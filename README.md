# AI Document Analyzer CLI

A powerful command-line tool for analyzing structured documents using OpenAI's ChatGPT API. This tool helps professionals extract key insights, metrics, and strategic information from various document types through an interactive chat interface.

**Primary Focus: Clinical Trial Analysis** - Analyze clinical trial reports, research studies, and medical documents to extract key findings, safety data, and methodological insights. Also supports research papers and other structured documents.

## Features

- 📄 **Multi-Document Support**: Upload PDFs of clinical trials, research papers, medical studies, and more
- 🤖 **AI-Powered Analysis**: Uses ChatGPT to understand and analyze document content with document-type specific prompts
- 💬 **Interactive Chat**: Ask questions and get detailed answers about the document
- 📊 **Automatic Summaries**: Generate summaries for key sections:
  - **Clinical Trials**: Study Overview, Key Results, Methodology, Clinical Impact
  - **Research Papers**: Abstract, Methodology, Results, Conclusions
- 💾 **Session Persistence**: Close and resume conversations later
- 🗂️ **Multiple Documents**: Manage multiple document analysis sessions
- 🎯 **Research Focus**: Specialized analysis for clinical research and medical studies
- 🎨 **Beautiful CLI**: Colored output and intuitive interface

## Prerequisites

- Node.js 18+ and npm
- OpenAI API key with access to GPT-4 and Assistants API
- PDF files to analyze (clinical trial reports, research papers, medical studies, etc.)

## Installation

1. Clone or download this repository:
```bash
git clone <repository-url>
cd document-analyzer-ai
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on the example:
```bash
cp env.example .env
```

4. Add your OpenAI API key to `.env`:
```
OPENAI_DOCUMENT_CLI_API_KEY=your_openai_api_key_here

# Optional: Customize response length (default: 200 characters)
# MAX_RESPONSE_LENGTH=100   # For very short responses
# MAX_RESPONSE_LENGTH=500   # For more detailed responses
```

## Usage

### Organizing Your Documents

For the best experience, place your PDF files in the `documents/` folder in the project directory:

```bash
document-analyzer-ai/
├── documents/        # Your PDF files
│   ├── 125742_S1_M5_c4591001-A-report-cci-leukemia.pdf      # Clinical trial reports
│   ├── 125742_S1_M5_c4591001-A-report-cci-periph-vasc.pdf   # From PHMPT Pfizer documents
│   ├── 125742_S1_M5_c4591001-A-report-cci-pulmonary.pdf     # Clinical trial subgroup analyses
│   ├── clinical-study-report.pdf                           # Clinical trial reports
│   ├── research-paper.pdf                                  # Research papers
│   └── ...
├── sessions/         # Analysis sessions and summaries
│   ├── sessions.json              # Session metadata
│   ├── pfizer-covid-questions.json # Clinical trial question history
│   ├── clinical-study-questions.json # Clinical trial question history
│   └── .gitkeep                   # Folder structure placeholder
├── prompts-questions/ # Predefined questions for specific documents
│   ├── pfizer-covid-questions.json  # Clinical trial research questions
│   ├── clinical-study-questions.json # Clinical trial analysis questions
│   └── ...
└── ...
```

The CLI will automatically detect all PDF files in this folder, determine their document type (clinical, research), and present them as options when you select "Analyze a new document".

### Clinical Trial Analysis

**🎯 Primary Use Case**: Analyze clinical trial documents to extract key findings, safety data, and research insights for medical and scientific research.

#### **Clinical Trial Documents (from [PHMPT](https://phmpt.org/pfizer-16-plus-documents/))**
The project includes Pfizer COVID-19 vaccine clinical trial documents from the Public Health and Medical Professionals for Transparency (PHMPT) release:

- **`125742_S1_M5_c4591001-A-report-cci-leukemia.pdf`** - Analysis of vaccine performance in leukemia patients
- **`125742_S1_M5_c4591001-A-report-cci-periph-vasc.pdf`** - Peripheral vascular disease subgroup analysis  
- **`125742_S1_M5_c4591001-A-report-cci-pulmonary.pdf`** - Pulmonary conditions subgroup analysis

These documents provide **real clinical insights** - the Pfizer COVID-19 vaccine trials represent comprehensive clinical research data from one of the most significant global health studies in recent history.

### Predefined Questions

The tool supports predefined questions for specific documents and entities. When you analyze a document, the system automatically detects if curated questions are available and adds an "Ask predefined questions" option to the main menu.

#### **Clinical Trial Questions** are organized by categories such as:
- **Primary Efficacy** - Core trial results and statistical significance
- **Safety Profile** - Adverse events and safety signals  
- **Clinical Impact** - Patient outcomes and therapeutic benefits
- **Research Design** - Study methodology and data quality
- **Regulatory Considerations** - Approval pathways and compliance

Currently available question sets:
- **Pfizer COVID-19 Vaccine** - 10 research-focused questions for clinical trial analysis
- **Clinical Study Templates** - Standard question sets for clinical research

To add questions for other documents, create a JSON file in `prompts-questions/` following the format of existing question files.

#### Automated Question Processing

For clinical trial reports, you can automatically ask all predefined questions using automated scripts:

```bash
npm run auto-ask-clinical
```

This script will:
- ✅ Find your existing clinical trial session automatically
- ⏱️ Ask each question with a 10-second interval between calls
- 💾 Save all responses to question history with full metadata
- 📊 Show progress indicators and final success/failure summary
- 🔄 Continue with remaining questions even if one fails

**Requirements**:
- An existing clinical trial session (analyze a clinical PDF report first)
- Valid OpenAI API key in your `.env` file
- The appropriate questions JSON file in `prompts-questions/` directory

**Example Output**:
```
🤖 Auto Clinical Question Asker
Automatically asking all clinical trial questions with 10-second intervals

