# 📋 Document Analyzer - Command Reference

Quick reference guide for all available commands with 50-word summaries and examples.

## 🚀 Core Commands

### `npm run analyze`
Builds TypeScript files and starts the main interactive CLI. This is the primary command for analyzing documents. Provides menu-driven interface for uploading PDFs, asking questions, and managing analysis sessions.

```bash
npm run analyze
# Builds and starts the interactive analyzer
```

### `npm run dev`
Runs the analyzer directly with TypeScript without building. Perfect for development and quick access. Skips the build step and launches immediately into the interactive CLI interface.

```bash
npm run dev
# Quick start without building
```

### `npm run build`
Compiles TypeScript source files to JavaScript in the dist/ directory. Required before running the production version. Ensures all TypeScript code is properly compiled and ready for execution.

```bash
npm run build
# Compiles TypeScript to JavaScript
```

### `npm start`
Starts the compiled JavaScript version from dist/index.js. Must run build first. Launches the production-ready version of the analyzer with optimized performance and error handling.

```bash
npm start
# Runs the compiled version
```

## 🔧 Utility Commands

### `npm run test-setup`
Validates your environment configuration including OpenAI API key, file permissions, and dependencies. Checks if all requirements are met before running analysis. Essential troubleshooting tool for setup issues.

```bash
npm run test-setup
# Validates configuration and setup
```

### `npm run list-documents`
Lists all PDF files in the documents/ directory. Shows file sizes, permissions, and modification dates. Helps you see which documents are available for analysis without opening file explorer.

```bash
npm run list-documents
# Shows all PDFs in documents/ folder
```

### `npm run sessions-info`
Displays information about stored analysis sessions including file paths and directory contents. Shows where sessions are saved and what data is available for resuming previous analyses.

```bash
npm run sessions-info
# Shows session storage location and contents
```

### `npm run show-summaries`
Extracts and displays generated summaries from all analysis sessions. Shows overviews, key results, methodology, and clinical impact analyses across all your analyzed documents for quick comparison.

```bash
npm run show-summaries
# View all generated report summaries
```

### `npm run show-question-history`
Displays detailed history of all predefined questions asked across sessions. Shows questions, responses, timestamps, and metadata including processing times, sources referenced, and AI model information for analysis tracking.

```bash
npm run show-question-history
# View detailed question and response history
```

### `npm run show-config`
Shows current configuration settings including API key status, response length limits, model selection, and retry settings. Useful for troubleshooting and verifying your environment setup without exposing sensitive information.

```bash
npm run show-config
# Display current configuration settings
```

### `npm run analyze-metadata`
Analyzes detailed metadata from question responses including token usage, processing times, confidence levels, and citation patterns. Provides insights into AI performance and helps optimize question strategies.

```bash
npm run analyze-metadata
# Analyze question response metadata and performance
```

## 🤖 Automated Features

### `npm run auto-ask-clinical`
**NEW!** Automatically asks all predefined clinical trial questions with 10-second intervals between each call. Finds existing clinical session, processes questions sequentially, saves responses to history. Perfect for batch processing.

```bash
npm run auto-ask-clinical
# Automatically ask all clinical trial questions
# Requires existing clinical trial session
# 10-second timer between questions
```

## 📁 File Organization

### Documents Directory
```bash
documents/
├── clinical-study-report.pdf       # Clinical trial reports
├── pfizer-covid-vaccine.pdf        # Vaccine study reports
└── research-paper.pdf              # Research papers
```

### Sessions Directory
```bash
sessions/
├── sessions.json                   # Session metadata
├── clinical-study-questions.json   # Clinical trial question history
└── .gitkeep                       # Git folder structure
```

### Questions Directory
```bash
prompts-questions/
├── pfizer-covid-questions.json     # Pfizer vaccine questions
└── clinical-study-questions.json   # Clinical study questions
```

## 🎯 Quick Start Workflow

1. **Setup**: `npm run test-setup`
2. **Analyze Document**: `npm run analyze`
3. **Auto Questions**: `npm run auto-ask-clinical`
4. **View Results**: `npm run show-question-history`

## 💡 Pro Tips

- Use `npm run dev` for quick access during development
- Run `auto-ask-clinical` after analyzing clinical trial reports for comprehensive analysis
- Check `show-config` if you encounter API or setup issues
- Use `sessions-info` to find and manage your analysis data
