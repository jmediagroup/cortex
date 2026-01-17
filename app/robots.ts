import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/pricing',
          '/apps/compound-interest',
          '/apps/budget',
          '/apps/retirement-strategy',
          '/apps/index-fund-visualizer',
          '/apps/gambling-redirect',
          '/apps/car-affordability',
          '/apps/rent-vs-buy',
          '/apps/debt-paydown',
          '/apps/geographic-arbitrage',
          '/apps/net-worth',
          '/apps/s-corp-optimizer',
          '/apps/s-corp-investment',
        ],
        disallow: ['/api/', '/account', '/dashboard'],
      },
    ],
    sitemap: 'https://cortex.vip/sitemap.xml',
  };
}
