import { Sparkles } from 'lucide-react';

const SUGGESTIONS = [
  'How does the authentication middleware work?',
  'What is the database schema for users?',
  'Explain the GitHub webhook ingestion pipeline.',
  'How are SQS messages consumed and processed?',
  'What vector embedding model is used?',
];

interface EmptyStateProps {
  onSuggestion: (text: string) => void;
}

export function EmptyState({ onSuggestion }: EmptyStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center select-none">
      <div className="w-12 h-12 rounded-2xl bg-blue-600/15 flex items-center justify-center mb-4">
        <Sparkles size={22} className="text-blue-400" />
      </div>
      <h2 className="text-base font-semibold mb-1">Ask your codebase anything</h2>
      <p className="text-sm text-muted-foreground mb-8 max-w-xs">
        Recall searches your indexed repositories and generates an answer with citations.
      </p>
      <div className="flex flex-col gap-2 w-full max-w-sm">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onSuggestion(s)}
            className="text-left text-xs text-muted-foreground px-4 py-2.5 rounded-lg border border-border hover:border-zinc-600 hover:text-foreground hover:bg-zinc-800/50 transition-all duration-150"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
