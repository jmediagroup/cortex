'use client';

type Props = {
  /** Daily budget target. */
  daily: number;
  /** Amount spent so far today. */
  spent: number;
  /** Diameter of the orbit ring. */
  size?: number;
  /** Currency string prefix. Defaults to `$`. */
  currency?: string;
};

/**
 * Orbit ring around a daily-safe-to-spend value.
 * Emerald ring when under budget; crimson ring when over.
 * Port of `ui_kits/mobile/SafeToSpend.jsx` with tokens wiring.
 */
export function SafeToSpend({ daily, spent, size = 200, currency = '$' }: Props) {
  const remaining = daily - spent;
  const pct = Math.max(0, Math.min(1, daily ? remaining / daily : 0));
  const under = pct > 0.1;
  const color = under ? 'var(--emerald-500)' : 'var(--crimson-500)';
  const haloColor = under ? 'var(--emerald-100)' : 'var(--crimson-100)';
  const r = size / 2 - 14;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct);

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        margin: '0 auto',
      }}
    >
      {under && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: -8,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${haloColor}, transparent 70%)`,
            animation: 'safeToSpendOrbitPulse 2.8s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />
      )}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'rotate(-90deg)' }}
        role="img"
        aria-label={`${under ? 'Safe to spend' : 'Over budget'}: ${currency}${Math.abs(remaining).toLocaleString('en-US')} of ${currency}${daily.toLocaleString('en-US')} today`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--border-subtle)"
          strokeWidth="10"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{
            filter: `drop-shadow(0 0 12px ${haloColor})`,
            transition: 'stroke-dashoffset 520ms var(--ease-out-expo)',
          }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            color,
          }}
        >
          {under ? 'Safe to spend' : 'Over budget'}
        </div>
        <div
          style={{
            fontSize: 40,
            fontWeight: 600,
            letterSpacing: '-0.03em',
            color: 'var(--text-primary)',
            fontVariantNumeric: 'tabular-nums',
            fontFamily: 'var(--font-sans)',
          }}
        >
          {currency}
          {Math.abs(remaining).toLocaleString('en-US')}
        </div>
        <div
          style={{
            fontSize: 12,
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          of {currency}
          {daily.toLocaleString('en-US')} today
        </div>
      </div>
      <style>{`@keyframes safeToSpendOrbitPulse { 0%, 100% { transform: scale(1); opacity: 0.7; } 50% { transform: scale(1.06); opacity: 1; } }`}</style>
    </div>
  );
}
