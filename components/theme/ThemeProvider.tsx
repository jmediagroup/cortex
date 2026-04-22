'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  THEME_COOKIE,
  THEME_DEFAULT,
  THEME_STORAGE_KEY,
  isTheme,
  type Theme,
} from '@/lib/theme';

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  hasUserPreference: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readInitialTheme(fallback: Theme): Theme {
  if (typeof document === 'undefined') return fallback;
  const attr = document.documentElement.getAttribute('data-theme');
  return isTheme(attr) ? attr : fallback;
}

export function ThemeProvider({
  children,
  initialTheme = THEME_DEFAULT,
}: {
  children: ReactNode;
  initialTheme?: Theme;
}) {
  const [theme, setThemeState] = useState<Theme>(() => readInitialTheme(initialTheme));
  const [hasUserPreference, setHasUserPreference] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      return isTheme(stored);
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {}
    document.cookie = `${THEME_COOKIE}=${theme}; Path=/; Max-Age=31536000; SameSite=Lax`;
  }, [theme]);

  useEffect(() => {
    if (hasUserPreference) return;
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const handler = (event: MediaQueryListEvent) => {
      setThemeState(event.matches ? 'light' : 'dark');
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [hasUserPreference]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    setHasUserPreference(true);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
    setHasUserPreference(true);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, toggleTheme, hasUserPreference }),
    [theme, setTheme, toggleTheme, hasUserPreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
