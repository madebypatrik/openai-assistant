#!/usr/bin/env node

import { readFileSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';

const sessionsFile = join(process.cwd(), 'sessions', 'sessions.json');

try {
  const sessions = JSON.parse(readFileSync(sessionsFile, 'utf-8'));
  
  console.log(chalk.bold.blue('\n📊 Document Analysis Summaries\n'));
  
  sessions.forEach((session, index) => {
    console.log(chalk.bold.green(`${index + 1}. ${session.fileName}`));
    console.log(chalk.gray(`   Created: ${new Date(session.createdAt).toLocaleString()}`));
    
    if (session.summaries) {
      const summaryTypes = [
        { key: 'overview', name: '📋 Study Overview' },
        { key: 'keyResults', name: '🔬 Key Results' },
        { key: 'methodology', name: '📊 Methodology' },
        { key: 'impact', name: '🎯 Clinical Impact' }
      ];
      
      summaryTypes.forEach(({ key, name }) => {
        if (session.summaries[key]) {
          console.log(chalk.blue(`\n   ${name}:`));
          console.log(chalk.white('   ' + '─'.repeat(50)));
          // Show first 200 characters of summary
          const summary = session.summaries[key];
          const preview = summary.length > 200 ? summary.substring(0, 200) + '...' : summary;
          console.log(chalk.gray(`   ${preview.replace(/\n/g, '\n   ')}`));
        }
      });
      
      console.log('\n' + chalk.yellow('   💡 Use the CLI to view full summaries: npm run analyze\n'));
    } else {
      console.log(chalk.yellow('   ⚠️  No summaries generated yet\n'));
    }
    
    console.log(chalk.gray('   ' + '═'.repeat(60)));
  });
  
} catch (error) {
  console.error(chalk.red('❌ Error reading sessions:'), error.message);
  console.log(chalk.yellow('💡 Make sure you have analyzed some documents first with: npm run analyze'));
}
