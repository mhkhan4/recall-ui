'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useChatStore } from '@/store/chat';
import { useAuthStore } from '@/store/auth';
import { streamQuery } from '@/lib/api/sse';
import type { ConversationMessage } from '@/lib/api/types';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { EmptyState } from './EmptyState';

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function ChatThread() {
  const {
    threads,
    activeThreadId,
    mode,
    filters,
    isStreaming,
    createThread,
    addMessage,
    appendToken,
    setMessageSources,
    setMessageRetrieving,
    finalizeMessage,
    setMessageError,
    setMode,
    setFilters,
    setIsStreaming,
  } = useChatStore();

  const { token, clearAuth } = useAuthStore();
  const router = useRouter();

  const thread = threads.find((t) => t.id === activeThreadId);
  const messages = thread?.messages ?? [];

  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Smooth-scroll only when a new message is added; instant scroll keeps up during streaming
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  useEffect(() => {
    if (isStreaming) {
      bottomRef.current?.scrollIntoView({ behavior: 'instant' });
    }
  }, [messages, isStreaming]);

  function stopStreaming() {
    abortRef.current?.abort();
    setIsStreaming(false);
  }

  const handleSubmit = useCallback(
    async (question: string) => {
      if (!token || isStreaming) return;

      let threadId = activeThreadId;
      if (!threadId) {
        threadId = createThread();
      }

      // Add user message
      addMessage(threadId, {
        id: uid(),
        role: 'user',
        content: question,
        createdAt: Date.now(),
      });

      // Add assistant placeholder
      const assistantId = uid();
      addMessage(threadId, {
        id: assistantId,
        role: 'assistant',
        content: '',
        isStreaming: true,
        retrieving: true,
        createdAt: Date.now(),
      });

      // Build rolling window of last 6 messages (3 user+assistant pairs) as context.
      // Excludes the current question and the empty assistant placeholder just added.
      const completedMessages = thread
        ? thread.messages.filter((m) => !m.isStreaming && m.content && !m.error)
        : [];
      const historyWindow = completedMessages.slice(-6);
      const conversation_history: ConversationMessage[] = historyWindow.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      setIsStreaming(true);
      abortRef.current = new AbortController();

      await streamQuery(
        { question, mode, filters, conversation_history },
        token,
        {
          onSources(e) {
            setMessageSources(threadId!, assistantId, e.sources);
            setMessageRetrieving(threadId!, assistantId, false);
          },
          onToken(t) {
            appendToken(threadId!, assistantId, t);
          },
          onDone(e) {
            finalizeMessage(threadId!, assistantId, e);
            setIsStreaming(false);
          },
          onError(e) {
            setMessageError(threadId!, assistantId, e.detail);
            setIsStreaming(false);
          },
          onUnauthorized() {
            setIsStreaming(false);
            clearAuth();
            router.replace('/login');
          },
        },
        abortRef.current.signal,
      );
    },
    [
      token, isStreaming, activeThreadId, mode, filters,
      createThread, addMessage, appendToken, setMessageSources,
      setMessageRetrieving, finalizeMessage, setMessageError, setIsStreaming,
      clearAuth, router,
    ],
  );

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <EmptyState onSuggestion={handleSubmit} />
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <ChatInput
        onSubmit={handleSubmit}
        onStop={stopStreaming}
        isStreaming={isStreaming}
        mode={mode}
        onModeChange={setMode}
        filters={filters}
        onFiltersChange={setFilters}
        disabled={!token}
      />
    </div>
  );
}
