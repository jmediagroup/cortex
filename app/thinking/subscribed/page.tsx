import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Subscription confirmed — Money Guy Mutants Outlook',
  robots: { index: false, follow: false },
};

export default function SubscribedPage() {
  return (
    <div style={{ padding: '120px 24px', textAlign: 'center' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <div
          className="eyebrow"
          style={{ color: 'var(--emerald-500)', marginBottom: 16 }}
        >
          SUBSCRIBED
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
          You&apos;re in.
        </h1>
        <p
          style={{
            fontSize: 17,
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            margin: '0 0 32px',
          }}
        >
          The next Money Guy Mutants Investment Outlook will land in your inbox at 7am ET. You
          can unsubscribe in one click from any email.
        </p>
        <Link
          href="/thinking"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'var(--emerald-500)',
            color: 'var(--text-inverse)',
            padding: '12px 22px',
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 14,
            textDecoration: 'none',
            boxShadow: '0 0 0 1px var(--cta-glow-ring), 0 0 24px var(--cta-glow-soft)',
          }}
        >
          Read the latest outlook →
        </Link>
      </div>
    </div>
  );
}
