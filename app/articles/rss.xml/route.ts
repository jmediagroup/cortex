import { getArticles } from '@/lib/wordpress/client';

// /articles/rss.xml — Atom-compatible RSS 2.0 feed of recent articles.
// Drives freshness signals to Google, Bing, news aggregators, AI search
// engines (Perplexity, You.com, Phind), and feed readers.

export const revalidate = 1800; // 30 minutes

const BASE_URL = 'https://moneyguymutants.com';

function escapeXml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toRfc822(date: string | Date): string {
  return new Date(date).toUTCString();
}

export async function GET() {
  let items = '';
  let latestDate = new Date();

  try {
    const { articles } = await getArticles(50);
    if (articles.length > 0) {
      latestDate = new Date(articles[0].date);
      items = articles
        .map((a) => {
          const url = `${BASE_URL}/articles/${a.slug}`;
          const categoryTags = a.categories
            .map((c) => `<category>${escapeXml(c.name)}</category>`)
            .join('');
          return `
    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${toRfc822(a.date)}</pubDate>
      <description>${escapeXml(a.excerpt)}</description>
      <author>noreply@moneyguymutants.com (${escapeXml(a.author.name || 'Money Guy Mutants Team')})</author>
      ${categoryTags}
    </item>`;
        })
        .join('');
    }
  } catch (error) {
    console.error('rss.xml: failed to fetch articles', error);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Money Guy Mutants — Articles</title>
    <link>${BASE_URL}/articles</link>
    <atom:link href="${BASE_URL}/articles/rss.xml" rel="self" type="application/rss+xml" />
    <description>Expert articles on personal finance, retirement planning, investing strategies, and money management from Money Guy Mutants.</description>
    <language>en-us</language>
    <copyright>© ${new Date().getFullYear()} J Media Group LLC</copyright>
    <lastBuildDate>${toRfc822(latestDate)}</lastBuildDate>
    <ttl>30</ttl>${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=1800, stale-while-revalidate=86400',
      'X-Robots-Tag': 'all',
    },
  });
}
