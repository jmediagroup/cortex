// CMS content types.
//
// The public `Article` / `ArticleListItem` shapes intentionally mirror the old
// WordPress-transformed types (formerly in lib/wordpress/types.ts) so every
// consumer of the article data layer keeps compiling after the swap. `content`
// is HTML rendered from the stored markdown via lib/outlook/markdown.ts.

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  modified: string;
  featuredImage: {
    url: string;
    alt: string;
    width: number;
    height: number;
  } | null;
  author: {
    name: string;
    slug: string;
    avatar: string;
    bio: string;
  };
  categories: Array<{
    name: string;
    slug: string;
  }>;
  tags: Array<{
    name: string;
    slug: string;
  }>;
  seo: {
    title: string;
    description: string;
    keywords: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: string | null;
    canonical: string;
    schema: string | null;
  } | null;
  readingTime: number;
  relatedCalculator: string | null;
  faq: Array<{
    question: string;
    answer: string;
  }>;
  cta: {
    text: string;
    link: string;
  } | null;
}

export interface ArticleListItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  featuredImage: {
    url: string;
    alt: string;
  } | null;
  author: {
    name: string;
    avatar: string;
  };
  categories: Array<{
    name: string;
    slug: string;
  }>;
  readingTime: number;
}

export interface Category {
  name: string;
  slug: string;
  count: number;
}

export interface Tag {
  name: string;
  slug: string;
  count: number;
}

// Structured shape of the `metadata` JSONB column for articles.
export interface ArticleMetadata {
  faq?: Array<{ question: string; answer: string }>;
  cta?: { text: string; link: string } | null;
  related_calculator?: string | null;
}
