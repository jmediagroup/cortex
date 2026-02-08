'use client';

import { Star, Target } from 'lucide-react';
import { ConcentricArcChart } from '@/components/charts';

export default function GoalProgress() {
  const arcs = [
    { label: 'Savings', value: 45.3, color: 'var(--chart-purple)' },
    { label: 'Investment', value: 68, color: 'var(--chart-green)' },
    { label: 'Debt Payoff', value: 82, color: 'var(--chart-blue)' },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Star rating (Image 3) */}
      <div
        className="flex flex-col items-center gap-2 rounded-[var(--radius-xl)] border border-[var(--border-primary)] bg-[var(--surface-primary)] px-4 py-5"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              size={24}
              className="fill-[var(--color-warning)] text-[var(--color-warning)]"
            />
          ))}
        </div>
        <p className="text-center text-sm text-[var(--text-secondary)]">
          Your financial health score is excellent. Keep it up!
        </p>
      </div>

      {/* Goal Progress arc chart (Image 3) */}
      <div
        className="rounded-[var(--radius-xl)] border border-[var(--border-primary)] bg-[var(--surface-primary)] p-5"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <h3 className="mb-4 text-base font-semibold text-[var(--text-primary)]">
          Goal Progress
        </h3>
        <ConcentricArcChart
          arcs={arcs}
          centerLabel="Savings"
          centerValue="45.3%"
        />
      </div>

      {/* Goal card (Image 3) */}
      <div
        className="rounded-[var(--radius-xl)] border border-[var(--border-primary)] bg-[var(--surface-primary)] p-5"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <div className="flex items-center justify-center">
          <span className="rounded-full bg-[var(--surface-tertiary)] px-4 py-1.5 text-xs font-semibold text-[var(--text-secondary)]">
            Goal
          </span>
        </div>
        <div className="mt-3 flex items-baseline justify-center gap-2">
          <span className="text-sm text-[var(--text-secondary)]">Save</span>
          <span className="text-2xl font-bold text-[var(--text-primary)]">$20,000</span>
          <span className="text-sm text-[var(--text-secondary)]">Monthly</span>
        </div>
        <p className="mt-2 text-center text-xs text-[var(--text-tertiary)]">
          Based on your current trajectory, you&apos;ll reach this goal in 4 months.
        </p>
      </div>
    </div>
  );
}
