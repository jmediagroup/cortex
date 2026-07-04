import { MetadataRoute } from 'next';
import { getAllArticleSlugs } from '@/lib/cms/articles';
import { getAllOutlookSlugs } from '@/lib/outlook/content';
import { getAllGuideSlugs } from '@/lib/guides/content';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://moneyguymutants.com';

  // Fetch all article slugs from WordPress
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
    // Public Financial Calculators - highest priority for SEO
    {
      url: `${baseUrl}/apps/compound-interest`,
      lastModified: lastUpdated,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/apps/budget`,
      lastModified: lastUpdated,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/apps/retirement-strategy`,
      lastModified: lastUpdated,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/apps/index-fund-visualizer`,
      lastModified: lastUpdated,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/apps/gambling-redirect`,
      lastModified: lastUpdated,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    // Additional Financial Calculators
    {
      url: `${baseUrl}/apps/net-worth`,
      lastModified: lastUpdated,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/apps/car-affordability`,
      lastModified: lastUpdated,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/apps/rent-vs-buy`,
      lastModified: lastUpdated,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/apps/debt-paydown`,
      lastModified: lastUpdated,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/apps/geographic-arbitrage`,
      lastModified: lastUpdated,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    // Business Calculators
    {
      url: `${baseUrl}/apps/s-corp-optimizer`,
      lastModified: lastUpdated,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/apps/s-corp-investment`,
      lastModified: lastUpdated,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/apps/capital-gains-tax`,
      lastModified: lastUpdated,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    // Coast FIRE
    {
      url: `${baseUrl}/apps/coast-fire`,
      lastModified: lastUpdated,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    // Financial Personality Quiz
    {
      url: `${baseUrl}/apps/personality-quiz`,
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
