import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/apps/compound-interest',
          '/apps/budget',
          '/apps/retirement-strategy',
        ],
        disallow: ['/api/', '/account', '/dashboard'],
      },
    ],
    sitemap: 'https://cortex.vip/sitemap.xml',
  };
}