🔍 Finding clinical trial session...
✅ Found clinical session: pfizer-covid-vaccine.pdf
📋 Loading clinical trial questions...
✅ Loaded 10 questions for clinical analysis

⏱️ Starting automated questioning with 10-second intervals...

📝 Question 1/10
Category: Primary Efficacy
Question: What was the primary efficacy endpoint result...
🤖 Asking ChatGPT...
✅ Response received: [response content]
💾 Response saved to question history
⏳ Waiting 10 seconds before next question...
```

### Question History

Every time you ask a predefined question, the response is automatically saved to a study-specific history file (e.g., `sessions/clinical-study-questions.json`). This provides:

- **Persistent Storage**: All responses saved with timestamps
- **Smart Caching**: See previous answers before asking again
- **Progress Tracking**: Visual indicators show which questions you've answered
- **History Review**: Browse all your previous questions and responses
- **Time Tracking**: See when each question was asked

The question history includes:
- Question ID and full text
- AI response with character count
- Timestamp when asked
- **OpenAI API References**: Assistant ID, Thread ID, Run ID
- **Performance Metrics**: Processing time, model used
- **Source Analysis**: Number of document sources referenced
- **Citations**: Specific quotes and page references from the PDF
- **Token Usage**: Prompt tokens, completion tokens, total cost tracking
- **Confidence Indicators**: AI confidence level (when available)

### Response Length Control

The tool includes built-in response length control to keep answers concise and focused:

- **Default Limit**: 200 characters per response
- **Configurable**: Set `MAX_RESPONSE_LENGTH` in your `.env` file  
- **Visual Feedback**: Shows actual response length vs limit after each answer
- **Automatic Prompting**: AI assistant automatically receives length constraints
- **Concise Focus**: Responses prioritize key facts and numbers

This ensures efficient analysis sessions with quick, scannable responses rather than lengthy explanations.

### Build and Run

```bash
# Build TypeScript files
npm run build

# Run the analyzer
npm start

# Or use the combined command
npm run analyze
```

### Development Mode

```bash
# Run directly with TypeScript (no build needed)
npm run dev
```

### Utility Commands

```bash
# List all PDF files in reports folder
npm run list-reports

# Show summary previews of all analyzed reports
npm run show-summaries

# Display sessions storage location and contents
npm run sessions-info

# Test your setup
npm run test-setup

# View question history overview
npm run show-question-history

# Show current configuration settings
npm run show-config

# Analyze detailed metadata from question responses
npm run analyze-metadata

