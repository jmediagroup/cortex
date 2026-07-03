import type { Metadata } from 'next';
import { MarketingShell } from '@/components/marketing/MarketingShell';
import { MarketingIcon } from '@/components/marketing/Icons';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Changelog',
  description: 'What shipped, when, and why. The Money Guy Mutants product changelog.',
  alternates: { canonical: 'https://moneyguymutants.com/changelog' },
};

export default function ChangelogPage() {
  return (
    <MarketingShell>
      <section className="hero-gradient" style={{ padding: '96px 24px 48px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div className="mgm-eyebrow" style={{ marginBottom: 14 }}>CHANGELOG</div>
          <h1
            className="h-hero"
            style={{ margin: '0 0 16px', fontSize: 'clamp(40px,6vw,56px)' }}
          >
            What shipped, and when.
          </h1>
          <p
            style={{
              fontSize: 18,
              color: 'var(--gray-600)',
              lineHeight: 1.6,
              margin: 0,
              maxWidth: '56ch',
            }}
          >
            A public, dated record of every meaningful change — new tools, behavior tweaks, bug fixes, and design updates.
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
                We&apos;re consolidating our internal release notes into a public-facing changelog. Until then, follow the{' '}
                <strong style={{ color: 'var(--navy)' }}>Roadmap</strong>{' '}
                for what&apos;s coming next.
              </p>
              <p
                style={{
                  margin: 0,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 13,
                  color: 'var(--gray-500)',
                }}
              >
                Last updated · coming soon
              </p>
            </div>
          </Card>

          <Button href="/roadmap" variant="secondary" tone="navy">
            See the roadmap <MarketingIcon name="arrowRight" size={14} />
          </Button>
        </div>
      </section>
    </MarketingShell>
  );
}
