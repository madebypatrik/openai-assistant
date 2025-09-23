#!/usr/bin/env node

import { config } from 'dotenv';
import { existsSync } from 'fs';
import chalk from 'chalk';

console.log(chalk.bold.blue('\n🔍 Annual Report Analyzer - Setup Test\n'));

// Load environment variables
config();

// Check Node version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
console.log(`✓ Node.js version: ${nodeVersion}`);
if (majorVersion < 18) {
  console.log(chalk.red('  ⚠️  Warning: Node.js 18+ is required'));
}

// Check if .env file exists
if (existsSync('.env')) {
  console.log(chalk.green('✓ .env file found'));
} else {
  console.log(chalk.red('✗ .env file not found'));
  console.log(chalk.yellow('  → Run: cp env.example .env'));
}

// Check API key
const apiKey = process.env.OPENAI_DOCUMENT_CLI_API_KEY;
if (apiKey) {
  if (apiKey.startsWith('sk-')) {
    console.log(chalk.green('✓ OpenAI API key is set'));
  } else {
    console.log(chalk.yellow('⚠️  API key found but doesn\'t start with "sk-"'));
  }
} else {
  console.log(chalk.red('✗ OpenAI API key not set'));
  console.log(chalk.yellow('  → Add OPENAI_DOCUMENT_CLI_API_KEY to your .env file'));
}

// Check if build exists
if (existsSync('dist/index.js')) {
  console.log(chalk.green('✓ Project is built'));
} else {
  console.log(chalk.yellow('⚠️  Project not built yet'));
  console.log(chalk.yellow('  → Run: npm run build'));
}

// Summary
console.log('\n' + chalk.bold('Summary:'));
if (apiKey && apiKey.startsWith('sk-') && existsSync('.env') && existsSync('dist/index.js')) {
  console.log(chalk.green('✅ Everything looks good! Run "npm start" to begin.'));
} else {
  console.log(chalk.yellow('⚠️  Please complete the setup steps above before running the analyzer.'));
}

console.log();
