import type { LucideIcon } from 'lucide-react';

type Props = {
  title: string;
  meta?: string;
  amount: number;
  /** true = inflow (emerald + prefix), false = outflow (crimson − prefix). */
  positive?: boolean;
  icon: LucideIcon;
};

/**
 * Single transaction row with a circular icon chip, title/meta,
 * and a mono amount with sign prefix. Port of ui_kits/mobile/TransactionRow.jsx.
 */
export function TransactionRow({ title, meta, amount, positive = false, icon: Icon }: Props) {
  const color = positive ? 'var(--emerald-500)' : 'var(--crimson-500)';
  const ring = positive ? 'var(--emerald-border)' : 'var(--crimson-border)';
  const chip = positive ? 'var(--emerald-tint)' : 'var(--crimson-tint)';
  const formattedAmount = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 14px',
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 9999,
          background: chip,
          color,
          border: `1px solid ${ring}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={16} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: 'var(--text-primary)',
            margin: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {title}
        </p>
        {meta && (
          <p
            style={{
              fontSize: 11,
              color: 'var(--text-muted)',
              margin: '2px 0 0',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {meta}
          </p>
        )}
      </div>
      <span
        style={{
          fontSize: 14,
          fontWeight: 600,
          color,
          fontFamily: 'var(--font-mono)',
          fontVariantNumeric: 'tabular-nums',
          whiteSpace: 'nowrap',
        }}
      >
        {positive ? '+' : '−'}${formattedAmount}
      </span>
    </div>
  );
}
