import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { getAllGuideSlugs, getAllGuides, getGuideBySlug } from '@/lib/guides/content';
import type { Guide } from '@/lib/guides/types';
import { CALCULATOR_CONTENT } from '@/lib/calculator-content';
import { MarketingIcon } from '@/components/marketing/Icons';
import { Button } from '@/components/ui/Button';
import { FeaturedBanner } from '@/components/brand/FeaturedBanner';
import { ShareButtons } from '@/app/articles/[slug]/ShareButtons';
import '@/app/articles/[slug]/article-styles.css';

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllGuideSlugs().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);
  if (!guide) return { title: 'Guide Not Found' };

  const url = `https://moneyguymutants.com/guides/${slug}`;
  const description = guide.metaDescription || guide.summary;
  const ogImage = guide.ogImage || `/guides/${slug}/opengraph-image`;

  return {
    title: guide.title,
    description,
    keywords: [guide.topic, ...(guide.tags.length ? guide.tags : []), 'personal finance guide'],
    authors: [{ name: 'Money Guy Mutants Research' }],
    openGraph: {
      title: guide.title,
      description,
      type: 'article',
      url,
      siteName: 'Money Guy Mutants',
      locale: 'en_US',
      images: [{ url: ogImage, width: 1200, height: 630, alt: guide.title }],
      publishedTime: guide.date,
      tags: guide.tags,
      section: guide.category ?? 'Guides',
    },
    twitter: {
      card: 'summary_large_image',
      title: guide.title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: url,
      types: {
        'application/rss+xml': 'https://moneyguymutants.com/guides/rss.xml',
      },
    },
  };
}

export default async function GuideDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);
  if (!guide) notFound();

  const url = `https://moneyguymutants.com/guides/${slug}`;
  const formattedDate = formatGuideDate(guide.date);

  const articleSchema = generateArticleSchema(guide, url);
  const breadcrumbSchema = generateBreadcrumbSchema(guide);
  const faqSchema = generateFaqSchema(guide);

  const relatedTools = guide.relatedTools
    .map((toolSlug) => CALCULATOR_CONTENT[toolSlug])
    .filter((tool): tool is NonNullable<typeof tool> => Boolean(tool));

  const related = getAllGuides()
    .filter((g) => g.slug !== guide.slug)
    .slice(0, 4);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}

      <article lang="en-US">
        {/* Standard Money Guy Mutant branded hero — guides have no uploaded
            featured image, so every guide gets the same on-brand banner. */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: 'clamp(240px, 40vh, 440px)',
            background: 'var(--navy)',
          }}
        >
          <FeaturedBanner markSize={124} label={guide.category ?? 'GUIDE'} />
        </div>

        <header style={{ position: 'relative', marginTop: -96 }}>
          <div
            style={{
              maxWidth: 760,
              margin: '0 auto',
              background: 'var(--bg-canvas)',
              borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
              padding: '32px 24px 0',
            }}
          >
            <nav style={{ marginBottom: 20 }}>
              <Link
                href="/guides"
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
                <ArrowLeft size={14} /> Back to guides
              </Link>
            </nav>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#fff',
                  background: 'var(--sky-pill)',
                  padding: '5px 12px',
                  borderRadius: 9999,
                }}
              >
                {guide.category ?? 'Guide'}
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
              {guide.title}
            </h1>

            <p style={{ fontSize: 18, color: 'var(--text-secondary)', lineHeight: 1.55, margin: '0 0 24px' }}>
              {guide.summary}
            </p>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 16,
                color: 'var(--text-muted)',
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
                <time dateTime={guide.date}>{formattedDate}</time>
              </span>
              <span aria-hidden="true">·</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Clock size={13} /> {guide.readingTime} min read
              </span>
            </div>

            {guide.tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingTop: 20 }}>
                {guide.tags.map((t) => (
                  <span
                    key={t}
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: 'var(--navy)',
                      background: 'var(--off-white)',
                      border: '1px solid var(--border-default)',
                      padding: '4px 10px',
                      borderRadius: 9999,
                    }}
                  >
                    #{t}
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
            dangerouslySetInnerHTML={{ __html: guide.contentHtml }}
          />

          <ShareButtons url={url} title={guide.title} label="SHARE THIS GUIDE" />

          {relatedTools.length > 0 && (
            <section
              style={{
                margin: '8px 0 40px',
                padding: 28,
                background: 'var(--bg-section)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div className="mgm-eyebrow" style={{ marginBottom: 12, color: 'var(--gray-500)' }}>
                PUT IT INTO PRACTICE
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 12,
                }}
              >
                {relatedTools.map((tool) => (
                  <Link
                    key={tool.slug}
                    href={`/apps/${tool.slug}`}
                    className="hover-lift"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                      padding: '16px 18px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-md)',
                      textDecoration: 'none',
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
                      {tool.name}
                    </span>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 12,
                        fontWeight: 700,
                        color: 'var(--orange)',
                      }}
                    >
                      Try it free <MarketingIcon name="arrowRight" size={11} />
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {related.length > 0 && (
            <section style={{ padding: '32px 0', borderTop: '1px solid var(--border-subtle)' }}>
              <h2
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  margin: '0 0 16px',
                  letterSpacing: '-0.01em',
                }}
              >
                More guides
              </h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link
                      href={`/guides/${r.slug}`}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 14px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-default)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-primary)',
                        textDecoration: 'none',
                        fontSize: 14,
                        gap: 16,
                      }}
                    >
                      <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.title}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>
                        {formatGuideDate(r.date)}
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
              Browse all guides.
            </h3>
            <div style={{ marginTop: 16 }}>
              <Button variant="primary" href="/guides">
                View all guides <MarketingIcon name="arrowRight" size={14} />
              </Button>
            </div>
          </div>
        </div>
      </article>
    </>
  );
}

function formatGuideDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function generateArticleSchema(guide: Guide, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${url}#article`,
    url,
    headline: guide.title,
    description: guide.metaDescription || guide.summary,
    datePublished: guide.date,
    dateModified: guide.date,
    author: {
      '@type': 'Organization',
      name: 'Money Guy Mutants Research',
      '@id': 'https://moneyguymutants.com/#organization',
    },
    publisher: {
      '@type': 'Organization',
      '@id': 'https://moneyguymutants.com/#organization',
      name: 'Money Guy Mutants Technologies',
      logo: { '@type': 'ImageObject', url: 'https://moneyguymutants.com/icon' },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    timeRequired: `PT${guide.readingTime}M`,
    articleSection: guide.category ?? 'Guides',
    keywords: [guide.topic, ...guide.tags].join(', '),
    inLanguage: 'en-US',
    isAccessibleForFree: true,
    image: guide.ogImage
      ? { '@type': 'ImageObject', url: guide.ogImage }
      : `https://moneyguymutants.com/guides/${guide.slug}/opengraph-image`,
  };
}

function generateBreadcrumbSchema(guide: Guide) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://moneyguymutants.com' },
      { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://moneyguymutants.com/guides' },
      { '@type': 'ListItem', position: 3, name: guide.title, item: `https://moneyguymutants.com/guides/${guide.slug}` },
    ],
  };
}

// Best-effort FAQPage schema: pulls "### Q?" -> following paragraph pairs out
// of the rendered HTML's original markdown structure isn't available here, so
// this only fires when the guide's HTML contains a `##/### FAQ`-style section
// with sibling headings — parsed leniently, never throws.
function generateFaqSchema(guide: Guide) {
  const faqSectionMatch = guide.contentHtml.match(
    /<h[23][^>]*>\s*(?:frequently asked questions|faq)s?\s*<\/h[23]>([\s\S]*?)(?:<h[12][^>]*>|$)/i,
  );
  if (!faqSectionMatch) return null;

  const section = faqSectionMatch[1];
  const qaPairs: { question: string; answer: string }[] = [];
  const headingRegex = /<h[34][^>]*>(.*?)<\/h[34]>([\s\S]*?)(?=<h[34][^>]*>|$)/gi;
  let match: RegExpExecArray | null;
  while ((match = headingRegex.exec(section)) !== null) {
    const question = stripTags(match[1]).trim();
    const answer = stripTags(match[2]).trim();
    if (question && answer) qaPairs.push({ question, answer });
  }

  if (qaPairs.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: qaPairs.map((qa) => ({
      '@type': 'Question',
      name: qa.question,
      acceptedAnswer: { '@type': 'Answer', text: qa.answer },
    })),
  };
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}
