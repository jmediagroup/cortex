import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, ArrowLeft, Calendar } from 'lucide-react';
import { getArticleBySlug, getAllArticleSlugs, formatArticleDate } from '@/lib/cms/articles';
import { Article } from '@/lib/cms/types';
import { ShareButtons } from './ShareButtons';
import { RelatedArticles } from './RelatedArticles';
import { MarketingIcon } from '@/components/marketing/Icons';
import { Button } from '@/components/ui/Button';
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
  const ogImage = seo?.ogImage || article.featuredImage?.url || '/opengraph-image';

  const articleUrl = `https://moneyguymutants.com/articles/${slug}`;
  const tagNames = article.tags.map((t) => t.name);
  const fallbackKeywords =
    seo?.keywords?.split(',').map((k) => k.trim()).filter(Boolean) || tagNames;

  return {
    title,
    description,
    keywords: fallbackKeywords,
    authors: article.author?.name
      ? [{ name: article.author.name }]
      : [{ name: 'Cortex Technologies' }],
    category: article.categories[0]?.name,
    openGraph: {
      title: seo?.ogTitle || title,
      description: seo?.ogDescription || description,
      type: 'article',
      url: articleUrl,
      siteName: 'Money Guy Mutants',
      locale: 'en_US',
      images: [{ url: ogImage, width: 1200, height: 630, alt: article.title }],
      publishedTime: article.date,
      modifiedTime: article.modified,
      authors: article.author?.name ? [article.author.name] : undefined,
      tags: tagNames,
      section: article.categories[0]?.name,
    },
    twitter: {
      card: 'summary_large_image',
      title: seo?.ogTitle || title,
      description: seo?.ogDescription || description,
      images: [ogImage],
    },
    alternates: {
      canonical: seo?.canonical || articleUrl,
      types: {
        'application/rss+xml': 'https://moneyguymutants.com/articles/rss.xml',
      },
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) notFound();

  const articleSchema = generateArticleSchema(article);
  const faqSchema = article.faq.length > 0 ? generateFAQSchema(article.faq) : null;
  const breadcrumbSchema = generateBreadcrumbSchema(article);

  const articleUrl = `https://moneyguymutants.com/articles/${slug}`;

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

      <article lang="en-US" style={{ position: 'relative' }}>
        {article.featuredImage && (
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: 'clamp(260px, 45vh, 500px)',
              background: 'var(--navy)',
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
              borderRadius: article.featuredImage ? 'var(--radius-md) var(--radius-md) 0 0' : 0,
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
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: '#fff',
                      background: 'var(--sky-pill)',
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
                color: 'var(--text-muted)',
                fontSize: 13,
                paddingBottom: 24,
                borderBottom: '1px solid var(--border-subtle)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {article.author?.name && (
                <>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    By{' '}
                    <span style={{ color: 'var(--text-secondary)' }}>{article.author.name}</span>
                  </span>
                  <span aria-hidden="true">·</span>
                </>
              )}
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Calendar size={13} />
                <time dateTime={article.date}>{formatArticleDate(article.date)}</time>
              </span>
              {article.modified && article.modified !== article.date && (
                <>
                  <span aria-hidden="true">·</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    Updated{' '}
                    <time dateTime={article.modified}>
                      {formatArticleDate(article.modified)}
                    </time>
                  </span>
                </>
              )}
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
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                    }}
                  >
                    <summary
                      style={{
                        padding: '16px 20px',
                        cursor: 'pointer',
                        fontWeight: 700,
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
              className="mgm-band"
              style={{
                margin: '40px 0',
                padding: 32,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{ position: 'relative' }}>
                <div className="mgm-eyebrow" style={{ color: 'var(--sky)', marginBottom: 12 }}>
                  TRY IT YOURSELF
                </div>
                <h3
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: '#fff',
                    margin: '0 0 10px',
                    letterSpacing: '-0.015em',
                  }}
                >
                  Put what you learned into practice.
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.82)', margin: '0 0 20px', lineHeight: 1.55 }}>
                  {article.cta?.text || 'Run the scenario in our free calculator.'}
                </p>
                <Button variant="primary" href={article.cta?.link || `/apps/${article.relatedCalculator}`}>
                  Open calculator <MarketingIcon name="arrowRight" size={14} />
                </Button>
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
                className="mgm-eyebrow"
                style={{ marginRight: 8, color: 'var(--gray-500)' }}
              >
                TAGS
              </span>
              {article.tags.map((tag) => (
                <Link
                  key={tag.slug}
                  href={`/articles?tag=${tag.slug}`}
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--navy)',
                    background: 'var(--off-white)',
                    border: '1px solid var(--border-default)',
                    padding: '4px 10px',
                    borderRadius: 9999,
                    textDecoration: 'none',
                  }}
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          )}

          <RelatedArticles
            currentSlug={article.slug}
            categorySlug={article.categories[0]?.slug}
          />
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
              Keep reading, mutant.
            </h3>
            <p
              style={{
                color: 'var(--text-secondary)',
                marginBottom: 24,
                fontSize: 15,
              }}
            >
              More ways to shift into the fast-lane and build wealth on purpose.
            </p>
            <Button variant="primary" href="/articles">
              View all articles <MarketingIcon name="arrowRight" size={14} />
            </Button>
          </div>
        </div>
      </article>
    </>
  );
}

function articleBodyText(html: string): string {
  // Plain-text body for both schema.org articleBody and AI consumption.
  // Keeps line breaks but strips HTML tags and decodes a small set of entities.
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<\/(p|div|li|h[1-6]|blockquote)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function generateArticleSchema(article: Article) {
  const body = articleBodyText(article.content);
  const wordCount = body ? body.split(/\s+/).filter(Boolean).length : 0;
  const articleUrl = `https://moneyguymutants.com/articles/${article.slug}`;

  const author = article.author?.name
    ? {
        '@type': 'Person',
        name: article.author.name,
        url: `https://moneyguymutants.com/articles?author=${article.author.slug}`,
        ...(article.author.bio ? { description: article.author.bio } : {}),
        ...(article.author.avatar ? { image: article.author.avatar } : {}),
      }
    : {
        '@type': 'Organization',
        '@id': 'https://moneyguymutants.com/#organization',
        name: 'Cortex Technologies',
      };

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${articleUrl}#article`,
    url: articleUrl,
    headline: article.title,
    name: article.title,
    description: article.excerpt,
    image: article.featuredImage?.url
      ? {
          '@type': 'ImageObject',
          url: article.featuredImage.url,
          width: article.featuredImage.width,
          height: article.featuredImage.height,
        }
      : 'https://moneyguymutants.com/opengraph-image',
    datePublished: article.date,
    dateModified: article.modified,
    author,
    publisher: {
      '@type': 'Organization',
      '@id': 'https://moneyguymutants.com/#organization',
      name: 'Cortex Technologies',
      logo: { '@type': 'ImageObject', url: 'https://moneyguymutants.com/icon' },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
    wordCount,
    timeRequired: `PT${article.readingTime}M`,
    articleSection: article.categories[0]?.name || 'Finance',
    keywords: article.tags.map((t) => t.name).join(', '),
    inLanguage: 'en-US',
    isAccessibleForFree: true,
    // articleBody helps LLMs and AI search index the full content even when
    // they only fetch the structured-data block.
    articleBody: body,
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
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://moneyguymutants.com' },
      { '@type': 'ListItem', position: 2, name: 'Articles', item: 'https://moneyguymutants.com/articles' },
      {
        '@type': 'ListItem',
        position: 3,
        name: article.title,
        item: `https://moneyguymutants.com/articles/${article.slug}`,
      },
    ],
  };
}
