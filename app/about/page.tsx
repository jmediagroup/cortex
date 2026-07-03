import type { Metadata } from 'next';
import { MarketingPlaceholder } from '@/components/marketing/Placeholder';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Money Guy Mutants is built by humans who care about rational decision-making, personal agency, and designing tools that respect intelligence.',
  alternates: { canonical: 'https://moneyguymutants.com/about' },
};

export default function AboutPage() {
  return (
    <MarketingPlaceholder
      eyebrow="ABOUT"
      title="Money Guy Mutants, in one page."
      description="A decision-support platform built by humans who care about rational decision-making, personal agency, and tools that respect intelligence."
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
            Money Guy Mutants is built by{' '}
            <strong style={{ color: 'var(--text-primary)' }}>J Media Group LLC</strong>. Our first suite,{' '}
            <strong style={{ color: 'var(--text-primary)' }}>Money Guy Mutants</strong>, focuses on personal and small-business finance — where small decisions compound dramatically over time.
          </p>
          <p style={{ margin: 0 }}>
            We design for the part of your brain that plans, weighs outcomes, and resists impulse. Not the part that reacts to notifications, streaks, and countdowns. Money Guy Mutants makes invisible consequences visible, without pretending life is simple.
          </p>
          <p style={{ margin: 0 }}>
            A longer About page is in the works. Until then, the landing page and{' '}
            <strong style={{ color: 'var(--text-primary)' }}>Thinking</strong>{' '}
            section cover the essentials.
          </p>
        </div>
      }
      ctaHref="/thinking"
      ctaLabel="Read our thinking"
    />
  );
}
