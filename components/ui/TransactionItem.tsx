'use client';

import { type LucideIcon } from 'lucide-react';

interface TransactionItemProps {
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  title: string;
  timestamp: string;
  amount: number;
  formatAmount?: (amount: number) => string;
  className?: string;
}

const defaultFormatAmount = (amount: number) => {
  const prefix = amount >= 0 ? '+' : '';
  return `${prefix}${amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  })}`;
};

export default function TransactionItem({
  icon: Icon,
  iconBgColor = 'bg-[var(--surface-tertiary)]',
  iconColor = 'text-[var(--text-secondary)]',
  title,
  timestamp,
  amount,
  formatAmount = defaultFormatAmount,
  className = '',
}: TransactionItemProps) {
  const isPositive = amount >= 0;

  return (
    <div
      className={`flex items-center gap-3 rounded-[var(--radius-lg)] px-2 py-3 transition-colors hover:bg-[var(--surface-secondary)] ${className}`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconBgColor} ${iconColor}`}
      >
        <Icon size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[var(--text-primary)]">{title}</p>
        <p className="text-xs text-[var(--text-tertiary)]">{timestamp}</p>
      </div>

      <span
        className={`shrink-0 text-sm font-semibold ${
          isPositive ? 'text-[var(--color-positive)]' : 'text-[var(--color-negative)]'
        }`}
      >
        {formatAmount(amount)}
      </span>
    </div>
  );
}
