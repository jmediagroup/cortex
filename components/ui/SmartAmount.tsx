'use client';

import type { CSSProperties } from 'react';

export type SmartAmountMode = 'save' | 'debt' | 'neutral';

type Props = {
  label: string;
  value: string | number;
  onChange: (next: string) => void;
  mode?: SmartAmountMode;
  id?: string;
  placeholder?: string;
  hint?: string;
};

/**
 * Adaptive money input. Mode colors the label, prefix `$`, border, and glow:
 * - `save` → emerald (positive outcomes)
 * - `debt` → crimson (negative outcomes)
 * - `neutral` → mist (default)
 *
 * Port of `ui_kits/mobile/SmartAmount.jsx`. Tokens-driven so it flips under
 * force-dark / light automatically.
 */
export function SmartAmount({
  label,
  value,
  onChange,
  mode = 'neutral',
  id,
  placeholder,
  hint,
}: Props) {
  const accent = accentFor(mode);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label
        htmlFor={id}
        style={{
          display: 'block',
          fontSize: 11,
          fontWeight: 600,
          color: accent.label,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          transition: 'color 200ms',
          marginBottom: 4,
        }}
      >
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: 18,
            top: '50%',
            transform: 'translateY(-50%)',
            color: accent.prefix,
            fontSize: 28,
            fontFamily: 'var(--font-mono)',
            fontWeight: 500,
            transition: 'color 200ms',
            pointerEvents: 'none',
          }}
        >
          $
        </span>
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          inputMode="decimal"
          style={{
            width: '100%',
            padding: '22px 16px 22px 42px',
            border: `1px solid ${accent.border}`,
            borderRadius: 18,
            fontSize: 32,
            fontFamily: 'var(--font-mono)',
            fontWeight: 500,
            color: 'var(--text-primary)',
            background: accent.bg,
            outline: 'none',
            boxShadow: accent.glow,
            transition: 'all 240ms var(--ease-out-expo)',
            letterSpacing: '-0.02em',
            fontVariantNumeric: 'tabular-nums',
          }}
        />
      </div>
      {hint && (
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{hint}</span>
      )}
    </div>
  );
}

type Accent = {
  label: string;
  prefix: string;
  border: string;
  bg: string;
  glow: CSSProperties['boxShadow'];
};

function accentFor(mode: SmartAmountMode): Accent {
  if (mode === 'save') {
    return {
      label: 'var(--emerald-500)',
      prefix: 'var(--emerald-500)',
      border: 'var(--emerald-border)',
      bg: 'var(--emerald-wash)',
      glow: '0 0 0 4px var(--emerald-50), 0 0 32px var(--emerald-100)',
    };
  }
  if (mode === 'debt') {
    return {
      label: 'var(--crimson-500)',
      prefix: 'var(--crimson-500)',
      border: 'var(--crimson-border)',
      bg: 'var(--crimson-tint)',
      glow: '0 0 0 4px var(--crimson-50), 0 0 24px var(--crimson-100)',
    };
  }
  return {
    label: 'var(--text-muted)',
    prefix: 'var(--text-tertiary)',
    border: 'var(--border-default)',
    bg: 'var(--bg-glass)',
    glow: 'none',
  };
}
