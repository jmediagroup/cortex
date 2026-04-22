import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Cortex - Financial Decision Tools',
    short_name: 'Cortex',
    description: 'Tools for thinking clearly about life\'s biggest decisions. Financial calculators, budget planning, and more.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0A0E14',
    theme_color: '#0A0E14',
    icons: [
      {
        src: '/icon',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
