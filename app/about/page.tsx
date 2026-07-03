import type { Metadata } from 'next';
import { MarketingShell } from '@/components/marketing/MarketingShell';
import { MarketingIcon } from '@/components/marketing/Icons';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Money Guy Mutants is built by humans who care about rational decision-making, personal agency, and designing tools that respect intelligence.',
  alternates: { canonical: 'https://moneyguymutants.com/about' },
};

export default function AboutPage() {
  return (
    <MarketingShell>
      <section className="hero-gradient" style={{ padding: '96px 24px 48px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div className="mgm-eyebrow" style={{ marginBottom: 14 }}>ABOUT</div>
          <h1
            className="h-hero"
            style={{ margin: '0 0 16px', fontSize: 'clamp(40px,6vw,56px)' }}
          >
            Money Guy Mutants, in one page.
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
            A decision-support platform built by humans who care about rational
            decision-making, personal agency, and tools that respect intelligence.
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
                Money Guy Mutants is built by{' '}
                <strong style={{ color: 'var(--navy)' }}>J Media Group LLC</strong>. Our first suite,{' '}
                <strong style={{ color: 'var(--navy)' }}>Money Guy Mutants</strong>, focuses on personal and small-business finance — where small decisions compound dramatically over time.
              </p>
              <p style={{ margin: 0 }}>
                We design for the part of your brain that plans, weighs outcomes, and resists impulse. Not the part that reacts to notifications, streaks, and countdowns. Money Guy Mutants makes invisible consequences visible, without pretending life is simple.
              </p>
              <p style={{ margin: 0 }}>
                A longer About page is in the works. Until then, the landing page and{' '}
                <strong style={{ color: 'var(--navy)' }}>Thinking</strong>{' '}
                section cover the essentials.
              </p>
            </div>
          </Card>

          <Button href="/thinking" variant="secondary" tone="navy">
            Read our thinking <MarketingIcon name="arrowRight" size={14} />
          </Button>
        </div>
      </section>
    </MarketingShell>
  );
}
