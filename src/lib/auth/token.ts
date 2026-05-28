const TOKEN_KEY = 'recall_token';
const USER_KEY = 'recall_user';

export interface StoredUser {
  username: string;
  avatarUrl?: string;
}

export interface Session extends StoredUser {
  token: string;
}

export function getSession(): Session | null {
  if (typeof window === 'undefined') return null;
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const raw = localStorage.getItem(USER_KEY);
    if (!token || !raw) return null;
    const user = JSON.parse(raw) as StoredUser;
    return { token, ...user };
  } catch {
    return null;
  }
}

export function setSession(token: string, username: string, avatarUrl?: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify({ username, avatarUrl }));
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}
