'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { cn } from '@/lib/cn';

interface CodeBlockProps {
  language?: string;
  code: string;
  streaming?: boolean;
}

export function CodeBlock({ language = 'text', code, streaming = false }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="group relative my-4 rounded-lg overflow-hidden border border-zinc-700/60">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-700/60">
        <span className="text-xs font-mono text-zinc-400">{language}</span>
        {!streaming && (
          <button
            onClick={handleCopy}
            className={cn(
              'flex items-center gap-1.5 text-xs px-2 py-0.5 rounded transition-all duration-150',
              copied
                ? 'text-green-400'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800',
            )}
            aria-label="Copy code"
          >
            {copied ? (
              <>
                <Check size={11} />
                Copied
              </>
            ) : (
              <>
                <Copy size={11} />
                Copy
              </>
            )}
          </button>
        )}
      </div>

      {/* Code */}
      {streaming ? (
        <pre className="p-4 text-xs font-mono overflow-x-auto bg-zinc-950 text-zinc-300 leading-relaxed">
          <code>{code}</code>
        </pre>
      ) : (
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '1rem',
            background: '#09090b',
            fontSize: '0.75rem',
            lineHeight: '1.6',
          }}
          wrapLongLines={false}
          showLineNumbers={code.split('\n').length > 6}
          lineNumberStyle={{ color: '#4d4d4f', minWidth: '2.5em' }}
        >
          {code}
        </SyntaxHighlighter>
      )}
    </div>
  );
}
