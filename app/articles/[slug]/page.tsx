import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Brain, Clock, ArrowLeft, ArrowRight, Calendar, Share2 } from 'lucide-react';
import { getArticleBySlug, getAllArticleSlugs, formatArticleDate } from '@/lib/wordpress/client';
import { Article } from '@/lib/wordpress/types';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate static paths for all articles
export async function generateStaticParams() {
  const slugs = await getAllArticleSlugs();
  return slugs.map((item) => ({
    slug: item.slug,
  }));
}

// Generate metadata for each article
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return {
      title: 'Article Not Found',
    };
  }

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
    alternates: {
      canonical: seo?.canonical || `https://cortex.vip/articles/${slug}`,
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  // Generate Article JSON-LD schema
  const articleSchema = generateArticleSchema(article);
  const faqSchema = article.faq.length > 0 ? generateFAQSchema(article.faq) : null;
  const breadcrumbSchema = generateBreadcrumbSchema(article);

  const articleUrl = `https://cortex.vip/articles/${slug}`;
  const encodedUrl = encodeURIComponent(articleUrl);
  const encodedTitle = encodeURIComponent(article.title);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* JSON-LD Structured Data */}
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

      {/* TOP NAVIGATION */}
      <nav className="bg-white border-b border-slate-100 px-6 md:px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
            <Brain size={20} />
          </div>
          <span className="font-black text-xl tracking-tight">Cortex</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/articles" className="text-indigo-600 font-bold">
            Articles
          </Link>
          <Link
            href="/dashboard"
            className="text-slate-600 hover:text-indigo-600 transition-colors font-bold"
          >
            Dashboard
          </Link>
        </div>
      </nav>

      {/* ARTICLE CONTAINER */}
      <article className="relative">
        {/* Hero Section with Featured Image */}
        {article.featuredImage && (
          <div className="relative w-full h-[40vh] md:h-[50vh] max-h-[500px] bg-slate-100">
            <Image
              src={article.featuredImage.url}
              alt={article.featuredImage.alt}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        )}

        {/* Article Header */}
        <header className={`relative ${article.featuredImage ? '-mt-24 md:-mt-32' : 'pt-8 md:pt-12'}`}>
          <div className="max-w-[65ch] mx-auto px-6">
            {/* Card container for header when there's a featured image */}
            <div className={article.featuredImage ? 'bg-white rounded-t-2xl pt-8 md:pt-10 px-2' : ''}>
              {/* Breadcrumb */}
              <nav className="mb-6">
                <Link
                  href="/articles"
                  className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 text-sm font-medium transition-colors"
                >
                  <ArrowLeft size={14} />
                  Back to Articles
                </Link>
              </nav>

              {/* Categories */}
              {article.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {article.categories.map((category) => (
                    <Link
                      key={category.slug}
                      href={`/articles?category=${category.slug}`}
                      className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full hover:bg-indigo-100 transition-colors"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Title */}
              <h1 className="text-[2rem] md:text-[2.5rem] lg:text-[2.75rem] font-black text-slate-900 leading-[1.15] tracking-tight mb-6">
                {article.title}
              </h1>

              {/* Meta - Date and Reading Time */}
              <div className="flex flex-wrap items-center gap-4 text-slate-500 text-sm pb-6 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-slate-400" />
                  <time dateTime={article.date} className="font-medium">
                    {formatArticleDate(article.date)}
                  </time>
                </div>
                <span className="text-slate-300">•</span>
                <div className="flex items-center gap-1.5">
                  <Clock size={14} className="text-slate-400" />
                  <span className="font-medium">{article.readingTime} min read</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Article Body */}
        <div className="max-w-[65ch] mx-auto px-6 md:px-8">
          {/* Main Content */}
          <div
            className="article-content py-10 md:py-12"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Social Share Section */}
          <div className="py-8 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2 text-slate-600">
                <Share2 size={18} />
                <span className="font-semibold text-sm">Share this article</span>
              </div>
              <div className="flex items-center gap-2">
                {/* X (Twitter) */}
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-900 hover:text-white transition-colors"
                  aria-label="Share on X"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                {/* Facebook */}
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 hover:bg-[#1877F2] hover:text-white transition-colors"
                  aria-label="Share on Facebook"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                {/* LinkedIn */}
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 hover:bg-[#0A66C2] hover:text-white transition-colors"
                  aria-label="Share on LinkedIn"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                {/* Email */}
                <a
                  href={`mailto:?subject=${encodedTitle}&body=Check out this article: ${encodedUrl}`}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-700 hover:text-white transition-colors"
                  aria-label="Share via Email"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </a>
                {/* Copy Link */}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(articleUrl);
                  }}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 hover:bg-indigo-600 hover:text-white transition-colors"
                  aria-label="Copy link"
                  type="button"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          {article.faq.length > 0 && (
            <section className="py-10 border-t border-slate-100">
              <h2 className="text-2xl font-black text-slate-900 mb-6">
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {article.faq.map((item, index) => (
                  <details
                    key={index}
                    className="group bg-slate-50 rounded-xl border border-slate-100 overflow-hidden"
                  >
                    <summary className="flex items-center justify-between p-5 cursor-pointer font-semibold text-slate-900 hover:bg-slate-100 transition-colors">
                      {item.question}
                      <span className="ml-4 text-slate-400 group-open:rotate-180 transition-transform">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </span>
                    </summary>
                    <div className="px-5 pb-5 text-slate-600 leading-relaxed">
                      {item.answer}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          )}

          {/* Related Calculator CTA */}
          {article.relatedCalculator && (
            <div className="my-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
              <h3 className="text-xl font-black mb-2">Try It Yourself</h3>
              <p className="text-indigo-100 mb-6 text-sm leading-relaxed">
                {article.cta?.text || 'Put what you learned into practice with our free calculator.'}
              </p>
              <Link
                href={article.cta?.link || `/apps/${article.relatedCalculator}`}
                className="inline-flex items-center gap-2 bg-white text-indigo-600 font-bold px-5 py-2.5 rounded-lg hover:bg-indigo-50 transition-colors text-sm"
              >
                Open Calculator
                <ArrowRight size={16} />
              </Link>
            </div>
          )}

          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="py-8 border-t border-slate-100">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide mr-2">
                  Tags:
                </span>
                {article.tags.map((tag) => (
                  <span
                    key={tag.slug}
                    className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* More Articles CTA */}
        <div className="bg-slate-50 py-16 mt-8">
          <div className="max-w-[65ch] mx-auto px-6 text-center">
            <h3 className="text-2xl font-black text-slate-900 mb-3">
              Continue Learning
            </h3>
            <p className="text-slate-600 mb-6">
              Explore more articles to deepen your financial knowledge.
            </p>
            <Link
              href="/articles"
              className="inline-flex items-center gap-2 bg-slate-900 text-white font-bold px-6 py-3 rounded-xl hover:bg-slate-800 transition-colors"
            >
              View All Articles
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </article>

      {/* FOOTER */}
      <footer className="py-10 text-center text-slate-400 font-medium text-sm border-t border-slate-100">
        &copy; {new Date().getFullYear()} Cortex Technologies. Tools for Long-Term Thinking.
      </footer>

      {/* Article-specific styles for optimal reading */}
      <style jsx global>{`
        /* Article Content Typography - Optimized for Reading */
        .article-content {
          font-size: 1.125rem; /* 18px base */
          line-height: 1.75; /* Optimal line height for readability */
          color: #334155; /* slate-700 */
        }

        /* Headings */
        .article-content h1,
        .article-content h2,
        .article-content h3,
        .article-content h4,
        .article-content h5,
        .article-content h6 {
          color: #0f172a; /* slate-900 */
          font-weight: 800;
          letter-spacing: -0.025em;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          line-height: 1.25;
        }

        .article-content h2 {
          font-size: 1.75rem;
          padding-top: 1.5rem;
          border-top: 1px solid #e2e8f0;
          margin-top: 3rem;
        }

        .article-content h3 {
          font-size: 1.375rem;
        }

        .article-content h4 {
          font-size: 1.125rem;
        }

        /* First heading shouldn't have top margin */
        .article-content > h2:first-child,
        .article-content > h3:first-child {
          margin-top: 0;
          padding-top: 0;
          border-top: none;
        }

        /* Paragraphs */
        .article-content p {
          margin-bottom: 1.5rem;
        }

        /* Links */
        .article-content a {
          color: #4f46e5; /* indigo-600 */
          font-weight: 500;
          text-decoration: underline;
          text-underline-offset: 2px;
          transition: color 0.15s ease;
        }

        .article-content a:hover {
          color: #4338ca; /* indigo-700 */
        }

        /* Strong/Bold */
        .article-content strong {
          color: #0f172a;
          font-weight: 600;
        }

        /* Lists */
        .article-content ul,
        .article-content ol {
          margin-bottom: 1.5rem;
          padding-left: 1.5rem;
        }

        .article-content ul {
          list-style-type: disc;
        }

        .article-content ol {
          list-style-type: decimal;
        }

        .article-content li {
          margin-bottom: 0.5rem;
          padding-left: 0.5rem;
        }

        .article-content li::marker {
          color: #94a3b8; /* slate-400 */
        }

        /* Nested lists */
        .article-content ul ul,
        .article-content ol ol,
        .article-content ul ol,
        .article-content ol ul {
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }

        /* Blockquotes */
        .article-content blockquote {
          border-left: 4px solid #6366f1; /* indigo-500 */
          background: #f8fafc; /* slate-50 */
          margin: 2rem 0;
          padding: 1.25rem 1.5rem;
          border-radius: 0 0.75rem 0.75rem 0;
          font-style: italic;
          color: #475569; /* slate-600 */
        }

        .article-content blockquote p:last-child {
          margin-bottom: 0;
        }

        /* Code - Inline */
        .article-content code {
          background: #f1f5f9; /* slate-100 */
          color: #dc2626; /* red-600 */
          padding: 0.2em 0.4em;
          border-radius: 0.375rem;
          font-size: 0.875em;
          font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
        }

        /* Code - Blocks */
        .article-content pre {
          background: #1e293b; /* slate-800 */
          color: #e2e8f0; /* slate-200 */
          padding: 1.25rem 1.5rem;
          border-radius: 0.75rem;
          overflow-x: auto;
          margin: 2rem 0;
          font-size: 0.875rem;
          line-height: 1.7;
        }

        .article-content pre code {
          background: transparent;
          color: inherit;
          padding: 0;
          border-radius: 0;
          font-size: inherit;
        }

        /* Images */
        .article-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.75rem;
          margin: 2rem 0;
        }

        .article-content figure {
          margin: 2rem 0;
        }

        .article-content figcaption {
          text-align: center;
          font-size: 0.875rem;
          color: #64748b; /* slate-500 */
          margin-top: 0.75rem;
        }

        /* Tables */
        .article-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 2rem 0;
          font-size: 0.9375rem;
        }

        .article-content th,
        .article-content td {
          border: 1px solid #e2e8f0;
          padding: 0.75rem 1rem;
          text-align: left;
        }

        .article-content th {
          background: #f8fafc;
          font-weight: 600;
          color: #0f172a;
        }

        .article-content tr:nth-child(even) {
          background: #f8fafc;
        }

        /* Horizontal Rule */
        .article-content hr {
          border: none;
          border-top: 1px solid #e2e8f0;
          margin: 3rem 0;
        }

        /* Embedded Videos (YouTube, etc.) */
        .article-content iframe {
          max-width: 100%;
          border-radius: 0.75rem;
          margin: 2rem 0;
        }

        /* WordPress-specific: Caption classes */
        .article-content .wp-caption {
          max-width: 100%;
          margin: 2rem 0;
        }

        .article-content .wp-caption-text {
          text-align: center;
          font-size: 0.875rem;
          color: #64748b;
          margin-top: 0.75rem;
        }

        /* WordPress-specific: Alignment */
        .article-content .aligncenter {
          display: block;
          margin-left: auto;
          margin-right: auto;
        }

        .article-content .alignleft {
          float: left;
          margin-right: 1.5rem;
          margin-bottom: 1rem;
        }

        .article-content .alignright {
          float: right;
          margin-left: 1.5rem;
          margin-bottom: 1rem;
        }

        /* Clear floats */
        .article-content::after {
          content: '';
          display: table;
          clear: both;
        }

        /* Mobile adjustments */
        @media (max-width: 640px) {
          .article-content {
            font-size: 1.0625rem; /* 17px on mobile */
            line-height: 1.7;
          }

          .article-content h2 {
            font-size: 1.5rem;
          }

          .article-content h3 {
            font-size: 1.25rem;
          }

          .article-content blockquote {
            padding: 1rem 1.25rem;
          }

          .article-content pre {
            padding: 1rem;
            font-size: 0.8125rem;
          }

          .article-content .alignleft,
          .article-content .alignright {
            float: none;
            margin-left: 0;
            margin-right: 0;
          }
        }
      `}</style>
    </div>
  );
}

// Schema Generation Functions
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
      logo: {
        '@type': 'ImageObject',
        url: 'https://cortex.vip/icon',
      },
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
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

function generateBreadcrumbSchema(article: Article) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://cortex.vip',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Articles',
        item: 'https://cortex.vip/articles',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: article.title,
        item: `https://cortex.vip/articles/${article.slug}`,
      },
    ],
  };
}
