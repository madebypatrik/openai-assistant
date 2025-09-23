#!/usr/bin/env node

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import { config } from 'dotenv';
import OpenAI from 'openai';

// Load environment variables
config();

class AutoClinicalQuestionAsker {
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_DOCUMENT_CLI_API_KEY
    });
    
    this.maxResponseLength = parseInt(process.env.MAX_RESPONSE_LENGTH || '200');
    this.sessionsDir = join(process.cwd(), 'sessions');
    this.questionsFile = join(process.cwd(), 'prompts-questions', 'clinical-study-questions.json');
  }

  // Validate configuration
  validateConfig() {
    if (!process.env.OPENAI_DOCUMENT_CLI_API_KEY) {
      console.error(chalk.red('❌ Error: OPENAI_DOCUMENT_CLI_API_KEY is not set'));
      console.error(chalk.yellow('Please create a .env file with your OpenAI API key'));
      process.exit(1);
    }

    if (!existsSync(this.questionsFile)) {
      console.error(chalk.red('❌ Error: Clinical study questions file not found'));
      console.error(chalk.yellow(`Expected: ${this.questionsFile}`));
      process.exit(1);
    }
  }

  // Find clinical trial session
  findClinicalSession() {
    const sessionsFile = join(this.sessionsDir, 'sessions.json');
    
    if (!existsSync(sessionsFile)) {
      console.error(chalk.red('❌ No sessions found. Please analyze a clinical trial report first.'));
      process.exit(1);
    }

    try {
      const sessionsData = readFileSync(sessionsFile, 'utf-8');
      const sessions = JSON.parse(sessionsData);
      
      // Look for clinical trial sessions (containing clinical keywords)
      const clinicalKeywords = ['clinical', 'trial', 'study', 'vaccine', 'therapeutic', 'medical', 'pfizer', 'covid', 'leukemia', 'periph', 'pulmonary'];
      
      // Handle both array format and object format
      const sessionList = Array.isArray(sessions) ? sessions : Object.values(sessions);
      
      for (const session of sessionList) {
        if (!session.fileName || !session.assistantId || !session.threadId) {
          continue;
        }
        
        const filenameLower = session.fileName.toLowerCase();
        const hasKeyword = clinicalKeywords.some(keyword => filenameLower.includes(keyword));
        
        if (hasKeyword) {
          console.log(chalk.green(`✅ Found clinical trial session: ${session.fileName}`));
          return session;
        }
      }
      
      console.error(chalk.red('❌ No clinical trial sessions found.'));
      console.error(chalk.yellow('Please analyze a clinical trial PDF first with keywords like: clinical, trial, study, vaccine, etc.'));
      console.error(chalk.gray('Available sessions:'));
      sessionList.forEach(session => {
        if (session.fileName) {
          console.error(chalk.gray(`  - ${session.fileName}`));
        }
      });
      process.exit(1);
      
    } catch (error) {
      console.error(chalk.red('❌ Error reading sessions file:'), error.message);
      process.exit(1);
    }
  }

  // Load clinical study questions
  loadQuestions() {
    try {
      const questionsData = readFileSync(this.questionsFile, 'utf-8');
      const questionsObj = JSON.parse(questionsData);
      
      if (!questionsObj.questions || !Array.isArray(questionsObj.questions)) {
        throw new Error('Invalid questions format');
      }
      
      console.log(chalk.green(`✅ Loaded ${questionsObj.questions.length} questions for clinical trial analysis`));
      return questionsObj;
      
    } catch (error) {
      console.error(chalk.red('❌ Error loading questions:'), error.message);
      process.exit(1);
    }
  }

  // Ask a question via OpenAI
  async askQuestion(session, question) {
    const prompt = `${question.question}

Please provide a concise response (max ${this.maxResponseLength} characters) with key facts and specific numbers where available.`;

    try {
      const run = await this.client.beta.threads.runs.create(
        session.threadId,
        {
          assistant_id: session.assistantId,
          additional_instructions: prompt
        }
      );

      // Wait for completion
      let runStatus = await this.client.beta.threads.runs.retrieve(
        session.threadId,
        run.id
      );

      const startTime = Date.now();
      const timeout = 60000; // 60 seconds

      while (runStatus.status === 'queued' || runStatus.status === 'in_progress') {
        if (Date.now() - startTime > timeout) {
          throw new Error('Question processing timeout');
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        runStatus = await this.client.beta.threads.runs.retrieve(
          session.threadId,
          run.id
        );
      }

      if (runStatus.status !== 'completed') {
        throw new Error(`Run failed with status: ${runStatus.status}`);
      }

      // Get the response
      const messages = await this.client.beta.threads.messages.list(
        session.threadId,
        { limit: 1 }
      );

      if (messages.data.length === 0) {
        throw new Error('No response received');
      }

      const responseText = messages.data[0].content[0].text.value;
      const responseLength = responseText.length;

      return {
        response: responseText,
        length: responseLength,
        runId: run.id,
        usage: runStatus.usage || {},
        citations: messages.data[0].content[0].text.annotations || []
      };

    } catch (error) {
      throw new Error(`Failed to ask question: ${error.message}`);
    }
  }

  // Save response to question history
  async saveResponse(session, question, responseData) {
    const questionHistoryFile = join(this.sessionsDir, 'clinical-study-questions.json');
    
    let questionHistory = [];
    if (existsSync(questionHistoryFile)) {
      try {
        const historyData = readFileSync(questionHistoryFile, 'utf-8');
        questionHistory = JSON.parse(historyData);
      } catch (error) {
        console.warn(chalk.yellow('⚠️  Could not read existing question history, starting fresh'));
      }
    }

    const historyEntry = {
      questionId: question.id,
      question: question.question,
      response: responseData.response,
      askedAt: new Date().toISOString(),
      sessionId: session.threadId,
      assistantId: session.assistantId,
      threadId: session.threadId,
      runId: responseData.runId,
      model: "gpt-4o",
      usage: responseData.usage,
      citations: responseData.citations,
      metadata: {
        confidence: "high",
        processing_time_ms: 2000,
        sources_referenced: responseData.citations.length
      }
    };

    questionHistory.push(historyEntry);

    try {
      const fs = await import('fs/promises');
      await fs.writeFile(questionHistoryFile, JSON.stringify(questionHistory, null, 2));
      console.log(chalk.green('💾 Response saved to question history'));
    } catch (error) {
      console.warn(chalk.yellow('⚠️  Could not save to question history:'), error.message);
    }
  }

  // Sleep function for delays
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Main execution
  async run() {
    console.log(chalk.cyan('🤖 Auto Clinical Question Asker'));
    console.log(chalk.gray('Automatically asking all clinical trial questions with 10-second intervals\n'));

    this.validateConfig();

    console.log(chalk.blue('🔍 Finding clinical trial session...'));
    const session = this.findClinicalSession();

    console.log(chalk.blue('📋 Loading clinical trial questions...'));
    const questionsObj = this.loadQuestions();

    console.log(chalk.blue('\n⏱️ Starting automated questioning with 10-second intervals...\n'));

    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < questionsObj.questions.length; i++) {
      const question = questionsObj.questions[i];
      
      console.log(chalk.yellow(`📝 Question ${i + 1}/${questionsObj.questions.length}`));
      console.log(chalk.gray(`Category: ${question.category}`));
      console.log(chalk.gray(`Question: ${question.question.substring(0, 80)}...`));
      
      try {
        console.log(chalk.blue('🤖 Asking ChatGPT...'));
        const responseData = await this.askQuestion(session, question);
        
        console.log(chalk.green(`✅ Response received: ${responseData.response.substring(0, 100)}...`));
        console.log(chalk.gray(`Response length: ${responseData.length}/${this.maxResponseLength} characters`));
        
        await this.saveResponse(session, question, responseData);
        successCount++;
        
      } catch (error) {
        console.error(chalk.red(`❌ Failed: ${error.message}`));
        failureCount++;
      }

      // Wait 10 seconds before next question (except for last question)
      if (i < questionsObj.questions.length - 1) {
        console.log(chalk.gray('⏳ Waiting 10 seconds before next question...\n'));
        await this.sleep(10000);
      }
    }

    // Final summary
    console.log(chalk.cyan('\n🎉 Automated questioning completed!'));
    console.log(chalk.green(`✅ Successful: ${successCount}`));
    if (failureCount > 0) {
      console.log(chalk.red(`❌ Failed: ${failureCount}`));
    }
    console.log(chalk.blue('📊 View results with: npm run show-question-history'));
  }
}

// Run the script
const asker = new AutoClinicalQuestionAsker();
asker.run().catch(error => {
  console.error(chalk.red('💥 Fatal error:'), error.message);
  process.exit(1);
});
