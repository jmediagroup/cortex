import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Brain, Clock, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { getArticles, formatArticleDate } from '@/lib/wordpress/client';
import { ArticleListItem } from '@/lib/wordpress/types';

export const metadata: Metadata = {
  title: 'Articles - Financial Insights & Guides',
  description: 'Expert articles on personal finance, retirement planning, investing strategies, and money management. Learn how to make smarter financial decisions with Cortex.',
  keywords: ['financial articles', 'personal finance blog', 'investing guides', 'retirement planning articles', 'money management tips', 'financial literacy'],
  openGraph: {
    title: 'Articles - Financial Insights & Guides | Cortex',
    description: 'Expert articles on personal finance, retirement planning, investing strategies, and money management.',
    type: 'website',
    url: 'https://cortex.vip/articles',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Cortex Articles' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Articles - Financial Insights & Guides',
    description: 'Expert articles on personal finance, retirement planning, and investing strategies.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://cortex.vip/articles',
  },
};

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function ArticlesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentPage = parseInt(params.page || '1', 10);
  const articlesPerPage = 12;

  let articles: ArticleListItem[] = [];
  let hasNextPage = false;
  let error: string | null = null;

  try {
    const result = await getArticles(articlesPerPage);
    articles = result.articles;
    hasNextPage = result.hasNextPage;
  } catch (e) {
    console.error('Failed to fetch articles:', e);
    error = 'Unable to load articles. Please try again later.';
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
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

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        {/* HEADER */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
            Financial Insights
          </h1>
          <p className="text-xl text-slate-600 font-medium max-w-2xl mx-auto">
            Expert guides, strategies, and insights to help you make smarter financial decisions.
          </p>
        </div>

        {/* ERROR STATE */}
        {error && (
          <div className="text-center py-16">
            <p className="text-slate-600 text-lg">{error}</p>
            <Link
              href="/articles"
              className="inline-flex items-center gap-2 mt-4 text-indigo-600 font-bold hover:text-indigo-700"
            >
              Try again
              <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {/* EMPTY STATE */}
        {!error && articles.length === 0 && (
          <div className="text-center py-16">
            <p className="text-slate-600 text-lg mb-4">No articles published yet.</p>
            <p className="text-slate-500">Check back soon for new content!</p>
          </div>
        )}

        {/* ARTICLES GRID */}
        {articles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}

        {/* PAGINATION */}
        {articles.length > 0 && (
          <div className="flex justify-center items-center gap-4 mt-16">
            {currentPage > 1 && (
              <Link
                href={`/articles?page=${currentPage - 1}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:border-indigo-300 hover:text-indigo-600 transition-all"
              >
                <ChevronLeft size={20} />
                Previous
              </Link>
            )}
            <span className="text-slate-500 font-medium">Page {currentPage}</span>
            {hasNextPage && (
              <Link
                href={`/articles?page=${currentPage + 1}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
              >
                Next
                <ChevronRight size={20} />
              </Link>
            )}
          </div>
        )}

        {/* CTA SECTION */}
        <div className="mt-24 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-12 text-white text-center">
          <h2 className="text-3xl font-black mb-4">Put Knowledge Into Action</h2>
          <p className="text-indigo-100 font-medium text-lg mb-6 max-w-xl mx-auto">
            Use our free calculators to apply what you&apos;ve learned and make better financial decisions.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-white text-indigo-600 font-black px-8 py-4 rounded-xl hover:bg-indigo-50 transition-all shadow-xl"
          >
            Explore Calculators
            <ArrowRight size={20} />
          </Link>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="max-w-7xl mx-auto px-6 py-12 text-center text-slate-400 font-medium text-sm">
        &copy; {new Date().getFullYear()} Cortex Technologies. Tools for Long-Term Thinking.
      </footer>
    </div>
  );
}

function ArticleCard({ article }: { article: ArticleListItem }) {
  return (
    <Link href={`/articles/${article.slug}`} className="group">
      <article className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-indigo-300 hover:shadow-lg transition-all h-full flex flex-col">
        {/* Featured Image */}
        {article.featuredImage ? (
          <div className="relative h-48 bg-slate-100 overflow-hidden">
            <Image
              src={article.featuredImage.url}
              alt={article.featuredImage.alt}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        ) : (
          <div className="h-48 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
            <Brain size={48} className="text-indigo-300" />
          </div>
        )}

        <div className="p-6 flex flex-col flex-grow">
          {/* Categories */}
          {article.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {article.categories.slice(0, 2).map((category) => (
                <span
                  key={category.slug}
                  className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full"
                >
                  {category.name}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h2 className="text-xl font-black text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
            {article.title}
          </h2>

          {/* Excerpt */}
          <p className="text-slate-600 text-sm mb-4 line-clamp-3 flex-grow">
            {article.excerpt}
          </p>

          {/* Meta */}
          <div className="flex items-center justify-between text-sm text-slate-500 pt-4 border-t border-slate-100">
            <span className="font-medium">{formatArticleDate(article.date)}</span>
            <span className="flex items-center gap-1 font-medium">
              <Clock size={14} />
              {article.readingTime} min read
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
