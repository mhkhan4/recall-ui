'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { useChatStore } from '@/store/chat';
import { useRouter } from 'next/navigation';
import { AuthBoundary } from '@/components/layout/AuthBoundary';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Trash2, LogOut, GitBranch, Loader2 } from 'lucide-react';
import { fetchRepos, updateIndexBranch } from '@/lib/api/repos';
import type { RepoListItem } from '@/lib/api/repos';

export default function SettingsPage() {
  const { username, token, clearAuth } = useAuthStore();
  const { threads } = useChatStore();
  const router = useRouter();

  const [repos, setRepos] = useState<RepoListItem[] | null>(null);
  const [reposError, setReposError] = useState<string | null>(null);
  const [savingRepo, setSavingRepo] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [savedRepo, setSavedRepo] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    fetchRepos(token)
      .then((data) => {
        setRepos(data);
        const initial: Record<string, string> = {};
        for (const r of data) {
          initial[r.repo_full_name] = r.index_branch ?? '';
        }
        setDraft(initial);
      })
      .catch(() => setReposError('Could not load repositories.'));
  }, [token]);

  async function handleSaveBranch(repoFullName: string) {
    if (!token) return;
    const [owner, repo] = repoFullName.split('/');
    const value = draft[repoFullName]?.trim() || null;
    setSavingRepo(repoFullName);
    try {
      const result = await updateIndexBranch(token, owner, repo, value);
      setRepos((prev) =>
        prev?.map((r) =>
          r.repo_full_name === repoFullName
            ? { ...r, index_branch: result.index_branch, status: 'pending' }
            : r,
        ) ?? prev,
      );
      setSavedRepo(repoFullName);
      setTimeout(() => setSavedRepo(null), 3000);
    } catch {
      setReposError(`Failed to update branch for ${repoFullName}.`);
    } finally {
      setSavingRepo(null);
    }
  }

  function handleWipeData() {
    if (confirm('Delete all local conversation history? This cannot be undone.')) {
      localStorage.removeItem('recall-auth');
      localStorage.removeItem('recall-chat-v1');
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

            {/* Repositories */}
            <section className="space-y-3">
              <h2 className="text-sm font-medium">Repositories</h2>
              <p className="text-xs text-muted-foreground">
                Choose which branch to index per repo. Leave blank to follow the GitHub default branch.
              </p>

              {reposError && (
                <p className="text-xs text-destructive">{reposError}</p>
              )}

              {repos === null && !reposError && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                  <Loader2 size={12} className="animate-spin" />
                  Loading repositories…
                </div>
              )}

              {repos !== null && repos.length === 0 && (
                <p className="text-xs text-muted-foreground">No repositories registered yet.</p>
              )}

              {repos !== null && repos.length > 0 && (
                <div className="space-y-2">
                  {repos.map((r) => (
                    <div
                      key={r.repo_full_name}
                      className="bg-card border border-border rounded-xl p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-mono">{r.repo_full_name}</span>
                        <span className="text-xs text-muted-foreground capitalize">{r.status}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <GitBranch size={13} className="text-muted-foreground shrink-0" />
                        <input
                          type="text"
                          value={draft[r.repo_full_name] ?? ''}
                          onChange={(e) =>
                            setDraft((d) => ({ ...d, [r.repo_full_name]: e.target.value }))
                          }
                          placeholder={r.indexed_branch ?? 'GitHub default'}
                          className="flex-1 bg-background border border-border rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                        <button
                          onClick={() => handleSaveBranch(r.repo_full_name)}
                          disabled={savingRepo === r.repo_full_name}
                          className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-1.5"
                        >
                          {savingRepo === r.repo_full_name && (
                            <Loader2 size={11} className="animate-spin" />
                          )}
                          Save
                        </button>
                      </div>

                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span>{r.files_count} files</span>
                        {r.last_synced_at && (
                          <span>
                            last synced {new Date(r.last_synced_at).toLocaleDateString()}
                          </span>
                        )}
                        {savedRepo === r.repo_full_name && (
                          <span className="text-green-500">Re-indexing…</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
