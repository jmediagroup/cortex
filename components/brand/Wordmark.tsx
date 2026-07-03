import type { CSSProperties } from 'react';
import { MutantMark } from './MutantMark';

/**
 * Money Guy Mutants lockup — mascot + stacked "MONEYGUY" (bold 800) over
 * light, wide-tracked "MUTANTS". The signature MONEY-heavy / thin-second-word
 * wordmark. Renders the mark only; wrap in a <Link>/<a> at the call site.
 *
 * tone: "navy" (on light surfaces) | "white" (on navy/dark bands)
 * size: "sm" (nav bars) | "lg" (footer / hero)
 */
export function Wordmark({
  tone = 'navy',
  size = 'sm',
  style,
}: {
  tone?: 'navy' | 'white';
  size?: 'sm' | 'lg';
  style?: CSSProperties;
}) {
  const big = size === 'lg';
  const color = tone === 'white' ? '#ffffff' : 'var(--navy)';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: big ? 12 : 9,
        lineHeight: 1,
        ...style,
      }}
    >
      <MutantMark size={big ? 46 : 32} title="Money Guy Mutants" />
      <span style={{ display: 'inline-flex', flexDirection: 'column' }}>
        <span
          style={{
            fontWeight: 800,
            fontSize: big ? 27 : 17,
            letterSpacing: '0.03em',
            color,
          }}
        >
          MONEYGUY
        </span>
        <span
          style={{
            fontWeight: 300,
            fontSize: big ? 12 : 8.5,
            letterSpacing: big ? '0.44em' : '0.3em',
            color,
            marginTop: 2,
          }}
        >
          MUTANTS
        </span>
      </span>
    </span>
  );
}
