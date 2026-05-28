'use client';

import { SquarePen, LogOut, Settings, Command } from 'lucide-react';
import * as Avatar from '@radix-ui/react-avatar';
import { useChatStore } from '@/store/chat';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { SidebarSources } from './SidebarSources';
import { SidebarThreads } from './SidebarThreads';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

export function AppSidebar() {
  const { createThread, setActiveThread } = useChatStore();
  const { username, avatarUrl, clearAuth } = useAuthStore();
  const router = useRouter();

  function handleNewChat() {
    const id = createThread();
    setActiveThread(id);
  }

  function handleLogout() {
    clearAuth();
    router.replace('/login');
  }

  function handleKbd(e: React.MouseEvent) {
    e.currentTarget.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }),
    );
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }),
    );
  }

  return (
    <aside className="w-60 shrink-0 flex flex-col h-full bg-zinc-950 border-r border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-xs font-mono">R</span>
          </div>
          <span className="text-sm font-semibold tracking-tight">recall</span>
        </div>
        <button
          onClick={handleNewChat}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-zinc-800 transition-colors"
          title="New chat"
        >
          <SquarePen size={14} />
        </button>
      </div>

      <Separator />

      {/* Cmd+K shortcut hint */}
      <div className="px-3 pt-3 pb-1">
        <button
          onClick={handleKbd}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-zinc-600 transition-colors text-xs"
        >
          <Command size={11} />
          <span className="flex-1 text-left">Quick search</span>
          <kbd className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
        </button>
      </div>

      <Separator className="mt-3" />

      {/* Sources status */}
      <SidebarSources />

      <Separator />

      {/* Threads */}
      <div className="flex-1 min-h-0">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-4 pt-3 pb-1">
          Recent
        </p>
        <ScrollArea className="h-full">
          <SidebarThreads />
          <div className="h-4" />
        </ScrollArea>
      </div>

      <Separator />

      {/* Footer */}
      <div className="p-3 space-y-1 shrink-0">
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <Avatar.Root className="w-6 h-6 rounded-full overflow-hidden shrink-0">
            {avatarUrl ? (
              <Avatar.Image src={avatarUrl} alt={username ?? 'User'} className="w-full h-full object-cover" />
            ) : null}
            <Avatar.Fallback className="w-full h-full bg-zinc-700 flex items-center justify-center text-[10px] font-semibold">
              {username?.[0]?.toUpperCase() ?? 'U'}
            </Avatar.Fallback>
          </Avatar.Root>
          <span className="flex-1 text-xs text-foreground truncate">{username ?? 'User'}</span>
        </div>

        <button
          onClick={() => router.push('/settings')}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-zinc-800 transition-colors"
        >
          <Settings size={13} />
          Settings
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-destructive hover:bg-zinc-800 transition-colors"
        >
          <LogOut size={13} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
