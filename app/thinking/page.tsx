import type { Metadata } from 'next';
import Link from 'next/link';
import { Clock, Calendar } from 'lucide-react';
import { getAllOutlooks } from '@/lib/outlook/content';
import type { OutlookListItem, OutlookType } from '@/lib/outlook/types';
import { MarketingIcon } from '@/components/marketing/Icons';
import { OutlookSubscribeForm } from './_components/OutlookSubscribeForm';

export const metadata: Metadata = {
  title: 'Thinking — Daily & Weekly Investment Outlook',
  description:
    'Cortex Research publishes a daily and weekly investment outlook covering markets, tickers, sectors, and the decisions worth making. Free to read; opt in for the daily email.',
  keywords: [
    'investment outlook',
    'daily market outlook',
    'weekly market outlook',
    'investing newsletter',
    'cortex research',
  ],
  openGraph: {
    title: 'Cortex Thinking — Daily & Weekly Investment Outlook',
    description:
      'Daily and weekly investment outlooks from Cortex Research. Free to read; opt in for the daily email.',
    type: 'website',
    url: 'https://cortex.vip/thinking',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Cortex Thinking' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cortex Thinking — Daily & Weekly Investment Outlook',
    description: 'Daily and weekly investment outlooks from Cortex Research.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://cortex.vip/thinking',
    types: {
      'application/rss+xml': 'https://cortex.vip/thinking/rss.xml',
    },
  },
};

type PageProps = {
  searchParams: Promise<{ type?: string }>;
};

const VALID_FILTERS: Array<OutlookType | 'all'> = ['all', 'daily', 'weekly'];

export default async function ThinkingPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const rawFilter = (params.type ?? 'all') as OutlookType | 'all';
  const filter = VALID_FILTERS.includes(rawFilter) ? rawFilter : 'all';

  const all = getAllOutlooks();
  const outlooks = filter === 'all' ? all : all.filter((o) => o.type === filter);
  const counts = {
    all: all.length,
    daily: all.filter((o) => o.type === 'daily').length,
    weekly: all.filter((o) => o.type === 'weekly').length,
  };

  const collectionSchema =
    outlooks.length > 0 && filter === 'all'
      ? {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          '@id': 'https://cortex.vip/thinking#collection',
          url: 'https://cortex.vip/thinking',
          name: 'Cortex Thinking — Investment Outlook',
          description:
            'Daily and weekly investment outlooks from Cortex Research.',
          inLanguage: 'en-US',
          isPartOf: { '@id': 'https://cortex.vip/#website' },
          publisher: { '@id': 'https://cortex.vip/#organization' },
          mainEntity: {
            '@type': 'ItemList',
            numberOfItems: outlooks.length,
            itemListElement: outlooks.map((o, idx) => ({
              '@type': 'ListItem',
              position: idx + 1,
              url: `https://cortex.vip/thinking/${o.slug}`,
              name: o.title,
            })),
          },
        }
      : null;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://cortex.vip' },
      { '@type': 'ListItem', position: 2, name: 'Thinking', item: 'https://cortex.vip/thinking' },
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

      <section
        className="hero-gradient"
        style={{ padding: '96px 24px 48px', textAlign: 'center' }}
      >
        <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative' }}>
          <div
            className="eyebrow"
            style={{ marginBottom: 16, color: 'var(--text-tertiary)' }}
          >
            THINKING
          </div>
          <h1 className="h-hero" style={{ margin: '0 0 16px', fontSize: 'clamp(40px,6vw,64px)' }}>
            The Cortex Investment Outlook.
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
                background: 'var(--bg-glass)',
                backdropFilter: 'var(--glass-blur)',
                WebkitBackdropFilter: 'var(--glass-blur)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-xl)',
                padding: 20,
                boxShadow: 'var(--shadow-card), var(--shadow-inset-top)',
                display: 'flex',
                flexDirection: 'column',
                gap: 24,
              }}
            >
              <div>
                <div
                  className="eyebrow"
                  style={{ marginBottom: 10, color: 'var(--text-tertiary)' }}
                >
                  CADENCE
                </div>
                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                  }}
                >
                  <FilterLink href="/thinking" active={filter === 'all'} label="All outlooks" count={counts.all} />
                  <FilterLink
                    href="/thinking?type=daily"
                    active={filter === 'daily'}
                    label="Daily"
                    count={counts.daily}
                  />
                  <FilterLink
                    href="/thinking?type=weekly"
                    active={filter === 'weekly'}
                    label="Weekly"
                    count={counts.weekly}
                  />
                </ul>
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
            {outlooks.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '64px 24px',
                  background: 'var(--bg-glass)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-xl)',
                  color: 'var(--text-secondary)',
                }}
              >
                <p style={{ fontSize: 16, marginBottom: 8 }}>
                  {filter === 'all'
                    ? 'No outlooks published yet.'
                    : `No ${filter} outlooks yet.`}
                </p>
                <p style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>
                  Subscribe to be notified when the first one drops.
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: 16,
                }}
              >
                {outlooks.map((o) => (
                  <OutlookCard key={o.slug} outlook={o} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function FilterLink({
  href,
  active,
  label,
  count,
}: {
  href: string;
  active: boolean;
  label: string;
  count: number;
}) {
  return (
    <li>
      <Link
        href={href}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 10px',
          borderRadius: 10,
          fontSize: 13,
          fontWeight: 500,
          textDecoration: 'none',
          color: active ? 'var(--emerald-500)' : 'var(--text-secondary)',
          background: active ? 'var(--emerald-tint-soft)' : 'transparent',
          border: `1px solid ${active ? 'var(--emerald-border-soft)' : 'transparent'}`,
        }}
      >
        <span>{label}</span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: active ? 'var(--emerald-500)' : 'var(--text-muted)',
          }}
        >
          {count}
        </span>
      </Link>
    </li>
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
        background: 'var(--bg-glass)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        textDecoration: 'none',
        boxShadow: 'var(--shadow-card), var(--shadow-inset-top)',
        padding: 20,
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--emerald-500)',
            background: 'var(--emerald-tint-soft)',
            border: '1px solid var(--emerald-border-soft)',
            padding: '4px 8px',
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
          fontWeight: 600,
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
          color: 'var(--text-tertiary)',
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
                color: 'var(--text-secondary)',
                background: 'var(--bg-glass-strong)',
                border: '1px solid var(--glass-border)',
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
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--emerald-500)' }}>
          Read <MarketingIcon name="arrowRight" size={12} />
        </span>
      </div>
    </Link>
  );
}
