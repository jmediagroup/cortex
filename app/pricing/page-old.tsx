"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { Zap, Check, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';

const PRICING_PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Get started with essential financial tools',
    features: [
      'Car Affordability Calculator',
      'Compound Interest Calculator',
      'S-Corp Tax Optimizer',
      'S-Corp Investment Optimizer',
      'Retirement Strategy Engine',
      'Community support',
    ],
    cta: 'Get Started',
    tier: 'free',
    priceId: null,
  },
  {
    name: 'Pro',
    price: '$9',
    period: 'per month',
    description: 'Unlock advanced optimization tools',
    features: [
      'Everything in Free',
      'Roth Conversion Ladder Optimizer',
      'Advanced tax modeling',
      'Scenario saving & comparison',
      'Priority support',
      'Early access to new features',
    ],
    cta: 'Upgrade to Pro',
    tier: 'pro',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID || 'price_PLACEHOLDER',
    highlighted: true,
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [userTier, setUserTier] = useState<'free' | 'pro'>('free');
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
          .single() as { data: { tier: 'free' | 'pro' } | null };

        if (userData?.tier) {
          setUserTier(userData.tier);
        }
      }
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
      // Create checkout session
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

      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      alert(error.message || 'Failed to start checkout. Please try again.');
      setLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    setLoading('manage');

    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to open billing portal');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Portal error:', error);
      alert(error.message || 'Failed to open billing portal. Please try again.');
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
          <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
            <Zap size={20} fill="currentColor" />
          </div>
          <span className="font-black text-xl tracking-tight">Cortex<span className="text-indigo-600">Hub</span></span>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <button
                onClick={() => router.push('/dashboard')}
                className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors"
              >
                Dashboard
              </button>
              {userTier === 'pro' && (
                <button
                  onClick={handleManageSubscription}
                  disabled={loading === 'manage'}
                  className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors disabled:opacity-50"
                >
                  {loading === 'manage' ? <Loader2 className="animate-spin" size={16} /> : 'Manage Subscription'}
                </button>
              )}
            </>
          ) : (
            <>
              <button
                onClick={() => router.push('/login')}
                className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => router.push('/login')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2 rounded-xl transition-all text-sm"
              >
                Get Started
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-6 py-20 text-center">
        <div className="mb-6 inline-block">
          <span className="bg-indigo-100 text-indigo-700 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full border border-indigo-200">
            Simple, Transparent Pricing
          </span>
        </div>
        <h1 className="text-6xl font-black mb-6 tracking-tight text-slate-900">
          Choose Your Plan
        </h1>
        <p className="text-xl text-slate-600 font-medium max-w-2xl mx-auto">
          Start with powerful free tools, upgrade when you need advanced optimization
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-2 gap-8">
          {PRICING_PLANS.map((plan) => {
            const isCurrentPlan = user && plan.tier === userTier;

            return (
              <div
                key={plan.tier}
                className={`bg-white rounded-[2.5rem] p-10 border-2 transition-all ${
                  plan.highlighted
                    ? 'border-indigo-600 shadow-2xl shadow-indigo-100 scale-105'
                    : 'border-slate-200 shadow-sm'
                }`}
              >
                {plan.highlighted && (
                  <div className="mb-6">
                    <span className="bg-indigo-600 text-white text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <h3 className="text-3xl font-black mb-2 text-slate-900">{plan.name}</h3>
                <p className="text-slate-600 font-medium mb-6">{plan.description}</p>

                <div className="mb-8">
                  <span className="text-5xl font-black text-slate-900">{plan.price}</span>
                  <span className="text-slate-500 font-bold ml-2">/ {plan.period}</span>
                </div>

                <ul className="space-y-4 mb-10">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <Check className="text-indigo-600" size={20} strokeWidth={3} />
                      </div>
                      <span className="text-slate-700 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleUpgrade(plan.priceId, plan.tier)}
                  disabled={loading === plan.tier || isCurrentPlan}
                  className={`w-full py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-2 ${
                    plan.highlighted
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-100 active:scale-95'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-900 active:scale-95'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading === plan.tier ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : isCurrentPlan ? (
                    'Current Plan'
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
      </div>

      {/* Security Badge */}
      <div className="max-w-5xl mx-auto px-6 pb-20">
        <div className="bg-white rounded-[2.5rem] p-12 border border-slate-200 text-center">
          <ShieldCheck className="mx-auto mb-4 text-indigo-600" size={48} />
          <h3 className="text-2xl font-black mb-2 text-slate-900">Secure Payment Processing</h3>
          <p className="text-slate-600 font-medium">
            All payments are securely processed by Stripe. We never store your payment information.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-6 py-12 border-t border-slate-200 text-center text-slate-400 font-medium text-sm">
        &copy; {new Date().getFullYear()} Cortex SaaS. Built for mathematical wealth optimization.
      </footer>
    </div>
  );
}
