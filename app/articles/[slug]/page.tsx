import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Brain, Clock, ArrowLeft, ArrowRight, Calendar, User } from 'lucide-react';
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
    authors: [{ name: article.author.name }],
    openGraph: {
      title: seo?.ogTitle || title,
      description: seo?.ogDescription || description,
      type: 'article',
      url: `https://cortex.vip/articles/${slug}`,
      images: [{ url: ogImage, width: 1200, height: 630, alt: article.title }],
      publishedTime: article.date,
      modifiedTime: article.modified,
      authors: [article.author.name],
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

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
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
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
            <Brain size={20} />
          </div>
          <span className="font-black text-xl tracking-tight">Cortex</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/articles"
            className="text-indigo-600 font-bold"
          >
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

      {/* ARTICLE CONTENT */}
      <article className="max-w-4xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Articles
          </Link>
        </nav>

        {/* Header */}
        <header className="mb-12">
          {/* Categories */}
          {article.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {article.categories.map((category) => (
                <span
                  key={category.slug}
                  className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full"
                >
                  {category.name}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
            {article.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-6 text-slate-500 text-sm">
            <div className="flex items-center gap-2">
              <User size={16} />
              <span className="font-medium">{article.author.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <time dateTime={article.date} className="font-medium">
                {formatArticleDate(article.date)}
              </time>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span className="font-medium">{article.readingTime} min read</span>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {article.featuredImage && (
          <div className="relative w-full h-64 md:h-96 mb-12 rounded-2xl overflow-hidden">
            <Image
              src={article.featuredImage.url}
              alt={article.featuredImage.alt}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Content */}
        <div
          className="prose prose-lg prose-slate max-w-none
            prose-headings:font-black prose-headings:tracking-tight
            prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
            prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
            prose-p:text-slate-700 prose-p:leading-relaxed
            prose-a:text-indigo-600 prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
            prose-strong:text-slate-900
            prose-ul:list-disc prose-ol:list-decimal
            prose-li:text-slate-700
            prose-blockquote:border-l-indigo-500 prose-blockquote:bg-slate-50 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-lg
            prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
            prose-pre:bg-slate-900 prose-pre:text-slate-100
            prose-img:rounded-xl"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* FAQ Section */}
        {article.faq.length > 0 && (
          <section className="mt-16 pt-12 border-t border-slate-200">
            <h2 className="text-3xl font-black text-slate-900 mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {article.faq.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl border border-slate-200 p-6"
                >
                  <h3 className="text-lg font-bold text-slate-900 mb-3">
                    {item.question}
                  </h3>
                  <p className="text-slate-600">{item.answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related Calculator CTA */}
        {article.relatedCalculator && (
          <div className="mt-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-black mb-3">Try It Yourself</h3>
            <p className="text-indigo-100 mb-6">
              {article.cta?.text || 'Put what you learned into practice with our free calculator.'}
            </p>
            <Link
              href={article.cta?.link || `/apps/${article.relatedCalculator}`}
              className="inline-flex items-center gap-2 bg-white text-indigo-600 font-black px-6 py-3 rounded-xl hover:bg-indigo-50 transition-all"
            >
              Open Calculator
              <ArrowRight size={20} />
            </Link>
          </div>
        )}

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-slate-200">
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">
              Tags
            </h4>
            <div className="flex flex-wrap gap-2">
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

        {/* Author Bio */}
        {article.author.bio && (
          <div className="mt-12 pt-8 border-t border-slate-200">
            <div className="flex items-start gap-4">
              {article.author.avatar && (
                <Image
                  src={article.author.avatar}
                  alt={article.author.name}
                  width={64}
                  height={64}
                  className="rounded-full"
                />
              )}
              <div>
                <h4 className="font-bold text-slate-900 mb-1">
                  Written by {article.author.name}
                </h4>
                <p className="text-slate-600 text-sm">{article.author.bio}</p>
              </div>
            </div>
          </div>
        )}
      </article>

      {/* More Articles CTA */}
      <div className="max-w-4xl mx-auto px-6 pb-16">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <h3 className="text-2xl font-black text-slate-900 mb-3">
            Continue Learning
          </h3>
          <p className="text-slate-600 mb-6">
            Explore more articles to deepen your financial knowledge.
          </p>
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 bg-slate-900 text-white font-bold px-6 py-3 rounded-xl hover:bg-slate-800 transition-all"
          >
            View All Articles
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="max-w-7xl mx-auto px-6 py-12 text-center text-slate-400 font-medium text-sm border-t border-slate-200">
        &copy; {new Date().getFullYear()} Cortex Technologies. Tools for Long-Term Thinking.
      </footer>
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
    author: {
      '@type': 'Person',
      name: article.author.name,
      url: `https://cortex.vip/author/${article.author.slug}`,
    },
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
