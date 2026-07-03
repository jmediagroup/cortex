import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { getAllOutlookSlugs, getAllOutlooks, getOutlookBySlug } from '@/lib/outlook/content';
import type { Outlook } from '@/lib/outlook/types';
import { MarketingIcon } from '@/components/marketing/Icons';
import { OutlookSubscribeForm } from '../_components/OutlookSubscribeForm';
import '@/app/articles/[slug]/article-styles.css';

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllOutlookSlugs().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const outlook = await getOutlookBySlug(slug);
  if (!outlook) return { title: 'Outlook Not Found' };

  const url = `https://moneyguymutants.com/thinking/${slug}`;
  const description = outlook.metaDescription || outlook.summary;
  const ogImage = outlook.ogImage || `/thinking/${slug}/opengraph-image`;

  return {
    title: outlook.title,
    description,
    keywords: [
      ...(outlook.tickers.length ? outlook.tickers : []),
      ...(outlook.sectors.length ? outlook.sectors : []),
      outlook.type === 'weekly' ? 'weekly investment outlook' : 'daily investment outlook',
    ],
    authors: [{ name: 'Money Guy Mutants Research' }],
    openGraph: {
      title: outlook.title,
      description,
      type: 'article',
      url,
      siteName: 'Money Guy Mutants',
      locale: 'en_US',
      images: [{ url: ogImage, width: 1200, height: 630, alt: outlook.title }],
      publishedTime: outlook.date,
      tags: outlook.tickers,
      section: outlook.type === 'weekly' ? 'Weekly Outlook' : 'Daily Outlook',
    },
    twitter: {
      card: 'summary_large_image',
      title: outlook.title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: url,
      types: {
        'application/rss+xml': 'https://moneyguymutants.com/thinking/rss.xml',
      },
    },
  };
}

