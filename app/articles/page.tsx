import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, ChevronLeft, ChevronRight, Search, X, Folder, Tag } from 'lucide-react';
import {
  getArticles,
  getCategories,
  getTags,
  searchArticles,
  getArticlesByCategory,
  getArticlesByTag,
  formatArticleDate,
  Category,
  Tag as TagType,
} from '@/lib/wordpress/client';
import { ArticleListItem } from '@/lib/wordpress/types';
import { MarketingIcon } from '@/components/marketing/Icons';

export const metadata: Metadata = {
  title: 'Articles — Financial Insights & Guides',
  description:
    'Expert articles on personal finance, retirement planning, investing strategies, and money management. Learn how to make smarter financial decisions with Cortex.',
  keywords: [
    'financial articles',
    'personal finance blog',
    'investing guides',
    'retirement planning articles',
    'money management tips',
    'financial literacy',
  ],
  openGraph: {
    title: 'Articles — Financial Insights & Guides | Cortex',
    description:
      'Expert articles on personal finance, retirement planning, investing strategies, and money management.',
    type: 'website',
    url: 'https://cortex.vip/articles',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Cortex Articles' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Articles — Financial Insights & Guides',
    description: 'Expert articles on personal finance, retirement planning, and investing strategies.',
    images: ['/og-image.png'],
  },
  alternates: { canonical: 'https://cortex.vip/articles' },
};

