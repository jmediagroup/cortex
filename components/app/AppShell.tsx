import type { ReactNode } from 'react';
import type { Tier } from '@/lib/access-control';
import { AppSideNav } from './AppSideNav';
import { AppTopBar } from './AppTopBar';
import { AppMobileTabBar } from './AppMobileTabBar';

type Props = {
  children: ReactNode;
  user?: { email: string; name?: string } | null;
  userTier?: Tier;
  onSignOut?: () => void;
};

/**
 * Authenticated app shell — inherits the user's chosen theme
 * (dark or light) so dashboard, apps, scenarios, and account
 * surfaces honour the toggle set from marketing.
 */
export function AppShell({ children, user, userTier = 'free', onSignOut }: Props) {
  return (
    <div
      className="app-shell"
      style={{
        minHeight: '100vh',
        background: 'var(--bg-canvas)',
        color: 'var(--text-primary)',
        display: 'flex',
      }}
    >
      <AppSideNav />
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <AppTopBar user={user} userTier={userTier} onSignOut={onSignOut} />
        <main className="with-mobile-tab-bar" style={{ flex: 1 }}>
          {children}
        </main>
      </div>
      <AppMobileTabBar />
    </div>
  );
}
