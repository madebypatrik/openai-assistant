export interface SessionData {
  assistantId: string;
  threadId: string;
  fileId: string;
  fileName: string;
  createdAt: string;
  lastAccessed: string;
  documentType?: string; // 'clinical', 'research', 'regulatory', etc.
  summaries?: {
    overview?: string;
    keyResults?: string;
    methodology?: string;
    impact?: string;
  };
}

export interface AppConfig {
  openaiApiKey: string;
  assistantModel: string;
  maxRetries: number;
  retryDelay: number;
  dataDir: string;
  maxResponseLength: number;
}

export interface AnalysisPrompts {
  overview: string;
  keyResults: string;
  methodology: string;
  impact: string;
}

export interface PredefinedQuestion {
  id: string;
  category: string;
  question: string;
}

export interface QuestionSet {
  entityName: string; // Could be drug name, study name, trial identifier, or research topic
  documentType: string; // 'clinical', 'research', 'regulatory', etc.
  reportType: string; // Specific report type within document type (e.g., 'phase-3-trial', 'safety-report')
  questions: PredefinedQuestion[];
}

export interface QuestionResponse {
  questionId: string;
  question: string;
  response: string;
  askedAt: string;
  sessionId: string;
  assistantId: string;
  threadId: string;
  runId?: string;
  model?: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  citations?: Array<{
    start_index: number;
    end_index: number;
    text: string;
    file_citation?: {
      file_id: string;
      quote?: string;
    };
  }>;
  metadata?: {
    confidence?: string;
    processing_time_ms?: number;
    sources_referenced?: number;
  };
}

export interface QuestionHistory {
  entityName: string;
  documentType: string;
  reportType: string;
  createdAt: string;
  lastUpdated: string;
  responses: QuestionResponse[];
}

