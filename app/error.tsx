'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { MarketingIcon } from '@/components/marketing/Icons';

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error('Unhandled application error:', error);
  }, [error]);

  return (
    <section
      className="hero-gradient"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '96px 24px',
        textAlign: 'center',
        background: 'var(--bg-canvas)',
      }}
    >
      <div style={{ maxWidth: 560, position: 'relative' }}>
        <div
          className="eyebrow"
          style={{ marginBottom: 16, color: 'var(--crimson-500)' }}
        >
          ● SOMETHING BROKE
        </div>
        <h1
          className="h-hero"
          style={{ fontSize: 'clamp(40px,6vw,64px)', margin: '0 0 20px' }}
        >
          An unexpected error occurred.
        </h1>
        <p
          style={{
            fontSize: 17,
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            margin: '0 0 40px',
          }}
        >
          Something went wrong rendering this page. Try again, or head back to the homepage.
        </p>
        {error.digest && (
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: 'var(--text-muted)',
              margin: '0 0 32px',
            }}
          >
            reference · {error.digest}
          </p>
        )}
        <div
          style={{
            display: 'flex',
            gap: 12,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            onClick={reset}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--emerald-500)',
              color: 'var(--text-inverse)',
              border: 0,
              padding: '14px 24px',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
              fontFamily: 'inherit',
              boxShadow:
                '0 0 0 1px var(--cta-glow-ring), 0 0 32px var(--cta-glow-soft)',
            }}
          >
            Try again <MarketingIcon name="arrowRight" size={14} />
          </button>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--bg-glass-strong)',
              color: 'var(--text-primary)',
              border: '1px solid var(--glass-border-strong)',
              padding: '14px 24px',
              borderRadius: 12,
              fontWeight: 600,
              fontSize: 14,
              textDecoration: 'none',
            }}
          >
            Back to home
          </Link>
        </div>
      </div>
    </section>
  );
}
