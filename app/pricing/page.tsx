"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { Brain, Check, ArrowRight, Loader2, ShieldCheck, Sparkles } from 'lucide-react';
import { type Tier } from '@/lib/access-control';
import { trackEvent } from '@/lib/analytics';

const PRICING_PLANS = [
  {
    name: 'Free',
    price: '$0',
    annualPrice: null,
    period: 'forever',
    description: 'For exploration and curiosity',
    features: [
      'Access to core calculators',
      'Compound Interest Calculator',
      'Car Affordability Calculator',
      'Limited scenarios and projections',
      'Ideal for learning',
      'Community support',
    ],
    cta: 'Start Free',
    tier: 'free' as const,
    sector: null,
    priceId: null,
    annualPriceId: null,
  },
  {
    name: 'Finance Pro',
    price: '$9',
    annualPrice: '$90',
    period: 'per month',
    annualSavings: 'Save $18/year',
    description: 'For people who want precision around money',
    features: [
      'Full access to all Cortex Finance tools',
      'Advanced scenarios and comparisons',
      'Deeper projections and strategy modeling',
      'S-Corp tools and tax modeling',
      'Ad-free experience',
      'Priority support',
    ],
    cta: 'Get Finance Pro',
    tier: 'finance_pro' as const,
    sector: 'finance' as const,
    priceId: process.env.NEXT_PUBLIC_STRIPE_FINANCE_PRO_MONTHLY_PRICE_ID || 'price_PLACEHOLDER',
    annualPriceId: process.env.NEXT_PUBLIC_STRIPE_FINANCE_PRO_ANNUAL_PRICE_ID || 'price_PLACEHOLDER',
    highlighted: true,
    badge: 'Most Popular',
  },
  {
    name: 'Elite',
    price: '$29',
    annualPrice: '$290',
    period: 'per month',
    annualSavings: 'Save $58/year',
    description: 'For people who want a thinking system',
    features: [
      'Unlocks all current and future apps',
      'Access across Finance, Health, Education',
      'Life planning tools as they launch',
      'Pro access to ALL future sectors',
      'Ad-free experience',
      'Premium priority support',
      'Early access to new features',
    ],
    cta: 'Get Elite',
    tier: 'elite' as const,
    sector: null,
    priceId: process.env.NEXT_PUBLIC_STRIPE_ELITE_MONTHLY_PRICE_ID || 'price_PLACEHOLDER',
    annualPriceId: process.env.NEXT_PUBLIC_STRIPE_ELITE_ANNUAL_PRICE_ID || 'price_PLACEHOLDER',
    highlighted: false,
    badge: 'Best Value',
    special: true,
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [userTier, setUserTier] = useState<Tier>('free');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const supabase = createBrowserClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        setUser(session.user);

        // Fetch user tier
        const { data: userData } = await supabase
          .from('users')
          .select('tier')
          .eq('id', session.user.id)
          .single() as { data: { tier: Tier } | null };

        if (userData?.tier) {
          setUserTier(userData.tier);
        }
      }

      // Track pricing page view
      trackEvent('pricing_page_view');
    };

    checkAuth();
  }, [supabase]);

  const handleUpgrade = async (priceId: string | null, tier: string) => {
    if (!priceId) {
      // Free tier - redirect to signup or dashboard
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
      return;
    }

    if (!user) {
      router.push('/login?redirect=/pricing');
      return;
    }

    setLoading(tier);

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({ priceId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        // Track checkout initiation
        await trackEvent('subscription_upgrade', {
          new_tier: tier,
          billing_period: billingPeriod,
        }, true);

        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      alert(error.message || 'Failed to start checkout. Please try again.');
      setLoading(null);

      // Track error
      await trackEvent('error_occurred', {
        error_message: error.message,
        context: 'checkout',
      }, true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* TOP NAVIGATION */}
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
            <Brain size={20} />
          </div>
          <span className="font-black text-xl tracking-tight">Cortex</span>
        </a>
        <button
          onClick={() => router.push('/dashboard')}
          className="text-slate-600 hover:text-indigo-600 transition-colors font-bold"
        >
          {user ? 'Back to Dashboard' : 'Sign In'}
        </button>
      </nav>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        {/* HEADER */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
            Simple, Honest Pricing
          </h1>
          <p className="text-xl text-slate-600 font-medium max-w-2xl mx-auto mb-8">
            Choose the plan that matches where you are today. Start free, upgrade when precision matters, or unlock everything with Elite.
          </p>

          {/* BILLING TOGGLE */}
          <div className="inline-flex items-center gap-4 bg-white rounded-full p-2 border border-slate-200">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2 rounded-full font-bold transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:text-indigo-600'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('annual')}
              className={`px-6 py-2 rounded-full font-bold transition-all ${
                billingPeriod === 'annual'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:text-indigo-600'
              }`}
            >
              Annual
              <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                Save up to $58
              </span>
            </button>
          </div>
        </div>

        {/* PRICING CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {PRICING_PLANS.map((plan) => {
            const isCurrentPlan = user && plan.tier === userTier;
            const selectedPriceId = billingPeriod === 'annual' && plan.annualPriceId
              ? plan.annualPriceId
              : plan.priceId;
            const displayPrice = billingPeriod === 'annual' && plan.annualPrice
              ? plan.annualPrice
              : plan.price;

            return (
              <div
                key={plan.tier}
                className={`relative bg-white rounded-3xl border-2 p-8 flex flex-col ${
                  plan.special
                    ? 'border-purple-300 shadow-2xl shadow-purple-100'
                    : plan.highlighted
                    ? 'border-indigo-300 shadow-xl shadow-indigo-100'
                    : 'border-slate-200'
                }`}
              >
                {/* BADGE */}
                {plan.badge && (
                  <div className={`absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-xs font-black uppercase tracking-wide ${
                    plan.special
                      ? 'bg-purple-600 text-white'
                      : 'bg-indigo-600 text-white'
                  }`}>
                    {plan.badge}
                  </div>
                )}

                {/* HEADER */}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-black text-slate-900 mb-2">{plan.name}</h3>
                  <p className="text-sm text-slate-500 font-medium mb-4">{plan.description}</p>

                  <div className="mb-2">
                    <span className="text-5xl font-black text-slate-900">{displayPrice}</span>
                    {plan.period !== 'forever' && (
                      <span className="text-slate-500 font-medium ml-2">
                        / {billingPeriod === 'annual' ? 'year' : 'month'}
                      </span>
                    )}
                  </div>

                  {billingPeriod === 'annual' && plan.annualSavings && (
                    <p className="text-sm text-emerald-600 font-bold">{plan.annualSavings}</p>
                  )}
                </div>

                {/* FEATURES */}
                <ul className="space-y-3 mb-8 flex-grow">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className={`${plan.special ? 'text-purple-600' : 'text-indigo-600'} flex-shrink-0 mt-0.5`} size={20} />
                      <span className="text-sm text-slate-700 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA BUTTON */}
                <button
                  onClick={() => handleUpgrade(selectedPriceId, plan.tier)}
                  disabled={isCurrentPlan || loading === plan.tier}
                  className={`w-full py-4 rounded-xl font-black text-lg transition-all flex items-center justify-center gap-2 ${
                    isCurrentPlan
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : plan.special
                      ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg hover:shadow-xl'
                      : plan.highlighted
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {loading === plan.tier ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Processing...
                    </>
                  ) : isCurrentPlan ? (
                    <>
                      <ShieldCheck size={20} />
                      Current Plan
                    </>
                  ) : (
                    <>
                      {plan.cta}
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* ENTERPRISE CTA */}
        <div className="mt-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-12 text-white text-center">
          <Sparkles className="mx-auto mb-4" size={48} />
          <h3 className="text-3xl font-black mb-4">Need a Custom Solution?</h3>
          <p className="text-indigo-100 font-medium text-lg mb-6">
            Contact us for enterprise pricing, custom integrations, or white-label solutions.
          </p>
          <button
            onClick={() => window.location.href = 'mailto:support@cortex.vip'}
            className="bg-white text-indigo-600 font-black px-8 py-4 rounded-xl hover:bg-indigo-50 transition-all shadow-xl"
          >
            Contact Sales
          </button>
        </div>

        {/* VALUE PROPOSITION */}
        <div className="mt-16 text-center">
          <p className="text-lg text-slate-600 font-medium mb-4">
            Elite is for people who understand one thing:
          </p>
          <p className="text-3xl font-black text-slate-900">
            Clarity compounds.
          </p>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="max-w-7xl mx-auto px-6 py-12 text-center text-slate-400 font-medium text-sm">
        &copy; {new Date().getFullYear()} Cortex Technologies. Tools for Long-Term Thinking.
      </footer>
    </div>
  );
}
