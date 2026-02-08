'use client';

import { ArrowLeft, MoreVertical } from 'lucide-react';
import { type ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  onBack?: () => void;
  showBack?: boolean;
  rightElement?: ReactNode;
  avatar?: {
    src?: string;
    fallback: string;
    statusColor?: string;
  };
  subtitle?: string;
  className?: string;
}

export default function PageHeader({
  title,
  onBack,
  showBack = false,
  rightElement,
  avatar,
  subtitle,
  className = '',
}: PageHeaderProps) {
  return (
    <header className={`flex items-center justify-between px-4 py-3 md:px-6 md:py-4 ${className}`}>
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={onBack}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-tertiary)]"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <div>
          <h1 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h1>
          {subtitle && (
            <p className="text-xs text-[var(--text-tertiary)]">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {rightElement}
        {avatar && (
          <div className="relative">
            {avatar.src ? (
              <img
                src={avatar.src}
                alt={avatar.fallback}
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--surface-tertiary)] text-sm font-semibold text-[var(--text-secondary)]">
                {avatar.fallback.charAt(0).toUpperCase()}
              </div>
            )}
            {avatar.statusColor && (
              <span
                className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-[var(--surface-primary)]"
                style={{ backgroundColor: avatar.statusColor }}
              />
            )}
          </div>
        )}
      </div>
    </header>
  );
}
