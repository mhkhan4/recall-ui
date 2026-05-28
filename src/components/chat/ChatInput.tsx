'use client';

import { useState, useRef, useCallback, KeyboardEvent } from 'react';
import { Send, StopCircle, ChevronDown, SlidersHorizontal } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import type { QueryMode, QueryFilters } from '@/lib/api/types';
import { cn } from '@/lib/cn';

interface ChatInputProps {
  onSubmit: (question: string) => void;
  onStop: () => void;
  isStreaming: boolean;
  mode: QueryMode;
  onModeChange: (mode: QueryMode) => void;
  filters: QueryFilters;
  onFiltersChange: (f: QueryFilters) => void;
  disabled?: boolean;
}

const MODE_LABELS: Record<QueryMode, { label: string; description: string }> = {
  standard: { label: 'Standard', description: 'Fast, uses GPT-4.1 mini' },
  complex: { label: 'Complex', description: 'Deep reasoning, uses Claude Sonnet' },
};

export function ChatInput({
  onSubmit,
  onStop,
  isStreaming,
  mode,
  onModeChange,
  filters,
  onFiltersChange,
  disabled,
}: ChatInputProps) {
  const [value, setValue] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(() => {
    const q = value.trim();
    if (!q || isStreaming) return;
    onSubmit(q);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [value, isStreaming, onSubmit]);

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function handleInput() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }

  const hasActiveFilters = Object.values(filters).some(Boolean);

  return (
    <div className="px-4 pb-4 pt-2">
      <div className="max-w-3xl mx-auto">
        {/* Filter row */}
        {showFilters && (
          <div className="flex flex-wrap gap-2 mb-2 px-1">
            <FilterInput
              label="Repo"
              value={filters.repository_name ?? ''}
              onChange={(v) => onFiltersChange({ ...filters, repository_name: v || undefined })}
              placeholder="org/repo"
            />
            <FilterInput
              label="File type"
              value={filters.file_format ?? ''}
              onChange={(v) => onFiltersChange({ ...filters, file_format: v || undefined })}
              placeholder="python, go, ts…"
            />
            <FilterInput
              label="Author"
              value={filters.author ?? ''}
              onChange={(v) => onFiltersChange({ ...filters, author: v || undefined })}
              placeholder="github_username"
            />
          </div>
        )}

        {/* Main input */}
        <div className="relative flex items-end gap-2 bg-zinc-900 border border-border rounded-xl px-3 py-2.5 focus-within:ring-1 focus-within:ring-ring transition-shadow">
          <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            disabled={disabled}
            placeholder="Ask your codebase anything… (⇧Enter for newline)"
            className="flex-1 bg-transparent text-sm resize-none outline-none placeholder:text-muted-foreground max-h-[200px] leading-relaxed"
          />

          <div className="flex items-center gap-1.5 shrink-0 pb-0.5">
            {/* Filters toggle */}
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={cn(
                'p-1.5 rounded-lg transition-colors',
                showFilters || hasActiveFilters
                  ? 'text-blue-400 bg-blue-500/15'
                  : 'text-muted-foreground hover:text-foreground hover:bg-zinc-800',
              )}
              title="Filters"
            >
              <SlidersHorizontal size={14} />
            </button>

            {/* Mode selector */}
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg hover:bg-zinc-800 transition-colors">
                  {MODE_LABELS[mode].label}
                  <ChevronDown size={11} />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="end"
                  sideOffset={6}
                  className="z-50 w-52 bg-zinc-900 border border-border rounded-xl shadow-lg p-1 animate-in fade-in-0 zoom-in-95"
                >
                  {(Object.keys(MODE_LABELS) as QueryMode[]).map((m) => (
                    <DropdownMenu.Item
                      key={m}
                      onSelect={() => onModeChange(m)}
                      className={cn(
                        'flex flex-col gap-0.5 px-3 py-2 rounded-lg cursor-pointer outline-none transition-colors',
                        mode === m ? 'bg-zinc-800' : 'hover:bg-zinc-800',
                      )}
                    >
                      <span className="text-xs font-medium text-foreground">
                        {MODE_LABELS[m].label}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {MODE_LABELS[m].description}
                      </span>
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>

            {/* Send / Stop */}
            {isStreaming ? (
              <button
                onClick={onStop}
                className="p-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-foreground transition-colors"
                title="Stop generation"
              >
                <StopCircle size={14} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!value.trim() || disabled}
                className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="Send (Enter)"
              >
                <Send size={14} />
              </button>
            )}
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground text-center mt-2">
          Recall can make mistakes. Verify critical information in source code.
        </p>
      </div>
    </div>
  );
}

function FilterInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="flex items-center gap-1.5 bg-zinc-800 rounded-lg px-2.5 py-1 border border-border">
      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-transparent text-xs outline-none placeholder:text-zinc-600 w-28"
      />
    </div>
  );
}
