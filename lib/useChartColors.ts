'use client';

import { useEffect, useState } from 'react';

export type ChartColors = {
  emerald: string;
  emeraldArea: string;
  crimson: string;
  crimsonArea: string;
  info: string;
  purple: string;
  amber: string;
  pink: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textMuted: string;
  borderSubtle: string;
  borderDefault: string;
  bgCard: string;
  bgSection: string;
  bgGlassStrong: string;
};

/** Dark defaults used as an SSR-safe fallback (matches tokens.css `:root`). */
const DEFAULTS: ChartColors = {
  emerald: '#00F0A0',
  emeraldArea: 'rgba(0, 240, 160, 0.18)',
  crimson: '#FF3B30',
  crimsonArea: 'rgba(255, 59, 48, 0.15)',
  info: '#5AC8FA',
  purple: '#BF5AF2',
  amber: '#FFB800',
  pink: '#FF66C4',
  textPrimary: '#F5F5F7',
  textSecondary: '#AEAEB2',
  textTertiary: '#8E8E93',
  textMuted: '#6D6D72',
  borderSubtle: 'rgba(255, 255, 255, 0.06)',
  borderDefault: 'rgba(255, 255, 255, 0.10)',
  bgCard: '#1C1C1E',
  bgSection: '#121620',
  bgGlassStrong: 'rgba(255, 255, 255, 0.10)',
};

function resolveColors(): ChartColors {
  if (typeof document === 'undefined') return DEFAULTS;
  const style = getComputedStyle(document.documentElement);
  const read = (name: string, fallback: string) => {
    const v = style.getPropertyValue(name).trim();
    return v || fallback;
  };
  return {
    emerald: read('--chart-emerald', DEFAULTS.emerald),
    emeraldArea: read('--chart-emerald-area', DEFAULTS.emeraldArea),
    crimson: read('--chart-crimson', DEFAULTS.crimson),
    crimsonArea: read('--chart-crimson-area', DEFAULTS.crimsonArea),
    info: read('--chart-info', DEFAULTS.info),
    purple: read('--chart-purple', DEFAULTS.purple),
    amber: read('--chart-amber', DEFAULTS.amber),
    pink: read('--chart-pink', DEFAULTS.pink),
    textPrimary: read('--text-primary', DEFAULTS.textPrimary),
    textSecondary: read('--text-secondary', DEFAULTS.textSecondary),
    textTertiary: read('--text-tertiary', DEFAULTS.textTertiary),
    textMuted: read('--text-muted', DEFAULTS.textMuted),
    borderSubtle: read('--border-subtle', DEFAULTS.borderSubtle),
    borderDefault: read('--border-default', DEFAULTS.borderDefault),
    bgCard: read('--bg-card', DEFAULTS.bgCard),
    bgSection: read('--bg-section', DEFAULTS.bgSection),
    bgGlassStrong: read('--bg-glass-strong', DEFAULTS.bgGlassStrong),
  };
}

/**
 * Resolve current CSS-var chart colors. Re-reads whenever the `data-theme`
 * attribute on `<html>` changes so Recharts re-renders with the right hex
 * when the user flips theme.
 *
 * Recharts does not inherit CSS variables, so colors must be passed as
 * literal strings. This hook bridges the token system to that constraint.
 */
export function useChartColors(): ChartColors {
  const [colors, setColors] = useState<ChartColors>(() => resolveColors());

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const target = document.documentElement;
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'attributes' && m.attributeName === 'data-theme') {
          setColors(resolveColors());
          return;
        }
      }
    });
    observer.observe(target, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  return colors;
}
