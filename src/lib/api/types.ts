export type QueryMode = 'standard' | 'complex';

export interface QueryFilters {
  repository_name?: string;
  file_format?: string;
  author?: string;
}

export interface QueryRequest {
  question: string;
  top_k?: number;
  mode?: QueryMode;
  filters?: QueryFilters;
}

export interface SourceChunk {
  chunk_text: string;
  file_path: string;
  repository_name: string;
  chunk_index: number;
  blob_url: string | null;
  author: string;
  commit_sha: string;
  relevance_score: number;
}

export interface QueryResponse {
  answer: string;
  sources: SourceChunk[];
  mode: string;
  model_used: string;
  retrieved_count: number;
  reranked_count: number;
  latency_ms: number;
}

export interface SourcesEventPayload {
  sources: SourceChunk[];
  retrieved_count: number;
  reranked_count: number;
}

export interface DoneEventPayload {
  mode: string;
  model_used: string;
  latency_ms: number;
}

export interface ErrorEventPayload {
  detail: string;
}

export type SSEEvent =
  | { type: 'sources'; data: SourcesEventPayload }
  | { type: 'token'; data: { token: string } }
  | { type: 'done'; data: DoneEventPayload }
  | { type: 'error'; data: ErrorEventPayload };
