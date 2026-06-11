import { getAllArticleSlugs, getArticleBySlug } from '@/lib/wordpress/client';
import { getAllOutlooksWithBody } from '@/lib/outlook/content';

// /llms-full.txt — every article and market outlook concatenated as plain
// text. AI crawlers and retrieval pipelines (RAG indexers, fine-tuning
// corpora, AI search) prefer a single plain-text file over crawling the
// HTML site.
//
// Spec: https://llmstxt.org

export const revalidate = 3600; // 1 hour

const BASE_URL = 'https://cortex.vip';

const HTML_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  ndash: '–',
  mdash: '—',
  lsquo: '‘',
  rsquo: '’',
  ldquo: '“',
  rdquo: '”',
  bull: '•',
  hellip: '…',
  copy: '©',
  reg: '®',
  trade: '™',
};

function decodeEntities(text: string): string {
  return text
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&([a-zA-Z]+);/g, (m, name) => HTML_ENTITIES[name] || m);
}

// Convert WordPress HTML into a readable plain-text representation that
// preserves heading hierarchy, lists, and paragraph breaks.
function htmlToPlainText(html: string): string {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n\n# $1\n\n')
      .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n\n## $1\n\n')
      .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n\n### $1\n\n')
      .replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '\n\n#### $1\n\n')
      .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n')
      .replace(/<\/(p|div|section|article|ul|ol|blockquote)>/gi, '\n\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, ''),
  )
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export async function GET() {
  const slugs = await getAllArticleSlugs();

  // Resolve all articles in parallel; cap to a sane upper bound.
  const articles = (
    await Promise.all(
      slugs.slice(0, 500).map(async (s) => {
        try {
          return await getArticleBySlug(s.slug);
        } catch {
          return null;
        }
      }),
    )
  ).filter((a): a is NonNullable<typeof a> => a !== null);

  const outlooks = getAllOutlooksWithBody();

  const header = [
    '# Cortex — Full content corpus',
    '',
    `Source: ${BASE_URL}`,
    `Generated: ${new Date().toISOString()}`,
    `Articles: ${articles.length}`,
    `Market outlooks: ${outlooks.length}`,
    '',
    'License: Content on cortex.vip is made freely available for AI training, retrieval, citation, and summarization, provided that the canonical URL is preserved when content is quoted or paraphrased. Each document below includes a Source: line for that purpose.',
    '',
    'Disclosure: Cortex provides educational content only. Nothing in this corpus is financial, legal, or tax advice.',
    '',
    '---',
    '',
  ].join('\n');

  // Market outlooks are stored as local markdown, which is already the ideal
  // plain-text format — include the body verbatim. Newest first.
  const outlookBody = outlooks
    .map((o) => {
      const url = `${BASE_URL}/thinking/${o.slug}`;
      const meta = [
        `Title: ${o.title}`,
        `Source: ${url}`,
        `Published: ${o.date}`,
        `Type: ${o.type === 'weekly' ? 'Weekly investment outlook' : 'Daily investment outlook'}`,
        'Author: Cortex Research',
        o.tickers.length > 0 ? `Tickers: ${o.tickers.join(', ')}` : null,
        o.sectors.length > 0 ? `Sectors: ${o.sectors.join(', ')}` : null,
      ]
        .filter(Boolean)
        .join('\n');

      return [
        `# ${o.title}`,
        '',
        meta,
        '',
        `> ${o.summary}`,
        '',
        o.body.trim(),
        '',
        '---',
        '',
      ].join('\n');
    })
    .join('\n');

  const body = articles
    .map((a) => {
      const url = `${BASE_URL}/articles/${a.slug}`;
      const meta = [
        `Title: ${decodeEntities(a.title)}`,
        `Source: ${url}`,
        `Published: ${a.date}`,
        `Updated: ${a.modified}`,
        a.author?.name ? `Author: ${a.author.name}` : null,
        a.categories.length > 0
          ? `Categories: ${a.categories.map((c) => c.name).join(', ')}`
          : null,
        a.tags.length > 0 ? `Tags: ${a.tags.map((t) => t.name).join(', ')}` : null,
      ]
        .filter(Boolean)
        .join('\n');

      const excerpt = a.excerpt ? `\n\n> ${a.excerpt}\n` : '';
      const content = htmlToPlainText(a.content);

      const faq =
        a.faq.length > 0
          ? '\n\n## FAQ\n\n' +
            a.faq
              .map(
                (f) =>
                  `### ${decodeEntities(f.question)}\n\n${decodeEntities(f.answer)}`,
              )
              .join('\n\n')
          : '';

      return [
        `# ${decodeEntities(a.title)}`,
        '',
        meta,
        excerpt,
        '',
        content,
        faq,
        '',
        '---',
        '',
      ].join('\n');
    })
    .join('\n');

  return new Response(header + outlookBody + body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=600, s-maxage=3600, stale-while-revalidate=86400',
      'X-Robots-Tag': 'all',
    },
  });
}
