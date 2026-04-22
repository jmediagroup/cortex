'use client';

import { MoreVertical } from 'lucide-react';
import { Sparkline } from './Sparkline';

type Props = {
  account: string;
  masked?: string;
  balance: number;
  change: number;
  spark: number[];
  expanded?: boolean;
  onPress?: () => void;
  /** Render as a button (default) or a div (non-interactive). */
  as?: 'button' | 'div';
};

export function PulseCard({
  account,
  masked,
  balance,
  change,
  spark,
  expanded = false,
  onPress,
  as = 'button',
}: Props) {
  const up = change >= 0;
  const color = up ? 'var(--emerald-500)' : 'var(--crimson-500)';
  const wholeDollars = Math.trunc(balance).toLocaleString('en-US');
  const cents = balance.toFixed(2).split('.')[1];
  const Tag = as;

  return (
    <Tag
      type={as === 'button' ? 'button' : undefined}
      onClick={as === 'button' ? onPress : undefined}
      style={{
        width: '100%',
        textAlign: 'left',
        cursor: as === 'button' ? 'pointer' : 'default',
        padding: 20,
        borderRadius: 'var(--radius-xl)',
        background: 'var(--bg-glass)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: `1px solid ${expanded ? 'var(--emerald-border)' : 'var(--glass-border)'}`,
        boxShadow: expanded
          ? '0 0 40px var(--cta-glow-soft), var(--shadow-inset-top)'
          : 'var(--shadow-inset-top), var(--shadow-card)',
        transition: 'all 320ms var(--ease-out-expo)',
        color: 'var(--text-primary)',
        fontFamily: 'inherit',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 9,
              background: up ? 'var(--emerald-tint)' : 'var(--crimson-tint)',
              color,
              border: `1px solid ${up ? 'var(--emerald-border)' : 'var(--crimson-border)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
              {account}
            </div>
            {masked && (
              <div
                style={{
                  fontSize: 10,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-muted)',
                  letterSpacing: '0.1em',
                }}
              >
                {masked}
              </div>
            )}
          </div>
        </div>
        <MoreVertical size={16} color="var(--text-tertiary)" />
      </div>

      <div
        style={{
          fontSize: 32,
          fontWeight: 600,
          letterSpacing: '-0.03em',
          color: 'var(--text-primary)',
          fontVariantNumeric: 'tabular-nums',
          fontFamily: 'var(--font-sans)',
        }}
      >
        ${wholeDollars}
        <span style={{ color: 'var(--text-muted)' }}>.{cents}</span>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 8,
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            color,
            fontSize: 12,
            fontWeight: 600,
            fontVariantNumeric: 'tabular-nums',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {up ? '↑' : '↓'} {Math.abs(change).toFixed(2)}%
          <span style={{ color: 'var(--text-muted)', fontWeight: 500, marginLeft: 4 }}>7d</span>
        </span>
        <Sparkline data={spark} color={color} width={100} height={28} />
      </div>

      {expanded && (
        <div
          style={{
            marginTop: 14,
            paddingTop: 14,
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            gap: 10,
          }}
        >
          {['Transfer', 'Pay', 'Save'].map((action) => (
            <span
              key={action}
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '8px 0',
                borderRadius: 10,
                background: 'var(--bg-glass-strong)',
                color: 'var(--text-primary)',
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              {action}
            </span>
          ))}
        </div>
      )}
    </Tag>
  );
}
