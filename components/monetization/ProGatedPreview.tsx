'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Sparkles, ArrowRight } from 'lucide-react';

// Single source of truth for Pro benefit bullets (ProUpsellCard imports this).
// Every bullet must describe something the tool's Pro view actually renders.
export const TOOL_BENEFITS: Record<string, string[]> = {
  'capital-gains-tax': ['NIIT headroom analysis', 'ACA premium-tax-credit cliff and Medicare IRMAA tiers', 'QBI / §199A deduction with the S-corp wage limit'],
  'car-affordability': ['Unlimited saved affordability scenarios (free accounts save 1 per tool)', 'Pro access across every Money Guy Mutants calculator', 'Deeper Pro panels in tools like Debt Paydown and Rent vs Buy'],
  'coast-fire': ['Stress test: lower returns, higher inflation, reduced spending', 'Barista FIRE part-time income scenarios', 'Social Security integration and a coast date optimizer'],
  'compound-interest': ['Cost of a 5-year delay, in dollars', 'What a 20% higher contribution adds', 'Withdrawal income preview and age milestones'],
  'debt-paydown': ['Opportunity cost: paydown versus minimums plus investing', 'Hybrid plan and refinance opportunity check', 'Debt-to-income trajectory and cash flow flexibility score'],
  'gambling-redirect': ['Expected loss to the house edge over your timeframe', 'Life milestones the same money could reach', 'Projected income from the invested alternative'],
  'geographic-arbitrage': ['Top 5 destinations ranked for your savings', 'Estimated state income tax difference from a move', 'Career mobility premium and lifestyle compression score'],
  'index-fund-visualizer': ['Head-to-head comparison of all four funds with your inputs', 'Monte Carlo range (5th, 50th, 95th percentile) from fund volatility', 'Sharpe ratio and estimated max drawdown'],
  'net-worth': ['Net worth momentum split into asset growth and active savings', 'Annual debt drag on your momentum', 'Tipping point: when asset growth can outpace savings'],
  'rent-vs-buy': ['3-move lifecycle friction analysis', 'Market timing scenario range', 'Hidden ownership cost breakdown'],
  'retirement-strategy': ['Auto-sized Roth conversions that fill a target tax bracket', 'Choice of which bracket to fill', 'Unlimited saved retirement scenarios (free accounts save 1 per tool)'],
  's-corp-investment': ['Solo 401(k) employee deferral and employer contribution modeling', 'IRA and HSA contributions with 2026 limits', '30-year projection with tax savings factored in'],
  's-corp-optimizer': ['Unlimited saved scenarios (free accounts save 1 per tool)', 'Pro access across every Money Guy Mutants calculator', 'Includes the S-Corp Investment Optimizer (Solo 401(k), IRA, HSA)'],
  'whats-your-why': ['AI-synthesized reflection on your money psychology', 'Named themes, core tension, and a personal next step', 'Reflections saved privately to your account'],
};

export const DEFAULT_PRO_BENEFITS = ['Deeper scenario panel for this tool', 'Unlimited saved scenarios (free accounts save 1 per tool)', 'Pro access across every Money Guy Mutants calculator'];

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

  const benefits = TOOL_BENEFITS[toolId] || DEFAULT_PRO_BENEFITS;

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
        <div className="bg-[var(--bg-card)]/95 border border-[var(--border-default)] rounded-xl p-8 max-w-md mx-4 shadow-[var(--shadow-elevated)] text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--emerald-100)] mb-4">
            <Lock size={20} className="text-[var(--emerald-500)]" />
          </div>
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">
            {previewLabel || 'Unlock Pro Analysis'}
          </h3>
          <p className="text-sm text-[var(--text-tertiary)] mb-4">
            Upgrade to see the full breakdown
          </p>
          <div className="space-y-2 mb-6 text-left">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-center gap-2">
                <Sparkles size={12} className="text-[var(--emerald-400)] flex-shrink-0" />
                <span className="text-xs font-medium text-[var(--text-secondary)]">{benefit}</span>
              </div>
            ))}
          </div>
          <button
            data-funnel-ignore
            onClick={() => router.push('/pricing')}
            className="w-full bg-[var(--orange)] text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-[#d94f1e] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            Upgrade to Pro
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
