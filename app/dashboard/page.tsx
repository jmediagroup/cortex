"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient, type OnboardingAnswers } from '@/lib/supabase/client';
import { type Tier } from '@/lib/access-control';
import { trackEvent } from '@/lib/analytics';
import { DashboardShell } from '@/components/navigation';
import { AppLibrary, OnboardingQuiz } from '@/components/dashboard';
import { SkeletonDashboard } from '@/components/ui/Skeleton';
import { getRecommendedAppOrder } from '@/lib/onboarding-recommendations';

export default function Dashboard() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userTier, setUserTier] = useState<Tier>('free');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [appOrder, setAppOrder] = useState<string[] | null>(null);

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
        .select('tier, has_completed_onboarding, onboarding_answers')
        .eq('id', session.user.id)
        .single() as { data: { tier: Tier; has_completed_onboarding: boolean; onboarding_answers: OnboardingAnswers | null } | null };

      if (userData?.tier) {
        setUserTier(userData.tier);
      }

      // Check onboarding status
      if (userData && !userData.has_completed_onboarding) {
        setShowOnboarding(true);
        trackEvent('onboarding_started');
      }

      // Apply personalized order if they have quiz answers
      if (userData?.onboarding_answers) {
        setAppOrder(getRecommendedAppOrder(userData.onboarding_answers));
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

  const handleOnboardingComplete = (answers: OnboardingAnswers) => {
    setShowOnboarding(false);
    setAppOrder(getRecommendedAppOrder(answers));
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--surface-secondary)]">
        <SkeletonDashboard />
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
      {showOnboarding && (
        <OnboardingQuiz
          userId={user.id}
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}

      <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 lg:px-8">
        <AppLibrary userTier={userTier} appOrder={appOrder} />
      </div>

      {/* Footer */}
      <footer className="mx-auto max-w-7xl border-t border-[var(--border-primary)] px-6 py-8 text-center text-xs text-[var(--text-tertiary)]">
        &copy; {new Date().getFullYear()} Cortex Technologies. Built for smarter financial decisions.
      </footer>
    </DashboardShell>
  );
}
