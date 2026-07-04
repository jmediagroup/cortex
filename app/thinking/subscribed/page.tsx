import type { Metadata } from 'next';
import { Button } from '@/components/ui/Button';
import { MarketingIcon } from '@/components/marketing/Icons';

export const metadata: Metadata = {
  title: 'Subscription confirmed — Money Guy Mutants Outlook',
  robots: { index: false, follow: false },
};

export default function SubscribedPage() {
  return (
    <div style={{ padding: '120px 24px', textAlign: 'center' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <div
          className="mgm-eyebrow"
          style={{ color: 'var(--teal-green)', marginBottom: 16 }}
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
        <Button variant="primary" href="/thinking">
          Read the latest outlook <MarketingIcon name="arrowRight" size={14} />
        </Button>
      </div>
    </div>
  );
}
