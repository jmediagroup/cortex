import { MetadataRoute } from 'next';
import { getAllArticleSlugs } from '@/lib/cms/articles';
import { getAllOutlookSlugs } from '@/lib/outlook/content';
import { getAllGuideSlugs } from '@/lib/guides/content';
import { getAllLandingSlugs } from '@/lib/landing-pages';
import { CALCULATOR_CONTENT } from '@/lib/calculator-content';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://moneyguymutants.com';

  // Fetch all article slugs from the CMS
  let articleEntries: MetadataRoute.Sitemap = [];
  try {
    const articles = await getAllArticleSlugs();
    articleEntries = articles.map((article) => ({
      url: `${baseUrl}/articles/${article.slug}`,
      lastModified: new Date(article.modified),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Failed to fetch articles for sitemap:', error);
  }

  // Outlook entries from local Markdown.
  const outlookEntries: MetadataRoute.Sitemap = getAllOutlookSlugs().map((o) => ({
    url: `${baseUrl}/thinking/${o.slug}`,
    lastModified: new Date(`${o.date}T12:00:00Z`),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Guide entries from local Markdown.
  const guideEntries: MetadataRoute.Sitemap = getAllGuideSlugs().map((g) => ({
    url: `${baseUrl}/guides/${g.slug}`,
    lastModified: new Date(`${g.date}T12:00:00Z`),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // Search landing pages (/calculators/*) — keyword pages wrapping the tools.
  const landingEntries: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/calculators`,
      lastModified: new Date('2026-09-20T12:00:00Z'),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    ...getAllLandingSlugs().map((l) => ({
      url: `${baseUrl}/calculators/${l.slug}`,
      lastModified: new Date(`${l.updated}T12:00:00Z`),
      changeFrequency: 'monthly' as const,
      priority: 0.85,
    })),
  ];

  // Articles listing page
  const articlesListingEntry: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/articles`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/thinking`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/guides`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
  ];

  // Use a stable date for static routes to avoid misleading crawlers with
  // new timestamps on every build. Update this date when content actually changes.
  const lastUpdated = new Date('2026-04-07');
  // Tool pages: bumped whenever calculator logic or on-page content changes.
  const toolsUpdated = new Date('2026-09-20');

  const staticRoutes: MetadataRoute.Sitemap = [
    // Core pages
    {
      url: baseUrl,
      lastModified: lastUpdated,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: lastUpdated,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: lastUpdated,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/enterprise`,
      lastModified: lastUpdated,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/security`,
      lastModified: lastUpdated,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: lastUpdated,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/changelog`,
      lastModified: lastUpdated,
      changeFrequency: 'weekly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/roadmap`,
      lastModified: lastUpdated,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    // Keyword landing page for the Money Guy Show / Financial Mutants audience
    {
      url: `${baseUrl}/financial-mutants`,
      lastModified: lastUpdated,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    // Money Guy Show tribute hub (subscribe + latest videos feed)
    {
      url: `${baseUrl}/the-money-guy-show`,
      lastModified: lastUpdated,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    // All-tools index
    {
      url: `${baseUrl}/apps`,
      lastModified: lastUpdated,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    // Public financial calculators — derived from the content registry so a
    // new tool can't be forgotten here. Highest priority for SEO.
    ...Object.keys(CALCULATOR_CONTENT).map((slug) => ({
      url: `${baseUrl}/apps/${slug}`,
      lastModified: toolsUpdated,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    })),
    {
      url: `${baseUrl}/apps/personality-quiz`,
      lastModified: lastUpdated,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    // What's Your Why
    {
      url: `${baseUrl}/apps/whats-your-why`,
      lastModified: lastUpdated,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    ...['accumulator', 'optimizer', 'fortress', 'tactician', 'visionary', 'steward'].map(
      (id) => ({
        url: `${baseUrl}/apps/personality-quiz/r/${id}`,
        lastModified: lastUpdated,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }),
    ),
  ];

  return [...staticRoutes, ...articlesListingEntry, ...articleEntries, ...outlookEntries, ...guideEntries];
}
