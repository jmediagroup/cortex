// WordPress GraphQL Types

export interface WPMediaItem {
  node: {
    sourceUrl: string;
    altText: string;
    mediaDetails: {
      width: number;
      height: number;
    };
  };
}

export interface WPAuthor {
  node: {
    name: string;
    slug: string;
    avatar: {
      url: string;
    };
    description: string;
  };
}

export interface WPCategory {
  node: {
    name: string;
    slug: string;
    description: string;
  };
}

export interface WPTag {
  node: {
    name: string;
    slug: string;
  };
}

export interface WPSeoData {
  title: string;
  metaDesc: string;
  focuskw: string;
  metaKeywords: string;
  opengraphTitle: string;
  opengraphDescription: string;
  opengraphImage: {
    sourceUrl: string;
  } | null;
  twitterTitle: string;
  twitterDescription: string;
  canonical: string;
  schema: {
    raw: string;
  };
}

export interface WPArticle {
  id: string;
  databaseId: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  modified: string;
  featuredImage: WPMediaItem | null;
  author: WPAuthor;
  categories: {
    edges: WPCategory[];
  };
  tags: {
    edges: WPTag[];
  };
  seo: WPSeoData | null;
  // ACF Custom Fields
  acfArticleFields: {
    readingTime: number | null;
    relatedCalculator: string | null;
    faqSection: Array<{
      question: string;
      answer: string;
    }> | null;
    ctaText: string | null;
    ctaLink: string | null;
  } | null;
}

export interface WPArticleEdge {
  node: WPArticle;
  cursor: string;
}

export interface WPPageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string;
  endCursor: string;
}

export interface WPArticlesResponse {
  posts: {
    edges: WPArticleEdge[];
    pageInfo: WPPageInfo;
  };
}

export interface WPArticleBySlugResponse {
  postBy: WPArticle | null;
}

export interface WPCategoryResponse {
  category: {
    name: string;
    slug: string;
    description: string;
    posts: {
      edges: WPArticleEdge[];
      pageInfo: WPPageInfo;
    };
  } | null;
}

// Transformed types for use in components
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
