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
    <>
      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-6 lg:px-8">
        {/* HEADER */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-[var(--text-primary)] mb-3 tracking-tight">
            Financial Insights
          </h1>
          <p className="text-base text-[var(--text-secondary)] font-medium max-w-2xl mx-auto">
            Expert guides, strategies, and insights to help you make smarter financial decisions.
          </p>
        </div>

        {/* LAYOUT: SIDEBAR + CONTENT */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT SIDEBAR */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="rounded-[var(--radius-xl)] border border-[var(--border-primary)] bg-[var(--surface-primary)] p-5 sticky top-24" style={{ boxShadow: 'var(--shadow-card)' }}>
              {/* SEARCH */}
              <div className="mb-6">
                <h3 className="font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
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
                      className="w-full px-4 py-2.5 pr-10 border border-[var(--border-primary)] rounded-[var(--radius-lg)] bg-[var(--surface-secondary)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
                    />
                    <button
                      type="submit"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--color-accent)]"
                    >
                      <Search size={16} />
                    </button>
                  </div>
                </form>
              </div>

              {/* CATEGORIES */}
              <div className="mb-6">
                <h3 className="font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                  <Folder size={16} />
                  Categories
                </h3>
                <ul className="space-y-1">
                  <li>
                    <Link
                      href="/articles"
                      className={`block px-3 py-2 rounded-[var(--radius-md)] text-sm font-medium transition-colors ${
                        !categoryFilter && !searchQuery && !tagFilter
                          ? 'bg-[var(--color-accent-light)] text-[var(--color-accent)]'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--surface-tertiary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      All Articles
                    </Link>
                  </li>
                  {categories.map((category) => (
                    <li key={category.slug}>
                      <Link
                        href={`/articles?category=${category.slug}`}
                        className={`flex items-center justify-between px-3 py-2 rounded-[var(--radius-md)] text-sm font-medium transition-colors ${
                          categoryFilter === category.slug
                            ? 'bg-[var(--color-accent-light)] text-[var(--color-accent)]'
                            : 'text-[var(--text-secondary)] hover:bg-[var(--surface-tertiary)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        <span>{category.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          categoryFilter === category.slug
                            ? 'bg-[var(--primary-200)] text-[var(--primary-800)]'
                            : 'bg-[var(--surface-tertiary)] text-[var(--text-tertiary)]'
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
                  <h3 className="font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
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
                            ? 'bg-[var(--color-accent)] text-white'
                            : 'bg-[var(--surface-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--border-primary)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        {tag.name}
                        <span className={`text-[10px] ${tagFilter === tag.slug ? 'text-white/60' : 'text-[var(--text-tertiary)]'}`}>
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
                <span className="text-sm text-[var(--text-tertiary)]">Showing:</span>
                {searchQuery && (
                  <Link
                    href={categoryFilter ? `/articles?category=${categoryFilter}` : tagFilter ? `/articles?tag=${tagFilter}` : '/articles'}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-accent-light)] text-[var(--color-accent)] rounded-full text-sm font-medium hover:opacity-80 transition-colors"
                  >
                    &ldquo;{searchQuery}&rdquo;
                    <X size={14} />
                  </Link>
                )}
                {categoryFilter && (
                  <Link
                    href={searchQuery ? `/articles?q=${searchQuery}` : '/articles'}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-accent-light)] text-[var(--color-accent)] rounded-full text-sm font-medium hover:opacity-80 transition-colors"
                  >
                    {activeCategoryName}
                    <X size={14} />
                  </Link>
                )}
                {tagFilter && (
                  <Link
                    href={searchQuery ? `/articles?q=${searchQuery}` : '/articles'}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-accent)] text-white rounded-full text-sm font-medium hover:opacity-90 transition-colors"
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
                <p className="text-[var(--text-secondary)] text-lg">{error}</p>
                <Link
                  href="/articles"
                  className="inline-flex items-center gap-2 mt-4 text-[var(--color-accent)] font-bold hover:opacity-80"
                >
                  Try again
                  <ArrowRight size={16} />
                </Link>
              </div>
            )}

            {/* EMPTY STATE */}
            {!error && articles.length === 0 && (
              <div className="text-center py-16 rounded-[var(--radius-xl)] border border-[var(--border-primary)] bg-[var(--surface-primary)]">
                <p className="text-[var(--text-secondary)] text-lg mb-2">
                  {searchQuery
                    ? `No articles found for "${searchQuery}"`
                    : categoryFilter
                    ? `No articles in this category yet`
                    : tagFilter
                    ? `No articles with this tag yet`
                    : 'No articles published yet.'}
                </p>
                <p className="text-[var(--text-tertiary)] text-sm mb-4">
                  {searchQuery || categoryFilter || tagFilter
                    ? 'Try adjusting your filters or browse all articles.'
                    : 'Check back soon for new content!'}
                </p>
                {(searchQuery || categoryFilter || tagFilter) && (
                  <Link
                    href="/articles"
                    className="inline-flex items-center gap-2 text-[var(--color-accent)] font-bold hover:opacity-80"
                  >
                    View all articles
                    <ArrowRight size={16} />
                  </Link>
                )}
              </div>
            )}

            {/* ARTICLES GRID */}
            {articles.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                    className="inline-flex items-center gap-2 px-5 py-2.5 border border-[var(--border-primary)] bg-[var(--surface-primary)] rounded-[var(--radius-lg)] font-bold text-[var(--text-primary)] hover:bg-[var(--surface-tertiary)] transition-all text-sm"
                  >
                    <ChevronLeft size={18} />
                    Previous
                  </Link>
                )}
                <span className="text-[var(--text-tertiary)] font-medium text-sm">Page {currentPage}</span>
                {hasNextPage && (
                  <Link
                    href={`/articles?page=${currentPage + 1}${searchQuery ? `&q=${searchQuery}` : ''}${categoryFilter ? `&category=${categoryFilter}` : ''}${tagFilter ? `&tag=${tagFilter}` : ''}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--color-accent)] text-white rounded-[var(--radius-lg)] font-bold hover:bg-[var(--primary-600)] transition-all text-sm"
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
        <div className="mt-16 bg-[var(--primary-900)] rounded-[var(--radius-2xl)] p-10 md:p-12 text-white text-center">
          <h2 className="text-2xl md:text-3xl font-black mb-4">Put Knowledge Into Action</h2>
          <p className="text-white/70 font-medium text-base md:text-lg mb-6 max-w-xl mx-auto">
            Use our free calculators to apply what you&apos;ve learned and make better financial decisions.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-white text-[var(--primary-900)] font-black px-8 py-4 rounded-[var(--radius-lg)] hover:bg-white/90 transition-all shadow-xl"
          >
            Explore Calculators
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="max-w-7xl mx-auto border-t border-[var(--border-primary)] px-6 py-8 text-center text-xs text-[var(--text-tertiary)]">
        &copy; {new Date().getFullYear()} Cortex Technologies. Built for smarter financial decisions.
      </footer>
    </>
  );
}

function ArticleCard({ article }: { article: ArticleListItem }) {
  return (
    <Link href={`/articles/${article.slug}`} className="group">
      <article
        className="rounded-[var(--radius-xl)] border border-[var(--border-primary)] bg-[var(--surface-primary)] overflow-hidden hover:border-[var(--color-accent)] transition-all duration-300 h-full flex flex-col hover:-translate-y-1"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        {/* Featured Image */}
        {article.featuredImage ? (
          <div className="relative h-44 bg-[var(--surface-tertiary)] overflow-hidden">
            <Image
              src={article.featuredImage.url}
              alt={article.featuredImage.alt}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        ) : (
          <div className="h-44 bg-gradient-to-br from-[var(--primary-100)] to-[var(--primary-200)] flex items-center justify-center">
            <Brain size={40} className="text-[var(--primary-300)]" />
          </div>
        )}

        <div className="p-5 flex flex-col flex-grow">
          {/* Categories */}
          {article.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {article.categories.slice(0, 2).map((category) => (
                <span
                  key={category.slug}
                  className="text-xs font-bold text-[var(--color-accent)] bg-[var(--color-accent-light)] px-2 py-0.5 rounded-full"
                >
                  {category.name}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h2 className="text-lg font-black text-[var(--text-primary)] mb-2 group-hover:text-[var(--color-accent)] transition-colors line-clamp-2">
            {article.title}
          </h2>

          {/* Excerpt */}
          <p className="text-[var(--text-secondary)] text-sm mb-4 line-clamp-2 flex-grow">
            {article.excerpt}
          </p>

          {/* Meta */}
          <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)] pt-3 border-t border-[var(--border-secondary)]">
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
