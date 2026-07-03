"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@/lib/supabase/client';
import { Loader2, ShieldCheck } from 'lucide-react';
import { type Tier } from '@/lib/access-control';
import { trackEvent } from '@/lib/analytics';
import { MarketingShell } from '@/components/marketing/MarketingShell';
import { MarketingIcon } from '@/components/marketing/Icons';

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
          <div
            className="eyebrow"
            style={{ marginBottom: 16, color: 'var(--text-tertiary)' }}
          >
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
              color: 'var(--text-secondary)',
              lineHeight: 1.55,
              margin: '0 0 32px',
            }}
          >
            Choose the plan that matches where you are today. Start free, upgrade to Pro when precision matters.
          </p>

          <div
            role="tablist"
            aria-label="Billing period"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              background: 'var(--bg-glass)',
              backdropFilter: 'var(--glass-blur)',
              WebkitBackdropFilter: 'var(--glass-blur)',
              border: '1px solid var(--glass-border-strong)',
              padding: 4,
              borderRadius: 9999,
            }}
          >
            {(['monthly', 'annual'] as const).map((period) => (
              <button
                key={period}
                type="button"
                role="tab"
                aria-selected={billingPeriod === period}
                onClick={() => setBillingPeriod(period)}
                style={{
                  padding: '8px 20px',
                  borderRadius: 9999,
                  fontWeight: 600,
                  fontSize: 13,
                  border: 0,
                  cursor: 'pointer',
                  background: billingPeriod === period ? 'var(--emerald-500)' : 'transparent',
                  color:
                    billingPeriod === period
                      ? 'var(--text-inverse)'
                      : 'var(--text-secondary)',
                  transition: 'all 160ms var(--ease-out-expo)',
                  boxShadow:
                    billingPeriod === period ? '0 0 20px var(--cta-glow-soft)' : 'none',
                }}
              >
                {period === 'monthly' ? 'Monthly' : 'Annual'}
              </button>
            ))}
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
                  background: plan.highlighted
                    ? 'var(--bg-glass-strong)'
                    : 'var(--bg-glass)',
                  backdropFilter: 'var(--glass-blur)',
                  WebkitBackdropFilter: 'var(--glass-blur)',
                  border: `1px solid ${plan.highlighted ? 'var(--emerald-border)' : 'var(--glass-border)'}`,
                  borderRadius: 'var(--radius-2xl)',
                  padding: 32,
                  boxShadow: plan.highlighted
                    ? '0 0 0 1px var(--featured-halo), 0 20px 60px var(--featured-halo), var(--shadow-inset-top)'
                    : 'var(--shadow-card), var(--shadow-inset-top)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {plan.badge && (
                  <div
                    style={{
                      position: 'absolute',
                      top: -12,
                      left: 24,
                      background: 'var(--emerald-500)',
                      color: 'var(--text-inverse)',
                      padding: '5px 12px',
                      borderRadius: 9999,
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      boxShadow: '0 0 20px var(--cta-glow-ring)',
                    }}
                  >
                    {plan.badge}
                  </div>
                )}

                <h2
                  style={{
                    fontSize: 20,
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    margin: 0,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {plan.name}
                </h2>
                <p
                  style={{
                    color: 'var(--text-tertiary)',
                    fontSize: 13,
                    margin: '6px 0 24px',
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
                      color: 'var(--text-primary)',
                      letterSpacing: '-0.035em',
                    }}
                  >
                    {displayPrice}
                  </span>
                  <span
                    style={{
                      color: 'var(--text-tertiary)',
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
                      fontSize: 12,
                      color: 'var(--emerald-500)',
                      fontWeight: 600,
                      margin: '0 0 24px',
                    }}
                  >
                    {plan.annualSavings}
                  </p>
                )}

                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: billingPeriod === 'annual' && plan.annualSavings ? '8px 0 32px' : '24px 0 32px',
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
                        fontSize: 14,
                        color: 'var(--text-secondary)',
                      }}
                    >
                      <span
                        aria-hidden="true"
                        style={{
                          flexShrink: 0,
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          background: plan.highlighted
                            ? 'var(--emerald-tint)'
                            : 'var(--bg-glass-strong)',
                          border: `1px solid ${plan.highlighted ? 'var(--emerald-border)' : 'var(--glass-border)'}`,
                          color: plan.highlighted
                            ? 'var(--emerald-500)'
                            : 'var(--text-tertiary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginTop: 1,
                        }}
                      >
                        <MarketingIcon name="check" size={10} stroke={2.5} />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => handleUpgrade(selectedPriceId, plan.tier)}
                  disabled={isCurrent || loading === plan.tier}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    background: isCurrent
                      ? 'var(--bg-glass-strong)'
                      : plan.highlighted
                        ? 'var(--emerald-500)'
                        : 'var(--bg-glass-strong)',
                    color: isCurrent
                      ? 'var(--text-tertiary)'
                      : plan.highlighted
                        ? 'var(--text-inverse)'
                        : 'var(--text-primary)',
                    border: plan.highlighted ? 'none' : '1px solid var(--glass-border-strong)',
                    padding: '14px 24px',
                    borderRadius: 12,
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: isCurrent || loading === plan.tier ? 'not-allowed' : 'pointer',
                    boxShadow: plan.highlighted && !isCurrent ? '0 0 24px var(--cta-glow-soft)' : 'none',
                    transition: 'all 160ms',
                    fontFamily: 'inherit',
                  }}
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
                </button>
              </div>
            );
          })}
        </div>

        <div style={{ maxWidth: 960, margin: '64px auto 0' }}>
          <div
            style={{
              background:
                'linear-gradient(135deg, #121620 0%, #0A0E14 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 'var(--radius-2xl)',
              padding: '48px 32px',
              color: '#F5F5F7',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'radial-gradient(ellipse at center top, rgba(0,240,160,0.18), transparent 60%)',
                pointerEvents: 'none',
              }}
            />
            <div style={{ position: 'relative' }}>
              <div className="eyebrow" style={{ color: '#00F0A0', marginBottom: 16 }}>
                ENTERPRISE
              </div>
              <h2
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  margin: '0 0 12px',
                  letterSpacing: '-0.02em',
                }}
              >
                Need a custom solution?
              </h2>
              <p
                style={{
                  fontSize: 16,
                  color: '#AEAEB2',
                  lineHeight: 1.55,
                  margin: '0 auto 28px',
                  maxWidth: 520,
                }}
              >
                Contact us for team seats, custom integrations, or white-label deployments.
              </p>
              <Link
                href="/enterprise"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: '#00F0A0',
                  color: '#0A0E14',
                  padding: '14px 24px',
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: 14,
                  textDecoration: 'none',
                  boxShadow:
                    '0 0 0 1px rgba(0,240,160,0.4), 0 0 32px rgba(0,240,160,0.35)',
                }}
              >
                Contact sales <MarketingIcon name="arrowRight" size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
