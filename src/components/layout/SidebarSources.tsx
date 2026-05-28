'use client';

import { Github, Slack, GitPullRequest } from 'lucide-react';
import { useAuthStore } from '@/store/auth';

interface SourceItem {
  id: string;
  name: string;
  Icon: React.FC<{ size?: number; className?: string }>;
  status: 'connected' | 'disconnected' | 'soon';
  detail?: string;
}

export function SidebarSources() {
  const username = useAuthStore((s) => s.username);

  const sources: SourceItem[] = [
    {
      id: 'github',
      name: 'GitHub',
      Icon: Github,
      status: username ? 'connected' : 'disconnected',
      detail: username ? `@${username}` : undefined,
    },
    {
      id: 'teams',
      name: 'Microsoft Teams',
      Icon: Slack,
      status: 'soon',
    },
    {
      id: 'jira',
      name: 'Jira',
      Icon: GitPullRequest,
      status: 'soon',
    },
  ];

  return (
    <div className="px-3 py-2">
      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-1 mb-2">
        Sources
      </p>
      <div className="space-y-0.5">
        {sources.map((src) => (
          <div
            key={src.id}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs"
          >
            <src.Icon size={13} className="text-muted-foreground shrink-0" />
            <span className="flex-1 truncate text-muted-foreground">{src.name}</span>
            {src.status === 'connected' && (
              <span className="flex items-center gap-1 text-green-400 text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                {src.detail ?? 'Connected'}
              </span>
            )}
            {src.status === 'disconnected' && (
              <span className="text-[10px] text-muted-foreground">Not connected</span>
            )}
            {src.status === 'soon' && (
              <span className="text-[10px] text-zinc-600">Soon</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
