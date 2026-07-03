import type { CSSProperties, ReactNode } from 'react';

/**
 * MGM Tag / pill — content-category chip. Full pill radius, uppercase-friendly.
 * tone sets the fill; sky is the default interactive accent.
 */
type Tone = 'sky' | 'navy' | 'mint' | 'teal' | 'yellow' | 'orange';

const FILLS: Record<Tone, { background: string; color: string }> = {
  sky: { background: 'var(--sky-pill)', color: '#fff' },
  navy: { background: 'var(--navy)', color: '#fff' },
  mint: { background: 'var(--mint)', color: 'var(--navy-deep)' },
  teal: { background: 'var(--teal-green)', color: '#fff' },
  yellow: { background: 'var(--yellow)', color: 'var(--navy-deep)' },
  orange: { background: 'var(--orange)', color: '#fff' },
};

export function Tag({
  children,
  tone = 'sky',
  style,
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontFamily: 'var(--font-sans)',
        fontSize: 13,
        fontWeight: 600,
        lineHeight: 1,
        padding: '7px 14px',
        borderRadius: 'var(--radius-full)',
        ...FILLS[tone],
        ...style,
      }}
    >
      {children}
    </span>
  );
}
