export interface ColumnMeta {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'unknown';
  sampleValues: any[];
  uniqueCount: number;
  min?: number | string;
  max?: number | string;
  nullable: boolean;
}

export interface Dataset {
  id: string;
  name: string;
  tableName: string;
  rowCount: number;
  columns: ColumnMeta[];
  data: Record<string, any>[];
  fileSizeFormatted?: string;
  uploadedAt: string;
}

export interface ReasoningStep {
  title: string;
  detail: string;
  status: 'waiting' | 'running' | 'done' | 'error';
  timestamp?: number;
}

export interface ChartSuggestion {
  type: 'bar' | 'line' | 'donut' | 'area';
  xAxisKey: string;
  yAxisKey: string;
  title: string;
}

export interface QueryInsight {
  summary: string;
  highlights: string[];
  recommendedAction?: string;
}

export interface QueryResult {
  id: string;
  question: string;
  sql: string;
  columns: string[];
  rows: Record<string, any>[];
  rowCount: number;
  executionTimeMs: number;
  reasoningSteps: ReasoningStep[];
  insight?: QueryInsight;
  chartSuggestion?: ChartSuggestion;
  error?: string;
  timestamp: string;
}

export type AiProvider = 'gemini' | 'groq' | 'claude' | 'openai';

export interface ApiKeyConfig {
  provider: AiProvider;
  key: string;
  model: string;
  useEnvKey?: boolean;
}

export interface HistoryItem {
  id: string;
  question: string;
  sql: string;
  datasetName: string;
  rowCount: number;
  timestamp: string;
}
