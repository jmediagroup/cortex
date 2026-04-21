import type { Metadata } from 'next';
import { MarketingPlaceholder } from '@/components/marketing/Placeholder';

export const metadata: Metadata = {
  title: 'Security',
  description: 'How Cortex handles data, authentication, and the boring-but-important parts of security.',
  alternates: { canonical: 'https://cortex.vip/security' },
};

export default function SecurityPage() {
  return (
    <MarketingPlaceholder
      eyebrow="SECURITY"
      title="How we protect your data."
      description="Cortex stores the minimum information required to run your tools. Everything else — calculations, scenarios, projections — lives in your browser until you choose to save it."
      body={
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            color: 'var(--text-secondary)',
            lineHeight: 1.65,
          }}
        >
          <p style={{ margin: 0 }}>
            <strong style={{ color: 'var(--text-primary)' }}>Authentication.</strong> Email + password or passwordless magic links via Supabase. Sessions use httpOnly cookies over HTTPS.
          </p>
          <p style={{ margin: 0 }}>
            <strong style={{ color: 'var(--text-primary)' }}>Billing.</strong> Payments are processed by Stripe. We never see or store your card.
          </p>
          <p style={{ margin: 0 }}>
            <strong style={{ color: 'var(--text-primary)' }}>Data.</strong> Your saved scenarios are stored in a row-level-secured Postgres (Supabase) database — only you can read them.
          </p>
          <p style={{ margin: 0 }}>
            <strong style={{ color: 'var(--text-primary)' }}>Disclosure.</strong> Found a security issue? Email{' '}
            <a
              href="mailto:support@jmediagroup.net"
              style={{ color: 'var(--emerald-500)', fontWeight: 600, textDecoration: 'underline' }}
            >
              support@jmediagroup.net
            </a>
            . We read every report.
          </p>
        </div>
      }
      ctaHref="/terms"
      ctaLabel="Read our terms"
    />
  );
}
