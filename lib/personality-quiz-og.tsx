import { ARCHETYPES, type ArchetypeId } from './personality-quiz-data';

/**
 * Per-archetype accent palette tuned for high-contrast, scroll-stopping
 * social cards. Each archetype gets a distinct hue while staying inside
 * the Cortex obsidian/emerald system.
 */
const ARCHETYPE_ACCENT: Record<ArchetypeId, { glow: string; ring: string; tint: string }> = {
  accumulator: { glow: '#00F0A0', ring: '#00C285', tint: 'rgba(0,240,160,0.18)' },
  optimizer:   { glow: '#5AC8FA', ring: '#0A9DD9', tint: 'rgba(90,200,250,0.18)' },
  fortress:    { glow: '#FFB800', ring: '#D99A00', tint: 'rgba(255,184,0,0.18)' },
  tactician:   { glow: '#FF6B63', ring: '#E0382C', tint: 'rgba(255,107,99,0.18)' },
  visionary:   { glow: '#BF5AF2', ring: '#8E3FB4', tint: 'rgba(191,90,242,0.20)' },
  steward:     { glow: '#33F3B3', ring: '#00C285', tint: 'rgba(51,243,179,0.18)' },
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
 * objects (no className, no CSS variables).
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

  return (
    <div
      style={{
        width,
        height,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#05070A',
        backgroundImage: `radial-gradient(ellipse at top right, ${accent.tint}, transparent 55%), radial-gradient(ellipse at bottom left, rgba(0,0,0,0.6), transparent 60%)`,
        padding,
        position: 'relative',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Aurora bloom */}
      <div
        style={{
          position: 'absolute',
          top: -200,
          right: -200,
          width: 700,
          height: 700,
          borderRadius: 9999,
          background: `radial-gradient(circle, ${accent.tint}, transparent 70%)`,
          display: 'flex',
        }}
      />

      {/* Eyebrow / wordmark */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 9999,
              background: accent.glow,
              boxShadow: `0 0 24px ${accent.glow}`,
              display: 'flex',
            }}
          />
          <div
            style={{
              fontSize: eyebrowSize,
              fontWeight: 700,
              letterSpacing: '0.32em',
              color: '#AEAEB2',
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
            color: '#8E8E93',
            display: 'flex',
          }}
        >
          CORTEX.VIP
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
            color: accent.glow,
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
            letterSpacing: '-0.04em',
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
            color: '#E5E5EA',
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
            color: '#8E8E93',
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
            background: accent.glow,
            color: '#0A0E14',
            fontSize: eyebrowSize + 2,
            fontWeight: 800,
            letterSpacing: '0.04em',
            boxShadow: `0 0 0 4px ${accent.tint}`,
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
