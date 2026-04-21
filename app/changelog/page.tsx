import type { Metadata } from 'next';
import { MarketingPlaceholder } from '@/components/marketing/Placeholder';

export const metadata: Metadata = {
  title: 'Changelog',
  description: 'What shipped, when, and why. The Cortex product changelog.',
  alternates: { canonical: 'https://cortex.vip/changelog' },
};

export default function ChangelogPage() {
  return (
    <MarketingPlaceholder
      eyebrow="CHANGELOG"
      title="What shipped, and when."
      description="A public, dated record of every meaningful change — new tools, behavior tweaks, bug fixes, and design updates."
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
            We&apos;re consolidating our internal release notes into a public-facing changelog. Until then, follow the{' '}
            <strong style={{ color: 'var(--text-primary)' }}>Roadmap</strong>{' '}
            for what&apos;s coming next.
          </p>
          <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-tertiary)' }}>
            Last updated · coming soon
          </p>
        </div>
      }
      ctaHref="/roadmap"
      ctaLabel="See the roadmap"
    />
  );
}
