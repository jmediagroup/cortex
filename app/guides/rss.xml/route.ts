import { getAllGuides } from '@/lib/guides/content';

// /guides/rss.xml — RSS 2.0 feed of Money Guy Mutants personal-finance guides.

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
  const guides = getAllGuides().slice(0, 50);
  const latestDate = guides[0]?.date ? new Date(`${guides[0].date}T12:00:00Z`) : new Date();

  const items = guides
    .map((g) => {
      const url = `${BASE_URL}/guides/${g.slug}`;
      const categoryTags = [g.category ?? 'Guide', ...g.tags]
        .map((c) => `<category>${escapeXml(c)}</category>`)
        .join('');
      return `
    <item>
      <title>${escapeXml(g.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${toRfc822(g.date)}</pubDate>
      <description>${escapeXml(g.summary)}</description>
      <author>noreply@cortex.vip (Money Guy Mutants Research)</author>
      ${categoryTags}
    </item>`;
    })
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Money Guy Mutants — Guides</title>
    <link>${BASE_URL}/guides</link>
    <atom:link href="${BASE_URL}/guides/rss.xml" rel="self" type="application/rss+xml" />
    <description>In-depth, evergreen personal-finance guides from Money Guy Mutants Research.</description>
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
