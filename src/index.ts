#!/usr/bin/env node

import chalk from 'chalk';
import { validateConfig } from './lib/config.js';
import { CLIInterface } from './lib/cli-interface.js';

async function main() {
  try {
    // Validate configuration
    validateConfig();

    // Create and initialize CLI
    const cli = new CLIInterface();
    await cli.initialize();

    // Run the application
    await cli.run();
  } catch (error) {
    console.error(chalk.red('Fatal error:'), error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n\n👋 Shutting down gracefully...\n'));
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('Unhandled Promise Rejection:'), reason);
  process.exit(1);
});

main();

