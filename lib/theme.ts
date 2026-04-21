export const THEME_COOKIE = 'cortex-theme';
export const THEME_STORAGE_KEY = 'cortex-theme';
export const THEME_DEFAULT: Theme = 'dark';

export type Theme = 'dark' | 'light';

export function isTheme(value: unknown): value is Theme {
  return value === 'dark' || value === 'light';
}
