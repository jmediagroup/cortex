import { ARCHETYPES, type ArchetypeId } from './personality-quiz-data';
import { MUTANT_MARK_DATA_URI, BRAND } from './brand-assets';

/**
 * Per-archetype accent palette drawn from the Money Guy Mutants system
 * (sky / teal-green / mint / orange / yellow). Each archetype gets a
 * distinct on-brand hue that reads cleanly on the navy card. `onAccent`
 * is the legible text color for the accent-filled CTA button.
 */
const ARCHETYPE_ACCENT: Record<ArchetypeId, { accent: string; tint: string; onAccent: string }> = {
  accumulator: { accent: '#1D8072', tint: 'rgba(29,128,114,0.20)', onAccent: '#FFFFFF' },
  optimizer:   { accent: '#4EC9F5', tint: 'rgba(78,201,245,0.20)', onAccent: '#153055' },
  fortress:    { accent: '#FEBF14', tint: 'rgba(254,191,20,0.20)', onAccent: '#153055' },
  tactician:   { accent: '#F26531', tint: 'rgba(242,101,49,0.20)', onAccent: '#FFFFFF' },
  visionary:   { accent: '#8FD9CE', tint: 'rgba(143,217,206,0.22)', onAccent: '#153055' },
  steward:     { accent: '#2E9E8D', tint: 'rgba(46,158,141,0.20)', onAccent: '#153055' },
};

interface ShareCardProps {
  archetypeId: ArchetypeId;
  width: number;
  height: number;
}

/**
 * Punchy, scroll-stopping share card used by the dynamic OG/Twitter
 * image routes and the portrait download endpoint. Pure JSX — rendered
 * to PNG by next/og's ImageResponse, so styles must use inline `style`
 * objects (no className, no CSS variables). Money Guy Mutants navy field,
 * sky glow, mascot mark, white archetype name.
 */
export function ShareCard({ archetypeId, width, height }: ShareCardProps) {
  const archetype = ARCHETYPES[archetypeId];
  const accent = ARCHETYPE_ACCENT[archetypeId];
  const isPortrait = height > width;

  // Type scale flexes between landscape and portrait so the archetype
  // name fills the canvas without wrapping awkwardly.
  const titleSize = isPortrait ? 132 : 112;
  const taglineSize = isPortrait ? 40 : 36;
  const eyebrowSize = isPortrait ? 22 : 20;
  const padding = isPortrait ? 80 : 70;
  const markSize = isPortrait ? 76 : 64;

  return (
    <div
      style={{
        width,
        height,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: BRAND.navy,
        backgroundImage: `radial-gradient(ellipse 900px 620px at 85% -8%, ${accent.tint}, transparent 60%), radial-gradient(ellipse 700px 520px at 8% 108%, rgba(78,201,245,0.16), transparent 60%)`,
        padding,
        position: 'relative',
        fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
      }}
    >
      {/* Eyebrow / wordmark */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={MUTANT_MARK_DATA_URI} width={markSize} height={markSize * (124 / 120)} alt="" />
          <div
            style={{
              fontSize: eyebrowSize,
              fontWeight: 700,
              letterSpacing: '0.28em',
              color: '#FFFFFF',
              textTransform: 'uppercase',
              display: 'flex',
            }}
          >
            FINANCIAL PERSONALITY
          </div>
        </div>

        <div
          style={{
            fontSize: eyebrowSize,
            fontWeight: 700,
            letterSpacing: '0.16em',
            color: BRAND.sky,
            display: 'flex',
          }}
        >
          MONEYGUYMUTANTS.COM
        </div>
      </div>

      {/* Centerpiece */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          gap: isPortrait ? 32 : 24,
          marginTop: isPortrait ? 60 : 30,
        }}
      >
        <div
          style={{
            fontSize: eyebrowSize - 2,
            color: accent.accent,
            fontWeight: 700,
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            display: 'flex',
          }}
        >
          You are
        </div>
        <div
          style={{
            fontSize: titleSize,
            fontWeight: 800,
            color: '#FFFFFF',
            letterSpacing: '-0.03em',
            lineHeight: 0.96,
            display: 'flex',
            flexWrap: 'wrap',
            maxWidth: width - padding * 2,
          }}
        >
          {archetype.name}
        </div>
        <div
          style={{
            fontSize: taglineSize,
            fontStyle: 'italic',
            color: 'rgba(255,255,255,0.86)',
            lineHeight: 1.25,
            letterSpacing: '-0.01em',
            maxWidth: width - padding * 2,
            display: 'flex',
          }}
        >
          &ldquo;{archetype.tagline}&rdquo;
        </div>
      </div>

      {/* Footer CTA */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          marginTop: isPortrait ? 60 : 30,
        }}
      >
        <div
          style={{
            fontSize: eyebrowSize,
            color: 'rgba(255,255,255,0.72)',
            display: 'flex',
            letterSpacing: '0.04em',
          }}
        >
          Find your archetype →
        </div>

        <div
          style={{
            display: 'flex',
            padding: '14px 28px',
            borderRadius: 9999,
            background: accent.accent,
            color: accent.onAccent,
            fontSize: eyebrowSize + 2,
            fontWeight: 800,
            letterSpacing: '0.04em',
          }}
        >
          TAKE THE QUIZ
        </div>
      </div>
    </div>
  );
}

export const SHARE_SIZES = {
  landscape: { width: 1200, height: 630 },
  portrait: { width: 1080, height: 1350 },
} as const;
