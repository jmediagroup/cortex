import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, ArrowLeft, ArrowRight, Calendar } from 'lucide-react';
import { getArticleBySlug, getAllArticleSlugs, formatArticleDate } from '@/lib/wordpress/client';
import { Article } from '@/lib/wordpress/types';
import { ShareButtons } from './ShareButtons';
import './article-styles.css';

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

  return (
    <>
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
          <div className="max-w-3xl mx-auto px-6">
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
        <div className="max-w-3xl mx-auto px-6 md:px-8">
          {/* Main Content */}
          <div
            className="article-content py-10 md:py-12"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Social Share Section */}
          <ShareButtons url={articleUrl} title={article.title} />

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
          <div className="max-w-3xl mx-auto px-6 text-center">
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
    </>
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
