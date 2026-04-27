import Link from 'next/link';
import Image from 'next/image';
import { Clock } from 'lucide-react';
import {
  getArticlesByCategory,
  getArticles,
  formatArticleDate,
} from '@/lib/wordpress/client';
import type { ArticleListItem } from '@/lib/wordpress/types';
import { MarketingIcon } from '@/components/marketing/Icons';

type Props = {
  currentSlug: string;
  categorySlug?: string;
  limit?: number;
};

// Server component: fetches up to `limit` related articles by category,
// falling back to most-recent. Used to deepen internal linking — every
// article gets an outbound link to 3+ related pages, which improves
// crawl coverage and reduces orphan articles.
export async function RelatedArticles({ currentSlug, categorySlug, limit = 3 }: Props) {
  let candidates: ArticleListItem[] = [];

  try {
    if (categorySlug) {
      const result = await getArticlesByCategory(categorySlug, limit + 4);
      candidates = result.articles;
    }
    if (candidates.length < limit) {
      const recent = await getArticles(limit + 4);
      const seen = new Set(candidates.map((a) => a.slug));
      for (const a of recent.articles) {
        if (!seen.has(a.slug)) candidates.push(a);
      }
    }
  } catch (error) {
    console.error('RelatedArticles: failed to fetch', error);
    return null;
  }

  const related = candidates.filter((a) => a.slug !== currentSlug).slice(0, limit);
  if (related.length === 0) return null;

  return (
    <section
      style={{
        padding: '40px 0',
        borderTop: '1px solid var(--border-subtle)',
      }}
      aria-label="Related articles"
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
        Related reading.
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16,
        }}
      >
        {related.map((article) => (
          <Link
            key={article.slug}
            href={`/articles/${article.slug}`}
            className="hover-lift"
            style={{
              display: 'flex',
              flexDirection: 'column',
              background: 'var(--bg-glass)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              textDecoration: 'none',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            {article.featuredImage ? (
              <div
                style={{
                  position: 'relative',
                  height: 140,
                  background: 'var(--bg-section)',
                  overflow: 'hidden',
                }}
              >
                <Image
                  src={article.featuredImage.url}
                  alt={article.featuredImage.alt}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 600px) 100vw, 33vw"
                />
              </div>
            ) : (
              <div
                style={{
                  height: 140,
                  background:
                    'linear-gradient(135deg, var(--emerald-tint) 0%, var(--bg-glass-strong) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--emerald-500)',
                }}
              >
                <MarketingIcon name="brain" size={32} />
              </div>
            )}
            <div
              style={{
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                flex: 1,
              }}
            >
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  lineHeight: 1.3,
                  margin: 0,
                  letterSpacing: '-0.005em',
                }}
              >
                {article.title}
              </h3>
              <p
                style={{
                  color: 'var(--text-tertiary)',
                  fontSize: 12,
                  lineHeight: 1.5,
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
                  marginTop: 'auto',
                  paddingTop: 8,
                }}
              >
                <span>{formatArticleDate(article.date)}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={11} /> {article.readingTime} min
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
