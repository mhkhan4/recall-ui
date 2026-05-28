'use client';

import { useState } from 'react';
import { Github, ExternalLink, X, FileCode } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import type { SourceChunk } from '@/lib/api/types';
import { cn } from '@/lib/cn';

interface SourcePillProps {
  source: SourceChunk;
  index: number;
}

function getFileLabel(path: string): string {
  const parts = path.split('/');
  return parts[parts.length - 1] ?? path;
}

function getRelevanceColor(score: number): string {
  if (score >= 0.8) return 'text-green-400 border-green-500/30 bg-green-500/10';
  if (score >= 0.6) return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
  return 'text-zinc-400 border-zinc-600/40 bg-zinc-700/20';
}

export function SourcePill({ source, index }: SourcePillProps) {
  const [open, setOpen] = useState(false);
  const label = getFileLabel(source.file_path);
  const colorClass = getRelevanceColor(source.relevance_score);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          className={cn(
            'inline-flex items-center gap-1.5 text-xs font-mono px-2 py-0.5 rounded border transition-all duration-100 hover:brightness-125',
            colorClass,
          )}
        >
          <Github size={10} />
          <span className="max-w-[160px] truncate">
            {source.repository_name.split('/')[1] ?? source.repository_name}: {label}
          </span>
          <span className="text-[10px] opacity-60">{(source.relevance_score * 100).toFixed(0)}%</span>
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[80vh] bg-zinc-900 border border-border rounded-xl shadow-2xl flex flex-col animate-in fade-in-0 zoom-in-95">
          {/* Header */}
          <div className="flex items-start justify-between p-4 border-b border-border">
            <div className="space-y-1 min-w-0 pr-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Github size={12} />
                <span>{source.repository_name}</span>
                <span>·</span>
                <span className="font-mono">#{index + 1}</span>
              </div>
              <p className="text-sm font-mono text-foreground truncate">{source.file_path}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>by {source.author}</span>
                <span>·</span>
                <span className="font-mono">{source.commit_sha.slice(0, 7)}</span>
                <span>·</span>
                <span>{(source.relevance_score * 100).toFixed(1)}% match</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {source.blob_url && (
                <a
                  href={source.blob_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <ExternalLink size={12} />
                  View file
                </a>
              )}
              <Dialog.Close className="p-1 rounded hover:bg-zinc-800 text-muted-foreground hover:text-foreground transition-colors">
                <X size={14} />
              </Dialog.Close>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
              <FileCode size={12} />
              <span>Chunk {source.chunk_index}</span>
            </div>
            <pre className="text-xs font-mono bg-zinc-950 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap leading-relaxed text-zinc-300">
              {source.chunk_text}
            </pre>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
