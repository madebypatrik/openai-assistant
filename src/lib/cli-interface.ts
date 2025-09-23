import { input, select, confirm } from '@inquirer/prompts';
import chalk from 'chalk';
import { StorageManager } from './storage.js';
import { OpenAIClient } from './openai-client.js';
import { QuestionsLoader } from './questions-loader.js';
import { QuestionHistoryManager } from './question-history.js';
import { appConfig } from './config.js';
import { SessionData, QuestionSet, PredefinedQuestion, QuestionResponse } from '../types/index.js';
import { analysisPrompts } from '../prompts/analysis-prompts.js';
import { existsSync, readdirSync } from 'fs';
import { basename, join, resolve } from 'path';

export class CLIInterface {
  private storage: StorageManager;
  private openai: OpenAIClient;
  private questionsLoader: QuestionsLoader;
  private questionHistory: QuestionHistoryManager;
  private currentSession: SessionData | null = null;
  private currentQuestions: QuestionSet | null = null;

  constructor() {
    this.storage = new StorageManager();
    this.openai = new OpenAIClient();
    this.questionsLoader = new QuestionsLoader();
    this.questionHistory = new QuestionHistoryManager();
  }

  async initialize(): Promise<void> {
    await this.storage.initialize();
  }

  async run(): Promise<void> {
    console.log(chalk.bold.green('\n📊 AI Document Analyzer'));
    console.log(chalk.gray('Powered by ChatGPT'));
    console.log(chalk.yellow(`📏 Response limit: ${appConfig.maxResponseLength} characters\n`));

    while (true) {
      try {
        const action = await this.showMainMenu();
        
        switch (action) {
          case 'new':
            await this.handleNewReport();
            break;
          case 'resume':
            await this.handleResumeSession();
            break;
          case 'questions':
            await this.handlePredefinedQuestions();
            break;
          case 'list':
            await this.listSessions();
            break;
          case 'delete':
            await this.handleDeleteSession();
            break;
          case 'exit':
            console.log(chalk.yellow('\n👋 Goodbye!\n'));
            process.exit(0);
        }
      } catch (error) {
        console.error(chalk.red('\n❌ Error:'), error);
        console.log(chalk.gray('Press Ctrl+C to exit\n'));
      }
    }
  }

  private async showMainMenu(): Promise<string> {
    const choices = [
      { name: '📄 Analyze a new document', value: 'new' },
      { name: '💬 Resume a previous session', value: 'resume' },
      { name: '📋 List all sessions', value: 'list' },
      { name: '🗑️  Delete a session', value: 'delete' }
    ];

    // Add predefined questions option if available for current session
    if (this.currentSession && this.currentQuestions) {
      choices.splice(2, 0, { 
        name: `❓ Ask predefined questions (${this.currentQuestions.entityName})`, 
        value: 'questions' 
      });
    }

    choices.push({ name: '🚪 Exit', value: 'exit' });

    return await select({
      message: 'What would you like to do?',
      choices: choices
    });
  }

  private async selectPdfFile(): Promise<string> {
    const documentsDir = resolve(process.cwd(), 'documents');
    let availableDocuments: string[] = [];

    // Check if documents directory exists and scan for PDF files
    if (existsSync(documentsDir)) {
      try {
        const files = readdirSync(documentsDir);
        availableDocuments = files
          .filter(file => file.toLowerCase().endsWith('.pdf'))
          .map(file => join(documentsDir, file));
      } catch (error) {
        console.log(chalk.yellow('⚠️  Could not read documents directory'));
      }
    }

    const choices = [];

    // Add available documents from documents folder
    if (availableDocuments.length > 0) {
      choices.push({ name: chalk.blue('📁 Available Documents:'), value: 'header', disabled: true });
      availableDocuments.forEach(filePath => {
        const fileName = basename(filePath);
        choices.push({ 
          name: `  📄 ${fileName}`, 
          value: filePath 
        });
      });
      choices.push({ name: '', value: 'separator', disabled: true });
    }

    // Add option to browse for other files
    choices.push({ name: '🔍 Browse for other PDF file...', value: 'browse' });

    const selection = await select({
      message: 'Select a PDF file to analyze:',
      choices: choices
    });

    if (selection === 'browse') {
      // Fallback to manual file input
      return await input({
        message: 'Enter the path to the PDF file:',
        validate: (value) => {
          if (!value) return 'Please enter a file path';
          if (!existsSync(value)) return 'File not found';
          if (!value.toLowerCase().endsWith('.pdf')) return 'Please provide a PDF file';
          return true;
        }
      });
    }

    return selection;
  }

