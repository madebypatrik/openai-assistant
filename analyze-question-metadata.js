#!/usr/bin/env node

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';

console.log(chalk.bold.blue('\n🔍 Question Metadata Analysis\n'));

const sessionsDir = join(process.cwd(), 'sessions');

if (!existsSync(sessionsDir)) {
  console.log(chalk.red('❌ Sessions directory not found'));
  process.exit(1);
}

try {
  const files = readdirSync(sessionsDir);
  const questionFiles = files.filter(file => file.endsWith('-questions.json'));
  
  if (questionFiles.length === 0) {
    console.log(chalk.yellow('📭 No question history files found.'));
    process.exit(0);
  }
  
  questionFiles.forEach(file => {
    const filePath = join(sessionsDir, file);
    try {
      const history = JSON.parse(readFileSync(filePath, 'utf-8'));
      const studyName = file.replace('-questions.json', '').replace(/-/g, ' ').toUpperCase();
      
      console.log(chalk.bold.green(`🔬 ${studyName} Question Metadata Analysis`));
      console.log(chalk.gray('─'.repeat(60)));
      
      if (history.responses.length === 0) {
        console.log(chalk.yellow('No responses found'));
        return;
      }
      
      history.responses.forEach((response, index) => {
        console.log(chalk.cyan(`\n${index + 1}. Question ID: ${response.questionId}`));
        console.log(chalk.white(`   Question: ${response.question.substring(0, 80)}...`));
        console.log(chalk.gray(`   Asked: ${new Date(response.askedAt).toLocaleString()}`));
        
        // Core IDs
        console.log(chalk.blue('\n   🔗 OpenAI References:'));
        console.log(chalk.gray(`      Assistant ID: ${response.assistantId || 'N/A'}`));
        console.log(chalk.gray(`      Thread ID: ${response.threadId || response.sessionId || 'N/A'}`));
        console.log(chalk.gray(`      Run ID: ${response.runId || 'N/A'}`));
        
        // Performance metrics
        if (response.metadata) {
          console.log(chalk.yellow('\n   📊 Performance Metrics:'));
          if (response.model) console.log(chalk.gray(`      Model: ${response.model}`));
          if (response.metadata.processing_time_ms) {
            console.log(chalk.gray(`      Processing time: ${response.metadata.processing_time_ms}ms`));
          }
          if (response.metadata.sources_referenced !== undefined) {
            console.log(chalk.gray(`      Sources referenced: ${response.metadata.sources_referenced}`));
          }
          if (response.metadata.confidence) {
            console.log(chalk.gray(`      Confidence: ${response.metadata.confidence}`));
          }
        }
        
        // Usage stats
        if (response.usage) {
          console.log(chalk.green('\n   💰 Token Usage:'));
          if (response.usage.prompt_tokens) console.log(chalk.gray(`      Prompt tokens: ${response.usage.prompt_tokens}`));
          if (response.usage.completion_tokens) console.log(chalk.gray(`      Completion tokens: ${response.usage.completion_tokens}`));
          if (response.usage.total_tokens) console.log(chalk.gray(`      Total tokens: ${response.usage.total_tokens}`));
        }
        
        // Citations
        if (response.citations && response.citations.length > 0) {
          console.log(chalk.magenta('\n   📝 Citations:'));
          response.citations.forEach((citation, citIndex) => {
            console.log(chalk.gray(`      ${citIndex + 1}. Text: "${citation.text}"`));
            if (citation.file_citation?.quote) {
              console.log(chalk.gray(`         Quote: "${citation.file_citation.quote}"`));
            }
          });
        }
        
        // Response preview
        console.log(chalk.white('\n   💬 Response:'));
        const responsePreview = response.response.length > 150 ? 
          response.response.substring(0, 150) + '...' : 
          response.response;
        console.log(chalk.gray(`      ${responsePreview.replace(/\n/g, ' ')}`));
        console.log(chalk.gray(`      Length: ${response.response.length} characters`));
      });
      
      console.log('\n' + chalk.gray('═'.repeat(60)));
      
    } catch (error) {
      console.log(chalk.red(`❌ Error reading ${file}:`, error.message));
    }
  });
  
} catch (error) {
  console.error(chalk.red('❌ Error reading sessions directory:'), error.message);
}

console.log();
