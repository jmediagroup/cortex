"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { Loader2, ShieldCheck } from 'lucide-react';
import { type Tier } from '@/lib/access-control';
import { trackEvent } from '@/lib/analytics';
import { MarketingShell } from '@/components/marketing/MarketingShell';
import { MarketingIcon } from '@/components/marketing/Icons';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';

type Plan = {
  name: string;
  price: string;
  annualPrice: string | null;
  period: string;
  annualSavings?: string;
  description: string;
  features: string[];
  cta: string;
  tier: Tier;
  priceId: string | null;
  annualPriceId: string | null;
  highlighted?: boolean;
  badge?: string;
};

const PRICING_PLANS: Plan[] = [
  {
    name: 'Free',
    price: '$0',
    annualPrice: null,
    period: 'forever',
    description: 'For exploration and curiosity.',
    features: [
      'Access to core calculators',
      'Compound Interest Calculator',
      'Car Affordability Calculator',
      'Limited scenarios and projections',
      'Ideal for learning',
      'Community support',
    ],
    cta: 'Start free',
    tier: 'free',
    priceId: null,
    annualPriceId: null,
  },
  {
    name: 'Finance Pro',
    price: '$9',
    annualPrice: '$90',
    period: 'per month',
    annualSavings: 'Save $18/year',
    description: 'For people who want precision.',
    features: [
      'Full access to all Money Guy Mutants tools',
      'Advanced scenarios and comparisons',
      'Deeper projections and strategy modeling',
      'S-Corp tools and tax modeling',
      'Ad-free experience',
      'Priority support',
    ],
    cta: 'Get Pro',
    tier: 'finance_pro',
    priceId: process.env.NEXT_PUBLIC_STRIPE_FINANCE_PRO_MONTHLY_PRICE_ID || 'price_PLACEHOLDER',
    annualPriceId: process.env.NEXT_PUBLIC_STRIPE_FINANCE_PRO_ANNUAL_PRICE_ID || 'price_PLACEHOLDER',
    highlighted: true,
    badge: 'Most popular',
  },
];

type SessionUser = { id: string; email: string | null };