  private async handleNewReport(): Promise<void> {
    const filePath = await this.selectPdfFile();
    const fileName = basename(filePath);
    
    // Check if session already exists
    const existing = await this.storage.getSession(fileName);
    if (existing) {
      const overwrite = await confirm({
        message: `A session for "${fileName}" already exists. Overwrite?`,
        default: false
      });
      
      if (!overwrite) {
        return;
      }
    }

    // Upload file and create assistant
    console.log(chalk.blue('\n🚀 Setting up your analysis environment...\n'));
    
    const fileId = await this.openai.uploadFile(filePath);
    const assistantId = await this.openai.createAssistant(fileName);
    const threadId = await this.openai.createThread();
    
    await this.openai.attachFileToThread(threadId, fileId);

    // Create session
    this.currentSession = {
      assistantId,
      threadId,
      fileId,
      fileName,
      createdAt: new Date().toISOString(),
      lastAccessed: new Date().toISOString()
    };

    await this.storage.saveSession(this.currentSession);
    
    // Load predefined questions if available
    this.currentQuestions = this.questionsLoader.loadQuestionsForFile(this.currentSession.fileName);
    if (this.currentQuestions) {
      const stats = this.questionHistory.getQuestionStats(this.currentSession.fileName);
      if (stats) {
        console.log(chalk.blue(`\n📝 Found ${this.currentQuestions.questions.length} predefined questions for ${this.currentQuestions.entityName} (${stats.answered}/${stats.total} answered)`));
      } else {
        console.log(chalk.blue(`\n📝 Found ${this.currentQuestions.questions.length} predefined questions for ${this.currentQuestions.entityName}`));
      }
    }
    
    // Generate summaries
    const generateSummaries = await confirm({
      message: 'Would you like to generate automatic summaries of key sections?',
      default: true
    });

    if (generateSummaries) {
      await this.generateAllSummaries();
    }

    // Start chat
    await this.startChat();
  }

  private async handleResumeSession(): Promise<void> {
    const sessions = await this.storage.getAllSessions();
    
    if (sessions.length === 0) {
      console.log(chalk.yellow('\n📭 No sessions found. Please analyze a report first.\n'));
      return;
    }

    const sessionChoice = await select({
      message: 'Select a session to resume:',
      choices: sessions.map(s => ({
        name: `${s.fileName} (${new Date(s.lastAccessed).toLocaleString()})`,
        value: s.fileName
      }))
    });

    this.currentSession = await this.storage.getSession(sessionChoice);
    if (this.currentSession) {
      await this.storage.updateLastAccessed(sessionChoice);
      
      // Load predefined questions if available
      this.currentQuestions = this.questionsLoader.loadQuestionsForFile(this.currentSession.fileName);
      
      console.log(chalk.green(`\n✅ Resumed session for: ${this.currentSession.fileName}`));
      if (this.currentQuestions) {
        const stats = this.questionHistory.getQuestionStats(this.currentSession.fileName);
        if (stats) {
          console.log(chalk.blue(`📝 ${this.currentQuestions.questions.length} predefined questions available (${stats.answered}/${stats.total} answered)`));
        } else {
          console.log(chalk.blue(`📝 ${this.currentQuestions.questions.length} predefined questions available`));
        }
      }
      console.log();
      
      await this.startChat();
    }
  }

  private async listSessions(): Promise<void> {
    const sessions = await this.storage.getAllSessions();
    
    if (sessions.length === 0) {
      console.log(chalk.yellow('\n📭 No sessions found.\n'));
      return;
    }

    console.log(chalk.bold('\n📚 Your Sessions:\n'));
    sessions.forEach(s => {
      console.log(chalk.blue(`📄 ${s.fileName}`));
      console.log(chalk.gray(`   Created: ${new Date(s.createdAt).toLocaleString()}`));
      console.log(chalk.gray(`   Last accessed: ${new Date(s.lastAccessed).toLocaleString()}`));
      if (s.summaries) {
        const summaryCount = Object.keys(s.summaries).length;
        console.log(chalk.gray(`   Summaries generated: ${summaryCount}/4`));
      }
      console.log();
    });
  }

