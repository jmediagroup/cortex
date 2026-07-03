'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { MarketingIcon } from './Icons';

/**
 * Clean MGM hero — a full-bleed navy duotone band (navy base + faint diagonal
 * texture screened with sky). White ink on top, orange primary CTA, white ghost
 * secondary, and a floating white MGM preview card. No aurora / grid glow.
 */
function HeroBackground() {
  return (
    <div
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'var(--navy)',
          backgroundImage:
            'repeating-linear-gradient(135deg, rgba(255,255,255,0.05) 0 14px, rgba(255,255,255,0) 14px 28px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'var(--sky)',
          mixBlendMode: 'screen',
          opacity: 0.12,
        }}
      />
    </div>
  );
}

function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function Tick({ from, to, prefix = '', suffix = '', dur = 1400 }: {
  from: number;
  to: number;
  prefix?: string;
  suffix?: string;
  dur?: number;
}) {
  const [value, setValue] = useState<number>(() =>
    prefersReducedMotion() ? to : from,
  );
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const start = performance.now();
    let raf = 0;
    const loop = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(from + (to - from) * eased);
      if (p < 1) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [from, to, dur]);
  return (
    <>
      {prefix}
      {Math.round(value).toLocaleString()}
      {suffix}
    </>
  );
}

function PulsePreview() {
  const [hover, setHover] = useState(false);
  const bars = [42, 58, 46, 71, 65, 83, 78, 92];
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        background: 'var(--white)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        padding: 28,
        boxShadow: hover ? 'var(--shadow-card-hover)' : 'var(--shadow-card)',
        transform: hover ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'transform 320ms var(--ease-out-expo), box-shadow 320ms',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            aria-hidden="true"
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--teal-green)',
            }}
          />
          <span className="eyebrow" style={{ margin: 0 }}>
            NET WORTH · LIVE
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            color: 'var(--teal-green)',
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          <MarketingIcon name="trendUp" size={14} /> +4.8%
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
        <span
          className="balance-hero"
          style={{ fontSize: 44, lineHeight: 1, letterSpacing: '-0.035em' }}
        >
          $<Tick from={0} to={248912} />
        </span>
      </div>
      <div
        style={{
          fontSize: 12,
          color: 'var(--text-muted)',
          marginBottom: 24,
          fontFamily: 'var(--font-mono)',
        }}
      >
        +$11,240 this quarter · Coast FIRE at age 47
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 8,
          height: 72,
          marginBottom: 16,
        }}
      >
        {bars.map((h, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div
              style={{
                height: `${h * 0.55}%`,
                background: 'var(--teal-green)',
                borderRadius: 3,
                opacity: i === bars.length - 1 ? 1 : 0.85,
              }}
            />
            <div
              style={{
                height: `${(100 - h) * 0.25}%`,
                background: 'var(--crimson-tint)',
                borderRadius: 3,
              }}
            />
          </div>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 12,
          paddingTop: 16,
          borderTop: '1px solid var(--border-default)',
        }}
      >
        {[
          { l: 'SAVINGS', v: '$4,280', d: '+12%' },
          { l: 'SPEND', v: '$3,140', d: '−8%' },
          { l: 'INVEST', v: '$1,600', d: '+22%' },
        ].map((s, i) => (
          <div key={i}>
            <div className="eyebrow" style={{ fontSize: 9, marginBottom: 4 }}>
              {s.l}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}
            >
              {s.v}
            </div>
            <div
              style={{
                fontSize: 11,
                color: 'var(--teal-green)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {s.d}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

type HeroStat = { v: string; l: string; plus?: boolean };

const DEFAULT_STATS: HeroStat[] = [
  { v: '13', l: 'Interactive tools', plus: true },
  { v: '50', l: 'States covered', plus: true },
  { v: '0', l: 'Dark patterns' },
];

export function MarketingHero({ stats = DEFAULT_STATS }: { stats?: HeroStat[] } = {}) {
  return (
    <section
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--navy-deep)',
        paddingBottom: 80,
      }}
    >
      <HeroBackground />

      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '120px 24px 80px',
          position: 'relative',
        }}
      >
        <div
          className="marketing-hero-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1.15fr 1fr',
            gap: 80,
            alignItems: 'center',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.16)',
                color: 'rgba(255,255,255,0.9)',
                padding: '6px 12px',
                borderRadius: 9999,
                marginBottom: 32,
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: 'var(--mint)',
                }}
              />
              <span
                className="eyebrow"
                style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.9)' }}
              >
                DECISION SUPPORT, MUTANT-GRADE
              </span>
            </div>

            <h1 className="h-hero" style={{ margin: '0 0 28px', maxWidth: 620, color: '#fff' }}>
              Think clearly about
              <br />
              life&apos;s{' '}
              <span style={{ color: 'var(--sky)' }}>biggest decisions.</span>
            </h1>

            <p
              style={{
                fontSize: 18,
                color: 'rgba(255,255,255,0.85)',
                lineHeight: 1.55,
                margin: '0 0 40px',
                maxWidth: 520,
              }}
            >
              Interactive financial models that turn complexity into clarity — so you can{' '}
              <span style={{ color: '#fff', fontWeight: 600 }}>
                see outcomes before you live them
              </span>
              .
            </p>

            <div style={{ display: 'flex', gap: 12, marginBottom: 48, flexWrap: 'wrap' }}>
              <Button variant="primary" size="lg" href="/#tools">
                Explore the tools <MarketingIcon name="arrowRight" size={16} />
              </Button>
              <Button variant="secondary" tone="white" size="lg" href="/signup">
                Start free
              </Button>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 24,
                paddingTop: 32,
                borderTop: '1px solid rgba(255,255,255,0.18)',
                flexWrap: 'wrap',
              }}
            >
              {stats.map((s, i) => (
                <div key={s.l} style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                  {i > 0 && (
                    <div
                      aria-hidden="true"
                      style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.18)' }}
                    />
                  )}
                  <div>
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: 600,
                        color: '#fff',
                        fontFamily: 'var(--font-mono)',
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {s.v}
                      {s.plus && <span style={{ color: 'var(--mint)' }}>+</span>}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: 'rgba(255,255,255,0.6)',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        marginTop: 2,
                      }}
                    >
                      {s.l}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="marketing-hero-preview" style={{ position: 'relative' }}>
            <PulsePreview />
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: -20,
                right: -16,
                background: 'var(--white)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'var(--mint)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--navy)',
                }}
              >
                <MarketingIcon name="trendUp" size={14} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 10,
                    color: 'var(--text-muted)',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  Safe to spend
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--teal-green)',
                  }}
                >
                  $2,140
                </div>
              </div>
            </div>
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                bottom: -16,
                left: -20,
                background: 'var(--white)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'var(--crimson-tint)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--crimson-500)',
                }}
              >
                <MarketingIcon name="trendDown" size={14} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 10,
                    color: 'var(--text-muted)',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  Debt payoff
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                  }}
                >
                  −$840 / mo
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
