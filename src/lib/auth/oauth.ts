export function buildGitHubLoginUrl(): string {
  return '/api/ingest-gate/auth/github';
}

export interface CallbackParams {
  token: string;
  username: string;
  avatarUrl?: string;
}

// Reads token from the URL fragment (#token=...&username=...).
// The fragment is never sent to any server so it never appears in access logs.
// Call history.replaceState immediately after reading to remove it from browser history.
export function parseCallbackParams(): CallbackParams | null {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash.slice(1);
  if (!hash) return null;
  const params = new URLSearchParams(hash);
  const token = params.get('token');
  const username = params.get('username');
  if (!token || !username) return null;
  const avatarUrl = params.get('avatar_url') ?? undefined;
  return { token, username, avatarUrl };
}
