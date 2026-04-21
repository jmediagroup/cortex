import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingShell } from '@/components/marketing/MarketingShell';
import { MarketingIcon } from '@/components/marketing/Icons';

export const metadata: Metadata = {
  title: 'Not found',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <MarketingShell>
      <section
        className="hero-gradient"
        style={{
          minHeight: 'calc(100vh - 200px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '96px 24px',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 560, position: 'relative' }}>
          <div
            className="eyebrow"
            style={{ marginBottom: 16, color: 'var(--text-tertiary)' }}
          >
            404 · NOT FOUND
          </div>
          <h1
            className="h-hero"
            style={{ fontSize: 'clamp(40px,6vw,72px)', margin: '0 0 20px' }}
          >
            This page doesn&apos;t exist.
          </h1>
          <p
            style={{
              fontSize: 17,
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              margin: '0 0 40px',
            }}
          >
            The URL you&apos;re looking for moved, renamed, or never existed in the first place.
          </p>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--emerald-500)',
              color: 'var(--text-inverse)',
              padding: '14px 24px',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 14,
              textDecoration: 'none',
              boxShadow:
                '0 0 0 1px var(--cta-glow-ring), 0 0 32px var(--cta-glow-soft)',
            }}
          >
            Back to the homepage <MarketingIcon name="arrowRight" size={14} />
          </Link>
        </div>
      </section>
    </MarketingShell>
  );
}
