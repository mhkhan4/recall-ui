export function buildGitHubLoginUrl(): string {
  return '/api/ingest-gate/auth/github';
}

export interface CallbackParams {
  token: string;
  username: string;
  avatarUrl?: string;
}

// Reads token from query params (?token=...&username=...).
// The callback page clears them from the URL immediately with history.replaceState.
export function parseCallbackParams(): CallbackParams | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  const username = params.get('username');
  if (!token || !username) return null;
  const avatarUrl = params.get('avatar_url') ?? undefined;
  return { token, username, avatarUrl };
}
