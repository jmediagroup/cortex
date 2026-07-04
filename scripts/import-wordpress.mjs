/**
 * One-time importer: WordPress posts -> Supabase CMS (cms_content + taxonomy).
 *
 * Self-contained (no app imports) so it runs with plain Node and doesn't couple
 * to the Next build. Idempotent: re-running upserts on (type, slug).
 *
 * Usage:
 *   NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL=https://cms.cortex.vip/graphql \
 *   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ... \
 *   node scripts/import-wordpress.mjs
 *
 * Requires the `turndown` devDependency (npm i -D turndown).
 */

import { createClient } from '@supabase/supabase-js';
import TurndownService from 'turndown';

const WP_URL =
  process.env.NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL || process.env.WORDPRESS_GRAPHQL_URL;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!WP_URL || !SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    'Missing env. Need NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.',
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
});

const ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  ndash: '–', mdash: '—', lsquo: '‘', rsquo: '’',
  ldquo: '“', rdquo: '”', hellip: '…',
};

function decodeEntities(text) {
  return String(text || '')
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&([a-zA-Z]+);/g, (m, n) => ENTITIES[n] ?? m);
}

function stripHtml(html) {
  return decodeEntities(String(html || '').replace(/<[^>]*>/g, '')).trim();
}

function slugify(input) {
  const s = String(input || '')
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return s || 'untitled';
}

const POSTS_QUERY = `
  query Posts($first: Int!, $after: String) {
    posts(first: $first, after: $after, where: { status: PUBLISH }) {
      pageInfo { hasNextPage endCursor }
      edges {
        node {
          slug
          title
          excerpt
          content
          date
          modified
          featuredImage { node { sourceUrl altText mediaDetails { width height } } }
          author { node { name slug avatar { url } description } }
          categories { edges { node { name slug } } }
          tags { edges { node { name slug } } }
        }
      }
    }
  }
`;

async function fetchPage(after) {
  const res = await fetch(WP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: POSTS_QUERY, variables: { first: 25, after } }),
  });
  if (!res.ok) throw new Error(`WP API ${res.status} ${res.statusText}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0]?.message || 'GraphQL error');
  return json.data.posts;
}

async function upsertTerm(table, name) {
  const slug = slugify(name);
  const { data: existing } = await supabase.from(table).select('id').eq('slug', slug).maybeSingle();
  if (existing) return existing.id;
  const { data, error } = await supabase.from(table).insert({ slug, name }).select('id').single();
  if (error) {
    const { data: retry } = await supabase.from(table).select('id').eq('slug', slug).maybeSingle();
    return retry?.id ?? null;
  }
  return data.id;
}

async function linkTaxonomy(contentId, table, joinTable, joinCol, names) {
  await supabase.from(joinTable).delete().eq('content_id', contentId);
  for (const name of names) {
    const id = await upsertTerm(table, name);
    if (id) await supabase.from(joinTable).upsert({ content_id: contentId, [joinCol]: id });
  }
}

async function importPost(node) {
  const img = node.featuredImage?.node;
  const author = node.author?.node;
  const body = turndown.turndown(node.content || '');

  const payload = {
    type: 'article',
    slug: node.slug,
    title: decodeEntities(node.title),
    excerpt: node.excerpt ? stripHtml(node.excerpt) : null,
    body_markdown: body,
    status: 'published',
    featured_image_url: img?.sourceUrl ?? null,
    featured_image_alt: img?.altText || decodeEntities(node.title),
    featured_image_width: img?.mediaDetails?.width ?? null,
    featured_image_height: img?.mediaDetails?.height ?? null,
    author_name: author?.name || 'Money Guy Mutants Team',
    author_slug: author?.slug || 'money-guy-mutants-team',
    author_avatar: author?.avatar?.url ?? null,
    author_bio: author?.description ?? null,
    metadata: {},
    published_at: node.date ? new Date(node.date).toISOString() : null,
  };

  const { data, error } = await supabase
    .from('cms_content')
    .upsert(payload, { onConflict: 'type,slug' })
    .select('id')
    .single();
  if (error) {
    console.error(`  ✗ ${node.slug}: ${error.message}`);
    return;
  }

  const categories = (node.categories?.edges || [])
    .map((e) => e.node.name)
    .filter((n) => n && n.toLowerCase() !== 'uncategorized');
  const tags = (node.tags?.edges || []).map((e) => e.node.name).filter(Boolean);
  await linkTaxonomy(data.id, 'cms_categories', 'cms_content_categories', 'category_id', categories);
  await linkTaxonomy(data.id, 'cms_tags', 'cms_content_tags', 'tag_id', tags);

  console.log(`  ✓ ${node.slug}`);
}

async function main() {
  console.log('Importing WordPress posts into cms_content…');
  let after = null;
  let total = 0;
  do {
    const page = await fetchPage(after);
    for (const edge of page.edges) {
      await importPost(edge.node);
      total += 1;
    }
    after = page.pageInfo.hasNextPage ? page.pageInfo.endCursor : null;
  } while (after);
  console.log(`Done. Imported/updated ${total} posts.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
