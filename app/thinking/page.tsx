import type { Metadata } from 'next';
import Link from 'next/link';
import { Clock, Calendar } from 'lucide-react';
import { getAllOutlooks } from '@/lib/outlook/content';
import { countOutlooks } from '@/lib/outlook/filter';
import type { OutlookListItem } from '@/lib/outlook/types';
import { MarketingIcon } from '@/components/marketing/Icons';
import { FeaturedBanner } from '@/components/brand/FeaturedBanner';
import { OutlookSubscribeForm } from './_components/OutlookSubscribeForm';
import { OutlookFilterGrid, OutlookFilterNav } from './_components/OutlookFilter';

export const metadata: Metadata = {
  title: 'Thinking — Daily & Weekly Investment Outlook',
  description:
    'Money Guy Mutants Research publishes a daily and weekly investment outlook covering markets, tickers, sectors, and the decisions worth making. Free to read; opt in for the daily email.',
  keywords: [
    'investment outlook',
    'daily market outlook',
    'weekly market outlook',
    'investing newsletter',
    'money guy mutants research',
  ],
  openGraph: {
    title: 'Money Guy Mutants Thinking — Daily & Weekly Investment Outlook',
    description:
      'Daily and weekly investment outlooks from Money Guy Mutants Research. Free to read; opt in for the daily email.',
    type: 'website',
    url: 'https://moneyguymutants.com/thinking',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Money Guy Mutants Thinking' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Money Guy Mutants Thinking — Daily & Weekly Investment Outlook',
    description: 'Daily and weekly investment outlooks from Money Guy Mutants Research.',
    images: ['/opengraph-image'],
  },
  alternates: {
    canonical: 'https://moneyguymutants.com/thinking',
    types: {
      'application/rss+xml': 'https://moneyguymutants.com/thinking/rss.xml',
    },
  },
};

// Static: the page no longer reads `searchParams` on the server. It renders
// every outlook once per build (each new post is a new deploy), and the
// `?type=daily|weekly` filter runs in the browser — see
// ./_components/OutlookFilter.tsx.
export default function ThinkingPage() {
  const outlooks = getAllOutlooks();
  const counts = countOutlooks(outlooks);
  const entries = outlooks.map((o) => ({
    slug: o.slug,
    type: o.type,
    card: <OutlookCard key={o.slug} outlook={o} />,
  }));

  // Describes the full collection at the canonical /thinking URL. Filtered
  // views share this static HTML and canonicalise to /thinking.
  const collectionSchema =
    outlooks.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          '@id': 'https://moneyguymutants.com/thinking#collection',
          url: 'https://moneyguymutants.com/thinking',
          name: 'Money Guy Mutants Thinking — Investment Outlook',
          description:
            'Daily and weekly investment outlooks from Money Guy Mutants Research.',
          inLanguage: 'en-US',
          isPartOf: { '@id': 'https://moneyguymutants.com/#website' },
          publisher: { '@id': 'https://moneyguymutants.com/#organization' },
          mainEntity: {
            '@type': 'ItemList',
            numberOfItems: outlooks.length,
            itemListElement: outlooks.map((o, idx) => ({
              '@type': 'ListItem',
              position: idx + 1,
              url: `https://moneyguymutants.com/thinking/${o.slug}`,
              name: o.title,
            })),
          },
        }
      : null;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://moneyguymutants.com' },
      { '@type': 'ListItem', position: 2, name: 'Thinking', item: 'https://moneyguymutants.com/thinking' },
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
          <div
            className="mgm-eyebrow"
            style={{ marginBottom: 16, color: 'var(--gray-500)' }}
          >
            THINKING
          </div>
          <h1 className="h-hero" style={{ margin: '0 0 16px', fontSize: 'clamp(40px,6vw,64px)' }}>
            The Money Guy Mutants Investment Outlook.
          </h1>
          <p
            style={{
              fontSize: 18,
              color: 'var(--text-secondary)',
              lineHeight: 1.55,
              margin: 0,
            }}
          >
            Daily before market open. Weekly on Sundays. Free to read — opt in for the email.
          </p>
        </div>
      </section>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px 96px' }}>
        <div
          className="marketing-articles-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '260px minmax(0,1fr)',
            gap: 40,
            alignItems: 'start',
          }}
        >
          <aside>
            <div
              style={{
                position: 'sticky',
                top: 88,
                background: 'var(--bg-card)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                padding: 20,
                boxShadow: 'var(--shadow-card)',
                display: 'flex',
                flexDirection: 'column',
                gap: 24,
              }}
            >
              <div>
                <div
                  className="mgm-eyebrow"
                  style={{ marginBottom: 10, color: 'var(--gray-500)' }}
                >
                  CADENCE
                </div>
                <OutlookFilterNav counts={counts} />
              </div>

              <div
                style={{
                  paddingTop: 20,
                  borderTop: '1px solid var(--border-subtle)',
                }}
              >
                <OutlookSubscribeForm />
              </div>
            </div>
          </aside>

          <div style={{ minWidth: 0 }}>
            <OutlookFilterGrid entries={entries} />
          </div>
        </div>
      </div>
    </>
  );
}

function formatOutlookDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function OutlookCard({ outlook }: { outlook: OutlookListItem }) {
  return (
    <Link
      href={`/thinking/${outlook.slug}`}
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
      }}
    >
      <div style={{ height: 168 }}>
        <FeaturedBanner
          markSize={52}
          label={outlook.type === 'weekly' ? 'WEEKLY OUTLOOK' : 'DAILY OUTLOOK'}
        />
      </div>

      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
            {outlook.type === 'weekly' ? 'Weekly' : 'Daily'}
          </span>
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
            {formatOutlookDate(outlook.date)}
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
          {outlook.title}
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
          {outlook.summary}
        </p>

        {outlook.tickers.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {outlook.tickers.slice(0, 6).map((t) => (
              <span
                key={t}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  color: 'var(--navy)',
                  background: 'var(--off-white)',
                  border: '1px solid var(--border-default)',
                  padding: '3px 8px',
                  borderRadius: 9999,
                }}
              >
                {t}
              </span>
            ))}
          </div>
        )}

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
            <Clock size={11} /> {outlook.readingTime} min
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--orange)', fontWeight: 700 }}>
            Read <MarketingIcon name="arrowRight" size={12} />
          </span>
        </div>
      </div>
    </Link>
  );
}
