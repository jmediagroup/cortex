"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { type Tier } from '@/lib/access-control';
import { trackEvent } from '@/lib/analytics';
import { DashboardShell } from '@/components/navigation';
import { DashboardLayout } from '@/components/layout';
import { TransactionHistory, BudgetOverview } from '@/components/dashboard';

export default function HistoryPage() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userTier, setUserTier] = useState<Tier>('free');

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login');
        return;
      }

      setUser(session.user);

      const { data: userData } = await supabase
        .from('users')
        .select('tier')
        .eq('id', session.user.id)
        .single() as { data: { tier: Tier } | null };

      if (userData?.tier) {
        setUserTier(userData.tier);
      }

      trackEvent('page_view');
      setLoading(false);
    };

    checkAuth();
  }, [router, supabase]);

  const handleSignOut = async () => {
    await trackEvent('user_logout', {}, true);
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--surface-secondary)]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--border-primary)] border-t-[var(--color-accent)]" />
      </div>
    );
  }

  if (!user) {
    if (typeof window !== 'undefined') {
      router.push('/login');
    }
    return null;
  }

  const userName = user.user_metadata?.first_name || user.email?.split('@')[0] || 'User';

  return (
    <DashboardShell
      user={{ email: user.email, name: userName }}
      userTier={userTier}
      onSignOut={handleSignOut}
    >
      <DashboardLayout
        sidebar={<BudgetOverview />}
      >
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight md:text-3xl">
              History & Budget
            </h1>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Track transactions, spending categories, and budget limits.
            </p>
          </div>

          <TransactionHistory />
        </div>
      </DashboardLayout>

      <footer className="mx-auto max-w-7xl border-t border-[var(--border-primary)] px-6 py-8 text-center text-xs text-[var(--text-tertiary)]">
        &copy; {new Date().getFullYear()} Cortex Technologies. Built for smarter financial decisions.
      </footer>
    </DashboardShell>
  );
}
