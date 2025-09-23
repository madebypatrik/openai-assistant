#!/usr/bin/env node

import { readdirSync, existsSync } from 'fs';
import { basename, join, resolve } from 'path';
import chalk from 'chalk';

console.log(chalk.bold.blue('\n🔍 File Selection Test\n'));

const reportsDir = resolve(process.cwd(), 'reports');
console.log(`Looking for PDF files in: ${chalk.cyan(reportsDir)}\n`);

if (existsSync(reportsDir)) {
  try {
    const files = readdirSync(reportsDir);
    const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'));
    
    if (pdfFiles.length > 0) {
      console.log(chalk.green('✅ Found PDF files:'));
      pdfFiles.forEach(file => {
        console.log(`  📄 ${chalk.blue(file)}`);
      });
      
      console.log('\n' + chalk.yellow('In the CLI, you will see these options:'));
      console.log(chalk.blue('📁 Available Reports:'));
      pdfFiles.forEach(file => {
        console.log(`    📄 ${file}`);
      });
      console.log('  🔍 Browse for other PDF file...');
    } else {
      console.log(chalk.yellow('⚠️  No PDF files found in reports directory'));
    }
  } catch (error) {
    console.log(chalk.red('❌ Error reading directory:'), error.message);
  }
} else {
  console.log(chalk.red('❌ Reports directory does not exist'));
  console.log(chalk.yellow('  → Create it with: mkdir reports'));
}

console.log();