export default async function OutlookDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const outlook = await getOutlookBySlug(slug);
  if (!outlook) notFound();

  const url = `https://moneyguymutants.com/thinking/${slug}`;
  const formattedDate = formatOutlookDate(outlook.date);

  const articleSchema = generateArticleSchema(outlook, url);
  const breadcrumbSchema = generateBreadcrumbSchema(outlook);

  const related = getAllOutlooks()
    .filter((o) => o.type === outlook.type && o.slug !== outlook.slug)
    .slice(0, 4);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <article lang="en-US">
        <header style={{ padding: '64px 24px 0' }}>
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <nav style={{ marginBottom: 20 }}>
              <Link
                href="/thinking"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  color: 'var(--text-secondary)',
                  fontSize: 13,
                  fontWeight: 500,
                  textDecoration: 'none',
                }}
              >
                <ArrowLeft size={14} /> Back to outlooks
              </Link>
            </nav>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--emerald-500)',
                  background: 'var(--emerald-tint-soft)',
                  border: '1px solid var(--emerald-border-soft)',
                  padding: '5px 12px',
                  borderRadius: 9999,
                }}
              >
                {outlook.type === 'weekly' ? 'Weekly Outlook' : 'Daily Outlook'}
              </span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(32px, 5vw, 44px)',
                fontWeight: 700,
                color: 'var(--text-primary)',
                letterSpacing: '-0.025em',
                lineHeight: 1.15,
                margin: '0 0 16px',
              }}
            >
              {outlook.title}
            </h1>

            <p
              style={{
                fontSize: 18,
                color: 'var(--text-secondary)',
                lineHeight: 1.55,
                margin: '0 0 24px',
              }}
            >
              {outlook.summary}
            </p>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 16,
                color: 'var(--text-tertiary)',
                fontSize: 13,
                paddingBottom: 24,
                borderBottom: '1px solid var(--border-subtle)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                By <span style={{ color: 'var(--text-secondary)' }}>Money Guy Mutants Research</span>
              </span>
              <span aria-hidden="true">·</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Calendar size={13} />
                <time dateTime={outlook.date}>{formattedDate}</time>
              </span>
              <span aria-hidden="true">·</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Clock size={13} /> {outlook.readingTime} min read
              </span>
            </div>

            {(outlook.tickers.length > 0 || outlook.sectors.length > 0) && (
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 6,
                  paddingTop: 20,
                }}
              >
                {outlook.tickers.map((t) => (
                  <span
                    key={`t-${t}`}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: '0.04em',
                      color: 'var(--emerald-500)',
                      background: 'var(--emerald-tint-soft)',
                      border: '1px solid var(--emerald-border-soft)',
                      padding: '4px 10px',
                      borderRadius: 9999,
                    }}
                  >
                    {t}
                  </span>
                ))}
                {outlook.sectors.map((s) => (
                  <span
                    key={`s-${s}`}
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      color: 'var(--text-secondary)',
                      background: 'var(--bg-glass-strong)',
                      border: '1px solid var(--glass-border)',
                      padding: '4px 10px',
                      borderRadius: 9999,
                    }}
                  >
                    #{s}
                  </span>
                ))}
              </div>
            )}
          </div>
        </header>

        <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px' }}>
          <div
            className="article-content"
            style={{ padding: '40px 0' }}
            dangerouslySetInnerHTML={{ __html: outlook.contentHtml }}
          />

          <div
            style={{
              margin: '40px 0',
              padding: 32,
              background: 'linear-gradient(135deg, #0a4a73 0%, #054C7D 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 'var(--radius-xl)',
              color: '#F5F5F7',
            }}
          >
            <div className="eyebrow" style={{ color: '#1D8072', marginBottom: 12 }}>
              GET THIS BY EMAIL
            </div>
            <h3
              style={{
                fontSize: 22,
                fontWeight: 700,
                margin: '0 0 10px',
                letterSpacing: '-0.015em',
              }}
            >
              Wake up to the outlook.
            </h3>
            <p style={{ color: '#AEAEB2', margin: '0 0 20px', lineHeight: 1.55 }}>
              Free. Weekday mornings + a Sunday recap. Unsubscribe in one click.
            </p>
            <div style={{ maxWidth: 360 }}>
              <OutlookSubscribeForm source={`detail:${outlook.slug}`} />
            </div>
          </div>

          {related.length > 0 && (
            <section
              style={{
                padding: '32px 0',
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              <h2
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  margin: '0 0 16px',
                  letterSpacing: '-0.01em',
                }}
              >
                More from Money Guy Mutants Research
              </h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link
                      href={`/thinking/${r.slug}`}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 14px',
                        background: 'var(--bg-glass)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: 12,
                        color: 'var(--text-primary)',
                        textDecoration: 'none',
                        fontSize: 14,
                        gap: 16,
                      }}
                    >
                      <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.title}
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 11,
                          color: 'var(--text-muted)',
                          flexShrink: 0,
                        }}
                      >
                        {formatOutlookDate(r.date)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <div
          style={{
            background: 'var(--bg-section)',
            padding: '64px 24px',
            marginTop: 32,
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
            <h3
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: 'var(--text-primary)',
                margin: '0 0 10px',
                letterSpacing: '-0.02em',
              }}
            >
              Browse all outlooks.
            </h3>
            <Link
              href="/thinking"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'var(--emerald-500)',
                color: 'var(--text-inverse)',
                padding: '13px 24px',
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 14,
                textDecoration: 'none',
                boxShadow: '0 0 0 1px var(--cta-glow-ring), 0 0 24px var(--cta-glow-soft)',
                marginTop: 16,
              }}
            >
              View the archive <MarketingIcon name="arrowRight" size={14} />
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}

function formatOutlookDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function generateArticleSchema(outlook: Outlook, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'AnalysisNewsArticle',
    '@id': `${url}#article`,
    url,
    headline: outlook.title,
    description: outlook.metaDescription || outlook.summary,
    datePublished: outlook.date,
    dateModified: outlook.date,
    author: {
      '@type': 'Organization',
      name: 'Money Guy Mutants Research',
      '@id': 'https://moneyguymutants.com/#organization',
    },
    publisher: {
      '@type': 'Organization',
      '@id': 'https://moneyguymutants.com/#organization',
      name: 'Cortex Technologies',
      logo: { '@type': 'ImageObject', url: 'https://moneyguymutants.com/icon' },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    timeRequired: `PT${outlook.readingTime}M`,
    articleSection: outlook.type === 'weekly' ? 'Weekly Outlook' : 'Daily Outlook',
    keywords: [...outlook.tickers, ...outlook.sectors].join(', '),
    inLanguage: 'en-US',
    isAccessibleForFree: true,
    image: outlook.ogImage
      ? { '@type': 'ImageObject', url: outlook.ogImage }
      : `https://moneyguymutants.com/thinking/${outlook.slug}/opengraph-image`,
  };
}

function generateBreadcrumbSchema(outlook: Outlook) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://moneyguymutants.com' },
      { '@type': 'ListItem', position: 2, name: 'Thinking', item: 'https://moneyguymutants.com/thinking' },
      {
        '@type': 'ListItem',
        position: 3,
        name: outlook.title,
        item: `https://moneyguymutants.com/thinking/${outlook.slug}`,
      },
    ],
  };
}
