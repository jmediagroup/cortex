import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/account', '/dashboard'],
      },
    ],
    sitemap: 'https://cortex.vip/sitemap.xml',
  };
}
