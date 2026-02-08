'use client';

import { ArrowUpRight, type LucideIcon } from 'lucide-react';
import Badge, { type BadgeVariant } from './Badge';

interface CategoryCardProps {
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  label: string;
  value: string;
  change?: {
    value: string;
    variant: BadgeVariant;
  };
  transactionCount?: number;
  onTransactionsClick?: () => void;
  className?: string;
}

export default function CategoryCard({
  icon: Icon,
  iconBgColor = 'bg-[var(--color-accent-light)]',
  iconColor = 'text-[var(--color-accent)]',
  label,
  value,
  change,
  transactionCount,
  onTransactionsClick,
  className = '',
}: CategoryCardProps) {
  return (
    <div
      className={`flex flex-col gap-3 rounded-[var(--radius-xl)] border border-[var(--border-primary)] bg-[var(--surface-primary)] p-4 transition-shadow hover:shadow-[var(--shadow-card-hover)] ${className}`}
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <div className={`flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] ${iconBgColor} ${iconColor}`}>
        <Icon size={22} />
      </div>

      <span className="text-sm font-medium text-[var(--text-secondary)]">{label}</span>

      <div className="flex items-center gap-2">
        <span className="text-xl font-bold text-[var(--text-primary)]">{value}</span>
        {change && <Badge value={change.value} variant={change.variant} />}
      </div>

      {transactionCount !== undefined && (
        <button
          onClick={onTransactionsClick}
          className="mt-auto flex items-center gap-1 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--color-accent)]"
        >
          {transactionCount} Transactions
          <ArrowUpRight size={12} />
        </button>
      )}
    </div>
  );
}
