'use client';

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

interface GenerateWithAIProps {
  onClick?: () => void | Promise<void>;
  label?: string;
  loadingLabel?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'outline';
  className?: string;
}

const sizeStyles = {
  sm: 'px-4 py-2 text-sm gap-2',
  md: 'px-5 py-2.5 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2.5',
};

export default function GenerateWithAI({
  onClick,
  label = 'Generate with AI',
  loadingLabel = 'Generating...',
  size = 'md',
  variant = 'primary',
  className = '',
}: GenerateWithAIProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading || !onClick) return;
    setLoading(true);
    try {
      await onClick();
    } finally {
      setLoading(false);
    }
  };

  const baseStyles =
    variant === 'primary'
      ? 'bg-[var(--color-accent)] text-white shadow-sm hover:bg-[var(--primary-600)] active:bg-[var(--primary-700)]'
      : 'border border-[var(--color-accent)] text-[var(--color-accent)] hover:bg-[var(--color-accent-light)]';

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200 disabled:opacity-70 ${baseStyles} ${sizeStyles[size]} ${className}`}
    >
      {loading ? (
        <Loader2 size={size === 'lg' ? 20 : 16} className="animate-spin" />
      ) : (
        <Sparkles size={size === 'lg' ? 20 : 16} />
      )}
      {loading ? loadingLabel : label}
    </button>
  );
}
