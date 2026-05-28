'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';
import { CodeBlock } from './CodeBlock';
import { cn } from '@/lib/cn';

interface MarkdownProps {
  content: string;
  streaming?: boolean;
  className?: string;
}

function buildComponents(streaming: boolean): Components {
  return {
    // Override pre to avoid double-wrapping
    pre({ children }) {
      return <>{children}</>;
    },

    code({ className, children, ...props }) {
      const match = /language-(\w+)/.exec(className ?? '');
      const codeStr = String(children).replace(/\n$/, '');
      const isBlock = match != null || codeStr.includes('\n');

      if (isBlock) {
        return (
          <CodeBlock
            language={match?.[1] ?? 'text'}
            code={codeStr}
            streaming={streaming}
          />
        );
      }

      return (
        <code
          className="font-mono text-xs bg-zinc-800 text-zinc-200 px-1.5 py-0.5 rounded"
          {...props}
        >
          {children}
        </code>
      );
    },
  };
}

export function Markdown({ content, streaming = false, className }: MarkdownProps) {
  return (
    <div className={cn('prose', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={buildComponents(streaming)}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
