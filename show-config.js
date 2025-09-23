#!/usr/bin/env node

import { config } from 'dotenv';
import chalk from 'chalk';

config();

console.log(chalk.bold.blue('\n⚙️  Current Configuration\n'));

const configs = [
  {
    name: 'API Key',
    env: 'OPENAI_DOCUMENT_CLI_API_KEY',
    value: process.env.OPENAI_DOCUMENT_CLI_API_KEY,
    default: 'Not set',
    mask: true
  },
  {
    name: 'Assistant Model',
    env: 'ASSISTANT_MODEL',
    value: process.env.ASSISTANT_MODEL,
    default: 'gpt-4o'
  },
  {
    name: 'Max Retries',
    env: 'MAX_RETRIES',
    value: process.env.MAX_RETRIES,
    default: '3'
  },
  {
    name: 'Retry Delay',
    env: 'RETRY_DELAY',
    value: process.env.RETRY_DELAY,
    default: '1000ms'
  },
  {
    name: 'Response Length Limit',
    env: 'MAX_RESPONSE_LENGTH',
    value: process.env.MAX_RESPONSE_LENGTH,
    default: '200 characters'
  }
];

configs.forEach(({ name, env, value, default: defaultValue, mask }) => {
  const displayValue = value || defaultValue;
  const maskedValue = mask && value ? 
    value.substring(0, 10) + '...' + value.substring(value.length - 4) : 
    displayValue;
    
  const status = value ? chalk.green('✓') : chalk.yellow('⚠');
  const source = value ? chalk.gray('(custom)') : chalk.gray('(default)');
  
  console.log(`${status} ${chalk.bold(name)}: ${chalk.cyan(maskedValue)} ${source}`);
});

console.log(chalk.gray('\n💡 Customize settings by creating a .env file or setting environment variables'));
console.log();