type PageProps = {
  searchParams: Promise<{ page?: string; q?: string; category?: string; tag?: string }>;
};

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
    [categories, tags] = await Promise.all([getCategories(), getTags()]);

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

  const hasFilter = Boolean(searchQuery || categoryFilter || tagFilter);

  return (
    <>
      <section
        className="hero-gradient"
        style={{ padding: '96px 24px 48px', textAlign: 'center' }}
      >
        <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative' }}>
          <div
            className="eyebrow"
            style={{ marginBottom: 16, color: 'var(--text-tertiary)' }}
          >
            INSIGHTS
          </div>
          <h1 className="h-hero" style={{ margin: '0 0 16px', fontSize: 'clamp(40px,6vw,64px)' }}>
            Articles for clearer thinking.
          </h1>
          <p
            style={{
              fontSize: 18,
              color: 'var(--text-secondary)',
              lineHeight: 1.55,
              margin: 0,
            }}
          >
            Expert guides, strategies, and deep dives into making smarter financial decisions.
          </p>
        </div>
      </section>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px 96px' }}>
        <div
          className="marketing-articles-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '260px minmax(0,1fr)',
            gap: 40,
            alignItems: 'start',
          }}
        >
          <aside>
            <div
              style={{
                position: 'sticky',
                top: 88,
                background: 'var(--bg-glass)',
                backdropFilter: 'var(--glass-blur)',
                WebkitBackdropFilter: 'var(--glass-blur)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-xl)',
                padding: 20,
                boxShadow: 'var(--shadow-card), var(--shadow-inset-top)',
              }}
            >
              <div style={{ marginBottom: 24 }}>
                <div
                  className="eyebrow"
                  style={{ marginBottom: 10, color: 'var(--text-tertiary)' }}
                >
                  SEARCH
                </div>
                <form action="/articles" method="GET">
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      name="q"
                      defaultValue={searchQuery}
                      placeholder="Search articles…"
                      style={{
                        width: '100%',
                        padding: '10px 36px 10px 12px',
                        border: '1px solid var(--border-default)',
                        borderRadius: 10,
                        background: 'var(--bg-glass-strong)',
                        color: 'var(--text-primary)',
                        fontSize: 13,
                        fontFamily: 'inherit',
                        outline: 'none',
                      }}
                    />
                    <button
                      type="submit"
                      aria-label="Search"
                      style={{
                        position: 'absolute',
                        right: 8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 0,
                        color: 'var(--text-tertiary)',
                        cursor: 'pointer',
                        padding: 4,
                        display: 'flex',
                      }}
                    >
                      <Search size={16} />
                    </button>
                  </div>
                </form>
              </div>

              <div style={{ marginBottom: 24 }}>
                <div
                  className="eyebrow"
                  style={{ marginBottom: 10, color: 'var(--text-tertiary)' }}
                >
                  CATEGORIES
                </div>
                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                  }}
                >
                  <SidebarLink
                    href="/articles"
                    active={!categoryFilter && !searchQuery && !tagFilter}
                    icon={<Folder size={14} />}
                    label="All Articles"
                  />
                  {categories.map((category) => (
                    <SidebarLink
                      key={category.slug}
                      href={`/articles?category=${category.slug}`}
                      active={categoryFilter === category.slug}
                      icon={<Folder size={14} />}
                      label={category.name}
                      count={category.count}
                    />
                  ))}
                </ul>
              </div>

              {tags.length > 0 && (
                <div>
                  <div
                    className="eyebrow"
                    style={{ marginBottom: 10, color: 'var(--text-tertiary)' }}
                  >
                    TAGS
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {tags.slice(0, 15).map((tag) => {
                      const active = tagFilter === tag.slug;
                      return (
                        <Link
                          key={tag.slug}
                          href={`/articles?tag=${tag.slug}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '4px 10px',
                            borderRadius: 9999,
                            fontSize: 11,
                            fontWeight: 500,
                            textDecoration: 'none',
                            background: active ? 'var(--emerald-500)' : 'var(--bg-glass-strong)',
                            border: `1px solid ${active ? 'var(--emerald-border)' : 'var(--glass-border)'}`,
                            color: active ? 'var(--text-inverse)' : 'var(--text-secondary)',
                          }}
                        >
                          <Tag size={10} />
                          {tag.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </aside>

          <div style={{ minWidth: 0 }}>
            {hasFilter && (
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 24,
                }}
              >
                <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Showing:</span>
                {searchQuery && (
                  <FilterChip
                    label={`"${searchQuery}"`}
                    href={
                      categoryFilter
                        ? `/articles?category=${categoryFilter}`
                        : tagFilter
                          ? `/articles?tag=${tagFilter}`
                          : '/articles'
                    }
                  />
                )}
                {categoryFilter && activeCategoryName && (
                  <FilterChip
                    label={activeCategoryName}
                    href={searchQuery ? `/articles?q=${searchQuery}` : '/articles'}
                  />
                )}
                {tagFilter && activeTagName && (
                  <FilterChip
                    label={`#${activeTagName}`}
                    href={searchQuery ? `/articles?q=${searchQuery}` : '/articles'}
                    strong
                  />
                )}
              </div>
            )}

            {error && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '64px 24px',
                  color: 'var(--text-secondary)',
                }}
              >
                <p>{error}</p>
                <Link
                  href="/articles"
                  style={{
                    color: 'var(--emerald-500)',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    marginTop: 12,
                  }}
                >
                  Try again <MarketingIcon name="arrowRight" size={14} />
                </Link>
              </div>
            )}

            {!error && articles.length === 0 && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '64px 24px',
                  background: 'var(--bg-glass)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-xl)',
                  color: 'var(--text-secondary)',
                }}
              >
                <p style={{ fontSize: 16, marginBottom: 8 }}>
                  {searchQuery
                    ? `No articles found for "${searchQuery}"`
                    : categoryFilter
                      ? 'No articles in this category yet'
                      : tagFilter
                        ? 'No articles with this tag yet'
                        : 'No articles published yet.'}
                </p>
                <p style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>
                  {hasFilter ? 'Try adjusting your filters or browse all articles.' : 'Check back soon for new content.'}
                </p>
                {hasFilter && (
                  <Link
                    href="/articles"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      color: 'var(--emerald-500)',
                      fontWeight: 600,
                      textDecoration: 'none',
                      marginTop: 16,
                    }}
                  >
                    View all articles <MarketingIcon name="arrowRight" size={14} />
                  </Link>
                )}
              </div>
            )}

            {articles.length > 0 && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: 16,
                }}
              >
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            )}

            {articles.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 16,
                  marginTop: 48,
                }}
              >
                {currentPage > 1 && (
                  <Link
                    href={buildPageHref(currentPage - 1, { searchQuery, categoryFilter, tagFilter })}
                    style={paginationBtn()}
                  >
                    <ChevronLeft size={16} /> Previous
                  </Link>
                )}
                <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
                  Page {currentPage}
                </span>
                {hasNextPage && (
                  <Link
                    href={buildPageHref(currentPage + 1, { searchQuery, categoryFilter, tagFilter })}
                    style={paginationBtn({ primary: true })}
                  >
                    Next <ChevronRight size={16} />
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function SidebarLink({
  href,
  active,
  icon,
  label,
  count,
}: {
  href: string;
  active: boolean;
  icon: React.ReactNode;
  label: string;
  count?: number;
}) {
  return (
    <li>
      <Link
        href={href}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 10px',
          borderRadius: 10,
          fontSize: 13,
          fontWeight: 500,
          textDecoration: 'none',
          color: active ? 'var(--emerald-500)' : 'var(--text-secondary)',
          background: active ? 'var(--emerald-tint-soft)' : 'transparent',
          border: `1px solid ${active ? 'var(--emerald-border-soft)' : 'transparent'}`,
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          {icon}
          {label}
        </span>
        {typeof count === 'number' && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: active ? 'var(--emerald-500)' : 'var(--text-muted)',
            }}
          >
            {count}
          </span>
        )}
      </Link>
    </li>
  );
}

