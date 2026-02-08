'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export type BadgeVariant = 'positive' | 'negative' | 'neutral' | 'info' | 'warning' | 'accent';

interface BadgeProps {
  value: string;
  variant?: BadgeVariant;
  showIcon?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  positive: 'bg-[var(--color-positive-light)] text-[var(--color-positive)]',
  negative: 'bg-[var(--color-negative-light)] text-[var(--color-negative)]',
  neutral: 'bg-[var(--surface-tertiary)] text-[var(--text-secondary)]',
  info: 'bg-[var(--color-info-light)] text-[var(--color-info)]',
  warning: 'bg-[var(--color-warning-light)] text-[var(--color-warning)]',
  accent: 'bg-[var(--color-accent-light)] text-[var(--color-accent)]',
};

const iconMap = {
  positive: TrendingUp,
  negative: TrendingDown,
  neutral: Minus,
  info: TrendingUp,
  warning: Minus,
  accent: TrendingUp,
};

export default function Badge({
  value,
  variant = 'neutral',
  showIcon = true,
  size = 'sm',
  className = '',
}: BadgeProps) {
  const Icon = iconMap[variant];
  const sizeStyles = size === 'sm'
    ? 'px-2 py-0.5 text-xs gap-1'
    : 'px-2.5 py-1 text-sm gap-1.5';
  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full ${variantStyles[variant]} ${sizeStyles} ${className}`}
    >
      {showIcon && <Icon size={iconSize} />}
      {value}
    </span>
  );
}
