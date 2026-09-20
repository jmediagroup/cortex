'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import type { Tier } from '@/lib/access-control';
import { AdProvider } from '@/components/monetization/AdProvider';
import { AppShell } from './AppShell';

type User = { email: string; name?: string } | null;

/**
 * Client wrapper for AppShell that loads the current Supabase session +
 * tier, and wires the sign-out action. Used by dashboard and apps layouts.
 */
export function AppShellClient({ children }: { children: ReactNode }) {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [user, setUser] = useState<User>(null);
  const [userTier, setUserTier] = useState<Tier>('free');
  // True once the session + tier lookup has settled (drives ad visibility).
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!active) return;
      if (session) {
        const meta = session.user.user_metadata as { first_name?: string } | null;
        const name = meta?.first_name || session.user.email?.split('@')[0] || 'User';
        setUser({ email: session.user.email ?? '', name });

        const { data: userData } = (await supabase
          .from('users')
          .select('tier')
          .eq('id', session.user.id)
          .single()) as { data: { tier: Tier } | null };

        if (active && userData?.tier) setUserTier(userData.tier);
      }
      if (active) setAuthReady(true);
    })();
    return () => {
      active = false;
    };
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <AdProvider tier={userTier} isLoggedIn={Boolean(user)} ready={authReady}>
      <AppShell user={user} userTier={userTier} onSignOut={handleSignOut}>
        {children}
      </AppShell>
    </AdProvider>
  );
}
