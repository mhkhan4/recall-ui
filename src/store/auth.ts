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

      isAuthenticated: () => {
        const { token } = get();
        if (!token) return false;
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (Date.now() >= payload.exp * 1000) {
            set({ token: null, username: null, avatarUrl: null });
            return false;
          }
          return true;
        } catch {
          return false;
        }
      },
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
