'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Zap, ChevronLeft } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';
import { getStripe } from '@/lib/stripe/client';

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started with financial planning',
    features: [
      'Compound Interest Calculator',
      'Car Affordability Calculator (20/3/8)',
      'S-Corp Tax Optimizer',
      'Retirement Strategy Engine (Basic)',
      'Basic portfolio visualization',
      'Email support'
    ],
    cta: 'Current Plan',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: 'per month',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID,
    description: 'Advanced tools for serious wealth optimization',
    features: [
      'Everything in Free, plus:',
      'Roth Conversion Ladder with Auto-Optimization',
      'S-Corp Investment Optimizer (2026 Limits)',
      'Retirement Strategy Engine (Pro Features)',
      'Auto-optimize to tax brackets',
      'Advanced tax strategy simulations',
      'Comparison mode visualizations',
      'Priority support',
    ],
    cta: 'Upgrade to Pro',
    highlighted: true,
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async (priceId?: string) => {
    if (!priceId) {
      router.push('/dashboard');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const supabase = createBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login?redirect=/pricing');
        return;
      }

      // Create checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ priceId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { sessionId } = await response.json();

      // Redirect to Stripe Checkout
      const stripe = await getStripe();
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId });
      }
    } catch (err: any) {
      console.error('Subscription error:', err);
      setError(err.message || 'Failed to start checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors font-bold"
          >
            <ChevronLeft size={20} />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-black text-lg">C</span>
            </div>
            <span className="font-black text-xl">Cortex</span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-16 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full font-bold text-sm mb-6">
          <Zap size={16} fill="currentColor" />
          <span>SIMPLE, TRANSPARENT PRICING</span>
        </div>
        <h1 className="text-5xl font-black text-slate-900 mb-4">
          Choose Your Plan
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto font-medium">
          Start free and upgrade when you need advanced tax optimization strategies
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-4xl mx-auto px-6 mb-8">
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 text-red-700 font-medium text-center">
            {error}
          </div>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-[3rem] p-8 border-2 transition-all ${
                plan.highlighted
                  ? 'border-indigo-600 shadow-2xl scale-105'
                  : 'border-slate-200 shadow-sm'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-6 py-2 rounded-full font-black text-sm uppercase tracking-wider">
                  Most Popular
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-black text-slate-900 mb-2">{plan.name}</h3>
                <p className="text-sm text-slate-600 font-medium mb-6">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-black text-slate-900">{plan.price}</span>
                  <span className="text-slate-500 font-medium">/ {plan.period}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="text-emerald-600 flex-shrink-0 mt-0.5" size={20} />
                    <span className="text-slate-700 font-medium">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.priceId)}
                disabled={loading}
                className={`w-full py-4 rounded-2xl font-black text-lg transition-all ${
                  plan.highlighted
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? 'Processing...' : plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-24 max-w-3xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <h3 className="font-black text-lg mb-2">Can I cancel anytime?</h3>
              <p className="text-slate-600 font-medium">
                Yes! You can cancel your Pro subscription at any time. You'll continue to have access until the end of your billing period.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <h3 className="font-black text-lg mb-2">What payment methods do you accept?</h3>
              <p className="text-slate-600 font-medium">
                We accept all major credit cards (Visa, Mastercard, American Express) through Stripe's secure payment processing.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <h3 className="font-black text-lg mb-2">Is my financial data secure?</h3>
              <p className="text-slate-600 font-medium">
                Absolutely. We use bank-level encryption and never store your financial institution credentials. All calculations are performed locally in your browser.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-400 font-medium text-sm">
          &copy; {new Date().getFullYear()} Cortex Financial Technology. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