  private async handleDeleteSession(): Promise<void> {
    const sessions = await this.storage.getAllSessions();
    
    if (sessions.length === 0) {
      console.log(chalk.yellow('\n📭 No sessions to delete.\n'));
      return;
    }

    const sessionChoice = await select({
      message: 'Select a session to delete:',
      choices: [
        ...sessions.map(s => ({
          name: `${s.fileName} (${new Date(s.lastAccessed).toLocaleString()})`,
          value: s.fileName
        })),
        { name: '❌ Cancel', value: 'cancel' }
      ]
    });

    if (sessionChoice === 'cancel') return;

    const confirmDelete = await confirm({
      message: `Are you sure you want to delete the session for "${sessionChoice}"?`,
      default: false
    });

    if (confirmDelete) {
      await this.storage.deleteSession(sessionChoice);
      console.log(chalk.green(`\n✅ Session deleted successfully.\n`));
    }
  }

  private async generateAllSummaries(): Promise<void> {
    if (!this.currentSession) return;

    console.log(chalk.blue('\n📊 Generating comprehensive analysis...\n'));

    const summaries: SessionData['summaries'] = {};

    try {
      summaries.overview = await this.openai.generateSummary(
        this.currentSession.threadId,
        this.currentSession.assistantId,
        'overview',
        analysisPrompts.overview
      );

      summaries.keyResults = await this.openai.generateSummary(
        this.currentSession.threadId,
        this.currentSession.assistantId,
        'keyResults',
        analysisPrompts.keyResults
      );

      summaries.methodology = await this.openai.generateSummary(
        this.currentSession.threadId,
        this.currentSession.assistantId,
        'methodology',
        analysisPrompts.methodology
      );

      summaries.impact = await this.openai.generateSummary(
        this.currentSession.threadId,
        this.currentSession.assistantId,
        'impact',
        analysisPrompts.impact
      );

      this.currentSession.summaries = summaries;
      await this.storage.saveSession(this.currentSession);
      
      console.log(chalk.green('\n✅ All summaries generated successfully!\n'));
    } catch (error) {
      console.error(chalk.red('\n❌ Failed to generate some summaries:'), error);
    }
  }

  private async startChat(): Promise<void> {
    if (!this.currentSession) return;

    console.log(chalk.bold('\n💬 Chat Mode'));
    console.log(chalk.gray('Type your questions about the annual report.'));
    console.log(chalk.gray('Commands: /summary, /menu, /exit\n'));

    while (true) {
      const message = await input({
        message: chalk.cyan('You:')
      });

      if (message.toLowerCase() === '/exit' || message.toLowerCase() === '/menu') {
        break;
      }

      if (message.toLowerCase() === '/summary') {
        await this.showSummaries();
        continue;
      }

      try {
        const result = await this.openai.sendMessage(
          this.currentSession.threadId,
          this.currentSession.assistantId,
          message
        );

        console.log(chalk.green('\n🤖 Assistant:\n'));
        console.log(result.response);
        console.log();
        console.log(chalk.gray(`📏 Response length: ${result.response.length} characters (limit: ${appConfig.maxResponseLength})`));
        
        // Show additional metadata
        if (result.metadata.sources_referenced && result.metadata.sources_referenced > 0) {
          console.log(chalk.blue(`📚 Sources referenced: ${result.metadata.sources_referenced}`));
        }
        if (result.metadata.processing_time_ms) {
          console.log(chalk.gray(`⏱️  Processing time: ${result.metadata.processing_time_ms}ms`));
        }
        console.log();
      } catch (error) {
        console.error(chalk.red('\n❌ Failed to get response:'), error);
      }
    }
  }

  private async showSummaries(): Promise<void> {
    if (!this.currentSession?.summaries) {
      console.log(chalk.yellow('\n📭 No summaries available. Generate them from the main menu.\n'));
      return;
    }

    const summaryChoice = await select({
      message: 'Which summary would you like to view?',
      choices: [
        { name: '📋 Document Overview', value: 'overview' },
        { name: '💰 Key Results', value: 'keyResults' },
        { name: '📊 Methodology/Design', value: 'methodology' },
        { name: '💵 Impact Analysis', value: 'impact' },
        { name: '🔙 Back to chat', value: 'back' }
      ]
    });

    if (summaryChoice === 'back') return;

    const summary = this.currentSession.summaries[summaryChoice as keyof SessionData['summaries']];
    if (summary) {
      console.log(chalk.blue(`\n${summaryChoice.replace(/([A-Z])/g, ' $1').trim()}:\n`));
      console.log(summary);
      console.log();
    }
  }

