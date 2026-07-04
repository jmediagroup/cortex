import 'server-only';
import { unstable_cache } from 'next/cache';
import readingTime from 'reading-time';
import { createServiceClient } from '@/lib/supabase/client';
import { renderMarkdown } from '@/lib/outlook/markdown';
import type { Article, ArticleListItem, Category, Tag, ArticleMetadata } from './types';

export type { Article, ArticleListItem, Category, Tag } from './types';

const SITE = 'https://moneyguymutants.com';
const REVALIDATE_TIME = 3600; // 1 hour

// Cache tags for on-demand revalidation (consumed by app/api/revalidate/route.ts).
export const CACHE_TAGS = {
  articles: 'cms-articles',
  article: (slug: string) => `cms-article-${slug}`,
};

// Embedded taxonomy selects (Supabase nested resource syntax).
const CATEGORY_EMBED = 'cms_content_categories(cms_categories(name,slug))';
const TAG_EMBED = 'cms_content_tags(cms_tags(name,slug))';
const LIST_SELECT =
  `id,slug,title,excerpt,body_markdown,reading_time,published_at,created_at,` +
  `featured_image_url,featured_image_alt,author_name,author_avatar,${CATEGORY_EMBED}`;
const FULL_SELECT = `*,${CATEGORY_EMBED},${TAG_EMBED}`;

// ---------------------------------------------------------------------------
// Transforms
// ---------------------------------------------------------------------------

function extractTaxonomy(
  embed: unknown,
  key: 'cms_categories' | 'cms_tags',
): Array<{ name: string; slug: string }> {
  if (!Array.isArray(embed)) return [];
  return embed
    .map((e) => (e as Record<string, unknown>)?.[key])
    .filter(Boolean)
    .map((c) => {
      const node = c as { name: string; slug: string };
      return { name: node.name, slug: node.slug };
    });
}

function computeReadingTime(row: { reading_time?: number | null; body_markdown?: string | null }): number {
  if (typeof row.reading_time === 'number' && row.reading_time > 0) return row.reading_time;
  return Math.max(1, Math.round(readingTime(row.body_markdown || '').minutes));
}

