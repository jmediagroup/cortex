'use client';

import { useState } from 'react';
import { Sparkles, AudioLines, X } from 'lucide-react';

interface AIAlertBannerProps {
  message: string;
  onDismiss?: () => void;
  onAction?: () => void;
  actionLabel?: string;
  variant?: 'default' | 'warning' | 'info';
  className?: string;
}

const variantStyles = {
  default: 'bg-[var(--color-accent)] text-white',
  warning: 'bg-[var(--color-warning)] text-white',
  info: 'bg-[var(--color-info)] text-white',
};

export default function AIAlertBanner({
  message,
  onDismiss,
  onAction,
  actionLabel = 'Cancel',
  variant = 'default',
  className = '',
}: AIAlertBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <div
      className={`flex items-center gap-3 rounded-full px-4 py-2.5 ${variantStyles[variant]} ${className}`}
    >
      <Sparkles size={16} className="shrink-0" />

      <p className="min-w-0 flex-1 truncate text-sm font-medium">{message}</p>

      <div className="flex shrink-0 items-center gap-2">
        <AudioLines size={16} className="opacity-70" />
        <span className="mx-1 h-4 w-px bg-white/30" />
        <button
          onClick={() => {
            onAction?.();
            handleDismiss();
          }}
          className="text-sm font-semibold opacity-90 transition-opacity hover:opacity-100"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}