  private async handlePredefinedQuestions(): Promise<void> {
    if (!this.currentSession || !this.currentQuestions) {
      console.log(chalk.yellow('\n⚠️  No predefined questions available for current session.\n'));
      return;
    }

    console.log(chalk.bold.blue(`\n❓ Predefined Questions for ${this.currentQuestions.entityName}\n`));

    // Group questions by category
    const categories = new Map<string, PredefinedQuestion[]>();
    this.currentQuestions.questions.forEach(q => {
      if (!categories.has(q.category)) {
        categories.set(q.category, []);
      }
      categories.get(q.category)!.push(q);
    });

    while (true) {
      const choices = [];
      
      // Add category-based choices
      for (const [category, questions] of categories) {
        choices.push({
          name: chalk.blue(`📂 ${category} (${questions.length} questions)`),
          value: `category:${category}`
        });
      }
      
      choices.push(
        { name: '📝 View all questions', value: 'all' },
        { name: '📜 View question history', value: 'history' },
        { name: '🔙 Back to main menu', value: 'back' }
      );

      const selection = await select({
        message: 'Select a category or option:',
        choices: choices
      });

      if (selection === 'back') {
        break;
      }

      if (selection === 'all') {
        await this.showAllQuestions();
        continue;
      }

      if (selection === 'history') {
        await this.showQuestionHistory();
        continue;
      }

      if (selection.startsWith('category:')) {
        const category = selection.replace('category:', '');
        const categoryQuestions = categories.get(category)!;
        await this.showCategoryQuestions(category, categoryQuestions);
      }
    }
  }

  private async showAllQuestions(): Promise<void> {
    if (!this.currentQuestions) return;

    console.log(chalk.bold.green(`\n📋 All Questions for ${this.currentQuestions.entityName}:\n`));
    
    this.currentQuestions.questions.forEach((q, index) => {
      console.log(chalk.cyan(`${index + 1}. ${chalk.bold(q.category)}`));
      console.log(chalk.white(`   ${q.question}\n`));
    });

    await input({ message: 'Press Enter to continue...' });
  }

  private async showQuestionHistory(): Promise<void> {
    if (!this.currentSession) return;

    const history = this.questionHistory.loadQuestionHistory(this.currentSession.fileName);
    
    if (!history || history.responses.length === 0) {
      console.log(chalk.yellow('\n📭 No question history found. Ask some questions first!\n'));
      await input({ message: 'Press Enter to continue...' });
      return;
    }

    console.log(chalk.bold.green(`\n📜 Question History for ${history.entityName}\n`));
    console.log(chalk.gray(`Created: ${new Date(history.createdAt).toLocaleString()}`));
    console.log(chalk.gray(`Last updated: ${new Date(history.lastUpdated).toLocaleString()}`));
    console.log(chalk.gray(`Total questions answered: ${history.responses.length}\n`));

    // Sort by most recent first
    const sortedResponses = [...history.responses].sort((a, b) => 
      new Date(b.askedAt).getTime() - new Date(a.askedAt).getTime()
    );

    sortedResponses.forEach((response, index) => {
      console.log(chalk.cyan(`${index + 1}. ${chalk.bold('Question:')} ${response.question}`));
      console.log(chalk.gray(`   Asked on: ${new Date(response.askedAt).toLocaleString()}`));
      console.log(chalk.white(`   ${chalk.bold('Answer:')} ${response.response.substring(0, 200)}${response.response.length > 200 ? '...' : ''}`));
      
      // Show metadata if available
      const meta = [];
      if (response.model) meta.push(`Model: ${response.model}`);
      if (response.metadata?.sources_referenced) meta.push(`Sources: ${response.metadata.sources_referenced}`);
      if (response.metadata?.processing_time_ms) meta.push(`${response.metadata.processing_time_ms}ms`);
      if (response.runId) meta.push(`Run: ${response.runId.substring(0, 8)}...`);
      
      if (meta.length > 0) {
        console.log(chalk.gray(`   📊 ${meta.join(' | ')}`));
      }
      console.log();
    });

    await input({ message: 'Press Enter to continue...' });
  }

