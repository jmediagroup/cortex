'use client';

import { MoreVertical, type LucideIcon } from 'lucide-react';
import Badge, { type BadgeVariant } from './Badge';

interface KPICardProps {
  label: string;
  value: string;
  change?: {
    value: string;
    variant: BadgeVariant;
  };
  comparison?: string;
  icon?: LucideIcon;
  iconColor?: string;
  onMenuClick?: () => void;
  className?: string;
}

export default function KPICard({
  label,
  value,
  change,
  comparison,
  icon: Icon,
  iconColor = 'text-[var(--color-accent)]',
  onMenuClick,
  className = '',
}: KPICardProps) {
  return (
    <div
      className={`relative flex flex-col gap-2 rounded-[var(--radius-xl)] border border-[var(--border-primary)] bg-[var(--surface-primary)] p-4 transition-shadow hover:shadow-[var(--shadow-card-hover)] ${className}`}
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className={`flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-accent-light)] ${iconColor}`}>
              <Icon size={20} />
            </div>
          )}
          <span className="text-sm font-medium text-[var(--text-secondary)]">{label}</span>
        </div>
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="rounded-full p-1 text-[var(--text-tertiary)] transition-colors hover:bg-[var(--surface-tertiary)] hover:text-[var(--text-secondary)]"
            aria-label="More options"
          >
            <MoreVertical size={16} />
          </button>
        )}
      </div>

      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-[var(--text-primary)]">{value}</span>
        {change && <Badge value={change.value} variant={change.variant} />}
      </div>

      {comparison && (
        <span className="text-xs text-[var(--text-tertiary)]">{comparison}</span>
      )}
    </div>
  );
}
