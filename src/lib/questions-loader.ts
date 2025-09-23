import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { QuestionSet } from '../types/index.js';

export class QuestionsLoader {
  private questionsDir: string;

  constructor() {
    this.questionsDir = join(process.cwd(), 'prompts-questions');
  }

  loadQuestionsForFile(fileName: string): QuestionSet | null {
    // Extract entity identifier from filename
    const entityKey = this.extractEntityKey(fileName);
    if (!entityKey) return null;

    const questionsFile = join(this.questionsDir, `${entityKey}-questions.json`);
    
    if (!existsSync(questionsFile)) {
      return null;
    }

    try {
      const data = readFileSync(questionsFile, 'utf-8');
      return JSON.parse(data) as QuestionSet;
    } catch (error) {
      console.error(`Error loading questions for ${fileName}:`, error);
      return null;
    }
  }

  detectDocumentType(fileName: string): string {
    const name = fileName.toLowerCase();
    
    // Clinical trial patterns
    if (name.includes('clinical') || name.includes('trial') || 
        name.includes('c4591001') || name.includes('125742') ||
        name.includes('study') || name.includes('protocol') ||
        name.includes('phase') || name.includes('efficacy') ||
        name.includes('safety') || name.includes('adverse') ||
        name.includes('vaccine') || name.includes('drug')) {
      return 'clinical';
    }
    
    // Medical research paper patterns
    if (name.includes('research') || name.includes('paper') || 
        name.includes('journal') || name.includes('article') ||
        name.includes('publication') || name.includes('manuscript')) {
      return 'research';
    }
    
    // Regulatory document patterns
    if (name.includes('fda') || name.includes('ema') || 
        name.includes('regulatory') || name.includes('submission') ||
        name.includes('approval') || name.includes('indication')) {
      return 'regulatory';
    }
    
    // Default fallback
    return 'clinical';
  }

  private extractEntityKey(fileName: string): string | null {
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
    
    // If no pattern matches, try using the first part of filename
    const parts = name.split(/[-_\s]/);
    return parts.length > 0 ? parts[0] : null;
  }

  getAvailableQuestionSets(): string[] {
    if (!existsSync(this.questionsDir)) {
      return [];
    }

    try {
      const files = readdirSync(this.questionsDir);
      return files
        .filter((file: string) => file.endsWith('-questions.json'))
        .map((file: string) => file.replace('-questions.json', ''));
    } catch {
      return [];
    }
  }
}
