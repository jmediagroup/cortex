"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { type Tier } from '@/lib/access-control';
import { trackEvent } from '@/lib/analytics';
import { DashboardShell } from '@/components/navigation';
import { DashboardLayout } from '@/components/layout';
import {
  AppLibrary,
  PortfolioOverview,
  Watchlist,
  AssetCards,
  PromoBanners,
} from '@/components/dashboard';
import { AIAlertBanner } from '@/components/ai';

type AppsView = 'invest' | 'manage';

export default function AppsPage() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userTier, setUserTier] = useState<Tier>('free');
  const [activeView, setActiveView] = useState<AppsView>('invest');

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

  const investSidebar = (
    <div className="flex flex-col gap-5">
      <Watchlist />
    </div>
  );

  return (
    <DashboardShell
      user={{ email: user.email, name: userName }}
      userTier={userTier}
      onSignOut={handleSignOut}
    >
      {/* Invest / Manage toggle (Images 6, 7) */}
      <div className="mx-auto w-full max-w-7xl px-4 pt-4 md:px-6 lg:px-8">
        <div className="inline-flex items-center gap-1 rounded-full border border-[var(--border-primary)] bg-[var(--surface-primary)] p-1">
          <button
            onClick={() => setActiveView('invest')}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 ${
              activeView === 'invest'
                ? 'bg-[var(--color-accent)] text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Invest
          </button>
          <button
            onClick={() => setActiveView('manage')}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 ${
              activeView === 'manage'
                ? 'bg-[var(--color-accent)] text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Manage
          </button>
        </div>
      </div>

      {activeView === 'invest' ? (
        <DashboardLayout sidebar={investSidebar}>
          <div className="flex flex-col gap-6">
            {/* Promo banners (Images 7, 9) */}
            <PromoBanners />

            {/* Portfolio overview with chart */}
            <PortfolioOverview />

            {/* AI alert */}
            <AIAlertBanner
              message="AI detected unusual dip on Thursday — portfolio dropped 3.2%"
              actionLabel="Dismiss"
              variant="default"
            />

            {/* Asset cards (Images 8, 9) */}
            <AssetCards />

            {/* Invest CTA (Image 8) */}
            <button className="w-full rounded-[var(--radius-lg)] bg-[var(--color-accent)] px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition-all hover:bg-[var(--primary-600)] active:scale-[0.98]">
              Invest Money
            </button>
          </div>
        </DashboardLayout>
      ) : (
        <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 lg:px-8">
          <AppLibrary userTier={userTier} />
        </div>
      )}

      <footer className="mx-auto max-w-7xl border-t border-[var(--border-primary)] px-6 py-8 text-center text-xs text-[var(--text-tertiary)]">
        &copy; {new Date().getFullYear()} Cortex Technologies. Built for smarter financial decisions.
      </footer>
    </DashboardShell>
  );
}