  private async showCategoryQuestions(category: string, questions: PredefinedQuestion[]): Promise<void> {
    while (true) {
      console.log(chalk.bold.blue(`\n📂 ${category} Questions\n`));
      
      const choices = questions.map((q, index) => {
        const hasAnswer = this.currentSession ? 
          this.questionHistory.getQuestionResponse(this.currentSession.fileName, q.id) !== null : 
          false;
        const prefix = hasAnswer ? '✅' : '❓';
        return {
          name: `${prefix} ${index + 1}. ${q.question.substring(0, 75)}${q.question.length > 75 ? '...' : ''}`,
          value: q.id
        };
      });
      
      choices.push(
        { name: '🔙 Back to categories', value: 'back' }
      );

      const selection = await select({
        message: `Select a question from ${category}:`,
        choices: choices
      });

      if (selection === 'back') {
        break;
      }

      const selectedQuestion = questions.find(q => q.id === selection);
      if (selectedQuestion) {
        await this.askPredefinedQuestion(selectedQuestion);
      }
    }
  }

  private async askPredefinedQuestion(question: PredefinedQuestion): Promise<void> {
    if (!this.currentSession || !this.currentQuestions) return;

    console.log(chalk.bold.cyan(`\n❓ ${question.category} Question:\n`));
    console.log(chalk.white(question.question));
    console.log(chalk.gray('\n' + '─'.repeat(60) + '\n'));

    // Check if we have a previous answer
    const previousResponse = this.questionHistory.getQuestionResponse(this.currentSession.fileName, question.id);
    
    if (previousResponse) {
      console.log(chalk.yellow('📝 Previous Answer:'));
      console.log(chalk.gray(`Asked on: ${new Date(previousResponse.askedAt).toLocaleString()}\n`));
      console.log(previousResponse.response);
      console.log();

      const useExisting = await confirm({
        message: 'Do you want to use the previous answer or get a fresh response?',
        default: true
      });

      if (useExisting) {
        const continueChoice = await select({
          message: 'What would you like to do next?',
          choices: [
            { name: '❓ Ask another question from this category', value: 'continue' },
            { name: '📂 Return to categories', value: 'categories' },
            { name: '🏠 Return to main menu', value: 'main' }
          ]
        });

        if (continueChoice === 'main') {
          return;
        }
        if (continueChoice === 'categories') {
          return;
        }
        return; // continue will loop back
      }
    }

    try {
      const result = await this.openai.sendMessage(
        this.currentSession.threadId,
        this.currentSession.assistantId,
        question.question
      );

      console.log(chalk.green('🤖 Assistant:\n'));
      console.log(result.response);
      console.log();
      console.log(chalk.gray(`📏 Response length: ${result.response.length} characters (limit: ${appConfig.maxResponseLength})`));
      
      // Show additional metadata
      if (result.metadata.sources_referenced && result.metadata.sources_referenced > 0) {
        console.log(chalk.blue(`📚 Sources referenced: ${result.metadata.sources_referenced}`));
      }
      if (result.metadata.processing_time_ms) {
        console.log(chalk.gray(`⏱️  Processing time: ${result.metadata.processing_time_ms}ms`));
      }
      if (result.metadata.model) {
        console.log(chalk.gray(`🤖 Model: ${result.metadata.model}`));
      }
      console.log();

      // Save the response to question history
      await this.questionHistory.saveQuestionResponse(
        this.currentSession.fileName,
        question.id,
        question.question,
        result.response,
        this.currentSession.assistantId,
        this.currentSession.threadId,
        this.currentQuestions,
        result.metadata
      );

      console.log(chalk.gray('💾 Response saved to question history'));
      console.log();

      const continueChoice = await select({
        message: 'What would you like to do next?',
        choices: [
          { name: '❓ Ask another question from this category', value: 'continue' },
          { name: '📂 Return to categories', value: 'categories' },
          { name: '🏠 Return to main menu', value: 'main' }
        ]
      });

      if (continueChoice === 'main') {
        return;
      }
      if (continueChoice === 'categories') {
        return;
      }
      // 'continue' will loop back to showCategoryQuestions
    } catch (error) {
      console.error(chalk.red('\n❌ Failed to get response:'), error);
      await input({ message: 'Press Enter to continue...' });
    }
  }
}

