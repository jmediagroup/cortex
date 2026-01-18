import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Brain, Clock, ArrowRight, ChevronLeft, ChevronRight, Search, X, Folder, Tag } from 'lucide-react';
import { getArticles, getCategories, getTags, searchArticles, getArticlesByCategory, getArticlesByTag, formatArticleDate, Category, Tag as TagType } from '@/lib/wordpress/client';
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
  searchParams: Promise<{ page?: string; q?: string; category?: string; tag?: string }>;
}

export default async function ArticlesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentPage = parseInt(params.page || '1', 10);
  const searchQuery = params.q || '';
  const categoryFilter = params.category || '';
  const tagFilter = params.tag || '';
  const articlesPerPage = 12;

  let articles: ArticleListItem[] = [];
  let categories: Category[] = [];
  let tags: TagType[] = [];
  let hasNextPage = false;
  let error: string | null = null;

  try {
    // Fetch categories and tags for sidebar
    [categories, tags] = await Promise.all([getCategories(), getTags()]);

    // Fetch articles based on filters
    if (searchQuery) {
      const result = await searchArticles(searchQuery, articlesPerPage);
      articles = result.articles;
      hasNextPage = result.hasNextPage;
    } else if (categoryFilter) {
      const result = await getArticlesByCategory(categoryFilter, articlesPerPage);
      articles = result.articles;
      hasNextPage = result.hasNextPage;
    } else if (tagFilter) {
      const result = await getArticlesByTag(tagFilter, articlesPerPage);
      articles = result.articles;
      hasNextPage = result.hasNextPage;
    } else {
      const result = await getArticles(articlesPerPage);
      articles = result.articles;
      hasNextPage = result.hasNextPage;
    }
  } catch (e) {
    console.error('Failed to fetch articles:', e);
    error = 'Unable to load articles. Please try again later.';
  }

  const activeCategoryName = categoryFilter
    ? categories.find((c) => c.slug === categoryFilter)?.name || categoryFilter
    : null;

  const activeTagName = tagFilter
    ? tags.find((t) => t.slug === tagFilter)?.name || tagFilter
    : null;

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
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* HEADER */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
            Financial Insights
          </h1>
          <p className="text-lg text-slate-600 font-medium max-w-2xl mx-auto">
            Expert guides, strategies, and insights to help you make smarter financial decisions.
          </p>
        </div>

        {/* LAYOUT: SIDEBAR + CONTENT */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT SIDEBAR */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-24">
              {/* SEARCH */}
              <div className="mb-6">
                <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Search size={16} />
                  Search
                </h3>
                <form action="/articles" method="GET">
                  <div className="relative">
                    <input
                      type="text"
                      name="q"
                      defaultValue={searchQuery}
                      placeholder="Search articles..."
                      className="w-full px-4 py-2.5 pr-10 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <button
                      type="submit"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600"
                    >
                      <Search size={16} />
                    </button>
                  </div>
                </form>
              </div>

              {/* CATEGORIES */}
              <div className="mb-6">
                <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Folder size={16} />
                  Categories
                </h3>
                <ul className="space-y-1">
                  <li>
                    <Link
                      href="/articles"
                      className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        !categoryFilter && !searchQuery && !tagFilter
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      All Articles
                    </Link>
                  </li>
                  {categories.map((category) => (
                    <li key={category.slug}>
                      <Link
                        href={`/articles?category=${category.slug}`}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          categoryFilter === category.slug
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <span>{category.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          categoryFilter === category.slug
                            ? 'bg-indigo-200 text-indigo-800'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {category.count}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* TAGS */}
              {tags.length > 0 && (
                <div>
                  <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Tag size={16} />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.slice(0, 15).map((tag) => (
                      <Link
                        key={tag.slug}
                        href={`/articles?tag=${tag.slug}`}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          tagFilter === tag.slug
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                        }`}
                      >
                        {tag.name}
                        <span className={`text-[10px] ${tagFilter === tag.slug ? 'text-indigo-200' : 'text-slate-400'}`}>
                          {tag.count}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* MAIN CONTENT AREA */}
          <div className="flex-1 min-w-0">
            {/* ACTIVE FILTERS */}
            {(searchQuery || categoryFilter || tagFilter) && (
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="text-sm text-slate-500">Showing:</span>
                {searchQuery && (
                  <Link
                    href={categoryFilter ? `/articles?category=${categoryFilter}` : tagFilter ? `/articles?tag=${tagFilter}` : '/articles'}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium hover:bg-indigo-100 transition-colors"
                  >
                    &ldquo;{searchQuery}&rdquo;
                    <X size={14} />
                  </Link>
                )}
                {categoryFilter && (
                  <Link
                    href={searchQuery ? `/articles?q=${searchQuery}` : '/articles'}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium hover:bg-indigo-100 transition-colors"
                  >
                    {activeCategoryName}
                    <X size={14} />
                  </Link>
                )}
                {tagFilter && (
                  <Link
                    href={searchQuery ? `/articles?q=${searchQuery}` : '/articles'}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-full text-sm font-medium hover:bg-indigo-700 transition-colors"
                  >
                    #{activeTagName}
                    <X size={14} />
                  </Link>
                )}
              </div>
            )}

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
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                <p className="text-slate-600 text-lg mb-2">
                  {searchQuery
                    ? `No articles found for "${searchQuery}"`
                    : categoryFilter
                    ? `No articles in this category yet`
                    : tagFilter
                    ? `No articles with this tag yet`
                    : 'No articles published yet.'}
                </p>
                <p className="text-slate-500 text-sm mb-4">
                  {searchQuery || categoryFilter || tagFilter
                    ? 'Try adjusting your filters or browse all articles.'
                    : 'Check back soon for new content!'}
                </p>
                {(searchQuery || categoryFilter || tagFilter) && (
                  <Link
                    href="/articles"
                    className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-700"
                  >
                    View all articles
                    <ArrowRight size={16} />
                  </Link>
                )}
              </div>
            )}

            {/* ARTICLES GRID */}
            {articles.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            )}

            {/* PAGINATION */}
            {articles.length > 0 && (
              <div className="flex justify-center items-center gap-4 mt-12">
                {currentPage > 1 && (
                  <Link
                    href={`/articles?page=${currentPage - 1}${searchQuery ? `&q=${searchQuery}` : ''}${categoryFilter ? `&category=${categoryFilter}` : ''}${tagFilter ? `&tag=${tagFilter}` : ''}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:border-indigo-300 hover:text-indigo-600 transition-all text-sm"
                  >
                    <ChevronLeft size={18} />
                    Previous
                  </Link>
                )}
                <span className="text-slate-500 font-medium text-sm">Page {currentPage}</span>
                {hasNextPage && (
                  <Link
                    href={`/articles?page=${currentPage + 1}${searchQuery ? `&q=${searchQuery}` : ''}${categoryFilter ? `&category=${categoryFilter}` : ''}${tagFilter ? `&tag=${tagFilter}` : ''}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all text-sm"
                  >
                    Next
                    <ChevronRight size={18} />
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* CTA SECTION */}
        <div className="mt-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-12 text-white text-center">
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
          <div className="relative h-44 bg-slate-100 overflow-hidden">
            <Image
              src={article.featuredImage.url}
              alt={article.featuredImage.alt}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        ) : (
          <div className="h-44 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
            <Brain size={40} className="text-indigo-300" />
          </div>
        )}

        <div className="p-5 flex flex-col flex-grow">
          {/* Categories */}
          {article.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {article.categories.slice(0, 2).map((category) => (
                <span
                  key={category.slug}
                  className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full"
                >
                  {category.name}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h2 className="text-lg font-black text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
            {article.title}
          </h2>

          {/* Excerpt */}
          <p className="text-slate-600 text-sm mb-4 line-clamp-2 flex-grow">
            {article.excerpt}
          </p>

          {/* Meta */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span className="font-medium">{formatArticleDate(article.date)}</span>
            <span className="flex items-center gap-1 font-medium">
              <Clock size={12} />
              {article.readingTime} min
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
