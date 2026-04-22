import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, ArrowLeft, Calendar } from 'lucide-react';
import { getArticleBySlug, getAllArticleSlugs, formatArticleDate } from '@/lib/wordpress/client';
import { Article } from '@/lib/wordpress/types';
import { ShareButtons } from './ShareButtons';
import { MarketingIcon } from '@/components/marketing/Icons';
import './article-styles.css';

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getAllArticleSlugs();
  return slugs.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) return { title: 'Article Not Found' };

  const seo = article.seo;
  const title = seo?.title || article.title;
  const description = seo?.description || article.excerpt;
  const ogImage = seo?.ogImage || article.featuredImage?.url || '/og-image.png';

  return {
    title,
    description,
    keywords: seo?.keywords?.split(',').map((k) => k.trim()) || [],
    openGraph: {
      title: seo?.ogTitle || title,
      description: seo?.ogDescription || description,
      type: 'article',
      url: `https://cortex.vip/articles/${slug}`,
      images: [{ url: ogImage, width: 1200, height: 630, alt: article.title }],
      publishedTime: article.date,
      modifiedTime: article.modified,
    },
    twitter: {
      card: 'summary_large_image',
      title: seo?.ogTitle || title,
      description: seo?.ogDescription || description,
      images: [ogImage],
    },
    alternates: { canonical: seo?.canonical || `https://cortex.vip/articles/${slug}` },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) notFound();

  const articleSchema = generateArticleSchema(article);
  const faqSchema = article.faq.length > 0 ? generateFAQSchema(article.faq) : null;
  const breadcrumbSchema = generateBreadcrumbSchema(article);

  const articleUrl = `https://cortex.vip/articles/${slug}`;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <article style={{ position: 'relative' }}>
        {article.featuredImage && (
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: 'clamp(260px, 45vh, 500px)',
              background: 'var(--bg-section)',
            }}
          >
            <Image
              src={article.featuredImage.url}
              alt={article.featuredImage.alt}
              fill
              style={{ objectFit: 'cover' }}
              priority
            />
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(to bottom, transparent 0%, var(--bg-canvas) 100%)',
              }}
            />
          </div>
        )}

        <header
          style={{
            position: 'relative',
            marginTop: article.featuredImage ? -96 : 48,
            padding: '0 24px',
          }}
        >
          <div
            style={{
              maxWidth: 760,
              margin: '0 auto',
              background: article.featuredImage ? 'var(--bg-canvas)' : 'transparent',
              borderRadius: article.featuredImage ? 'var(--radius-xl) var(--radius-xl) 0 0' : 0,
              padding: article.featuredImage ? '32px 0 0' : 0,
            }}
          >
            <nav style={{ marginBottom: 20 }}>
              <Link
                href="/articles"
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
                <ArrowLeft size={14} /> Back to articles
              </Link>
            </nav>

            {article.categories.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                {article.categories.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/articles?category=${category.slug}`}
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: 'var(--emerald-500)',
                      background: 'var(--emerald-tint-soft)',
                      border: '1px solid var(--emerald-border-soft)',
                      padding: '5px 12px',
                      borderRadius: 9999,
                      textDecoration: 'none',
                    }}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            )}

            <h1
              style={{
                fontSize: 'clamp(32px, 5vw, 44px)',
                fontWeight: 700,
                color: 'var(--text-primary)',
                letterSpacing: '-0.025em',
                lineHeight: 1.15,
                margin: '0 0 24px',
              }}
            >
              {article.title}
            </h1>

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
                <Calendar size={13} />
                <time dateTime={article.date}>{formatArticleDate(article.date)}</time>
              </span>
              <span aria-hidden="true">·</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Clock size={13} /> {article.readingTime} min read
              </span>
            </div>
          </div>
        </header>

        <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px' }}>
          <div
            className="article-content"
            style={{ padding: '40px 0' }}
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          <ShareButtons url={articleUrl} title={article.title} />

          {article.faq.length > 0 && (
            <section
              style={{
                padding: '40px 0',
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              <h2
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  margin: '0 0 24px',
                  letterSpacing: '-0.02em',
                }}
              >
                Frequently asked questions.
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {article.faq.map((item, index) => (
                  <details
                    key={index}
                    style={{
                      background: 'var(--bg-glass)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                    }}
                  >
                    <summary
                      style={{
                        padding: '16px 20px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        listStyle: 'none',
                      }}
                    >
                      {item.question}
                    </summary>
                    <div
                      style={{
                        padding: '0 20px 20px',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.65,
                      }}
                    >
                      {item.answer}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          )}

          {article.relatedCalculator && (
            <div
              style={{
                margin: '40px 0',
                padding: 32,
                background: 'linear-gradient(135deg, #121620 0%, #0A0E14 100%)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 'var(--radius-xl)',
                color: '#F5F5F7',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'radial-gradient(ellipse at top right, rgba(0,240,160,0.18), transparent 60%)',
                  pointerEvents: 'none',
                }}
              />
              <div style={{ position: 'relative' }}>
                <div className="eyebrow" style={{ color: '#00F0A0', marginBottom: 12 }}>
                  TRY IT YOURSELF
                </div>
                <h3
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    margin: '0 0 10px',
                    letterSpacing: '-0.015em',
                  }}
                >
                  Put what you learned into practice.
                </h3>
                <p style={{ color: '#AEAEB2', margin: '0 0 20px', lineHeight: 1.55 }}>
                  {article.cta?.text || 'Run the scenario in our free calculator.'}
                </p>
                <Link
                  href={article.cta?.link || `/apps/${article.relatedCalculator}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    background: '#00F0A0',
                    color: '#0A0E14',
                    padding: '12px 22px',
                    borderRadius: 12,
                    fontWeight: 700,
                    fontSize: 14,
                    textDecoration: 'none',
                    boxShadow:
                      '0 0 0 1px rgba(0,240,160,0.4), 0 0 32px rgba(0,240,160,0.35)',
                  }}
                >
                  Open calculator <MarketingIcon name="arrowRight" size={14} />
                </Link>
              </div>
            </div>
          )}

          {article.tags.length > 0 && (
            <div
              style={{
                padding: '32px 0',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span
                className="eyebrow"
                style={{ marginRight: 8, color: 'var(--text-muted)' }}
              >
                TAGS
              </span>
              {article.tags.map((tag) => (
                <span
                  key={tag.slug}
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: 'var(--text-secondary)',
                    background: 'var(--bg-glass-strong)',
                    border: '1px solid var(--glass-border)',
                    padding: '4px 10px',
                    borderRadius: 9999,
                  }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
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
              Continue learning.
            </h3>
            <p
              style={{
                color: 'var(--text-secondary)',
                marginBottom: 24,
                fontSize: 15,
              }}
            >
              Explore more articles to deepen your financial knowledge.
            </p>
            <Link
              href="/articles"
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
                boxShadow:
                  '0 0 0 1px var(--cta-glow-ring), 0 0 24px var(--cta-glow-soft)',
              }}
            >
              View all articles <MarketingIcon name="arrowRight" size={14} />
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}

function generateArticleSchema(article: Article) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `https://cortex.vip/articles/${article.slug}#article`,
    headline: article.title,
    description: article.excerpt,
    image: article.featuredImage?.url || 'https://cortex.vip/og-image.png',
    datePublished: article.date,
    dateModified: article.modified,
    publisher: {
      '@type': 'Organization',
      '@id': 'https://cortex.vip/#organization',
      name: 'Cortex Technologies',
      logo: { '@type': 'ImageObject', url: 'https://cortex.vip/icon' },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://cortex.vip/articles/${article.slug}`,
    },
    wordCount: article.content.replace(/<[^>]*>/g, '').split(/\s+/).length,
    articleSection: article.categories[0]?.name || 'Finance',
    keywords: article.tags.map((t) => t.name).join(', '),
  };
}

function generateFAQSchema(faq: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

function generateBreadcrumbSchema(article: Article) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://cortex.vip' },
      { '@type': 'ListItem', position: 2, name: 'Articles', item: 'https://cortex.vip/articles' },
      {
        '@type': 'ListItem',
        position: 3,
        name: article.title,
        item: `https://cortex.vip/articles/${article.slug}`,
      },
    ],
  };
}
