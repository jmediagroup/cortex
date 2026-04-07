'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Sparkles, ArrowRight } from 'lucide-react';

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

interface ProGatedPreviewProps {
  isLocked: boolean;
  toolId: string;
  previewLabel?: string;
  children: React.ReactNode;
}

export default function ProGatedPreview({ isLocked, toolId, previewLabel, children }: ProGatedPreviewProps) {
  const router = useRouter();

  if (!isLocked) {
    return <>{children}</>;
  }

  const benefits = TOOL_BENEFITS[toolId] || ['Advanced analytics', 'Pro-level insights', 'Enhanced modeling'];

  return (
    <div className="relative">
      {/* Blurred preview of the actual content */}
      <div
        className="blur-[6px] opacity-50 pointer-events-none select-none"
        aria-hidden="true"
      >
        {children}
      </div>

      {/* Overlay with upgrade CTA */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-2xl p-8 max-w-md mx-4 shadow-2xl text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 mb-4">
            <Lock size={20} className="text-indigo-600" />
          </div>
          <h3 className="text-lg font-black text-slate-900 mb-1">
            {previewLabel || 'Unlock Pro Analysis'}
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            Upgrade to see the full breakdown
          </p>
          <div className="space-y-2 mb-6 text-left">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-center gap-2">
                <Sparkles size={12} className="text-indigo-500 flex-shrink-0" />
                <span className="text-xs font-medium text-slate-600">{benefit}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => router.push('/pricing')}
            className="w-full bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            Upgrade to Pro
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
