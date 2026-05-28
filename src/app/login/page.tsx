'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Github } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { buildGitHubLoginUrl } from '@/lib/auth/oauth';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth, isAuthenticated } = useAuthStore();
  const [manualToken, setManualToken] = useState('');
  const [manualUsername, setManualUsername] = useState('');
  const [showManual, setShowManual] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace('/chat');
    }
  }, [isAuthenticated, router]);

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const token = manualToken.trim();
    const username = manualUsername.trim();
    if (!token) { setError('Token is required'); return; }
    if (!username) { setError('GitHub username is required'); return; }
    setAuth(token, username);
    router.replace('/chat');
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">

        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm font-mono">R</span>
            </div>
            <span className="text-xl font-semibold tracking-tight">recall</span>
          </div>
          <p className="text-sm text-muted-foreground">AI Second Brain for developers</p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div>
            <h1 className="text-base font-semibold">Sign in</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Connect your GitHub account to index your repositories
            </p>
          </div>

          <a
            href={buildGitHubLoginUrl()}
            className="flex items-center justify-center gap-2.5 w-full py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-sm font-medium rounded-lg transition-colors duration-150"
          >
            <Github size={16} />
            Continue with GitHub
          </a>

          <div className="relative flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {!showManual ? (
            <button
              onClick={() => setShowManual(true)}
              className="text-xs text-muted-foreground hover:text-foreground w-full text-center transition-colors"
            >
              Enter token manually
            </button>
          ) : (
            <form onSubmit={handleManualSubmit} className="space-y-3">
              <p className="text-xs text-muted-foreground">
                After clicking &quot;Continue with GitHub&quot; above, copy the{' '}
                <code className="font-mono bg-muted px-1 rounded">token</code> value from
                the JSON response and paste it here.
              </p>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="GitHub username"
                  value={manualUsername}
                  onChange={(e) => setManualUsername(e.target.value)}
                  className="w-full bg-zinc-900 border border-border rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <textarea
                  placeholder="Paste JWT token…"
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  rows={3}
                  className="w-full bg-zinc-900 border border-border rounded-lg px-3 py-2 text-xs font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                />
              </div>
              {error && <p className="text-xs text-destructive">{error}</p>}
              <button
                type="submit"
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-sm font-medium rounded-lg transition-colors"
              >
                Sign in
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Your session is stored locally in this browser.
        </p>
      </div>
    </div>
  );
}
