import { Button } from '@/components/ui/Button';
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
 * MGM navy-band CTA island — a full navy duotone panel with white ink and an
 * orange primary button. Renders light-on-navy in the single MGM theme.
 */
export function MarketingPrinciplesCTA() {
  const textWhite = '#FFFFFF';
  const textMist = 'rgba(255,255,255,0.82)';
  const textMuted = 'rgba(255,255,255,0.6)';
  const cardBg = 'rgba(255,255,255,0.06)';
  const cardBorder = 'rgba(255,255,255,0.14)';

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
          background: 'linear-gradient(135deg, #0a4a73 0%, var(--navy) 100%)',
          borderRadius: 'var(--radius-2xl)',
          padding: '80px 48px',
          overflow: 'hidden',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'repeating-linear-gradient(135deg, rgba(255,255,255,0.05) 0 14px, rgba(255,255,255,0) 14px 28px)',
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
          <div className="eyebrow" style={{ marginBottom: 20, color: 'var(--sky)' }}>
            OUR PRINCIPLES
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
                  border: `1px solid ${cardBorder}`,
                  borderRadius: 'var(--radius-md)',
                  padding: 20,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 'var(--radius-circle)',
                    background: 'var(--mint)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--navy)',
                    marginBottom: 14,
                  }}
                >
                  <MarketingIcon name={p.icon} size={15} />
                </div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
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

          <Button variant="primary" size="lg" href="/signup">
            Start thinking clearly <MarketingIcon name="arrowRight" size={16} />
          </Button>
        </div>
      </div>
    </section>
  );
}