# Automatically ask all 10 AMD questions (requires existing AMD session)
npm run auto-ask-amd
```

## How It Works

### Main Menu Options

1. **📄 Analyze a new document**
   - Select from PDF files in the `documents/` folder or browse for other files
   - Automatically detects document type (clinical, financial, research) and creates specialized AI assistant
   - Optionally generates summaries of key sections based on document type
   - Starts an interactive chat session

2. **💬 Resume a previous session**
   - Select from your saved analysis sessions
   - Continue asking questions about a previously uploaded document
   - All context is preserved from previous conversations

3. **📋 List all sessions**
   - View all your saved document analysis sessions
   - See creation and last access times
   - Check which summaries have been generated and document type

4. **❓ Ask predefined questions (when available)**
   - Access curated questions specific to the document/entity
   - Questions are organized by category (Primary Efficacy, Revenue Growth, etc.)
   - **Question History**: Automatically saves all responses with timestamps
   - **Smart Caching**: Shows previous answers and allows fresh responses
   - **Progress Tracking**: Visual indicators (✅/❓) show answered vs unanswered questions
   - Only appears when predefined questions exist for the current document

5. **🗑️ Delete a session**
   - Remove sessions you no longer need
   - Frees up space and keeps your session list organized

### Chat Commands

While in chat mode, you can use these special commands:

- `/summary` - View generated summaries
- `/menu` - Return to main menu
- `/exit` - Return to main menu

### Session Management

The tool stores session data in `sessions/sessions.json` within the project directory. Each session includes:
- Assistant ID and Thread ID (for OpenAI API)
- File information
- Generated summaries
- Timestamps

You can close the program at any time and resume your conversation later by selecting "Resume a previous session" from the main menu.

## Example Workflow

### Clinical Trial Analysis Example

1. **Start the analyzer**:
   ```bash
   npm run analyze
   ```

2. **Select a clinical trial document**:
   - Select "Analyze a new document"
   - Choose from clinical trial PDFs (e.g., `125742_S1_M5_c4591001-A-report-cci-leukemia.pdf`)
   - System detects it's a clinical document and configures appropriate analysis prompts
   - Wait for upload and setup to complete

3. **Generate summaries** (clinical-specific):
   - When prompted, choose to generate automatic summaries
   - The tool will analyze: Study Overview, Key Results, Methodology, and Clinical Impact
   - This provides research-focused insights before diving into specific questions

4. **Ask research-focused questions**:
   ```
   You: What was the primary efficacy endpoint result and statistical significance?
   
   🤖 Assistant: Based on the clinical study report, the primary endpoint showed 
   95% vaccine efficacy (95% CI: 90.3%-97.6%) with p<0.001, demonstrating highly 
   significant protection against COVID-19...
   
   You: What are the key safety findings from this study?
   
   🤖 Assistant: The safety analysis showed: (1) Similar adverse event rates between 
   vaccine and placebo groups, (2) No serious safety signals identified, 
   (3) Local reactions were mostly mild to moderate...
   ```

5. **Use predefined research questions**:
   - Access 10 curated clinical trial research questions
   - Categories include Primary Efficacy, Safety Profile, Clinical Impact, Research Design
   - Each response is saved with timestamp and metadata

6. **View summaries**:
   - Type `/summary` in chat mode
   - Select which summary to view (Overview, Key Results, Methodology, Clinical Impact)

7. **Resume later**:
   - Exit the program
   - Start it again and select "Resume a previous session"
   - Continue your analysis from where you left off

## Configuration

You can customize the behavior by setting these environment variables in your `.env` file:

- `OPENAI_DOCUMENT_CLI_API_KEY` (required): Your OpenAI API key
- `ASSISTANT_MODEL` (optional): GPT model to use (default: `gpt-4o`)
- `MAX_RETRIES` (optional): Maximum retry attempts for API calls (default: `3`)
- `RETRY_DELAY` (optional): Delay between retries in milliseconds (default: `1000`)
- `MAX_RESPONSE_LENGTH` (optional): Maximum character length for responses (default: `200`)

## Troubleshooting

### Common Issues

1. **"OPENAI_DOCUMENT_CLI_API_KEY is not set"**
   - Make sure you've created a `.env` file
   - Ensure your API key is correctly set in the file

2. **"File not found" when uploading PDF**
   - Use absolute paths for better reliability
   - Ensure the file exists and is readable
   - Check that the file has a `.pdf` extension

3. **"Assistant run failed" or timeouts**
   - Large PDFs may take longer to process
   - Check your OpenAI API usage limits
   - Ensure your API key has access to the Assistants API

4. **Build errors**
   - Make sure you have Node.js 18+ installed
   - Try deleting `node_modules` and running `npm install` again
   - Check that all TypeScript files are properly formatted

### API Rate Limits

The tool implements automatic retry logic for API calls. If you encounter rate limits:
- The tool will automatically retry with exponential backoff
- Consider using a lower-tier model if you hit usage limits
- Check your OpenAI dashboard for current usage

## Security

- API keys are stored locally in your `.env` file
- Never commit your `.env` file to version control
- Session data is stored locally in the `sessions/` folder within the project
- Session files are excluded from git by default for privacy
- No data is sent to third parties except OpenAI for analysis

## Development

### Project Structure

```
document-analyzer-ai/
├── src/
│   ├── index.ts           # Entry point
│   ├── lib/
│   │   ├── cli-interface.ts   # Main CLI logic
│   │   ├── openai-client.ts   # OpenAI API wrapper
│   │   ├── storage.ts         # Session persistence
│   │   └── config.ts          # Configuration
│   ├── prompts/
│   │   └── analysis-prompts.ts # Analysis prompt templates
│   └── types/
│       └── index.ts           # TypeScript types
├── documents/             # Your PDF files
├── sessions/              # Analysis sessions and summaries
│   ├── .gitkeep          # Keeps folder in git
│   └── sessions.json     # Session data (excluded from git)
├── package.json
├── tsconfig.json
├── .env                   # Your API key (create this)
└── README.md
```

### Adding New Features

1. **New Summary Types**: Add prompts to `src/prompts/analysis-prompts.ts`
2. **New Commands**: Extend the `CLIInterface` class in `src/lib/cli-interface.ts`
3. **Storage Options**: Modify `StorageManager` in `src/lib/storage.ts`

## License

MIT

## Support

For issues, questions, or contributions, please visit the project repository.

