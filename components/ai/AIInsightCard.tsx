'use client';

import { useState } from 'react';
import { Sparkles, X, ChevronDown } from 'lucide-react';

interface AIAction {
  label: string;
  onClick?: () => void;
}

interface AIInsightCardProps {
  message: string;
  actions?: AIAction[];
  onDismiss?: () => void;
  className?: string;
}

export default function AIInsightCard({
  message,
  actions = [],
  onDismiss,
  className = '',
}: AIInsightCardProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <div
      className={`relative rounded-[var(--radius-xl)] border border-[var(--border-primary)] bg-[var(--surface-primary)] p-5 ${className}`}
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-[var(--text-tertiary)] transition-colors hover:bg-[var(--surface-tertiary)] hover:text-[var(--text-secondary)]"
        aria-label="Dismiss insight"
      >
        <X size={14} />
      </button>

      {/* AI sparkle icon */}
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-accent-light)]">
        <Sparkles size={18} className="text-[var(--color-accent)]" />
      </div>

      {/* Insight text */}
      <p className="mb-4 pr-6 text-sm leading-relaxed text-[var(--text-primary)]">
        {message}
      </p>

      {/* Action buttons */}
      {actions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={action.onClick}
              className="flex items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--border-primary)] bg-[var(--surface-primary)] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-tertiary)]"
            >
              {action.label}
              <ChevronDown size={12} className="text-[var(--text-tertiary)]" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
