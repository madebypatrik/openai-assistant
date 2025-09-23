import OpenAI from 'openai';
import { createReadStream } from 'fs';
import ora from 'ora';
import chalk from 'chalk';
import { appConfig } from './config.js';
import { SessionData } from '../types/index.js';

export class OpenAIClient {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: appConfig.openaiApiKey
    });
  }

  async uploadFile(filePath: string): Promise<string> {
    const spinner = ora('Uploading PDF file...').start();
    
    try {
      const fileStream = createReadStream(filePath);
      const file = await this.client.files.create({
        file: fileStream,
        purpose: 'assistants'
      });
      
      spinner.succeed('File uploaded successfully');
      return file.id;
    } catch (error) {
      spinner.fail('Failed to upload file');
      throw error;
    }
  }

  async createAssistant(fileName: string): Promise<string> {
    const spinner = ora('Creating AI assistant...').start();
    
    try {
      const assistant = await this.client.beta.assistants.create({
        name: `Clinical Trial Document Analyzer - ${fileName}`,
        instructions: `You are an expert clinical research analyst specializing in reading and analyzing clinical trial documents, protocols, and research reports. 
        Your role is to help clinical researchers, physicians, and medical professionals extract key insights, clinical data, and research findings from clinical trial documentation.
        
        RESPONSE LENGTH REQUIREMENT: Keep all responses concise and under ${appConfig.maxResponseLength} characters unless specifically asked for detailed analysis.
        
        When analyzing clinical documents:
        - Provide specific clinical data points, patient numbers, and statistical results when available
        - Highlight primary and secondary endpoints, efficacy measures, and safety profiles
        - Identify potential clinical risks, adverse events, and safety concerns
        - Use clear, professional medical language
        - Be concise and direct - focus on key clinical facts and outcomes only
        - Structure responses with bullet points for clarity
        
        Always base your responses on the actual content of the uploaded clinical trial document.`,
        tools: [{ type: "file_search" }],
        model: appConfig.assistantModel
      });
      
      spinner.succeed('Assistant created successfully');
      return assistant.id;
    } catch (error) {
      spinner.fail('Failed to create assistant');
      throw error;
    }
  }

  async createThread(): Promise<string> {
    const spinner = ora('Creating conversation thread...').start();
    
    try {
      const thread = await this.client.beta.threads.create();
      spinner.succeed('Thread created successfully');
      return thread.id;
    } catch (error) {
      spinner.fail('Failed to create thread');
      throw error;
    }
  }

  async attachFileToThread(threadId: string, fileId: string): Promise<void> {
    const spinner = ora('Attaching file to thread...').start();
    
    try {
      await this.client.beta.threads.messages.create(threadId, {
        role: "user",
        content: "I've uploaded a clinical trial document. Please analyze it and be ready to answer questions about the study design, results, safety data, and clinical findings.",
        attachments: [{
          file_id: fileId,
          tools: [{ type: "file_search" }]
        }]
      });
      
      spinner.succeed('File attached to thread');
    } catch (error) {
      spinner.fail('Failed to attach file');
      throw error;
    }
  }

  async sendMessage(threadId: string, assistantId: string, message: string): Promise<{ 
    response: string; 
    metadata: {
      runId: string;
      model?: string;
      usage?: any;
      citations?: any[];
      confidence?: string;
      processing_time_ms?: number;
      sources_referenced?: number;
    }
  }> {
    const spinner = ora('Processing your question...').start();
    const startTime = Date.now();
    
    // Add response length constraint to the message
    const constrainedMessage = `${message}\n\nIMPORTANT: Please provide a concise response of approximately ${appConfig.maxResponseLength} characters or less. Be direct and focus on key facts and numbers only.`;
    
    try {
      // Add user message
      await this.client.beta.threads.messages.create(threadId, {
        role: "user",
        content: constrainedMessage
      });

      // Run the assistant
      const run = await this.client.beta.threads.runs.create(threadId, {
        assistant_id: assistantId
      });

      // Wait for completion with retry logic
      let runStatus = await this.client.beta.threads.runs.retrieve(threadId, run.id);
      let attempts = 0;
      
      while (runStatus.status !== 'completed' && attempts < 60) {
        if (runStatus.status === 'failed') {
          throw new Error('Assistant run failed: ' + runStatus.last_error?.message);
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        runStatus = await this.client.beta.threads.runs.retrieve(threadId, run.id);
        attempts++;
      }

      if (runStatus.status !== 'completed') {
        throw new Error('Assistant run timed out');
      }

      // Get the assistant's response
      const messages = await this.client.beta.threads.messages.list(threadId);
      const assistantMessage = messages.data.find(
        msg => msg.role === 'assistant' && msg.run_id === run.id
      );

      spinner.succeed('Response received');
      const processingTime = Date.now() - startTime;
      
      if (assistantMessage?.content[0]?.type === 'text') {
        const responseText = assistantMessage.content[0].text.value;
        
        // Extract citations from annotations
        const annotations = assistantMessage.content[0].text.annotations || [];
        const citations = annotations.map((annotation: any) => ({
          start_index: annotation.start_index,
          end_index: annotation.end_index,
          text: annotation.text,
          file_citation: annotation.file_citation
        }));

        // Count sources referenced (citations with file references)
        const sourcesReferenced = citations.filter(c => c.file_citation).length;

        // Extract confidence indicator (if available in response text)
        const confidenceMatch = responseText.match(/confidence[:\s]*(\w+)/i);
        const confidence = confidenceMatch ? confidenceMatch[1] : undefined;

        return {
          response: responseText,
          metadata: {
            runId: run.id,
            model: runStatus.model,
            usage: runStatus.usage,
            citations,
            confidence,
            processing_time_ms: processingTime,
            sources_referenced: sourcesReferenced
          }
        };
      }
      
      return {
        response: 'No response generated',
        metadata: {
          runId: run.id,
          model: runStatus.model,
          processing_time_ms: processingTime,
          sources_referenced: 0
        }
      };
    } catch (error) {
      spinner.fail('Failed to get response');
      throw error;
    }
  }

  async generateSummary(threadId: string, assistantId: string, promptKey: keyof NonNullable<SessionData['summaries']>, prompt: string): Promise<string> {
    console.log(chalk.blue(`\nGenerating ${promptKey} summary...`));
    const result = await this.sendMessage(threadId, assistantId, prompt);
    return result.response;
  }
}

