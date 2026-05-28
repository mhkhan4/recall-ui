'use client';

import { useEffect } from 'react';
import { useChatStore } from '@/store/chat';
import { ChatThread } from '@/components/chat/ChatThread';

export default function ChatPage() {
  const { activeThreadId, createThread, setActiveThread } = useChatStore();

  useEffect(() => {
    if (!activeThreadId) {
      const id = createThread();
      setActiveThread(id);
    }
  }, [activeThreadId, createThread, setActiveThread]);

  return <ChatThread />;
}
