'use client';

import { type ReactNode } from 'react';
import Link from 'next/link';
import TopNav from './TopNav';
import BottomTabBar from './BottomTabBar';
import { Wordmark } from '@/components/brand/Wordmark';
import { type Tier } from '@/lib/access-control';

interface DashboardShellProps {
  children: ReactNode;
  user?: {
    email: string;
    name?: string;
  } | null;
  userTier?: Tier;
  onSignOut?: () => void;
}

export default function DashboardShell({
  children,
  user,
  userTier = 'free',
  onSignOut,
}: DashboardShellProps) {
  const displayName = user?.name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-[var(--surface-secondary)]">
      {/* Desktop top navigation - hidden on mobile */}
      <TopNav
        user={user}
        userTier={userTier}
        onSignOut={onSignOut}
      />

      {/* Mobile header - hidden on desktop */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between border-b border-[var(--border-primary)] bg-[var(--surface-primary)]/95 backdrop-blur-lg md:hidden"
        style={{
          paddingTop: 'calc(0.75rem + var(--safe-top))',
          paddingBottom: '0.75rem',
          paddingLeft: 'calc(1rem + var(--safe-left))',
          paddingRight: 'calc(1rem + var(--safe-right))',
        }}
      >
        <Wordmark size="sm" />

        {user ? (
          <div className="relative">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface-tertiary)] text-xs font-bold text-[var(--text-secondary)]">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--surface-primary)] bg-[var(--color-positive)]" />
          </div>
        ) : (
          <Link
            href="/login"
            className="rounded-full bg-[var(--color-accent)] px-3.5 py-1.5 text-xs font-bold text-white"
          >
            Sign In
          </Link>
        )}
      </header>

      {/* Main content area */}
      <main className="with-mobile-tab-bar">
        {children}
      </main>

      {/* Mobile bottom tab bar - hidden on desktop */}
      <BottomTabBar />
    </div>
  );
}
