import {
  WPArticle,
  WPArticlesResponse,
  WPArticleBySlugResponse,
  Article,
  ArticleListItem,
} from './types';
import {
  GET_ARTICLES,
  GET_ARTICLE_BY_SLUG,
  GET_ALL_ARTICLE_SLUGS,
  GET_CATEGORIES,
  GET_TAGS,
  SEARCH_ARTICLES,
  GET_ARTICLES_BY_CATEGORY,
  GET_ARTICLES_BY_TAG,
} from './queries';

const WORDPRESS_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL;

// Common HTML named entities mapping
const HTML_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: '\u00A0',
  ndash: '\u2013',
  mdash: '\u2014',
  lsquo: '\u2018',
  rsquo: '\u2019',
  ldquo: '\u201C',
  rdquo: '\u201D',
  bull: '\u2022',
  hellip: '\u2026',
  copy: '\u00A9',
  reg: '\u00AE',
  trade: '\u2122',
  frac12: '\u00BD',
  frac14: '\u00BC',
  frac34: '\u00BE',
  deg: '\u00B0',
  times: '\u00D7',
  divide: '\u00F7',
};

// Decode HTML entities (numeric, hex, and named) into their actual characters
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&([a-zA-Z]+);/g, (match, name) => HTML_ENTITIES[name] || match);
}

// Strip HTML tags and decode entities from a string
function stripHtml(html: string): string {
  return decodeHtmlEntities(html.replace(/<[^>]*>/g, '')).trim();
}

// Cache tags for on-demand revalidation
export const CACHE_TAGS = {
  articles: 'wordpress-articles',
  article: (slug: string) => `wordpress-article-${slug}`,
};

// Revalidation time in seconds (1 hour)
const REVALIDATE_TIME = 3600;

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

async function fetchGraphQL<T>(
  query: string,
  variables: Record<string, unknown> = {},
  tags: string[] = []
): Promise<T> {
  if (!WORDPRESS_API_URL) {
    throw new Error('WordPress GraphQL URL is not configured');
  }

  const response = await fetch(WORDPRESS_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
    next: {
      revalidate: REVALIDATE_TIME,
      tags,
    },
  });

  if (!response.ok) {
    throw new Error(`WordPress API error: ${response.status} ${response.statusText}`);
  }

  const json: GraphQLResponse<T> = await response.json();

  if (json.errors) {
    console.error('GraphQL Errors:', json.errors);
    throw new Error(json.errors[0]?.message || 'GraphQL query failed');
  }

  if (!json.data) {
    throw new Error('No data returned from WordPress');
  }

  return json.data;
}

// Transform WordPress article to clean Article type
function transformArticle(wpArticle: WPArticle): Article {
  const wordCount = wpArticle.content
    ? stripHtml(wpArticle.content).split(/\s+/).length
    : 0;
  const calculatedReadingTime = Math.ceil(wordCount / 200);

  return {
    id: wpArticle.id,
    slug: wpArticle.slug,
    title: wpArticle.title,
    excerpt: wpArticle.excerpt ? stripHtml(wpArticle.excerpt) : '',
    content: wpArticle.content || '',
    date: wpArticle.date,
    modified: wpArticle.modified,
    featuredImage: wpArticle.featuredImage?.node
      ? {
          url: wpArticle.featuredImage.node.sourceUrl,
          alt: wpArticle.featuredImage.node.altText || wpArticle.title,
          width: wpArticle.featuredImage.node.mediaDetails?.width || 1200,
          height: wpArticle.featuredImage.node.mediaDetails?.height || 630,
        }
      : null,
    author: {
      name: wpArticle.author?.node?.name || 'Cortex Team',
      slug: wpArticle.author?.node?.slug || 'cortex-team',
      avatar: wpArticle.author?.node?.avatar?.url || '',
      bio: wpArticle.author?.node?.description || '',
    },
    categories: wpArticle.categories?.edges?.map((edge) => ({
      name: edge.node.name,
      slug: edge.node.slug,
    })) || [],
    tags: wpArticle.tags?.edges?.map((edge) => ({
      name: edge.node.name,
      slug: edge.node.slug,
    })) || [],
    seo: wpArticle.seo
      ? {
          title: wpArticle.seo.title || wpArticle.title,
          description: wpArticle.seo.metaDesc || (wpArticle.excerpt ? stripHtml(wpArticle.excerpt) : ''),
          keywords: wpArticle.seo.metaKeywords || '',
          ogTitle: wpArticle.seo.opengraphTitle || wpArticle.title,
          ogDescription: wpArticle.seo.opengraphDescription || (wpArticle.excerpt ? stripHtml(wpArticle.excerpt) : ''),
          ogImage: wpArticle.seo.opengraphImage?.sourceUrl || null,
          canonical: wpArticle.seo.canonical || `https://cortex.vip/articles/${wpArticle.slug}`,
          schema: wpArticle.seo.schema?.raw || null,
        }
      : null,
    readingTime: wpArticle.acfArticleFields?.readingTime || calculatedReadingTime,
    relatedCalculator: wpArticle.acfArticleFields?.relatedCalculator || null,
    faq: wpArticle.acfArticleFields?.faqSection || [],
    cta: wpArticle.acfArticleFields?.ctaText && wpArticle.acfArticleFields?.ctaLink
      ? {
          text: wpArticle.acfArticleFields.ctaText,
          link: wpArticle.acfArticleFields.ctaLink,
        }
      : null,
  };
}

