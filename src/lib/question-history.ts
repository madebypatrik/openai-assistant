import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { QuestionHistory, QuestionResponse, QuestionSet } from '../types/index.js';
import { appConfig } from './config.js';

export class QuestionHistoryManager {
  constructor() {}

  private getHistoryFilePath(companyKey: string): string {
    return join(appConfig.dataDir, `${companyKey}-questions.json`);
  }

  private extractCompanyKey(fileName: string): string | null {
    const name = fileName.toLowerCase().replace('.pdf', '');
    
    // Clinical trial patterns - look for study/drug/company identifiers
    if (name.includes('125742') || name.includes('c4591001') || name.includes('pfizer') || name.includes('bnt162b2')) {
      return 'pfizer-covid';
    }
    if (name.includes('moderna') || name.includes('mrna-1273')) return 'moderna-covid';
    if (name.includes('johnson') || name.includes('jnj') || name.includes('ad26')) return 'jnj-covid';
    if (name.includes('astrazeneca') || name.includes('azd1222') || name.includes('covishield')) return 'astrazeneca-covid';
    if (name.includes('novavax') || name.includes('nvx-cov2373')) return 'novavax-covid';
    
    // Additional clinical trial identifiers
    if (name.includes('leukemia') || name.includes('cci-leukemia')) return 'leukemia-study';
    if (name.includes('peripheral') || name.includes('vasc') || name.includes('periph-vasc')) return 'vascular-study';
    if (name.includes('pulmonary') || name.includes('lung')) return 'pulmonary-study';
    
    const parts = name.split(/[-_\s]/);
    return parts.length > 0 ? parts[0] : null;
  }

  async saveQuestionResponse(
    fileName: string, 
    questionId: string, 
    question: string, 
    response: string, 
    assistantId: string,
    threadId: string,
    questionSet: QuestionSet,
    metadata?: {
      runId?: string;
      model?: string;
      usage?: any;
      citations?: any[];
      confidence?: string;
      processing_time_ms?: number;
      sources_referenced?: number;
    }
  ): Promise<void> {
    const companyKey = this.extractCompanyKey(fileName);
    if (!companyKey) return;

    const historyFile = this.getHistoryFilePath(companyKey);
    let history: QuestionHistory;

    // Load existing history or create new
    if (existsSync(historyFile)) {
      try {
        const data = readFileSync(historyFile, 'utf-8');
        history = JSON.parse(data);
      } catch (error) {
        console.error('Error reading question history:', error);
        history = this.createNewHistory(questionSet);
      }
    } else {
      history = this.createNewHistory(questionSet);
    }

    // Check if question already exists and update it, or add new response
    const existingIndex = history.responses.findIndex(r => r.questionId === questionId);
    const questionResponse: QuestionResponse = {
      questionId,
      question,
      response,
      askedAt: new Date().toISOString(),
      sessionId: threadId, // Keep this for backward compatibility
      assistantId,
      threadId,
      runId: metadata?.runId,
      model: metadata?.model,
      usage: metadata?.usage,
      citations: metadata?.citations,
      metadata: {
        confidence: metadata?.confidence,
        processing_time_ms: metadata?.processing_time_ms,
        sources_referenced: metadata?.sources_referenced
      }
    };

    if (existingIndex >= 0) {
      history.responses[existingIndex] = questionResponse;
    } else {
      history.responses.push(questionResponse);
    }

    history.lastUpdated = new Date().toISOString();

    // Save updated history
    try {
      writeFileSync(historyFile, JSON.stringify(history, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error saving question history:', error);
    }
  }

  loadQuestionHistory(fileName: string): QuestionHistory | null {
    const companyKey = this.extractCompanyKey(fileName);
    if (!companyKey) return null;

    const historyFile = this.getHistoryFilePath(companyKey);
    
    if (!existsSync(historyFile)) {
      return null;
    }

    try {
      const data = readFileSync(historyFile, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading question history:', error);
      return null;
    }
  }

  getQuestionResponse(fileName: string, questionId: string): QuestionResponse | null {
    const history = this.loadQuestionHistory(fileName);
    if (!history) return null;

    return history.responses.find(r => r.questionId === questionId) || null;
  }

  hasQuestionHistory(fileName: string): boolean {
    const history = this.loadQuestionHistory(fileName);
    return history !== null && history.responses.length > 0;
  }

  private createNewHistory(questionSet: QuestionSet): QuestionHistory {
    return {
      entityName: questionSet.entityName,
      documentType: questionSet.documentType,
      reportType: questionSet.reportType,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      responses: []
    };
  }

  getQuestionStats(fileName: string): { total: number; answered: number } | null {
    const history = this.loadQuestionHistory(fileName);
    if (!history) return null;

    return {
      total: 10, // Default number of questions per clinical study
      answered: history.responses.length
    };
  }
}
