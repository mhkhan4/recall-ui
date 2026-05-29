'use client';

import { MessageSquare, Trash2 } from 'lucide-react';
import { useChatStore } from '@/store/chat';
import { cn } from '@/lib/cn';

interface SidebarThreadsProps {
  onSelect?: () => void;
}

export function SidebarThreads({ onSelect }: SidebarThreadsProps) {
  const { threads, activeThreadId, setActiveThread, deleteThread } = useChatStore();

  if (threads.length === 0) {
    return (
      <div className="px-4 py-3 text-xs text-muted-foreground text-center">
        No conversations yet
      </div>
    );
  }

  return (
    <div className="px-2 py-1 space-y-0.5">
      {threads.map((t) => (
        <div
          key={t.id}
          className={cn(
            'group flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors',
            t.id === activeThreadId
              ? 'bg-zinc-800 text-foreground'
              : 'text-muted-foreground hover:bg-zinc-800/60 hover:text-foreground',
          )}
          onClick={() => { setActiveThread(t.id); onSelect?.(); }}
        >
          <MessageSquare size={12} className="shrink-0 opacity-60" />
          <span className="flex-1 text-xs truncate">{t.title}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteThread(t.id);
            }}
            className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-zinc-700 transition-all"
          >
            <Trash2 size={10} />
          </button>
        </div>
      ))}
    </div>
  );
}
