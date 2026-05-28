'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { parseCallbackParams } from '@/lib/auth/oauth';

function CallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = parseCallbackParams(searchParams);
    if (params) {
      setAuth(params.token, params.username, params.avatarUrl);
      router.replace('/chat');
    } else {
      setError(
        'No token found in the callback URL. Please use the manual token flow on the login page.',
      );
    }
  }, [searchParams, setAuth, router]);

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

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <span className="inline-block w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CallbackInner />
    </Suspense>
  );
}
