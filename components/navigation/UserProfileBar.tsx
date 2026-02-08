'use client';

import { Calendar, Download, Upload } from 'lucide-react';

interface UserProfileBarProps {
  name: string;
  avatarUrl?: string;
  lastActivity?: string;
  className?: string;
}

export default function UserProfileBar({
  name,
  avatarUrl,
  lastActivity,
  className = '',
}: UserProfileBarProps) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className={`hidden md:flex items-center justify-between px-6 py-4 ${className}`}>
      <div className="flex items-center gap-3">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            className="h-11 w-11 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--surface-tertiary)] text-base font-bold text-[var(--text-secondary)]">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">{name}</h2>
          {lastActivity && (
            <p className="text-xs text-[var(--text-tertiary)]">{lastActivity}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-primary)] text-[var(--text-tertiary)] transition-colors hover:bg-[var(--surface-tertiary)] hover:text-[var(--text-secondary)]"
          aria-label="Download report"
        >
          <Download size={16} />
        </button>
        <button
          className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-primary)] text-[var(--text-tertiary)] transition-colors hover:bg-[var(--surface-tertiary)] hover:text-[var(--text-secondary)]"
          aria-label="Upload data"
        >
          <Upload size={16} />
        </button>
        <div className="ml-2 flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-primary)] px-3 py-2">
          <Calendar size={14} className="text-[var(--text-tertiary)]" />
          <span className="text-sm font-medium text-[var(--text-primary)]">{today}</span>
        </div>
      </div>
    </div>
  );
}
