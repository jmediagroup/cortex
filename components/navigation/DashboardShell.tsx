'use client';

import { type ReactNode } from 'react';
import TopNav from './TopNav';
import BottomTabBar from './BottomTabBar';
import UserProfileBar from './UserProfileBar';
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

      {/* Desktop user profile bar - hidden on mobile */}
      <UserProfileBar
        name={displayName}
        lastActivity="Your last activity 2 hours ago"
      />

      {/* Mobile header - hidden on desktop */}
      <header className="flex items-center justify-between border-b border-[var(--border-primary)] bg-[var(--surface-primary)] px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
          <div className="bg-[var(--color-accent)] p-1.5 rounded-lg text-white">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a8 8 0 0 0-8 8v12h16V10a8 8 0 0 0-8-8Z" />
              <path d="M9.5 14.5 12 12l2.5 2.5" />
              <path d="M12 12v6" />
            </svg>
          </div>
          <span className="font-black text-base tracking-tight text-[var(--text-primary)]">
            Cortex
          </span>
        </div>

        {user && (
          <div className="relative">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface-tertiary)] text-xs font-bold text-[var(--text-secondary)]">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--surface-primary)] bg-[var(--color-positive)]" />
          </div>
        )}
      </header>

      {/* Main content area */}
      <main className="pb-20 md:pb-0">
        {children}
      </main>

      {/* Mobile bottom tab bar - hidden on desktop */}
      <BottomTabBar />
    </div>
  );
}
