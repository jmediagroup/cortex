// WordPress GraphQL Queries

export const ARTICLE_FIELDS = `
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
  query GetArticlesByCategory($slug: String!, $first: Int!, $after: String) {
    category(id: $slug, idType: SLUG) {
      name
      slug
      description
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