export default function PricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [userTier, setUserTier] = useState<Tier>('free');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const supabase = createBrowserClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        setUser({ id: session.user.id, email: session.user.email ?? null });

        const { data: userData } = (await supabase
          .from('users')
          .select('tier')
          .eq('id', session.user.id)
          .single()) as { data: { tier: Tier } | null };

        if (userData?.tier) setUserTier(userData.tier);
      }

      trackEvent('pricing_page_view');
    };

    checkAuth();
  }, [supabase]);

  const handleUpgrade = async (priceId: string | null, tier: string) => {
    if (!priceId) {
      router.push(user ? '/dashboard' : '/signup');
      return;
    }
    if (!user) {
      const params = new URLSearchParams({ plan: tier, billing: billingPeriod });
      router.push(`/signup?${params.toString()}`);
      return;
    }

    setLoading(tier);
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({ priceId }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create checkout session');

      if (data.url) {
        await trackEvent(
          'subscription_upgrade',
          { new_tier: tier, billing_period: billingPeriod },
          true,
        );
        window.location.href = data.url;
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      console.error('Checkout error:', error);
      alert(message);
      setLoading(null);
      await trackEvent('error_occurred', { error_message: message, context: 'checkout' }, true);
    }
  };

  return (
    <MarketingShell>
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '96px 24px 32px',
          textAlign: 'center',
        }}
        className="hero-gradient"
      >
        <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative' }}>
          <div className="mgm-eyebrow" style={{ marginBottom: 14 }}>
            PRICING
          </div>
          <h1
            className="h-hero"
            style={{ margin: '0 0 20px', fontSize: 'clamp(40px,6vw,64px)' }}
          >
            Simple, honest pricing.
          </h1>
          <p
            style={{
              fontSize: 18,
              color: 'var(--gray-600)',
              lineHeight: 1.55,
              margin: '0 0 32px',
            }}
          >
            Pick the plan that matches where you are today. Start free, upgrade to Pro when precision matters. No countdowns, no dark patterns.
          </p>

          <div
            role="tablist"
            aria-label="Billing period"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              background: 'var(--off-white)',
              border: '1px solid var(--border-default)',
              padding: 4,
              borderRadius: 'var(--radius-pill)',
            }}
          >
            {(['monthly', 'annual'] as const).map((period) => {
              const on = billingPeriod === period;
              return (
                <button
                  key={period}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setBillingPeriod(period)}
                  style={{
                    padding: '9px 22px',
                    borderRadius: 'var(--radius-pill)',
                    fontWeight: 700,
                    fontSize: 13,
                    letterSpacing: '0.02em',
                    textTransform: 'uppercase',
                    border: 0,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                    background: on ? 'var(--navy)' : 'transparent',
                    color: on ? 'var(--white)' : 'var(--navy)',
                    transition: 'background .18s ease, color .18s ease',
                  }}
                >
                  {period === 'monthly' ? 'Monthly' : 'Annual'}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section style={{ padding: '32px 24px 96px' }}>
        <div
          style={{
            maxWidth: 960,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 20,
          }}
        >
          {PRICING_PLANS.map((plan) => {
            const isCurrent = Boolean(user && plan.tier === userTier);
            const selectedPriceId =
              billingPeriod === 'annual' && plan.annualPriceId
                ? plan.annualPriceId
                : plan.priceId;
            const displayPrice =
              billingPeriod === 'annual' && plan.annualPrice ? plan.annualPrice : plan.price;
            const displayCadence =
              plan.period === 'forever'
                ? '/ forever'
                : billingPeriod === 'annual'
                  ? '/ year'
                  : '/ month';

            return (
              <div
                key={plan.tier}
                style={{
                  position: 'relative',
                  background: 'var(--bg-card)',
                  border: plan.highlighted
                    ? '2px solid var(--sky)'
                    : '1px solid var(--off-white)',
                  borderRadius: 'var(--radius-md)',
                  padding: 30,
                  boxShadow: plan.highlighted
                    ? '0 14px 30px rgba(78, 201, 245, 0.18)'
                    : 'var(--shadow-card)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {plan.badge && (
                  <div
                    style={{
                      position: 'absolute',
                      top: -13,
                      left: '50%',
                      transform: 'translateX(-50%)',
                    }}
                  >
                    <Tag tone="sky" style={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: 11 }}>
                      {plan.badge}
                    </Tag>
                  </div>
                )}

                <h2
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: 'var(--sky)',
                    margin: 0,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  {plan.name}
                </h2>
                <p
                  style={{
                    color: 'var(--gray-500)',
                    fontSize: 14,
                    margin: '8px 0 22px',
                    lineHeight: 1.45,
                  }}
                >
                  {plan.description}
                </p>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 6,
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: 52,
                      fontWeight: 700,
                      color: 'var(--navy)',
                      letterSpacing: '-0.02em',
                      lineHeight: 1,
                    }}
                  >
                    {displayPrice}
                  </span>
                  <span
                    style={{
                      color: 'var(--gray-500)',
                      fontSize: 14,
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {displayCadence}
                  </span>
                </div>
                {billingPeriod === 'annual' && plan.annualSavings && (
                  <p
                    style={{
                      fontSize: 13,
                      color: 'var(--teal-green)',
                      fontWeight: 700,
                      margin: '10px 0 0',
                    }}
                  >
                    {plan.annualSavings}
                  </p>
                )}

                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: '22px 0 26px',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                  }}
                >
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 10,
                        fontSize: 15,
                        color: 'var(--gray-700)',
                        lineHeight: 1.4,
                      }}
                    >
                      <span
                        aria-hidden="true"
                        style={{
                          flexShrink: 0,
                          marginTop: 2,
                          color: 'var(--teal-green)',
                          display: 'inline-flex',
                        }}
                      >
                        <MarketingIcon name="check" size={18} stroke={2.6} />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.highlighted ? 'primary' : 'secondary'}
                  tone="navy"
                  onClick={() => handleUpgrade(selectedPriceId, plan.tier)}
                  disabled={isCurrent || loading === plan.tier}
                  style={{ width: '100%', marginTop: 'auto' }}
                >
                  {loading === plan.tier ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Processing...
                    </>
                  ) : isCurrent ? (
                    <>
                      <ShieldCheck size={16} /> Current plan
                    </>
                  ) : (
                    <>
                      {plan.cta} <MarketingIcon name="arrowRight" size={14} />
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>

        <div style={{ maxWidth: 960, margin: '64px auto 0' }}>
          <div
            className="mgm-band"
            style={{
              padding: '48px 32px',
              textAlign: 'center',
            }}
          >
            <div className="mgm-eyebrow" style={{ color: 'var(--sky)', marginBottom: 16 }}>
              ENTERPRISE
            </div>
            <h2
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: 'var(--white)',
                margin: '0 0 12px',
                letterSpacing: '-0.01em',
              }}
            >
              Building something bigger?
            </h2>
            <p
              style={{
                fontSize: 16,
                color: 'rgba(255,255,255,0.85)',
                lineHeight: 1.55,
                margin: '0 auto 28px',
                maxWidth: 520,
              }}
            >
              Talk to us about team seats, custom integrations, or white-label deployments.
            </p>
            <Button href="/enterprise" variant="primary">
              Contact sales <MarketingIcon name="arrowRight" size={14} />
            </Button>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
