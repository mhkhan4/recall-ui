'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  username: string | null;
  avatarUrl: string | null;
  setAuth: (token: string, username: string, avatarUrl?: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      username: null,
      avatarUrl: null,

      setAuth: (token, username, avatarUrl) =>
        set({ token, username, avatarUrl: avatarUrl ?? null }),

      clearAuth: () => set({ token: null, username: null, avatarUrl: null }),

      isAuthenticated: () => Boolean(get().token),
    }),
    {
      name: 'recall-auth',
      partialize: (s) => ({
        token: s.token,
        username: s.username,
        avatarUrl: s.avatarUrl,
      }),
    },
  ),
);
