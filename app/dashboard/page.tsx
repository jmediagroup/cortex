"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { type Tier } from '@/lib/access-control';
import { trackEvent } from '@/lib/analytics';
import { DashboardShell } from '@/components/navigation';
import { DashboardLayout } from '@/components/layout';
import { DashboardHome, SpendingSidebar, AppLibrary } from '@/components/dashboard';

type DashboardView = 'home' | 'apps';

export default function Dashboard() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userTier, setUserTier] = useState<Tier>('free');
  const [activeView, setActiveView] = useState<DashboardView>('home');

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

      trackEvent('dashboard_visit');
      setLoading(false);
    };

    checkAuth();
  }, [router, supabase]);

  const handleSignOut = async () => {
    await trackEvent('user_logout', {}, true);
    await supabase.auth.signOut();
    router.push('/');
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--surface-secondary)]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--border-primary)] border-t-[var(--color-accent)]" />
      </div>
    );
  }

  // Auth guard
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
      {/* View toggle tabs */}
      <div className="mx-auto w-full max-w-7xl px-4 pt-4 md:px-6 lg:px-8">
        <div className="inline-flex items-center gap-1 rounded-full border border-[var(--border-primary)] bg-[var(--surface-primary)] p-1">
          <button
            onClick={() => setActiveView('home')}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 ${
              activeView === 'home'
                ? 'bg-[var(--color-accent)] text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveView('apps')}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 ${
              activeView === 'apps'
                ? 'bg-[var(--color-accent)] text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            App Library
          </button>
        </div>
      </div>

      {activeView === 'home' ? (
        <DashboardLayout
          sidebar={<SpendingSidebar />}
        >
          <DashboardHome userName={userName} />
        </DashboardLayout>
      ) : (
        <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 lg:px-8">
          <AppLibrary userTier={userTier} />
        </div>
      )}

      {/* Footer */}
      <footer className="mx-auto max-w-7xl border-t border-[var(--border-primary)] px-6 py-8 text-center text-xs text-[var(--text-tertiary)]">
        &copy; {new Date().getFullYear()} Cortex Technologies. Built for smarter financial decisions.
      </footer>
    </DashboardShell>
  );
}
