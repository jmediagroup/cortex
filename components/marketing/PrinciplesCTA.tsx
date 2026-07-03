import Link from 'next/link';
import { MarketingIcon, type MarketingIconName } from './Icons';

type Principle = { icon: MarketingIconName; title: string; desc: string };

const PRINCIPLES: Principle[] = [
  { icon: 'lock', title: 'No dark patterns', desc: 'We never optimize for time-on-site.' },
  { icon: 'shield', title: 'No urgency traps', desc: 'Countdowns belong in game shows.' },
  {
    icon: 'star',
    title: 'No pretending life is simple',
    desc: 'We model complexity, not erase it.',
  },
];

/**
 * Dark feature island — stays obsidian in BOTH themes.
 * Uses fixed hex for white/mist text so it doesn't flip with the page theme.
 */
export function MarketingPrinciplesCTA() {
  const cardBg = 'rgba(255, 255, 255, 0.04)';
  const cardBorder = 'rgba(255, 255, 255, 0.08)';
  const textWhite = '#F5F5F7';
  const textMist = '#AEAEB2';
  const textMuted = '#8E8E93';

  return (
    <section
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '80px 24px',
        background: 'var(--bg-canvas)',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          position: 'relative',
          background: 'linear-gradient(135deg, #121620 0%, #0A0E14 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 'var(--radius-3xl)',
          padding: '80px 48px',
          overflow: 'hidden',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '-20%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 800,
            height: 400,
            background: 'radial-gradient(ellipse at center, rgba(0,240,160,0.18), transparent 60%)',
            filter: 'blur(40px)',
            pointerEvents: 'none',
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            position: 'relative',
            maxWidth: 900,
            margin: '0 auto',
            textAlign: 'center',
          }}
        >
          <div className="eyebrow" style={{ marginBottom: 20, color: '#00F0A0' }}>
            ● OUR PRINCIPLES
          </div>

          <h2
            style={{
              fontSize: 'clamp(32px,5vw,56px)',
              fontWeight: 700,
              color: textWhite,
              letterSpacing: '-0.03em',
              margin: '0 0 20px',
              lineHeight: 1.05,
            }}
          >
            Built on principles,
            <br />
            not dark patterns.
          </h2>
          <p
            style={{
              fontSize: 17,
              color: textMist,
              lineHeight: 1.55,
              maxWidth: 620,
              margin: '0 auto 56px',
            }}
          >
            Money Guy Mutants is built by humans who care about rational decision-making, personal agency, and designing tools that respect intelligence.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
              gap: 12,
              marginBottom: 56,
              textAlign: 'left',
            }}
          >
            {PRINCIPLES.map((p) => (
              <div
                key={p.title}
                style={{
                  background: cardBg,
                  backdropFilter: 'blur(20px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                  border: `1px solid ${cardBorder}`,
                  borderRadius: 'var(--radius-lg)',
                  padding: 20,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'rgba(0,240,160,0.1)',
                    border: '1px solid rgba(0,240,160,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#00F0A0',
                    marginBottom: 14,
                  }}
                >
                  <MarketingIcon name={p.icon} size={15} />
                </div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: textWhite,
                    marginBottom: 6,
                  }}
                >
                  {p.title}
                </div>
                <div style={{ fontSize: 12, color: textMuted, lineHeight: 1.5 }}>
                  {p.desc}
                </div>
              </div>
            ))}
          </div>

          <p
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: textWhite,
              letterSpacing: '-0.015em',
              marginBottom: 36,
              maxWidth: 600,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            Just clearer thinking — one decision at a time.
          </p>

          <Link
            href="/signup"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: '#00F0A0',
              color: '#0A0E14',
              padding: '16px 28px',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 15,
              textDecoration: 'none',
              boxShadow: '0 0 0 1px rgba(0,240,160,0.4), 0 0 40px rgba(0,240,160,0.4)',
            }}
          >
            Start thinking clearly <MarketingIcon name="arrowRight" size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