// Transform to list item (lighter weight for listings)
function transformToListItem(wpArticle: WPArticle): ArticleListItem {
  const strippedExcerpt = wpArticle.excerpt ? stripHtml(wpArticle.excerpt) : '';
  const wordCount = strippedExcerpt
    ? strippedExcerpt.split(/\s+/).length * 5
    : 0;
  const calculatedReadingTime = Math.max(Math.ceil(wordCount / 200), 3);

  return {
    id: wpArticle.id,
    slug: wpArticle.slug,
    title: wpArticle.title,
    excerpt: strippedExcerpt,
    date: wpArticle.date,
    featuredImage: wpArticle.featuredImage?.node
      ? {
          url: wpArticle.featuredImage.node.sourceUrl,
          alt: wpArticle.featuredImage.node.altText || wpArticle.title,
        }
      : null,
    author: {
      name: wpArticle.author?.node?.name || 'Cortex Team',
      avatar: wpArticle.author?.node?.avatar?.url || '',
    },
    categories: wpArticle.categories?.edges?.map((edge) => ({
      name: edge.node.name,
      slug: edge.node.slug,
    })) || [],
    readingTime: wpArticle.acfArticleFields?.readingTime || calculatedReadingTime,
  };
}

// Fetch paginated articles
export async function getArticles(
  first: number = 10,
  after?: string
): Promise<{
  articles: ArticleListItem[];
  hasNextPage: boolean;
  endCursor: string | null;
}> {
  const data = await fetchGraphQL<WPArticlesResponse>(
    GET_ARTICLES,
    { first, after },
    [CACHE_TAGS.articles]
  );

  return {
    articles: data.posts.edges.map((edge) => transformToListItem(edge.node)),
    hasNextPage: data.posts.pageInfo.hasNextPage,
    endCursor: data.posts.pageInfo.endCursor || null,
  };
}

// Fetch single article by slug
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const data = await fetchGraphQL<WPArticleBySlugResponse>(
      GET_ARTICLE_BY_SLUG,
      { slug },
      [CACHE_TAGS.articles, CACHE_TAGS.article(slug)]
    );

    if (!data.postBy) {
      return null;
    }

    return transformArticle(data.postBy);
  } catch (error) {
    console.error(`Error fetching article "${slug}":`, error);
    return null;
  }
}

// Fetch all article slugs for sitemap/static generation
export async function getAllArticleSlugs(): Promise<
  Array<{ slug: string; modified: string }>
