'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { parseCallbackParams } from '@/lib/auth/oauth';

export default function AuthCallbackPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = parseCallbackParams();
    if (params) {
      // Immediately overwrite the history entry so the fragment (and token)
      // disappears from browser history before we navigate away.
      history.replaceState(null, '', window.location.pathname);
      setAuth(params.token, params.username, params.avatarUrl);
      router.replace('/chat');
    } else {
      setError('Sign-in failed — no token received. Please try again.');
    }
  }, [setAuth, router]);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-sm w-full space-y-4 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <a
            href="/login"
            className="text-sm text-blue-400 underline underline-offset-2"
          >
            Back to login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span className="inline-block w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        Completing sign-in…
      </div>
    </div>
  );
}
