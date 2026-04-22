'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md';
  /** When true, renders a row with label (used in mobile profile menu) */
  withLabel?: boolean;
}

export default function ThemeToggle({
  className = '',
  size = 'md',
  withLabel = false,
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const iconSize = size === 'sm' ? 16 : 18;
  const boxSize = size === 'sm' ? 'h-8 w-8' : 'h-9 w-9';

  if (withLabel) {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-secondary)] ${className}`}
      >
        {isDark ? (
          <Sun size={16} className="text-[var(--text-tertiary)]" />
        ) : (
          <Moon size={16} className="text-[var(--text-tertiary)]" />
        )}
        <span className="flex-1 text-left">
          {isDark ? 'Light mode' : 'Dark mode'}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`flex ${boxSize} items-center justify-center rounded-full text-[var(--text-tertiary)] transition-colors hover:bg-[var(--surface-tertiary)] hover:text-[var(--text-primary)] ${className}`}
    >
      {isDark ? <Sun size={iconSize} /> : <Moon size={iconSize} />}
    </button>
  );
}
