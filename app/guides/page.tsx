import type { Metadata } from 'next';
import Link from 'next/link';
import { Clock, Calendar } from 'lucide-react';
import { getAllGuides } from '@/lib/guides/content';
import type { GuideListItem } from '@/lib/guides/types';
import { MarketingIcon } from '@/components/marketing/Icons';

export const metadata: Metadata = {
  title: 'Guides — Personal Finance, Explained',
  description:
    'Money Guy Mutants Guides are in-depth, evergreen personal-finance explainers — budgeting, investing, debt, taxes, and retirement — paired with the Money Guy Mutants calculators to put the ideas into practice.',
  keywords: [
    'personal finance guide',
    'financial planning guide',
    'budgeting guide',
    'investing guide',
    'retirement planning guide',
    'cortex guides',
  ],
  openGraph: {
    title: 'Money Guy Mutants Guides — Personal Finance, Explained',
    description:
      'In-depth, evergreen personal-finance guides from Money Guy Mutants, paired with free calculators to put the ideas into practice.',
    type: 'website',
    url: 'https://moneyguymutants.com/guides',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Money Guy Mutants Guides' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Money Guy Mutants Guides — Personal Finance, Explained',
    description: 'In-depth, evergreen personal-finance guides from Money Guy Mutants.',
    images: ['/opengraph-image'],
  },
  alternates: {
    canonical: 'https://moneyguymutants.com/guides',
    types: {
      'application/rss+xml': 'https://moneyguymutants.com/guides/rss.xml',
    },
  },
};

export default function GuidesPage() {
  const guides = getAllGuides();

  const collectionSchema =
    guides.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          '@id': 'https://moneyguymutants.com/guides#collection',
          url: 'https://moneyguymutants.com/guides',
          name: 'Money Guy Mutants Guides — Personal Finance, Explained',
          description:
            'In-depth, evergreen personal-finance guides from Money Guy Mutants.',
          inLanguage: 'en-US',
          isPartOf: { '@id': 'https://moneyguymutants.com/#website' },
          publisher: { '@id': 'https://moneyguymutants.com/#organization' },
          mainEntity: {
            '@type': 'ItemList',
            numberOfItems: guides.length,
            itemListElement: guides.map((g, idx) => ({
              '@type': 'ListItem',
              position: idx + 1,
              url: `https://moneyguymutants.com/guides/${g.slug}`,
              name: g.title,
            })),
          },
        }
      : null;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://moneyguymutants.com' },
      { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://moneyguymutants.com/guides' },
    ],
  };

  return (
    <>
      {collectionSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <section style={{ padding: '96px 24px 48px', textAlign: 'center' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative' }}>
          <div className="mgm-eyebrow" style={{ marginBottom: 16, color: 'var(--gray-500)' }}>
            ULTIMATE GUIDES
          </div>
          <h1 className="h-hero" style={{ margin: '0 0 16px', fontSize: 'clamp(40px,6vw,64px)' }}>
            Personal finance, explained.
          </h1>
          <p style={{ fontSize: 18, color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
            In-depth, evergreen guides on budgeting, investing, debt, taxes, and retirement —
            paired with the Money Guy Mutants calculators to put the ideas into practice. New guide every Sunday.
          </p>
        </div>
      </section>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px 96px' }}>
        {guides.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '64px 24px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-secondary)',
            }}
          >
            <p style={{ fontSize: 16 }}>No guides published yet. Check back soon.</p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 16,
            }}
          >
            {guides.map((g) => (
              <GuideCard key={g.slug} guide={g} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function formatGuideDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

function GuideCard({ guide }: { guide: GuideListItem }) {
  return (
    <Link
      href={`/guides/${guide.slug}`}
      className="hover-lift"
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        textDecoration: 'none',
        boxShadow: 'var(--shadow-card)',
        padding: 20,
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {guide.category && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#fff',
              background: 'var(--sky-pill)',
              padding: '4px 10px',
              borderRadius: 9999,
            }}
          >
            {guide.category}
          </span>
        )}
        <span
          style={{
            fontSize: 11,
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Calendar size={11} />
          {formatGuideDate(guide.date)}
        </span>
      </div>

      <h2
        style={{
          fontSize: 17,
          fontWeight: 700,
          color: 'var(--text-primary)',
          lineHeight: 1.3,
          letterSpacing: '-0.01em',
          margin: 0,
        }}
      >
        {guide.title}
      </h2>

      <p
        style={{
          color: 'var(--text-secondary)',
          fontSize: 13,
          lineHeight: 1.55,
          margin: 0,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {guide.summary}
      </p>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 11,
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
          paddingTop: 12,
          borderTop: '1px solid var(--border-subtle)',
          marginTop: 'auto',
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <Clock size={11} /> {guide.readingTime} min
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--orange)', fontWeight: 700 }}>
          Read <MarketingIcon name="arrowRight" size={12} />
        </span>
      </div>
    </Link>
  );
}
