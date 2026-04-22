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
 * Authenticated app shell — force-dark regardless of the global theme,
 * with a desktop side nav + top bar and a mobile bottom tab bar.
 * Every descendant reads the dark token values because `[data-theme="dark"]`
 * is declared alongside `:root` in tokens.css.
 */
export function AppShell({ children, user, userTier = 'free', onSignOut }: Props) {
  return (
    <div
      data-theme="dark"
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
        <main style={{ flex: 1, paddingBottom: 80 }}>{children}</main>
      </div>
      <AppMobileTabBar />
    </div>
  );
}
