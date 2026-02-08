'use client';

import {
  UtensilsCrossed,
  Briefcase,
  Coffee,
  ShoppingCart,
  Fuel,
  type LucideIcon,
} from 'lucide-react';
import { GaugeChart } from '@/components/charts';
import { AIInsightCard } from '@/components/ai';
import GenerateWithAI from '@/components/ai/GenerateWithAI';

interface BudgetCategory {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  name: string;
  amount: number;
  transactionCount: number;
  limit: number;
  color: string;
}

const budgetCategories: BudgetCategory[] = [
  {
    icon: UtensilsCrossed,
    iconBg: 'bg-[var(--color-positive-light)]',
    iconColor: 'text-[var(--color-positive)]',
    name: 'Food & Drinks',
    amount: 965,
    transactionCount: 45,
    limit: 2500,
    color: 'var(--chart-green)',
  },
  {
    icon: Briefcase,
    iconBg: 'bg-[var(--color-warning-light)]',
    iconColor: 'text-[var(--color-warning)]',
    name: 'Business Expenses',
    amount: 890,
    transactionCount: 23,
    limit: 1500,
    color: 'var(--chart-orange)',
  },
  {
    icon: Coffee,
    iconBg: 'bg-[var(--color-accent-light)]',
    iconColor: 'text-[var(--color-accent)]',
    name: 'Entertainment',
    amount: 432,
    transactionCount: 18,
    limit: 800,
    color: 'var(--chart-purple)',
  },
  {
    icon: ShoppingCart,
    iconBg: 'bg-[var(--color-info-light)]',
    iconColor: 'text-[var(--color-info)]',
    name: 'Shopping',
    amount: 1280,
    transactionCount: 31,
    limit: 2000,
    color: 'var(--chart-blue)',
  },
  {
    icon: Fuel,
    iconBg: 'bg-[var(--color-negative-light)]',
    iconColor: 'text-[var(--color-negative)]',
    name: 'Transportation',
    amount: 345,
    transactionCount: 12,
    limit: 600,
    color: 'var(--chart-teal)',
  },
];

export default function BudgetOverview() {
  const totalSpent = budgetCategories.reduce((sum, c) => sum + c.amount, 0);
  const totalBudget = budgetCategories.reduce((sum, c) => sum + c.limit, 0);

  return (
    <div className="flex flex-col gap-6">
      {/* AI prediction card (Image 10) */}
      <AIInsightCard
        message="AI predicts you'll exceed your monthly budget by Sept 25 if spending continues at the current rate."
        actions={[
          { label: 'Adjust Limit' },
          { label: 'Ignore' },
        ]}
      />

      <div className="flex justify-center">
        <GenerateWithAI size="md" onClick={async () => {}} />
      </div>

      {/* Gauge chart (Image 10) */}
      <div
        className="rounded-[var(--radius-xl)] border border-[var(--border-primary)] bg-[var(--surface-primary)] p-5"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <GaugeChart
          value={totalSpent}
          max={totalBudget}
          label="Spent This Month"
        />
      </div>

      {/* Budget categories with progress (Image 10) */}
      <div
        className="rounded-[var(--radius-xl)] border border-[var(--border-primary)] bg-[var(--surface-primary)] p-5"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <h3 className="mb-4 text-base font-semibold text-[var(--text-primary)]">
          Budget Categories
        </h3>
        <div className="flex flex-col gap-4">
          {budgetCategories.map((category) => {
            const pct = Math.min(Math.round((category.amount / category.limit) * 100), 100);
            const Icon = category.icon;
            return (
              <div key={category.name} className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] ${category.iconBg} ${category.iconColor}`}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        {category.name}
                      </p>
                      <p className="text-[11px] text-[var(--text-tertiary)]">
                        {category.transactionCount} Transactions
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[var(--text-primary)]">
                      ${category.amount.toLocaleString()}
                    </p>
                    <p className="text-[11px] text-[var(--text-tertiary)]">
                      Left out of ${category.limit.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-tertiary)]">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: category.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
