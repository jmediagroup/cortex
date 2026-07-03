import type { Metadata } from 'next';
import { MarketingShell } from '@/components/marketing/MarketingShell';
import { MarketingIcon } from '@/components/marketing/Icons';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Roadmap',
  description: 'What we are building next at Money Guy Mutants.',
  alternates: { canonical: 'https://moneyguymutants.com/roadmap' },
};

export default function RoadmapPage() {
  return (
    <MarketingShell>
      <section className="hero-gradient" style={{ padding: '96px 24px 48px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div className="mgm-eyebrow" style={{ marginBottom: 14 }}>ROADMAP</div>
          <h1
            className="h-hero"
            style={{ margin: '0 0 16px', fontSize: 'clamp(40px,6vw,56px)' }}
          >
            What we&apos;re building next.
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
            A narrow, opinionated list of the next tools, integrations, and workflows — in roughly the order we plan to ship them.
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
                The public roadmap lands soon. For now, our focus is on deepening the Finance suite — better cash-flow visualization, richer tax modeling in the S-Corp tools, and a Sankey view for income allocation.
              </p>
              <p style={{ margin: 0 }}>
                Have a tool you wish existed? Tell us via{' '}
                <strong style={{ color: 'var(--navy)' }}>Enterprise</strong>{' '}
                — we read every request.
              </p>
            </div>
          </Card>

          <Button href="/enterprise" variant="secondary" tone="navy">
            Share a request <MarketingIcon name="arrowRight" size={14} />
          </Button>
        </div>
      </section>
    </MarketingShell>
  );
}
