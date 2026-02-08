'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { DashboardShell } from '@/components/navigation';
import { type Tier } from '@/lib/access-control';

export default function ArticlesLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [user, setUser] = useState<{ email: string; name?: string } | null>(null);
  const [userTier, setUserTier] = useState<Tier>('free');

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const userName = session.user.user_metadata?.first_name || session.user.email?.split('@')[0] || 'User';
        setUser({ email: session.user.email!, name: userName });

        const { data: userData } = await supabase
          .from('users')
          .select('tier')
          .eq('id', session.user.id)
          .single() as { data: { tier: Tier } | null };

        if (userData?.tier) {
          setUserTier(userData.tier);
        }
      }
    };

    checkAuth();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <DashboardShell user={user} userTier={userTier} onSignOut={handleSignOut}>
      {children}
    </DashboardShell>
  );
}
