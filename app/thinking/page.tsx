import type { Metadata } from 'next';
import { MarketingPlaceholder } from '@/components/marketing/Placeholder';

export const metadata: Metadata = {
  title: 'Thinking',
  description:
    'Essays, frameworks, and principles behind Cortex — how we design for long-term decision making.',
  alternates: { canonical: 'https://cortex.vip/thinking' },
};

export default function ThinkingPage() {
  return (
    <MarketingPlaceholder
      eyebrow="THINKING"
      title="How we think about the work."
      description="The mental models, frameworks, and principles we use to design Cortex — collected in one place."
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
            This space is where we&apos;ll publish the longer-form pieces that sit behind the product. Expect essays on decision theory, behavioral finance, tradeoffs we&apos;ve made in tool design, and the line between modeling and fortune telling.
          </p>
          <p style={{ margin: 0 }}>
            We&apos;re writing now and will start publishing soon. In the meantime, the{' '}
            <strong style={{ color: 'var(--text-primary)' }}>Articles</strong>{' '}
            archive has shorter pieces covering specific financial topics.
          </p>
        </div>
      }
      ctaHref="/articles"
      ctaLabel="Read the articles"
    />
  );
}
