import Link from 'next/link';
import Image from 'next/image';
import { Clock } from 'lucide-react';
import { getArticles, formatArticleDate } from '@/lib/wordpress/client';
import { ArticleListItem } from '@/lib/wordpress/types';
import { MarketingIcon } from '@/components/marketing/Icons';

/**
 * Server component that fetches and displays the latest 3 articles.
 * Rendered on the marketing landing page.
 */
export default async function LatestArticles() {
  let articles: ArticleListItem[] = [];

  try {
    const result = await getArticles(3);
    articles = result.articles;
  } catch (error) {
    console.error('Failed to fetch latest articles:', error);
    return null;
  }

  if (articles.length === 0) return null;

  return (
    <section
      style={{
        padding: '120px 24px',
        background: 'var(--bg-section)',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ maxWidth: 640, margin: '0 0 56px' }}>
          <div
            className="eyebrow"
            style={{ marginBottom: 16, color: 'var(--text-tertiary)' }}
          >
            LATEST INSIGHTS
          </div>
          <h2
            style={{
              fontSize: 'clamp(32px,4.5vw,52px)',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.025em',
              margin: '0 0 16px',
              lineHeight: 1.1,
            }}
          >
            From the Cortex blog.
          </h2>
          <p
            style={{
              fontSize: 17,
              color: 'var(--text-secondary)',
              margin: 0,
              lineHeight: 1.55,
            }}
          >
            Strategies, frameworks, and deep dives into making better financial decisions.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 16,
            marginBottom: 40,
          }}
        >
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>

        <div>
          <Link
            href="/articles"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--bg-glass-strong)',
              border: '1px solid var(--glass-border-strong)',
              color: 'var(--text-primary)',
              padding: '13px 22px',
              borderRadius: 12,
              fontWeight: 600,
              fontSize: 14,
              textDecoration: 'none',
              backdropFilter: 'var(--glass-blur)',
              WebkitBackdropFilter: 'var(--glass-blur)',
            }}
          >
            Read all articles <MarketingIcon name="arrowRight" size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}

function ArticleCard({ article }: { article: ArticleListItem }) {
  return (
    <Link
      href={`/articles/${article.slug}`}
      style={{
        display: 'block',
        textDecoration: 'none',
        background: 'var(--bg-glass)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-card), var(--shadow-inset-top)',
      }}
      className="hover-lift"
    >
      {article.featuredImage ? (
        <div
          style={{
            position: 'relative',
            height: 180,
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
            height: 180,
            background:
              'linear-gradient(135deg, var(--emerald-tint) 0%, var(--bg-glass-strong) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--emerald-500)',
          }}
        >
          <MarketingIcon name="brain" size={48} />
        </div>
      )}

      <div
        style={{
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {article.categories.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {article.categories.slice(0, 1).map((category) => (
              <span
                key={category.slug}
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--emerald-500)',
                  background: 'var(--emerald-tint-soft)',
                  border: '1px solid var(--emerald-border-soft)',
                  padding: '4px 10px',
                  borderRadius: 9999,
                }}
              >
                {category.name}
              </span>
            ))}
          </div>
        )}

        <h3
          style={{
            fontSize: 17,
            fontWeight: 600,
            color: 'var(--text-primary)',
            margin: 0,
            lineHeight: 1.3,
            letterSpacing: '-0.01em',
          }}
        >
          {article.title}
        </h3>

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
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 11,
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            paddingTop: 12,
            borderTop: '1px solid var(--border-subtle)',
            marginTop: 4,
          }}
        >
          <span>{formatArticleDate(article.date)}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Clock size={11} />
            {article.readingTime} min
          </span>
        </div>
      </div>
    </Link>
  );
}
