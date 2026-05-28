const INGEST_GATE_URL =
  process.env.NEXT_PUBLIC_INGEST_GATE_URL ?? 'http://localhost:8000';

export function buildGitHubLoginUrl(): string {
  return `${INGEST_GATE_URL}/auth/github`;
}

export interface CallbackParams {
  token: string;
  username: string;
  avatarUrl?: string;
}

export function parseCallbackParams(
  searchParams: URLSearchParams,
): CallbackParams | null {
  const token = searchParams.get('token');
  const username = searchParams.get('username');
  if (!token || !username) return null;
  const avatarUrl = searchParams.get('avatar_url') ?? undefined;
  return { token, username, avatarUrl };
}
