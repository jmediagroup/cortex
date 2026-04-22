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
import { createBrowserClient } from '@/lib/supabase/client';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'cortex-theme';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyThemeClass(theme: Theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

function readInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  // 1) Whatever the anti-flash script already placed on <html> wins initially.
  if (document.documentElement.classList.contains('dark')) return 'dark';
  // 2) Fall back to stored preference.
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    /* localStorage unavailable */
  }
  return 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Server renders with 'light'; client lazy initializer reads the actual state
  // set by the anti-flash <script> in <head>, so the first client render matches
  // whatever was painted before hydration.
  const [theme, setThemeState] = useState<Theme>(() => readInitialTheme());

  // On login, pull the user's persisted theme from Supabase if it differs.
  useEffect(() => {
    const supabase = createBrowserClient();

    let cancelled = false;

    const loadFromSupabase = async (userId: string) => {
      const { data, error } = await supabase
        .from('users')
        .select('theme')
        .eq('id', userId)
        .maybeSingle();
      if (cancelled || error || !data) return;
      const remote = (data as { theme?: Theme | null }).theme;
      if (remote === 'light' || remote === 'dark') {
        setThemeState(remote);
        applyThemeClass(remote);
        try {
          window.localStorage.setItem(STORAGE_KEY, remote);
        } catch {
          /* ignore */
        }
      }
    };

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) loadFromSupabase(data.user.id);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) loadFromSupabase(session.user.id);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    applyThemeClass(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    // Fire-and-forget write-through to Supabase (no-op if signed out).
    fetch('/api/user/theme', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme: next }),
    }).catch(() => {
      /* best effort — localStorage is source of truth for signed-out users */
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Allow components that render outside the provider (emails, isolated
    // previews) to still function by returning a safe no-op default rather
    // than throwing. In the real app, layout.tsx wraps every route.
    return {
      theme: 'light',
      setTheme: () => {},
      toggleTheme: () => {},
    };
  }
  return ctx;
}
