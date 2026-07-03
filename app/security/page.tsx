import type { Metadata } from 'next';
import { MarketingShell } from '@/components/marketing/MarketingShell';
import { MarketingIcon } from '@/components/marketing/Icons';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Security',
  description: 'How Money Guy Mutants handles data, authentication, and the boring-but-important parts of security.',
  alternates: { canonical: 'https://moneyguymutants.com/security' },
};

export default function SecurityPage() {
  return (
    <MarketingShell>
      <section className="hero-gradient" style={{ padding: '96px 24px 48px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div className="mgm-eyebrow" style={{ marginBottom: 14 }}>SECURITY</div>
          <h1
            className="h-hero"
            style={{ margin: '0 0 16px', fontSize: 'clamp(40px,6vw,56px)' }}
          >
            How we protect your data.
          </h1>
          <p
            style={{
              fontSize: 18,
              color: 'var(--gray-600)',
              lineHeight: 1.6,
              margin: 0,
              maxWidth: '58ch',
            }}
          >
            Money Guy Mutants stores the minimum information required to run your tools. Everything else — calculations, scenarios, projections — lives in your browser until you choose to save it.
          </p>
        </div>
      </section>

      <section style={{ padding: '40px 24px 96px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <Card style={{ padding: 32, marginBottom: 36 }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                color: 'var(--text-secondary)',
                lineHeight: 1.7,
              }}
            >
              <p style={{ margin: 0 }}>
                <strong style={{ color: 'var(--navy)' }}>Authentication.</strong> Email + password or passwordless magic links via Supabase. Sessions use httpOnly cookies over HTTPS.
              </p>
              <p style={{ margin: 0 }}>
                <strong style={{ color: 'var(--navy)' }}>Billing.</strong> Payments are processed by Stripe. We never see or store your card.
              </p>
              <p style={{ margin: 0 }}>
                <strong style={{ color: 'var(--navy)' }}>Data.</strong> Your saved scenarios are stored in a row-level-secured Postgres (Supabase) database — only you can read them.
              </p>
              <p style={{ margin: 0 }}>
                <strong style={{ color: 'var(--navy)' }}>Disclosure.</strong> Found a security issue? Email{' '}
                <a
                  href="mailto:support@jmediagroup.net"
                  style={{ color: 'var(--navy)', fontWeight: 700, textDecoration: 'underline' }}
                >
                  support@jmediagroup.net
                </a>
                . We read every report.
              </p>
            </div>
          </Card>

          <Button href="/terms" variant="secondary" tone="navy">
            Read our terms <MarketingIcon name="arrowRight" size={14} />
          </Button>
        </div>
      </section>
    </MarketingShell>
  );
}
