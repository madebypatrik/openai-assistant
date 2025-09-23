#!/usr/bin/env node

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';

console.log(chalk.bold.blue('\n📜 Question History Overview\n'));

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
    console.log(chalk.gray('Ask some predefined questions first to see history here.'));
    process.exit(0);
  }
  
  questionFiles.forEach(file => {
    const filePath = join(sessionsDir, file);
    try {
      const history = JSON.parse(readFileSync(filePath, 'utf-8'));
      const studyName = file.replace('-questions.json', '').replace(/-/g, ' ').toUpperCase();
      
      console.log(chalk.bold.green(`🔬 ${studyName} (${history.studyName || 'Clinical Study'})`));
      console.log(chalk.gray(`   Report: ${history.reportType}`));
      console.log(chalk.gray(`   Created: ${new Date(history.createdAt).toLocaleString()}`));
      console.log(chalk.gray(`   Last updated: ${new Date(history.lastUpdated).toLocaleString()}`));
      console.log(chalk.blue(`   📊 Total questions answered: ${history.responses.length}`));
      
      if (history.responses.length > 0) {
        console.log(chalk.yellow('   📝 Recent questions:'));
        
        // Show 3 most recent questions
        const recent = [...history.responses]
          .sort((a, b) => new Date(b.askedAt).getTime() - new Date(a.askedAt).getTime())
          .slice(0, 3);
          
        recent.forEach((response, index) => {
          const preview = response.question.length > 60 ? 
            response.question.substring(0, 60) + '...' : 
            response.question;
          console.log(chalk.white(`     ${index + 1}. ${preview}`));
          console.log(chalk.gray(`        Asked: ${new Date(response.askedAt).toLocaleString()}`));
          
          // Show metadata if available
          const meta = [];
          if (response.model) meta.push(`Model: ${response.model}`);
          if (response.metadata?.sources_referenced) meta.push(`${response.metadata.sources_referenced} sources`);
          if (response.metadata?.processing_time_ms) meta.push(`${response.metadata.processing_time_ms}ms`);
          
          if (meta.length > 0) {
            console.log(chalk.gray(`        📊 ${meta.join(' | ')}`));
          }
        });
      }
      
      console.log();
      
    } catch (error) {
      console.log(chalk.red(`❌ Error reading ${file}:`, error.message));
    }
  });
  
  console.log(chalk.gray('💡 Use "npm run analyze" and select a report to view detailed question history'));
  
} catch (error) {
  console.error(chalk.red('❌ Error reading sessions directory:'), error.message);
}

console.log();
