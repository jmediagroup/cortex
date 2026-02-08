'use client';

import { MoreHorizontal } from 'lucide-react';

interface ProgressBarProps {
  label: string;
  current: number;
  target: number;
  formatValue?: (value: number) => string;
  color?: 'accent' | 'positive' | 'info' | 'warning' | 'negative';
  showMenu?: boolean;
  onMenuClick?: () => void;
  className?: string;
}

const colorMap = {
  accent: 'bg-[var(--color-accent)]',
  positive: 'bg-[var(--color-positive)]',
  info: 'bg-[var(--color-info)]',
  warning: 'bg-[var(--color-warning)]',
  negative: 'bg-[var(--color-negative)]',
};

const trackColorMap = {
  accent: 'bg-[var(--primary-100)]',
  positive: 'bg-[var(--color-positive-light)]',
  info: 'bg-[var(--color-info-light)]',
  warning: 'bg-[var(--color-warning-light)]',
  negative: 'bg-[var(--color-negative-light)]',
};

const defaultFormat = (value: number) =>
  value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });

export default function ProgressBar({
  label,
  current,
  target,
  formatValue = defaultFormat,
  color = 'accent',
  showMenu = false,
  onMenuClick,
  className = '',
}: ProgressBarProps) {
  const percentage = Math.min(Math.round((current / target) * 100), 100);

  return (
    <div
      className={`rounded-[var(--radius-xl)] border border-[var(--border-primary)] bg-[var(--surface-primary)] p-4 ${className}`}
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-[var(--text-secondary)]">{label}</span>
        {showMenu && (
          <button
            onClick={onMenuClick}
            className="rounded-full p-1 text-[var(--text-tertiary)] transition-colors hover:bg-[var(--surface-tertiary)] hover:text-[var(--text-secondary)]"
            aria-label="More options"
          >
            <MoreHorizontal size={16} />
          </button>
        )}
      </div>

      <div className="mb-2 flex items-baseline gap-0.5">
        <span className="text-2xl font-bold text-[var(--text-primary)]">
          {formatValue(current)}
        </span>
        <span className="text-sm text-[var(--text-tertiary)]">
          /{formatValue(target)}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className={`h-2 flex-1 overflow-hidden rounded-full ${trackColorMap[color]}`}>
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${colorMap[color]}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-xs font-semibold text-[var(--text-secondary)]">{percentage}%</span>
      </div>
    </div>
  );
}
