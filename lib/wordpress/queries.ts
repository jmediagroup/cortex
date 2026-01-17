// WordPress GraphQL Queries

// Core fields that work without additional plugins
export const ARTICLE_FIELDS_CORE = `
  id
  databaseId
  slug
  title
  excerpt
  date
  modified
  featuredImage {
    node {
      sourceUrl
      altText
      mediaDetails {
        width
        height
      }
    }
  }
  author {
    node {
      name
      slug
      avatar {
        url
      }
      description
    }
  }
  categories {
    edges {
      node {
        name
        slug
        description
      }
    }
  }
  tags {
    edges {
      node {
        name
        slug
      }
    }
  }
`;

// Optional Yoast SEO fields - only include if WPGraphQL Yoast SEO plugin is installed
export const SEO_FIELDS = `
  seo {
    title
    metaDesc
    focuskw
    metaKeywords
    opengraphTitle
    opengraphDescription
    opengraphImage {
      sourceUrl
    }
    twitterTitle
    twitterDescription
    canonical
    schema {
      raw
    }
  }
`;

// Optional ACF fields - only include if WPGraphQL for ACF plugin is installed
export const ACF_FIELDS = `
  acfArticleFields {
    readingTime
    relatedCalculator
    faqSection {
      question
      answer
    }
    ctaText
    ctaLink
  }
`;

// Use core fields by default (works without Yoast/ACF)
// To enable SEO/ACF fields, install the plugins and update this line:
// export const ARTICLE_FIELDS = ARTICLE_FIELDS_CORE + SEO_FIELDS + ACF_FIELDS;
export const ARTICLE_FIELDS = ARTICLE_FIELDS_CORE;

export const GET_ARTICLES = `
  query GetArticles($first: Int!, $after: String) {
    posts(first: $first, after: $after, where: { status: PUBLISH }) {
      edges {
        node {
          ${ARTICLE_FIELDS}
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

export const GET_ARTICLE_BY_SLUG = `
  query GetArticleBySlug($slug: String!) {
    postBy(slug: $slug) {
      ${ARTICLE_FIELDS}
      content
    }
  }
`;

export const GET_ALL_ARTICLE_SLUGS = `
  query GetAllArticleSlugs($first: Int!) {
    posts(first: $first, where: { status: PUBLISH }) {
      edges {
        node {
          slug
          modified
        }
      }
    }
  }
`;

export const GET_ARTICLES_BY_CATEGORY = `
  query GetArticlesByCategory($categorySlug: String!, $first: Int!) {
    posts(first: $first, where: { status: PUBLISH, categoryName: $categorySlug }) {
      edges {
        node {
          ${ARTICLE_FIELDS}
        }
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`;

export const GET_CATEGORIES = `
  query GetCategories {
    categories(first: 100, where: { hideEmpty: true }) {
      edges {
        node {
          name
          slug
          description
          count
        }
      }
    }
  }
`;

export const SEARCH_ARTICLES = `
  query SearchArticles($search: String!, $first: Int!) {
    posts(first: $first, where: { status: PUBLISH, search: $search }) {
      edges {
        node {
          ${ARTICLE_FIELDS}
        }
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`;
