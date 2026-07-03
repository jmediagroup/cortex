import type { CSSProperties, ReactNode } from 'react';

/**
 * MGM SectionBadge — a circular accent plate with a simple line glyph, placed
 * inline beside section headlines (the "section-icon" ornament). Echoes the
 * brand's plus/cross motif.
 */
type Glyph = 'plus' | 'book' | 'chat' | 'arrow' | 'spark';
type Tone = 'sky' | 'mint';

const PLATES: Record<Tone, { bg: string; stroke: string }> = {
  sky: { bg: 'var(--sky)', stroke: '#fff' },
  mint: { bg: 'var(--mint)', stroke: 'var(--navy)' },
};

const GLYPHS: Record<Glyph, ReactNode> = {
  plus: (
    <>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </>
  ),
  book: (
    <>
      <path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2z" />
      <line x1="8" y1="7" x2="14" y2="7" />
    </>
  ),
  chat: (
    <>
      <path d="M4 5h16v11H9l-4 4V5z" />
      <line x1="8" y1="10" x2="16" y2="10" />
    </>
  ),
  arrow: (
    <>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="13 6 19 12 13 18" />
    </>
  ),
  spark: <path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" />,
};

export function SectionBadge({
  glyph = 'plus',
  tone = 'sky',
  size = 48,
  style,
}: {
  glyph?: Glyph;
  tone?: Tone;
  size?: number;
  style?: CSSProperties;
}) {
  const plate = PLATES[tone];
  return (
    <span
      role="img"
      aria-hidden="true"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        flex: 'none',
        borderRadius: 'var(--radius-circle)',
        background: plate.bg,
        ...style,
      }}
    >
      <svg
        width={size * 0.5}
        height={size * 0.5}
        viewBox="0 0 24 24"
        fill="none"
        stroke={plate.stroke}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {GLYPHS[glyph]}
      </svg>
    </span>
  );
}

/**
 * SectionHeader — the repeating MGM section pattern: H2 + inline SectionBadge,
 * then a bold one-line intro and a short supporting sentence. Left-aligned.
 */
export function SectionHeader({
  title,
  intro,
  support,
  glyph = 'plus',
  tone = 'sky',
  style,
}: {
  title: ReactNode;
  intro?: ReactNode;
  support?: ReactNode;
  glyph?: Glyph;
  tone?: Tone;
  style?: CSSProperties;
}) {
  return (
    <header style={{ maxWidth: '62ch', ...style }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <h2 style={{ fontSize: 'var(--text-h2)', fontWeight: 700, color: 'var(--navy)', lineHeight: 1.1, margin: 0 }}>
          {title}
        </h2>
        <SectionBadge glyph={glyph} tone={tone} />
      </div>
      {intro && (
        <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--navy)', margin: '18px 0 8px' }}>{intro}</p>
      )}
      {support && (
        <p style={{ fontSize: '1.125rem', color: 'var(--gray-600)', lineHeight: 1.55, margin: 0 }}>{support}</p>
      )}
    </header>
  );
}
