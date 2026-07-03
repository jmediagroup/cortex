import type { Metadata } from 'next';
import { MarketingPlaceholder } from '@/components/marketing/Placeholder';

export const metadata: Metadata = {
  title: 'Roadmap',
  description: 'What we are building next at Money Guy Mutants.',
  alternates: { canonical: 'https://moneyguymutants.com/roadmap' },
};

export default function RoadmapPage() {
  return (
    <MarketingPlaceholder
      eyebrow="ROADMAP"
      title="What we&apos;re building next."
      description="A narrow, opinionated list of the next tools, integrations, and workflows — in roughly the order we plan to ship them."
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
            The public roadmap lands soon. For now, our focus is on deepening the Finance suite — better cash-flow visualization, richer tax modeling in the S-Corp tools, and a Sankey view for income allocation.
          </p>
          <p style={{ margin: 0 }}>
            Have a tool you wish existed? Tell us via{' '}
            <strong style={{ color: 'var(--text-primary)' }}>Enterprise</strong>{' '}
            — we read every request.
          </p>
        </div>
      }
      ctaHref="/enterprise"
      ctaLabel="Share a request"
    />
  );
}
