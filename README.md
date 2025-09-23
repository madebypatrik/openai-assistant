# 🔬 AI Document Analyzer

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-blue.svg)](https://openai.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **Turn any PDF into an AI conversation - Upload, ask, understand instantly**

## 💡 For Non-Technical Users

**Think of this as your personal research assistant that can read any document in seconds.**

🔍 **The Problem**: You have a 200-page research paper, clinical trial, or technical report. Reading it takes hours, and finding specific information is like searching for a needle in a haystack.

✨ **The Solution**: Upload your PDF and start chatting with it. Ask questions in plain English and get instant, accurate answers.

### Real Example
- **You upload**: A clinical trial document
- **You ask**: "What were the side effects?"
- **AI responds**: "The most common side effects were mild injection site pain (78% of participants), fatigue (62%), and headache (55%). No serious adverse events were related to the treatment..."

**Perfect for**: Researchers, students, consultants, medical professionals, or anyone drowning in complex documents.

## ⚡ What Makes This Special

- 🤖 **Powered by ChatGPT-4** - The most advanced AI reads your documents like an expert
- 📄 **Any PDF works** - Research papers, clinical trials, technical reports, legal documents
- 💬 **Natural conversation** - Ask follow-up questions, get clarifications, dive deeper
- 📊 **Smart summaries** - Auto-generates overviews of key sections
- 💾 **Saves everything** - Resume your analysis anytime, all answers are preserved
- 🎯 **Research-focused** - Pre-built questions for scientific and medical documents

## 🚀 Quick Start

### What You Need
- OpenAI API key ([get one here](https://platform.openai.com/api-keys) - $5-20/month typical usage)
- Node.js 18+ ([download here](https://nodejs.org/))
- A PDF document to analyze

### Setup (5 minutes)
```bash
# 1. Download the code
git clone https://github.com/madebypatrik/openai-assistant.git
cd openai-assistant

# 2. Install
npm install

# 3. Add your API key
cp env.example .env
# Edit .env and add: OPENAI_DOCUMENT_CLI_API_KEY=your_key_here

# 4. Start analyzing!
npm run analyze
```

## 🎬 See It In Action

The project includes real Pfizer COVID-19 trial documents for immediate testing:

**Sample Questions You Can Ask:**
- "What was the vaccine effectiveness rate?"
- "How many people were in the study?"
- "What were the most common side effects?"
- "How does this compare to other vaccines?"
- "What are the key limitations of this study?"

**AI Answers With:**
- Specific numbers and statistics
- Direct quotes from the document
- Context and explanations
- Comparisons and analysis

## 💡 Perfect For

### 📚 **Students & Academics**
- Literature reviews without the endless reading
- Extract key findings for papers and presentations
- Understand complex research methodologies
- Get help with thesis research

### 👩‍💼 **Business Professionals**
- Due diligence on technical reports
- Competitive analysis of research
- Regulatory document review
- Extract insights from industry studies

### 🏥 **Healthcare & Research**
- Analyze clinical trial results
- Review research protocols
- Stay current with medical literature
- Evidence-based decision making

## 🛠️ Available Commands

```bash
npm run analyze              # Main interface - start here
npm run auto-ask-clinical    # Auto-run predefined questions
npm run show-summaries       # View document summaries
npm run show-question-history # See your analysis history
```

## 🌟 Advanced Features

- **Session Management**: Save and resume analysis sessions
- **Question History**: All your questions and answers are automatically saved
- **Smart Categories**: Pre-built question sets for different document types
- **Multiple Documents**: Analyze several files in one session
- **Export Ready**: Save insights for reports and presentations

## 🤝 Contributing

Found this useful? Contributions welcome!
1. Fork the repository
2. Create your feature branch
3. Submit a pull request

## 📄 License

MIT License - Free to use and modify

---

⭐ **Star this repo if it saves you time!**

*Built by [@madebypatrik](https://github.com/madebypatrik) - Making complex documents accessible to everyone*

