"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { type Tier } from '@/lib/access-control';
import { trackEvent } from '@/lib/analytics';
import { DashboardShell } from '@/components/navigation';
import {
  GoalProgress,
  SpendingAnalytics,
  PerformanceView,
  ProgressTracking,
} from '@/components/dashboard';

type AnalyticsTab = 'overview' | 'spending' | 'performance' | 'progress';

const tabs: { key: AnalyticsTab; label: string }[] = [
  { key: 'overview', label: 'Goals' },
  { key: 'spending', label: 'Spending' },
  { key: 'performance', label: 'Performance' },
  { key: 'progress', label: 'Progress' },
];

export default function AnalyticsPage() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userTier, setUserTier] = useState<Tier>('free');
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('overview');

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
      <div className="mx-auto w-full max-w-5xl px-4 py-6 md:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight md:text-3xl">
            Statistics
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Track your financial goals, spending, and performance.
          </p>
        </div>

        {/* Tab navigation */}
        <div className="mb-6 flex gap-1 overflow-x-auto rounded-full border border-[var(--border-primary)] bg-[var(--surface-primary)] p-1 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-[var(--color-accent)] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'overview' && <GoalProgress />}
        {activeTab === 'spending' && <SpendingAnalytics />}
        {activeTab === 'performance' && <PerformanceView />}
        {activeTab === 'progress' && <ProgressTracking />}
      </div>

      <footer className="mx-auto max-w-5xl border-t border-[var(--border-primary)] px-6 py-8 text-center text-xs text-[var(--text-tertiary)]">
        &copy; {new Date().getFullYear()} Cortex Technologies. Built for smarter financial decisions.
      </footer>
    </DashboardShell>
  );
}
