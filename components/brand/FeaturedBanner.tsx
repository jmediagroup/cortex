import type { CSSProperties } from 'react';
import { MutantMark } from './MutantMark';

/**
 * Money Guy Mutants standard "featured image" — a navy duotone band with a
 * soft sky/mint glow, the mascot mark, and the stacked wordmark. It's the
 * on-brand fallback shown whenever a post has no custom featured image, so
 * every article, guide, and outlook still ships a recognizable branded visual
 * on its card and its detail hero. Mirrors the per-post OG cards
 * (`lib/og-image-utils.tsx`, `lib/brand-og-card.tsx`) so the on-page image and
 * the shared social image read as the same asset.
 *
 * Pure/presentational — fills its parent box (`width/height: 100%`), so the
 * caller controls the crop (thumbnail vs. full-bleed hero). `markSize` scales
 * the mascot and the wordmark together.
 */
export function FeaturedBanner({
  label,
  markSize = 68,
  showWordmark = true,
  style,
  className,
}: {
  /** Optional uppercase eyebrow (e.g. category / "DAILY OUTLOOK") drawn above the mark. */
  label?: string;
  /** Mascot width — a px number, or any CSS length (e.g. a responsive clamp()).
   *  The wordmark and internal spacing scale from it. */
  markSize?: number | string;
  showWordmark?: boolean;
  style?: CSSProperties;
  className?: string;
}) {
  // A single length drives the whole lockup so the mascot, wordmark, and gaps
  // scale together — pass a number for px or a clamp()/vh length for a hero
  // that shrinks the logo to fit above the overlapping article card.
  const mark = typeof markSize === 'number' ? `${markSize}px` : markSize;
  // Wordmark lockup, proportioned to match the brand OG cards: "MUTANTS" sits
  // at ~0.44× the "MONEYGUY" size with ~0.82× its own font as letter-spacing.
  const wordSize = `max(13px, ${mark} * 0.26)`;
  const mutantSize = `calc(${wordSize} * 0.44)`;
  const mutantTrack = `calc(${wordSize} * 0.3608)`; // 0.44 × 0.82

  return (
    <div
      aria-hidden={label ? undefined : true}
      role={label ? 'img' : undefined}
      aria-label={label ? `Money Guy Mutants — ${label}` : undefined}
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: `calc(${mark} * 0.2)`,
        background: 'linear-gradient(135deg, #0a4a73 0%, var(--navy) 100%)',
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* Sky + mint radial glow — the signature MGM OG-card wash. */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 80% 70% at 85% -15%, rgba(78,201,245,0.30), transparent 60%), radial-gradient(ellipse 65% 65% at 0% 115%, rgba(143,217,206,0.16), transparent 60%)',
        }}
      />

      {label && (
        <span
          className="mgm-eyebrow"
          style={{ position: 'relative', color: 'var(--sky)' }}
        >
          {label}
        </span>
      )}

      <MutantMark size={markSize} style={{ position: 'relative' }} />

      {showWordmark && (
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            lineHeight: 1,
          }}
        >
          <span
            style={{
              fontSize: wordSize,
              fontWeight: 800,
              letterSpacing: '0.03em',
              color: '#fff',
            }}
          >
            MONEYGUY
          </span>
          <span
            style={{
              fontSize: mutantSize,
              fontWeight: 400,
              letterSpacing: mutantTrack,
              color: '#fff',
              marginTop: 5,
              // optical centering: the trailing tracking pushes the block right.
              marginRight: `calc(${wordSize} * -0.3608)`,
            }}
          >
            MUTANTS
          </span>
        </div>
      )}
    </div>
  );
}
