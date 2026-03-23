'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Check } from 'lucide-react';

const TOOL_BENEFITS: Record<string, string[]> = {
  'car-affordability': ['Lease vs. buy comparison', '10-year total cost of ownership', 'Opportunity cost modeling'],
  'coast-fire': ['Monte Carlo retirement simulations', 'Variable contribution modeling', 'Safe withdrawal rate analysis'],
  'compound-interest': ['Tax-advantaged account modeling', 'Inflation-adjusted projections', 'Multi-account comparison'],
  'debt-paydown': ['Hybrid paydown strategies', 'Refinancing scenario modeling', 'Net worth impact projections'],
  'gambling-redirect': ['Portfolio simulation over 30 years', 'Risk-adjusted return comparisons', 'Behavioral cost calculator'],
  'geographic-arbitrage': ['Side-by-side city comparisons', 'Tax burden breakdown by state', 'Real wage purchasing power'],
  'index-fund-visualizer': ['Custom fund basket builder', 'Dividend reinvestment modeling', 'Factor exposure analysis'],
  'net-worth': ['Liability paydown projections', 'Asset growth forecasting', 'Financial independence timeline'],
  'rent-vs-buy': ['Neighborhood appreciation modeling', 'PMI and tax deduction analysis', 'Break-even timeline calculator'],
  'retirement-strategy': ['Roth conversion ladder modeling', 'Social Security optimization', 'Sequence of returns risk'],
  's-corp-investment': ['Solo 401k contribution maximizer', 'Defined benefit plan modeling', 'After-tax return comparison'],
  's-corp-optimizer': ['State tax optimization', 'Benefits and deduction planning', 'Multi-year salary strategy'],
};

interface ProUpsellCardProps {
  toolId: string;
  isLoggedIn: boolean;
}

export default function ProUpsellCard({ toolId, isLoggedIn }: ProUpsellCardProps) {
  const router = useRouter();
  const benefits = TOOL_BENEFITS[toolId] || ['Advanced analytics', 'Pro-level insights', 'Enhanced modeling'];

  return (
    <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700 rounded-3xl p-8 md:p-10 text-white relative overflow-hidden shadow-xl">
      <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
        <Sparkles size={160} fill="currentColor" />
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={20} />
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-200">Pro Feature</span>
        </div>
        <h3 className="text-2xl font-black mb-2">Unlock Pro</h3>
        <p className="text-emerald-100 font-medium text-sm mb-6 max-w-lg">
          Get deeper insights and advanced modeling tools to make smarter financial decisions.
        </p>
        <div className="space-y-3 mb-8">
          {benefits.map((benefit, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="bg-white/20 rounded-full p-1">
                <Check size={12} strokeWidth={3} />
              </div>
              <span className="text-sm font-semibold text-emerald-50">{benefit}</span>
            </div>
          ))}
        </div>
        <button
          onClick={() => router.push('/pricing')}
          className="bg-white text-emerald-700 px-6 py-3 rounded-xl font-black text-sm hover:bg-emerald-50 transition-all shadow-md hover:scale-105 active:scale-95"
        >
          Upgrade to Pro
        </button>
      </div>
    </div>
  );
}
