'use client';

import { type ReactNode } from 'react';
import Link from 'next/link';
import TopNav from './TopNav';
import BottomTabBar from './BottomTabBar';
import UserMenu from './UserMenu';
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
        className="sticky top-0 z-40 flex items-center justify-between border-b border-[var(--border-primary)] bg-[var(--surface-primary)] md:hidden"
        style={{
          paddingTop: 'calc(0.75rem + var(--safe-top))',
          paddingBottom: '0.75rem',
          paddingLeft: 'calc(1rem + var(--safe-left))',
          paddingRight: 'calc(1rem + var(--safe-right))',
        }}
      >
        <Wordmark size="sm" />

        {user ? (
          <UserMenu user={user} userTier={userTier} onSignOut={onSignOut} variant="compact" />
        ) : (
          <Link
            href="/login"
            className="rounded-full bg-[var(--orange)] px-3.5 py-1.5 text-xs font-bold text-white"
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
