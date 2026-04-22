'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';

type Props = {
  className?: string;
};

export function ThemeToggle({ className }: Props) {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';
  const nextLabel = isLight ? 'dark' : 'light';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isLight}
      aria-label={`Switch to ${nextLabel} theme`}
      data-state={theme}
      onClick={toggleTheme}
      className={['theme-toggle', className].filter(Boolean).join(' ')}
    >
      <span className="theme-toggle-track" aria-hidden="true">
        <span className="theme-toggle-icon theme-toggle-icon--moon">
          <Moon size={12} strokeWidth={2} />
        </span>
        <span className="theme-toggle-icon theme-toggle-icon--sun">
          <Sun size={12} strokeWidth={2} />
        </span>
        <span className="theme-toggle-pill" />
      </span>
    </button>
  );
}
