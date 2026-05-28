import type { QueryRequest, QueryResponse } from './types';

const QUERY_SERVICE_URL =
  process.env.NEXT_PUBLIC_QUERY_SERVICE_URL ?? 'http://localhost:8002';

export async function queryOnce(
  request: QueryRequest,
  token: string,
  signal?: AbortSignal,
): Promise<QueryResponse> {
  const res = await fetch(`${QUERY_SERVICE_URL}/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(request),
    signal,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` })) as { detail?: string };
    throw new Error(err.detail ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<QueryResponse>;
}
