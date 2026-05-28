'use client';

import { useAuthStore } from '@/store/auth';
import { useChatStore } from '@/store/chat';
import { useRouter } from 'next/navigation';
import { AuthBoundary } from '@/components/layout/AuthBoundary';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Trash2, LogOut } from 'lucide-react';

export default function SettingsPage() {
  const { username, token, clearAuth } = useAuthStore();
  const { threads } = useChatStore();
  const router = useRouter();

  function handleWipeData() {
    if (confirm('Delete all local conversation history? This cannot be undone.')) {
      localStorage.clear();
      window.location.href = '/login';
    }
  }

  function handleLogout() {
    clearAuth();
    router.replace('/login');
  }

  return (
    <AuthBoundary>
      <div className="flex h-screen overflow-hidden">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-xl space-y-8">
            <div>
              <h1 className="text-lg font-semibold">Settings</h1>
              <p className="text-sm text-muted-foreground mt-1">Manage your Recall session</p>
            </div>

            {/* Account */}
            <section className="space-y-3">
              <h2 className="text-sm font-medium">Account</h2>
              <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">GitHub username</span>
                  <span className="font-mono">{username ?? '—'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">JWT token</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {token ? `${token.slice(0, 20)}…` : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Local threads</span>
                  <span>{threads.length}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <LogOut size={14} />
                  Sign out
                </button>
              </div>
            </section>

            {/* Danger zone */}
            <section className="space-y-3">
              <h2 className="text-sm font-medium text-destructive">Danger Zone</h2>
              <div className="bg-card border border-destructive/30 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Delete all local data</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Removes all conversation history stored in this browser.
                    </p>
                  </div>
                  <button
                    onClick={handleWipeData}
                    className="flex items-center gap-2 text-sm text-destructive hover:bg-destructive/10 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Trash2 size={13} />
                    Delete
                  </button>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </AuthBoundary>
  );
}