function FilterChip({ label, href, strong }: { label: string; href: string; strong?: boolean }) {
  return (
    <Link
      href={href}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px',
        fontSize: 12,
        fontWeight: 500,
        borderRadius: 9999,
        textDecoration: 'none',
        background: strong ? 'var(--emerald-500)' : 'var(--emerald-tint-soft)',
        color: strong ? 'var(--text-inverse)' : 'var(--emerald-500)',
        border: `1px solid ${strong ? 'var(--emerald-border)' : 'var(--emerald-border-soft)'}`,
      }}
    >
      {label}
      <X size={12} />
    </Link>
  );
}

function ArticleCard({ article }: { article: ArticleListItem }) {
  return (
    <Link
      href={`/articles/${article.slug}`}
      className="hover-lift"
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-glass)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        textDecoration: 'none',
        boxShadow: 'var(--shadow-card), var(--shadow-inset-top)',
      }}
    >
      {article.featuredImage ? (
        <div
          style={{
            position: 'relative',
            height: 168,
            background: 'var(--bg-section)',
            overflow: 'hidden',
          }}
        >
          <Image
            src={article.featuredImage.url}
            alt={article.featuredImage.alt}
            fill
            style={{ objectFit: 'cover' }}
          />
        </div>
      ) : (
        <div
          style={{
            height: 168,
            background:
              'linear-gradient(135deg, var(--emerald-tint) 0%, var(--bg-glass-strong) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--emerald-500)',
          }}
        >
          <MarketingIcon name="brain" size={40} />
        </div>
      )}

      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        {article.categories.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {article.categories.slice(0, 2).map((category) => (
              <span
                key={category.slug}
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--emerald-500)',
                  background: 'var(--emerald-tint-soft)',
                  border: '1px solid var(--emerald-border-soft)',
                  padding: '4px 8px',
                  borderRadius: 9999,
                }}
              >
                {category.name}
              </span>
            ))}
          </div>
        )}

        <h2
          style={{
            fontSize: 17,
            fontWeight: 600,
            color: 'var(--text-primary)',
            lineHeight: 1.3,
            letterSpacing: '-0.01em',
            margin: 0,
          }}
        >
          {article.title}
        </h2>

        <p
          style={{
            color: 'var(--text-tertiary)',
            fontSize: 13,
            lineHeight: 1.55,
            margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {article.excerpt}
        </p>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 11,
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            paddingTop: 12,
            borderTop: '1px solid var(--border-subtle)',
            marginTop: 'auto',
          }}
        >
          <span>{formatArticleDate(article.date)}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Clock size={11} /> {article.readingTime} min
          </span>
        </div>
      </div>
    </Link>
  );
}

function paginationBtn({ primary = false }: { primary?: boolean } = {}): React.CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '10px 18px',
    fontSize: 13,
    fontWeight: 600,
    borderRadius: 12,
    textDecoration: 'none',
    background: primary ? 'var(--emerald-500)' : 'var(--bg-glass-strong)',
    color: primary ? 'var(--text-inverse)' : 'var(--text-primary)',
    border: primary ? 'none' : '1px solid var(--glass-border-strong)',
    boxShadow: primary ? '0 0 20px var(--cta-glow-soft)' : 'none',
  };
}

function buildPageHref(
  page: number,
  { searchQuery, categoryFilter, tagFilter }: { searchQuery: string; categoryFilter: string; tagFilter: string },
) {
  const params = new URLSearchParams();
  params.set('page', String(page));
  if (searchQuery) params.set('q', searchQuery);
  if (categoryFilter) params.set('category', categoryFilter);
  if (tagFilter) params.set('tag', tagFilter);
  return `/articles?${params.toString()}`;
}
