'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient, type OnboardingAnswers } from '@/lib/supabase/client';
import { type Tier } from '@/lib/access-control';
import { trackEvent } from '@/lib/analytics';
import { OnboardingQuiz } from '@/components/dashboard';
import DashboardHome from '@/components/dashboard/DashboardHome';
import { SkeletonDashboard } from '@/components/ui/Skeleton';
import { getRecommendedAppOrder } from '@/lib/onboarding-recommendations';

type UserRow = {
  tier: Tier;
  has_completed_onboarding: boolean;
  onboarding_answers: OnboardingAnswers | null;
};

export default function Dashboard() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; email: string | null; name: string } | null>(null);
  const [userTier, setUserTier] = useState<Tier>('free');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [appOrder, setAppOrder] = useState<string[] | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      const meta = session.user.user_metadata as { first_name?: string } | null;
      const name = meta?.first_name || session.user.email?.split('@')[0] || 'User';
      setUser({ id: session.user.id, email: session.user.email ?? null, name });

      const { data: userData } = (await supabase
        .from('users')
        .select('tier, has_completed_onboarding, onboarding_answers')
        .eq('id', session.user.id)
        .single()) as { data: UserRow | null };

      if (userData?.tier) setUserTier(userData.tier);

      if (userData && !userData.has_completed_onboarding) {
        setShowOnboarding(true);
        trackEvent('onboarding_started');
      }
      if (userData?.onboarding_answers) {
        setAppOrder(getRecommendedAppOrder(userData.onboarding_answers));
      }

      trackEvent('dashboard_visit');
      setLoading(false);
    };

    checkAuth();
  }, [router, supabase]);

  const handleOnboardingComplete = (answers: OnboardingAnswers) => {
    setShowOnboarding(false);
    setAppOrder(getRecommendedAppOrder(answers));
  };
  const handleOnboardingSkip = () => setShowOnboarding(false);

  if (loading || !user) {
    return (
      <div style={{ minHeight: '100%', padding: '24px' }}>
        <SkeletonDashboard />
      </div>
    );
  }

  return (
    <>
      {showOnboarding && (
        <OnboardingQuiz
          userId={user.id}
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}
      <DashboardHome
        userName={user.name}
        userTier={userTier}
        appOrder={appOrder}
      />
    </>
  );
}