> {
  try {
    const data = await fetchGraphQL<{
      posts: {
        edges: Array<{
          node: {
            slug: string;
            modified: string;
          };
        }>;
      };
    }>(GET_ALL_ARTICLE_SLUGS, { first: 1000 }, [CACHE_TAGS.articles]);

    return data.posts.edges.map((edge) => ({
      slug: edge.node.slug,
      modified: edge.node.modified,
    }));
  } catch (error) {
    console.error('Error fetching article slugs:', error);
    return [];
  }
}

// Estimate reading time from content
export function calculateReadingTime(content: string): number {
  const text = stripHtml(content);
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount / 200);
}

// Format date for display
export function formatArticleDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Category type
export interface Category {
  name: string;
  slug: string;
  count: number;
}

// Fetch all categories
export async function getCategories(): Promise<Category[]> {
  try {
    const data = await fetchGraphQL<{
      categories: {
        edges: Array<{
          node: {
            name: string;
            slug: string;
            count: number;
          };
        }>;
      };
    }>(GET_CATEGORIES, {}, [CACHE_TAGS.articles]);

    return data.categories.edges
      .map((edge) => ({
        name: edge.node.name,
        slug: edge.node.slug,
        count: edge.node.count || 0,
      }))
      .filter((cat) => cat.slug !== 'uncategorized');
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

// Search articles by query
export async function searchArticles(
  searchQuery: string,
  first: number = 10
): Promise<{
  articles: ArticleListItem[];
  hasNextPage: boolean;
}> {
  try {
    const data = await fetchGraphQL<WPArticlesResponse>(
      SEARCH_ARTICLES,
      { search: searchQuery, first },
      [CACHE_TAGS.articles]
    );

    return {
      articles: data.posts.edges.map((edge) => transformToListItem(edge.node)),
      hasNextPage: data.posts.pageInfo.hasNextPage,
    };
  } catch (error) {
    console.error('Error searching articles:', error);
    return { articles: [], hasNextPage: false };
  }
}

// Fetch articles by category
export async function getArticlesByCategory(
  categorySlug: string,
  first: number = 10
): Promise<{
  articles: ArticleListItem[];
  hasNextPage: boolean;
  categoryName: string | null;
}> {
  try {
    const data = await fetchGraphQL<{
      posts: {
        edges: Array<{ node: WPArticle }>;
        pageInfo: { hasNextPage: boolean };
      };
    }>(
      GET_ARTICLES_BY_CATEGORY,
      { categorySlug, first },
      [CACHE_TAGS.articles]
    );

    return {
      articles: data.posts.edges.map((edge) => transformToListItem(edge.node)),
      hasNextPage: data.posts.pageInfo.hasNextPage,
      categoryName: null,
    };
  } catch (error) {
    console.error('Error fetching articles by category:', error);
    return { articles: [], hasNextPage: false, categoryName: null };
  }
}

// Tag type
export interface Tag {
  name: string;
  slug: string;
  count: number;
}

// Fetch all tags
export async function getTags(): Promise<Tag[]> {
  try {
    const data = await fetchGraphQL<{
      tags: {
        edges: Array<{
          node: {
            name: string;
            slug: string;
            count: number;
          };
        }>;
      };
    }>(GET_TAGS, {}, [CACHE_TAGS.articles]);

    return data.tags.edges
      .map((edge) => ({
        name: edge.node.name,
        slug: edge.node.slug,
        count: edge.node.count || 0,
      }))
      .sort((a, b) => b.count - a.count); // Sort by count descending
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
}

// Fetch articles by tag
export async function getArticlesByTag(
  tagSlug: string,
  first: number = 10
): Promise<{
  articles: ArticleListItem[];
  hasNextPage: boolean;
}> {
  try {
    const data = await fetchGraphQL<{
      posts: {
        edges: Array<{ node: WPArticle }>;
        pageInfo: { hasNextPage: boolean };
      };
    }>(
      GET_ARTICLES_BY_TAG,
      { tagSlug, first },
      [CACHE_TAGS.articles]
    );

    return {
      articles: data.posts.edges.map((edge) => transformToListItem(edge.node)),
      hasNextPage: data.posts.pageInfo.hasNextPage,
    };
  } catch (error) {
    console.error('Error fetching articles by tag:', error);
    return { articles: [], hasNextPage: false };
  }
}
