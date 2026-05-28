'use client';

import { AuthBoundary } from '@/components/layout/AuthBoundary';
import { AppSidebar } from '@/components/layout/AppSidebar';

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthBoundary>
      <div className="flex h-screen overflow-hidden">
        <AppSidebar />
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </AuthBoundary>
  );
}
