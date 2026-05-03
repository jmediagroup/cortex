'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Loader2, ShieldCheck, Sparkles, X } from 'lucide-react';
import { createBrowserClient, type OnboardingAnswers } from '@/lib/supabase/client';
import { type Tier } from '@/lib/access-control';
import { trackEvent } from '@/lib/analytics';
import DashboardHome from '@/components/dashboard/DashboardHome';
import { SkeletonDashboard } from '@/components/ui/Skeleton';
import { getRecommendedAppOrder } from '@/lib/onboarding-recommendations';

type UserRow = {
  tier: Tier;
  has_completed_onboarding: boolean;
  onboarding_answers: OnboardingAnswers | null;
};

type BillingPeriod = 'monthly' | 'annual';

const PRO_MONTHLY_PRICE_ID =
  process.env.NEXT_PUBLIC_STRIPE_FINANCE_PRO_MONTHLY_PRICE_ID || '';
const PRO_ANNUAL_PRICE_ID =
  process.env.NEXT_PUBLIC_STRIPE_FINANCE_PRO_ANNUAL_PRICE_ID || '';

function priceIdFor(billing: BillingPeriod): string {
  return billing === 'annual' ? PRO_ANNUAL_PRICE_ID : PRO_MONTHLY_PRICE_ID;
}

function DashboardInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createBrowserClient();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; email: string | null; name: string } | null>(null);
  const [userTier, setUserTier] = useState<Tier>('free');
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);
  const [appOrder, setAppOrder] = useState<string[] | null>(null);
  const [showProWelcome, setShowProWelcome] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const planParam = searchParams.get('plan');
  const billingParam = searchParams.get('billing');
  const successParam = searchParams.get('success');

  const pendingProCheckout = planParam === 'finance_pro' || planParam === 'pro';
  const pendingBilling: BillingPeriod = billingParam === 'annual' ? 'annual' : 'monthly';

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

      const tier = userData?.tier ?? 'free';
      if (userData?.tier) setUserTier(userData.tier);

      const isProSuccess = successParam === 'true';

      if (isProSuccess) {
        setShowProWelcome(true);
        trackEvent('subscription_success_view');
      }

      if (userData && !userData.has_completed_onboarding) {
        setNeedsOnboarding(true);
      }
      if (userData?.onboarding_answers) {
        setAppOrder(getRecommendedAppOrder(userData.onboarding_answers));
      }

      // Clean intent params off the URL once we've consumed them so a
      // refresh doesn't re-trigger the welcome banner.
      if (isProSuccess || (pendingProCheckout && tier !== 'free')) {
        router.replace('/dashboard');
      }

      trackEvent('dashboard_visit');
      setLoading(false);
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleContinueCheckout = async () => {
    setCheckoutLoading(true);
    setCheckoutError(null);
    try {
      const priceId = priceIdFor(pendingBilling);
      if (!priceId) throw new Error('Pricing is unavailable. Please try again later.');

      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token ?? ''}`,
        },
        body: JSON.stringify({ priceId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to start checkout');
      if (data.url) {
        await trackEvent(
          'subscription_upgrade',
          { new_tier: 'finance_pro', billing_period: pendingBilling, source: 'post_signup' },
          true,
        );
        window.location.href = data.url;
        return;
      }
      throw new Error('Checkout session did not return a URL');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      console.error('Checkout error:', err);
      setCheckoutError(message);
      setCheckoutLoading(false);
      await trackEvent('error_occurred', { error_message: message, context: 'post_signup_checkout' }, true);
    }
  };

  const handleDismissCheckout = () => {
    router.replace('/dashboard');
  };

  const showCheckoutCard = useMemo(
    () => !loading && pendingProCheckout && userTier === 'free',
    [loading, pendingProCheckout, userTier],
  );

  const showPersonalizeBanner =
    !loading &&
    needsOnboarding &&
    !onboardingDismissed &&
    !showCheckoutCard &&
    !showProWelcome;

  if (loading || !user) {
    return (
      <div style={{ minHeight: '100%', padding: '24px' }}>
        <SkeletonDashboard />
      </div>
    );
  }

  return (
    <>
      {showProWelcome && <ProWelcomeBanner onDismiss={() => setShowProWelcome(false)} />}
      {showCheckoutCard && (
        <ContinueCheckoutCard
          billing={pendingBilling}
          loading={checkoutLoading}
          error={checkoutError}
          onContinue={handleContinueCheckout}
          onDismiss={handleDismissCheckout}
        />
      )}
      {showPersonalizeBanner && (
        <PersonalizeBanner onDismiss={() => setOnboardingDismissed(true)} />
      )}
      <DashboardHome
        userName={user.name}
        userTier={userTier}
        appOrder={appOrder}
      />
    </>
  );
}

function PersonalizeBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div
      role="status"
      style={{
        margin: '16px 24px 0',
        padding: '14px 16px',
        borderRadius: 12,
        background: 'var(--bg-glass)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--glass-border)',
        color: 'var(--text-primary)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <Sparkles size={18} style={{ color: 'var(--emerald-500)', flexShrink: 0 }} />
      <div style={{ flex: 1, fontSize: 14, lineHeight: 1.4 }}>
        <strong>Personalize your dashboard.</strong>{' '}
        <span style={{ color: 'var(--text-secondary)' }}>
          Answer five quick questions to surface the tools that fit you best.
        </span>
      </div>
      <Link
        href="/onboarding"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'var(--emerald-500)',
          color: 'var(--text-inverse)',
          padding: '8px 14px',
          borderRadius: 10,
          fontWeight: 600,
          fontSize: 13,
          textDecoration: 'none',
          flexShrink: 0,
        }}
      >
        Start <ArrowRight size={14} />
      </Link>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        style={{
          background: 'transparent',
          border: 0,
          color: 'var(--text-tertiary)',
          cursor: 'pointer',
          padding: 4,
          display: 'flex',
          flexShrink: 0,
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
}

function ProWelcomeBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div
      role="status"
      style={{
        margin: '16px 24px 0',
        padding: '14px 16px',
        borderRadius: 12,
        background: 'var(--emerald-tint)',
        border: '1px solid var(--emerald-border)',
        color: 'var(--text-primary)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        boxShadow: '0 0 24px var(--cta-glow-soft)',
      }}
    >
      <ShieldCheck size={18} style={{ color: 'var(--emerald-500)', flexShrink: 0 }} />
      <div style={{ flex: 1, fontSize: 14, lineHeight: 1.4 }}>
        <strong>Welcome to Finance Pro.</strong> Your subscription is active — every Pro tool is unlocked.
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        style={{
          background: 'transparent',
          border: 0,
          color: 'var(--text-tertiary)',
          cursor: 'pointer',
          padding: 4,
          display: 'flex',
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
}

function ContinueCheckoutCard({
  billing,
  loading,
  error,
  onContinue,
  onDismiss,
}: {
  billing: BillingPeriod;
  loading: boolean;
  error: string | null;
  onContinue: () => void;
  onDismiss: () => void;
}) {
  const price = billing === 'annual' ? '$90/year' : '$9/month';
  const label = billing === 'annual' ? 'Annual' : 'Monthly';
  return (
    <div
      style={{
        margin: '16px 24px 0',
        padding: '20px 20px',
        borderRadius: 16,
        background: 'var(--bg-glass-strong)',
        border: '1px solid var(--emerald-border)',
        boxShadow: '0 0 32px var(--cta-glow-soft)',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'wrap',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: 'var(--emerald-tint)',
          border: '1px solid var(--emerald-border)',
          color: 'var(--emerald-500)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Sparkles size={20} />
      </div>
      <div style={{ flex: 1, minWidth: 220 }}>
        <div className="eyebrow" style={{ color: 'var(--emerald-500)', marginBottom: 4 }}>
          ONE STEP LEFT
        </div>
        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
          Finish setting up Finance Pro · {label}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
          {price} · cancel anytime. We&apos;ll hand you off to Stripe to confirm.
        </div>
        {error && (
          <div style={{ fontSize: 12, color: 'var(--danger-500, #ef4444)', marginTop: 8 }}>
            {error}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <button
          type="button"
          onClick={onDismiss}
          disabled={loading}
          style={{
            background: 'transparent',
            color: 'var(--text-tertiary)',
            border: '1px solid var(--glass-border)',
            padding: '10px 16px',
            borderRadius: 10,
            fontWeight: 500,
            fontSize: 13,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Not now
        </button>
        <button
          type="button"
          onClick={onContinue}
          disabled={loading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'var(--emerald-500)',
            color: 'var(--text-inverse)',
            border: 0,
            padding: '10px 18px',
            borderRadius: 10,
            fontWeight: 600,
            fontSize: 13,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            boxShadow: '0 0 24px var(--cta-glow-soft)',
          }}
        >
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Redirecting...
            </>
          ) : (
            <>
              Continue to checkout <ArrowRight size={14} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '100%', padding: '24px' }}>
          <SkeletonDashboard />
        </div>
      }
    >
      <DashboardInner />
    </Suspense>
  );
}
