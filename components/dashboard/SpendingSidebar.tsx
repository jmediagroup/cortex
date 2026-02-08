'use client';

import {
  UtensilsCrossed,
  ShoppingBag,
} from 'lucide-react';
import CategoryCard from '@/components/ui/CategoryCard';
import ProgressBar from '@/components/ui/ProgressBar';
import CreditCardWidget from '@/components/ui/CreditCardWidget';
import CurrencyExchange from '@/components/ui/CurrencyExchange';

export default function SpendingSidebar() {
  return (
    <div className="flex flex-col gap-5">
      {/* Credit Card carousel */}
      <CreditCardWidget />

      {/* Most Spending section */}
      <div
        className="rounded-[var(--radius-xl)] border border-[var(--border-primary)] bg-[var(--surface-primary)] p-4"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <h3 className="mb-4 text-base font-semibold text-[var(--text-primary)]">
          Most Spending
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <CategoryCard
            icon={UtensilsCrossed}
            iconBgColor="bg-[var(--color-positive-light)]"
            iconColor="text-[var(--color-positive)]"
            label="Food & Beverages"
            value="$84,523"
            change={{ value: '12%', variant: 'positive' }}
            transactionCount={67}
            className="border-0 shadow-none p-0"
          />
          <CategoryCard
            icon={ShoppingBag}
            iconBgColor="bg-[var(--color-accent-light)]"
            iconColor="text-[var(--color-accent)]"
            label="Shopping"
            value="$73,630"
            change={{ value: '12%', variant: 'negative' }}
            transactionCount={48}
            className="border-0 shadow-none p-0"
          />
        </div>
      </div>

      {/* Saving progress */}
      <ProgressBar
        label="Saving"
        current={4834}
        target={9934}
        color="positive"
        showMenu
      />

      {/* Daily Limit progress */}
      <ProgressBar
        label="Daily Limit"
        current={31364}
        target={34934}
        color="accent"
        showMenu
      />

      {/* Currency Exchange widget */}
      <CurrencyExchange />
    </div>
  );
}
