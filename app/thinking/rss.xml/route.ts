import { getAllOutlooks } from '@/lib/outlook/content';

// /thinking/rss.xml — Atom-compatible RSS 2.0 feed of investment outlooks.

export const revalidate = 1800;

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
  return new Date(typeof date === 'string' ? `${date}T12:00:00Z` : date).toUTCString();
}

export async function GET() {
  const outlooks = getAllOutlooks().slice(0, 50);
  const latestDate = outlooks[0]?.date ? new Date(`${outlooks[0].date}T12:00:00Z`) : new Date();

  const items = outlooks
    .map((o) => {
      const url = `${BASE_URL}/thinking/${o.slug}`;
      const categoryTags = [
        o.type === 'weekly' ? 'Weekly Outlook' : 'Daily Outlook',
        ...o.tickers,
        ...o.sectors,
      ]
        .map((c) => `<category>${escapeXml(c)}</category>`)
        .join('');
      return `
    <item>
      <title>${escapeXml(o.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${toRfc822(o.date)}</pubDate>
      <description>${escapeXml(o.summary)}</description>
      <author>noreply@cortex.vip (Money Guy Mutants Research)</author>
      ${categoryTags}
    </item>`;
    })
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Money Guy Mutants — Thinking</title>
    <link>${BASE_URL}/thinking</link>
    <atom:link href="${BASE_URL}/thinking/rss.xml" rel="self" type="application/rss+xml" />
    <description>Daily and weekly investment outlooks from Money Guy Mutants Research.</description>
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
