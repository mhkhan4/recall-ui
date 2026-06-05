'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Command } from 'cmdk';
import { Search, Loader2, Github, FileCode, MessageSquare, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useChatStore } from '@/store/chat';
import { queryOnce } from '@/lib/api/queryService';
import type { SourceChunk } from '@/lib/api/types';
import { cn } from '@/lib/cn';

function getFileLabel(path: string): string {
  const parts = path.split('/');
  return parts[parts.length - 1] ?? path;
}

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SourceChunk[]>([]);
  const [error, setError] = useState('');

  const { token } = useAuthStore();
  const { createThread, addMessage, setActiveThread } = useChatStore();

  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const abortRef = useRef<AbortController | null>(null);

  // Register Cmd+K / Ctrl+K globally
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  // Debounced search
  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!search.trim() || !token || !open) {
      setResults([]);
      setError('');
      return;
    }
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    const { signal } = abortRef.current;

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const res = await queryOnce({ question: search.trim(), mode: 'standard' }, token, signal);
        setResults(res.sources ?? []);
      } catch (e) {
        if ((e as Error).name === 'AbortError') return;
        setError((e as Error).message ?? 'Search failed');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [search, token, open]);

  function handleClose() {
    setOpen(false);
    setSearch('');
    setResults([]);
    setError('');
  }

  const startChatFromSearch = useCallback(() => {
    if (!search.trim()) return;
    const q = search.trim();
    const threadId = createThread();
    addMessage(threadId, {
      id: `${Date.now()}`,
      role: 'user',
      content: q,
      createdAt: Date.now(),
    });
    setActiveThread(threadId);
    handleClose();
  }, [search, createThread, addMessage, setActiveThread]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] p-4 bg-black/50 backdrop-blur-sm animate-in fade-in-0"
      onClick={handleClose}
    >
      <Command
        className="w-full max-w-2xl bg-zinc-900 border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95"
        onClick={(e) => e.stopPropagation()}
        shouldFilter={false}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 border-b border-border">
          {loading ? (
            <Loader2 size={16} className="text-muted-foreground shrink-0 animate-spin" />
          ) : (
            <Search size={16} className="text-muted-foreground shrink-0" />
          )}
          <Command.Input
            value={search}
            onValueChange={setSearch}
            placeholder="Search your codebase…"
            className="flex-1 bg-transparent py-4 text-sm outline-none placeholder:text-muted-foreground"
            autoFocus
          />
          <kbd className="text-[10px] text-muted-foreground bg-zinc-800 px-1.5 py-0.5 rounded font-mono">
            ESC
          </kbd>
        </div>

        <Command.List className="max-h-[400px] overflow-y-auto p-2">
          {!token && (
            <Command.Empty className="py-8 text-center text-sm text-muted-foreground">
              Sign in to search your codebase
            </Command.Empty>
          )}

          {token && !search.trim() && (
            <div className="py-6 text-center text-xs text-muted-foreground">
              Start typing to search your indexed repositories
            </div>
          )}

          {error && (
            <div className="px-3 py-2 text-xs text-destructive">{error}</div>
          )}

          {/* Start chat option */}
          {search.trim() && (
            <Command.Group heading="Actions">
              <Command.Item
                onSelect={startChatFromSearch}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-sm',
                  'hover:bg-zinc-800 data-[selected=true]:bg-zinc-800',
                  'aria-selected:bg-zinc-800',
                )}
              >
                <MessageSquare size={14} className="text-blue-400 shrink-0" />
                <span className="flex-1">
                  Ask: <span className="text-blue-400">&ldquo;{search}&rdquo;</span>
                </span>
                <ArrowRight size={12} className="text-muted-foreground" />
              </Command.Item>
            </Command.Group>
          )}

          {/* Source results */}
          {results.length > 0 && (
            <Command.Group heading="Sources" className="mt-1">
              {results.map((src) => (
                <Command.Item
                  key={`${src.repository_name}-${src.file_path}-${src.chunk_index}`}
                  value={`${src.file_path}-${src.chunk_index}`}
                  onSelect={() => {
                    if (src.blob_url) window.open(src.blob_url, '_blank');
                    handleClose();
                  }}
                  className={cn(
                    'flex items-start gap-3 px-3 py-2.5 rounded-lg cursor-pointer',
                    'hover:bg-zinc-800 aria-selected:bg-zinc-800',
                  )}
                >
                  <FileCode size={14} className="text-muted-foreground shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-foreground truncate">
                        {getFileLabel(src.file_path)}
                      </span>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {(src.relevance_score * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <Github size={9} />
                      <span>{src.repository_name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mt-1">
                      {src.chunk_text.slice(0, 120)}…
                    </p>
                  </div>
                </Command.Item>
              ))}
            </Command.Group>
          )}
        </Command.List>

        {/* Footer */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-border">
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <kbd className="bg-zinc-800 px-1 py-0.5 rounded font-mono">↑↓</kbd>
            <span>navigate</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <kbd className="bg-zinc-800 px-1 py-0.5 rounded font-mono">↵</kbd>
            <span>select</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <kbd className="bg-zinc-800 px-1 py-0.5 rounded font-mono">⌘K</kbd>
            <span>close</span>
          </div>
        </div>
      </Command>
    </div>
  );
}
