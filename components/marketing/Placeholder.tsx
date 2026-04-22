import Link from 'next/link';
import { MarketingShell } from './MarketingShell';
import { MarketingIcon } from './Icons';

type Props = {
  eyebrow: string;
  title: string;
  description: string;
  body?: React.ReactNode;
  ctaHref?: string;
  ctaLabel?: string;
};

export function MarketingPlaceholder({
  eyebrow,
  title,
  description,
  body,
  ctaHref = '/',
  ctaLabel = 'Back to home',
}: Props) {
  return (
    <MarketingShell>
      <section
        className="hero-gradient"
        style={{ padding: '96px 24px 48px', textAlign: 'center' }}
      >
        <div style={{ maxWidth: 720, margin: '0 auto', position: 'relative' }}>
          <div
            className="eyebrow"
            style={{ marginBottom: 16, color: 'var(--text-tertiary)' }}
          >
            {eyebrow}
          </div>
          <h1
            className="h-hero"
            style={{ margin: '0 0 16px', fontSize: 'clamp(40px,6vw,56px)' }}
          >
            {title}
          </h1>
          <p
            style={{
              fontSize: 17,
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {description}
          </p>
        </div>
      </section>

      <section style={{ padding: '48px 24px 96px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          {body && (
            <div
              style={{
                background: 'var(--bg-glass)',
                backdropFilter: 'var(--glass-blur)',
                WebkitBackdropFilter: 'var(--glass-blur)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-xl)',
                padding: 32,
                boxShadow: 'var(--shadow-card), var(--shadow-inset-top)',
                marginBottom: 40,
              }}
            >
              {body}
            </div>
          )}

          <div style={{ textAlign: 'center' }}>
            <Link
              href={ctaHref}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'var(--emerald-500)',
                color: 'var(--text-inverse)',
                padding: '13px 24px',
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 14,
                textDecoration: 'none',
                boxShadow:
                  '0 0 0 1px var(--cta-glow-ring), 0 0 24px var(--cta-glow-soft)',
              }}
            >
              {ctaLabel} <MarketingIcon name="arrowRight" size={14} />
            </Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
