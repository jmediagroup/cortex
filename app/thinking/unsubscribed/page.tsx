import type { Metadata } from 'next';
import { Button } from '@/components/ui/Button';
import { MarketingIcon } from '@/components/marketing/Icons';

export const metadata: Metadata = {
  title: 'Unsubscribed — Money Guy Mutants Outlook',
  robots: { index: false, follow: false },
};

export default function UnsubscribedPage() {
  return (
    <div style={{ padding: '120px 24px', textAlign: 'center' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <div
          className="mgm-eyebrow"
          style={{ color: 'var(--gray-500)', marginBottom: 16 }}
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
          You won&apos;t receive any more Money Guy Mutants Outlook emails. The full archive stays
          free to read on the site.
        </p>
        <Button variant="secondary" tone="navy" href="/thinking">
          Read the latest outlook <MarketingIcon name="arrowRight" size={14} />
        </Button>
      </div>
    </div>
  );
}
