'use client';

import { type ReactNode } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
  className?: string;
}

export default function DashboardLayout({
  children,
  sidebar,
  className = '',
}: DashboardLayoutProps) {
  return (
    <div className={`mx-auto w-full max-w-7xl px-4 py-6 md:px-6 lg:px-8 ${className}`}>
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Main content area */}
        <main className="min-w-0 flex-1">
          <div className="flex flex-col gap-6">{children}</div>
        </main>

        {/* Sidebar - stacks below on mobile, right column on desktop */}
        {sidebar && (
          <aside className="w-full shrink-0 lg:w-80 xl:w-96">
            <div className="flex flex-col gap-6 lg:sticky lg:top-6">{sidebar}</div>
          </aside>
        )}
      </div>
    </div>
  );
}
