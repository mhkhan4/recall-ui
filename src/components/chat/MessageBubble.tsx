'use client';

import { Bot, User, AlertCircle, Zap, Brain } from 'lucide-react';
import type { ChatMessage } from '@/store/chat';
import { Markdown } from '@/components/markdown/Markdown';
import { SourcePill } from './SourcePill';
import { MessageSkeleton } from './MessageSkeleton';
import { StreamingCursor } from './StreamingCursor';
import { cn } from '@/lib/cn';

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex gap-3 justify-end">
        <div className="max-w-[80%] bg-zinc-800 text-sm px-4 py-2.5 rounded-2xl rounded-tr-sm">
          {message.content}
        </div>
        <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center shrink-0 mt-0.5">
          <User size={12} className="text-zinc-300" />
        </div>
      </div>
    );
  }

  // Retrieving skeleton
  if (message.retrieving && !message.content) {
    return (
      <div className="flex gap-3">
        <AssistantAvatar />
        <div className="flex-1">
          <MessageSkeleton />
        </div>
      </div>
    );
  }

  // Error state
  if (message.error) {
    return (
      <div className="flex gap-3">
        <AssistantAvatar error />
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2 text-xs text-destructive">
            <AlertCircle size={12} />
            <span>Error</span>
          </div>
          <p className="text-sm text-destructive/80">{message.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 animate-fade-in">
      <AssistantAvatar />
      <div className="flex-1 min-w-0 space-y-3">
        {/* Message content */}
        <div className="text-sm">
          <Markdown
            content={message.content}
            streaming={message.isStreaming}
          />
          {message.isStreaming && !message.content && (
            <StreamingCursor />
          )}
          {message.isStreaming && message.content && (
            <StreamingCursor />
          )}
        </div>

        {/* Sources */}
        {message.sources && message.sources.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              Sources
            </p>
            <div className="flex flex-wrap gap-1.5">
              {message.sources.map((src, i) => (
                <SourcePill key={`${src.file_path}-${src.chunk_index}`} source={src} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* Metadata footer */}
        {message.metadata && (
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground pt-1">
            <span className={cn(
              'flex items-center gap-1',
              message.metadata.mode === 'complex' ? 'text-purple-400' : 'text-blue-400',
            )}>
              {message.metadata.mode === 'complex' ? <Brain size={10} /> : <Zap size={10} />}
              {message.metadata.model_used}
            </span>
            <span>{message.metadata.latency_ms.toFixed(0)}ms</span>
          </div>
        )}
      </div>
    </div>
  );
}

function AssistantAvatar({ error = false }: { error?: boolean }) {
  return (
    <div
      className={cn(
        'w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5',
        error ? 'bg-destructive/20' : 'bg-blue-600/20',
      )}
    >
      <Bot size={12} className={error ? 'text-destructive' : 'text-blue-400'} />
    </div>
  );
}