// Excerpt falls back to the first slice of the (markdown-stripped) body.
function deriveExcerpt(row: { excerpt?: string | null; body_markdown?: string | null }): string {
  if (row.excerpt) return row.excerpt;
  const text = String(row.body_markdown || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*_`~[\]()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const words = text.split(' ').filter(Boolean).slice(0, 40);
  return words.join(' ');
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function rowToListItem(row: any): ArticleListItem {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: deriveExcerpt(row),
    date: row.published_at ?? row.created_at,
    featuredImage: row.featured_image_url
      ? { url: row.featured_image_url, alt: row.featured_image_alt || row.title }
      : null,
    author: {
      name: row.author_name || 'Money Guy Mutants Team',
      avatar: row.author_avatar || '',
    },
    categories: extractTaxonomy(row.cms_content_categories, 'cms_categories'),
    readingTime: computeReadingTime(row),
  };
}

async function rowToArticle(row: any): Promise<Article> {
  const content = await renderMarkdown(row.body_markdown || '');
  const excerpt = deriveExcerpt(row);
  const meta = (row.metadata ?? {}) as ArticleMetadata;
  const date = row.published_at ?? row.created_at;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt,
    content,
    date,
    modified: row.updated_at ?? date,
    featuredImage: row.featured_image_url
      ? {
          url: row.featured_image_url,
          alt: row.featured_image_alt || row.title,
          width: row.featured_image_width || 1200,
          height: row.featured_image_height || 630,
        }
      : null,
    author: {
      name: row.author_name || 'Money Guy Mutants Team',
      slug: row.author_slug || 'money-guy-mutants-team',
      avatar: row.author_avatar || '',
      bio: row.author_bio || '',
    },
    categories: extractTaxonomy(row.cms_content_categories, 'cms_categories'),
    tags: extractTaxonomy(row.cms_content_tags, 'cms_tags'),
    seo: {
      title: row.seo_title || row.title,
      description: row.seo_description || excerpt,
      keywords: row.seo_keywords || '',
      ogTitle: row.seo_og_title || row.title,
      ogDescription: row.seo_og_description || excerpt,
      ogImage: row.seo_og_image || row.featured_image_url || null,
      canonical: row.seo_canonical || `${SITE}/articles/${row.slug}`,
      schema: null,
    },
    readingTime: computeReadingTime(row),
    relatedCalculator: meta.related_calculator ?? null,
    faq: Array.isArray(meta.faq) ? meta.faq : [],
    cta: meta.cta ?? null,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

async function fetchArticles(first: number, after?: string): Promise<{
  articles: ArticleListItem[];
  hasNextPage: boolean;
  endCursor: string | null;
}> {
  const supabase = createServiceClient();
  const offset = after ? Math.max(0, parseInt(after, 10) || 0) : 0;
  const { data, error } = await supabase
    .from('cms_content')
    .select(LIST_SELECT)
    .eq('type', 'article')
    .eq('status', 'published')
    .order('published_at', { ascending: false, nullsFirst: false })
    .range(offset, offset + first); // one extra row to detect the next page

  if (error) {
    console.error('[cms] getArticles:', error.message);
    return { articles: [], hasNextPage: false, endCursor: null };
  }

  const rows = (data ?? []) as unknown[];
  const hasNextPage = rows.length > first;
  const page = (hasNextPage ? rows.slice(0, first) : rows) as Array<Record<string, unknown>>;
  return {
    articles: page.map(rowToListItem),
    hasNextPage,
    endCursor: hasNextPage ? String(offset + first) : null,
  };
}

export async function getArticles(first = 10, after?: string) {
  return unstable_cache(
    () => fetchArticles(first, after),
    ['cms-articles', String(first), after ?? ''],
    { tags: [CACHE_TAGS.articles], revalidate: REVALIDATE_TIME },
  )();
}

async function fetchArticleBySlug(slug: string): Promise<Article | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('cms_content')
    .select(FULL_SELECT)
    .eq('type', 'article')
    .eq('status', 'published')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error(`[cms] getArticleBySlug "${slug}":`, error.message);
    return null;
  }
  if (!data) return null;
  return rowToArticle(data);
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  return unstable_cache(
    () => fetchArticleBySlug(slug),
    ['cms-article', slug],
    { tags: [CACHE_TAGS.articles, CACHE_TAGS.article(slug)], revalidate: REVALIDATE_TIME },
  )();
}

async function fetchAllArticleSlugs(): Promise<Array<{ slug: string; modified: string }>> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('cms_content')
    .select('slug, updated_at, published_at, created_at')
    .eq('type', 'article')
    .eq('status', 'published')
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(1000);

  if (error) {
    console.error('[cms] getAllArticleSlugs:', error.message);
    return [];
  }
  return (data ?? []).map((r) => ({
    slug: r.slug as string,
    modified: (r.updated_at ?? r.published_at ?? r.created_at) as string,
  }));
}

export async function getAllArticleSlugs() {
  return unstable_cache(fetchAllArticleSlugs, ['cms-article-slugs'], {
    tags: [CACHE_TAGS.articles],
    revalidate: REVALIDATE_TIME,
  })();
}

async function fetchCategories(): Promise<Category[]> {
  const supabase = createServiceClient();
  const [{ data: cats }, { data: links }] = await Promise.all([
    supabase.from('cms_categories').select('id, slug, name'),
    supabase
      .from('cms_content_categories')
      .select('category_id, cms_content!inner(status, type)')
      .eq('cms_content.status', 'published')
      .eq('cms_content.type', 'article'),
  ]);

  const counts = new Map<string, number>();
  for (const link of (links ?? []) as Array<{ category_id: string }>) {
    counts.set(link.category_id, (counts.get(link.category_id) ?? 0) + 1);
  }

  return ((cats ?? []) as Array<{ id: string; slug: string; name: string }>)
    .map((c) => ({ name: c.name, slug: c.slug, count: counts.get(c.id) ?? 0 }))
    .filter((c) => c.slug !== 'uncategorized');
}

export async function getCategories(): Promise<Category[]> {
  return unstable_cache(fetchCategories, ['cms-categories'], {
    tags: [CACHE_TAGS.articles],
    revalidate: REVALIDATE_TIME,
  })();
}

async function fetchTags(): Promise<Tag[]> {
  const supabase = createServiceClient();
  const [{ data: tags }, { data: links }] = await Promise.all([
    supabase.from('cms_tags').select('id, slug, name'),
    supabase
      .from('cms_content_tags')
      .select('tag_id, cms_content!inner(status, type)')
      .eq('cms_content.status', 'published')
      .eq('cms_content.type', 'article'),
  ]);

  const counts = new Map<string, number>();
  for (const link of (links ?? []) as Array<{ tag_id: string }>) {
    counts.set(link.tag_id, (counts.get(link.tag_id) ?? 0) + 1);
  }

  return ((tags ?? []) as Array<{ id: string; slug: string; name: string }>)
    .map((t) => ({ name: t.name, slug: t.slug, count: counts.get(t.id) ?? 0 }))
    .sort((a, b) => b.count - a.count);
}

export async function getTags(): Promise<Tag[]> {
  return unstable_cache(fetchTags, ['cms-tags'], {
    tags: [CACHE_TAGS.articles],
    revalidate: REVALIDATE_TIME,
  })();
}

// PostgREST or-filters choke on commas/parens — strip them from the term.
function sanitizeSearch(q: string): string {
  return q.replace(/[,()]/g, ' ').trim();
}

async function fetchBySlugList(
  ids: string[],
  first: number,
): Promise<{ articles: ArticleListItem[]; hasNextPage: boolean }> {
  if (ids.length === 0) return { articles: [], hasNextPage: false };
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('cms_content')
    .select(LIST_SELECT)
    .eq('type', 'article')
    .eq('status', 'published')
    .in('id', ids)
    .order('published_at', { ascending: false, nullsFirst: false })
    .range(0, first);

  if (error) {
    console.error('[cms] fetchBySlugList:', error.message);
    return { articles: [], hasNextPage: false };
  }
  const rows = (data ?? []) as unknown[];
  const hasNextPage = rows.length > first;
  const page = (hasNextPage ? rows.slice(0, first) : rows) as Array<Record<string, unknown>>;
  return { articles: page.map(rowToListItem), hasNextPage };
}

export async function searchArticles(
  searchQuery: string,
  first = 10,
): Promise<{ articles: ArticleListItem[]; hasNextPage: boolean }> {
  const safe = sanitizeSearch(searchQuery);
  if (!safe) return { articles: [], hasNextPage: false };
  const supabase = createServiceClient();
  const term = `%${safe}%`;
  const { data, error } = await supabase
    .from('cms_content')
    .select(LIST_SELECT)
    .eq('type', 'article')
    .eq('status', 'published')
    .or(`title.ilike.${term},excerpt.ilike.${term},body_markdown.ilike.${term}`)
    .order('published_at', { ascending: false, nullsFirst: false })
    .range(0, first);

  if (error) {
    console.error('[cms] searchArticles:', error.message);
    return { articles: [], hasNextPage: false };
  }
  const rows = (data ?? []) as unknown[];
  const hasNextPage = rows.length > first;
  const page = (hasNextPage ? rows.slice(0, first) : rows) as Array<Record<string, unknown>>;
  return { articles: page.map(rowToListItem), hasNextPage };
}

export async function getArticlesByCategory(
  categorySlug: string,
  first = 10,
): Promise<{ articles: ArticleListItem[]; hasNextPage: boolean; categoryName: string | null }> {
  const supabase = createServiceClient();
  const { data: cat } = await supabase
    .from('cms_categories')
    .select('id, name')
    .eq('slug', categorySlug)
    .maybeSingle();
  if (!cat) return { articles: [], hasNextPage: false, categoryName: null };

  const { data: links } = await supabase
    .from('cms_content_categories')
    .select('content_id')
    .eq('category_id', (cat as { id: string }).id);
  const ids = ((links ?? []) as Array<{ content_id: string }>).map((l) => l.content_id);

  const { articles, hasNextPage } = await fetchBySlugList(ids, first);
  return { articles, hasNextPage, categoryName: (cat as { name: string }).name };
}

export async function getArticlesByTag(
  tagSlug: string,
  first = 10,
): Promise<{ articles: ArticleListItem[]; hasNextPage: boolean }> {
  const supabase = createServiceClient();
  const { data: tag } = await supabase
    .from('cms_tags')
    .select('id')
    .eq('slug', tagSlug)
    .maybeSingle();
  if (!tag) return { articles: [], hasNextPage: false };

  const { data: links } = await supabase
    .from('cms_content_tags')
    .select('content_id')
    .eq('tag_id', (tag as { id: string }).id);
  const ids = ((links ?? []) as Array<{ content_id: string }>).map((l) => l.content_id);

  return fetchBySlugList(ids, first);
}

// ---------------------------------------------------------------------------
// Utilities (kept API-compatible with the former WordPress client)
// ---------------------------------------------------------------------------

export function calculateReadingTime(content: string): number {
  return Math.max(1, Math.round(readingTime(content || '').minutes));
}

export function formatArticleDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
