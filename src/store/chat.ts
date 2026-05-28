'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SourceChunk, DoneEventPayload, QueryMode, QueryFilters } from '@/lib/api/types';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: SourceChunk[];
  isStreaming?: boolean;
  retrieving?: boolean;
  metadata?: DoneEventPayload;
  error?: string;
  createdAt: number;
}

export interface Thread {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

interface ChatState {
  threads: Thread[];
  activeThreadId: string | null;
  mode: QueryMode;
  filters: QueryFilters;
  isStreaming: boolean;

  createThread: () => string;
  setActiveThread: (id: string | null) => void;
  deleteThread: (id: string) => void;
  addMessage: (threadId: string, message: ChatMessage) => void;
  appendToken: (threadId: string, messageId: string, token: string) => void;
  setMessageSources: (threadId: string, messageId: string, sources: SourceChunk[]) => void;
  setMessageRetrieving: (threadId: string, messageId: string, value: boolean) => void;
  finalizeMessage: (threadId: string, messageId: string, metadata: DoneEventPayload) => void;
  setMessageError: (threadId: string, messageId: string, error: string) => void;
  setMode: (mode: QueryMode) => void;
  setFilters: (filters: QueryFilters) => void;
  setIsStreaming: (value: boolean) => void;
  getActiveThread: () => Thread | null;
}

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      threads: [],
      activeThreadId: null,
      mode: 'standard',
      filters: {},
      isStreaming: false,

      createThread() {
        const id = uid();
        const thread: Thread = {
          id,
          title: 'New Chat',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((s) => ({ threads: [thread, ...s.threads], activeThreadId: id }));
        return id;
      },

      setActiveThread: (id) => set({ activeThreadId: id }),

      deleteThread: (id) =>
        set((s) => {
          const threads = s.threads.filter((t) => t.id !== id);
          const activeThreadId =
            s.activeThreadId === id ? (threads[0]?.id ?? null) : s.activeThreadId;
          return { threads, activeThreadId };
        }),

      addMessage: (threadId, message) =>
        set((s) => ({
          threads: s.threads.map((t) =>
            t.id !== threadId
              ? t
              : {
                  ...t,
                  messages: [...t.messages, message],
                  title:
                    t.messages.length === 0 && message.role === 'user'
                      ? message.content.slice(0, 60)
                      : t.title,
                  updatedAt: Date.now(),
                },
          ),
        })),

      appendToken: (threadId, messageId, token) =>
        set((s) => ({
          threads: s.threads.map((t) =>
            t.id !== threadId
              ? t
              : {
                  ...t,
                  messages: t.messages.map((m) =>
                    m.id === messageId ? { ...m, content: m.content + token } : m,
                  ),
                },
          ),
        })),

      setMessageSources: (threadId, messageId, sources) =>
        set((s) => ({
          threads: s.threads.map((t) =>
            t.id !== threadId
              ? t
              : {
                  ...t,
                  messages: t.messages.map((m) =>
                    m.id === messageId ? { ...m, sources, retrieving: false } : m,
                  ),
                },
          ),
        })),

      setMessageRetrieving: (threadId, messageId, value) =>
        set((s) => ({
          threads: s.threads.map((t) =>
            t.id !== threadId
              ? t
              : {
                  ...t,
                  messages: t.messages.map((m) =>
                    m.id === messageId ? { ...m, retrieving: value } : m,
                  ),
                },
          ),
        })),

      finalizeMessage: (threadId, messageId, metadata) =>
        set((s) => ({
          threads: s.threads.map((t) =>
            t.id !== threadId
              ? t
              : {
                  ...t,
                  messages: t.messages.map((m) =>
                    m.id === messageId
                      ? { ...m, isStreaming: false, retrieving: false, metadata }
                      : m,
                  ),
                },
          ),
        })),

      setMessageError: (threadId, messageId, error) =>
        set((s) => ({
          threads: s.threads.map((t) =>
            t.id !== threadId
              ? t
              : {
                  ...t,
                  messages: t.messages.map((m) =>
                    m.id === messageId
                      ? { ...m, isStreaming: false, retrieving: false, error }
                      : m,
                  ),
                },
          ),
        })),

      setMode: (mode) => set({ mode }),
      setFilters: (filters) => set({ filters }),
      setIsStreaming: (isStreaming) => set({ isStreaming }),

      getActiveThread() {
        const { threads, activeThreadId } = get();
        return threads.find((t) => t.id === activeThreadId) ?? null;
      },
    }),
    {
      name: 'recall-chat-v1',
      partialize: (s) => ({
        threads: s.threads,
        activeThreadId: s.activeThreadId,
        mode: s.mode,
        filters: s.filters,
      }),
    },
  ),
);
