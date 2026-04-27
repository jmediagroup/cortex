import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Unsubscribed — Cortex Outlook',
  robots: { index: false, follow: false },
};

export default function UnsubscribedPage() {
  return (
    <div style={{ padding: '120px 24px', textAlign: 'center' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <div
          className="eyebrow"
          style={{ color: 'var(--text-tertiary)', marginBottom: 16 }}
        >
          UNSUBSCRIBED
        </div>
        <h1
          style={{
            fontSize: 'clamp(32px, 5vw, 44px)',
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            margin: '0 0 16px',
          }}
        >
          You&apos;re off the list.
        </h1>
        <p
          style={{
            fontSize: 17,
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            margin: '0 0 32px',
          }}
        >
          You won&apos;t receive any more Cortex Outlook emails. The full archive stays
          free to read on the site.
        </p>
        <Link
          href="/thinking"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'var(--bg-glass-strong)',
            color: 'var(--text-primary)',
            padding: '12px 22px',
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 14,
            textDecoration: 'none',
            border: '1px solid var(--glass-border-strong)',
          }}
        >
          Read the latest outlook →
        </Link>
      </div>
    </div>
  );
}
