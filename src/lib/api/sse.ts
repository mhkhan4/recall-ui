import type {
  QueryRequest,
  SourcesEventPayload,
  DoneEventPayload,
  ErrorEventPayload,
} from './types';

const QUERY_SERVICE_URL = '/api/query-service';

export interface StreamCallbacks {
  onSources: (event: SourcesEventPayload) => void;
  onToken: (token: string) => void;
  onDone: (event: DoneEventPayload) => void;
  onError: (event: ErrorEventPayload) => void;
}

export async function streamQuery(
  request: QueryRequest,
  authToken: string,
  callbacks: StreamCallbacks,
  signal?: AbortSignal,
): Promise<void> {
  let res: Response;
  try {
    res = await fetch(`${QUERY_SERVICE_URL}/query/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(request),
      signal,
    });
  } catch (err) {
    if ((err as Error).name === 'AbortError') return;
    callbacks.onError({ detail: 'Network error — is the query service running?' });
    return;
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    let detail = `HTTP ${res.status}`;
    try {
      const json = JSON.parse(text) as { detail?: string };
      if (json.detail) detail = json.detail;
    } catch {
      // use raw text
      if (text) detail = text;
    }
    callbacks.onError({ detail });
    return;
  }

  if (!res.body) {
    callbacks.onError({ detail: 'No response body from query service' });
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      let eventType = '';
      let dataStr = '';

      for (const line of lines) {
        if (line.startsWith('event: ')) {
          eventType = line.slice(7).trim();
        } else if (line.startsWith('data: ')) {
          dataStr = line.slice(6).trim();
        } else if (line === '') {
          if (eventType && dataStr) {
            try {
              const payload = JSON.parse(dataStr) as unknown;
              switch (eventType) {
                case 'sources':
                  callbacks.onSources(payload as SourcesEventPayload);
                  break;
                case 'token':
                  callbacks.onToken((payload as { token: string }).token);
                  break;
                case 'done':
                  callbacks.onDone(payload as DoneEventPayload);
                  break;
                case 'error':
                  callbacks.onError(payload as ErrorEventPayload);
                  break;
              }
            } catch {
              // ignore malformed SSE lines
            }
            eventType = '';
            dataStr = '';
          }
        }
      }
    }
  } catch (err) {
    if ((err as Error).name !== 'AbortError') {
      callbacks.onError({ detail: 'Stream interrupted unexpectedly' });
    }
  } finally {
    reader.releaseLock();
  }
}
