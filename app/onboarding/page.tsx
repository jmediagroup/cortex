'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';
import { trackEvent } from '@/lib/analytics';
import { OnboardingQuiz } from '@/components/dashboard';

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login?redirect=/onboarding');
        return;
      }
      setUserId(session.user.id);
      trackEvent('onboarding_started');
      setLoading(false);
    })();
  }, [router, supabase]);

  const handleDone = () => {
    router.push('/dashboard');
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'var(--bg-page)',
      }}
    >
      {loading || !userId ? (
        <Loader2 size={28} className="animate-spin" style={{ color: 'var(--text-tertiary)' }} />
      ) : (
        <OnboardingQuiz userId={userId} onComplete={handleDone} onSkip={handleDone} />
      )}
    </div>
  );
}
