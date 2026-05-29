'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import { AuthBoundary } from '@/components/layout/AuthBoundary';
import { AppSidebar } from '@/components/layout/AppSidebar';

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthBoundary>
      <div className="flex h-screen overflow-hidden">
        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 overflow-hidden flex flex-col min-w-0">
          {/* Mobile top bar */}
          <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-border shrink-0 bg-zinc-950">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-zinc-800 transition-colors"
              aria-label="Open sidebar"
            >
              <Menu size={18} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-[10px] font-mono">R</span>
              </div>
              <span className="text-sm font-semibold tracking-tight">recall</span>
            </div>
          </div>

          <div className="flex-1 min-h-0">
            {children}
          </div>
        </main>
      </div>
    </AuthBoundary>
  );
}
