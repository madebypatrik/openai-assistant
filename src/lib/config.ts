import { config } from 'dotenv';
import { join } from 'path';
import { AppConfig } from '../types/index.js';

config();

export const appConfig: AppConfig = {
  openaiApiKey: process.env.OPENAI_DOCUMENT_CLI_API_KEY || '',
  assistantModel: process.env.ASSISTANT_MODEL || 'gpt-4o',
  maxRetries: parseInt(process.env.MAX_RETRIES || '3'),
  retryDelay: parseInt(process.env.RETRY_DELAY || '1000'),
  dataDir: join(process.cwd(), 'sessions'),
  maxResponseLength: parseInt(process.env.MAX_RESPONSE_LENGTH || '200')
};

export function validateConfig(): void {
  if (!appConfig.openaiApiKey) {
    console.error('Error: OPENAI_DOCUMENT_CLI_API_KEY is not set in environment variables');
    console.error('Please create a .env file with your OpenAI API key');
    console.error('See env.example for reference');
    process.exit(1);
  }
}

