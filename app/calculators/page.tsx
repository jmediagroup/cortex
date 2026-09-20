import type { Metadata } from 'next';
import Link from 'next/link';
import { LANDING_PAGES, landingToolContent } from '@/lib/landing-pages';
import { LandingShell } from '@/components/landing/LandingShell';

const BASE_URL = 'https://moneyguymutants.com';

export const metadata: Metadata = {
  title: 'Free Financial Calculators — Compound Interest, Coast FIRE, Debt Payoff & More',
  description:
    'Free, no-signup financial calculators: compound interest with monthly contributions, Coast FIRE, debt snowball vs avalanche, rent vs buy, car affordability, S-corp tax savings, capital gains tax, and net worth.',
  alternates: { canonical: `${BASE_URL}/calculators` },
  openGraph: {
    type: 'website',
    url: `${BASE_URL}/calculators`,
    title: 'Free Financial Calculators | Money Guy Mutants',
    description:
      'Free, no-signup financial calculators for the decisions that actually move your net worth.',
    siteName: 'Money Guy Mutants',
  },
  robots: { index: true, follow: true },
};

/**
 * Hub for the search landing pages. Not linked from the main nav on purpose;
 * it exists so crawlers (and the sitemap) have one place that links every
 * landing page, and so each landing page has a sensible breadcrumb parent.
 */
export default function CalculatorsIndex() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Free financial calculators',
    url: `${BASE_URL}/calculators`,
    isPartOf: { '@id': `${BASE_URL}/#website` },
    hasPart: LANDING_PAGES.map((p) => ({
      '@type': 'SoftwareApplication',
      name: landingToolContent(p).name,
      url: `${BASE_URL}/calculators/${p.slug}`,
      applicationCategory: 'FinanceApplication',
      isAccessibleForFree: true,
    })),
  };

  return (
    <LandingShell slug="index">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section style={{ maxWidth: 1120, margin: '0 auto', padding: 'clamp(28px, 5vw, 56px) 20px' }}>
        <div className="mgm-eyebrow" style={{ marginBottom: 12 }}>
          FREE · NO SIGNUP TO TRY
        </div>
        <h1
          style={{
            fontSize: 'clamp(30px, 6vw, 48px)',
            fontWeight: 700,
            letterSpacing: '-0.025em',
            lineHeight: 1.08,
            color: 'var(--navy)',
            margin: '0 0 14px',
            maxWidth: 820,
          }}
        >
          Free financial calculators.
        </h1>
        <p style={{ fontSize: 18, lineHeight: 1.6, color: 'var(--text-secondary)', maxWidth: 720, margin: '0 0 32px' }}>
          Real models, not marketing widgets. Every calculator below works without an account; a
          free account lets you save and compare scenarios.
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 16,
          }}
        >
          {LANDING_PAGES.map((p) => (
            <Link
              key={p.slug}
              href={`/calculators/${p.slug}`}
              style={{
                textDecoration: 'none',
                background: 'var(--surface-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-xl)',
                padding: 22,
                color: 'var(--text-primary)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8, letterSpacing: '-0.01em' }}>
                {p.h1}
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-tertiary)', lineHeight: 1.55 }}>
                {p.subhead}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </LandingShell>
  );
}
