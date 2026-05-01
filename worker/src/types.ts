export interface Env {
  AI: Ai;
  CHAT_SESSIONS: KVNamespace;
  VECTORIZE?: VectorizeIndex;
  CORS_ORIGIN: string;
  NOTION_TOKEN: string;
  NOTION_DATABASE_ID: string;
  NOTION_CAPSTONE_DATABASE_ID?: string;
  MESSAGE_BOARD: KVNamespace;
  CAPSTONE_VOTES: KVNamespace;
  SETUP_SECRET?: string;
  SEED_TOKEN?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  message: string;
  sessionId?: string;
  contextNamespace?: string;
}

export interface ChatResponse {
  response: string;
  sessionId: string;
}

export interface Session {
  id: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface VectorMatch {
  id: string;
  score: number;
  metadata?: {
    title?: string;
    content?: string;
    source?: string;
    namespace?: string;
    label?: string;
  };
}
