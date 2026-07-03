import { createAppOgImage, ogImageSize } from '@/lib/og-image-utils';

export const runtime = 'edge';
export const alt = 'Geographic Arbitrage Calculator';
export const size = ogImageSize;
export const contentType = 'image/png';

export default async function Image() {
  return createAppOgImage({
    title: 'Geographic Arbitrage Calculator',
    description:
      'Compare income, taxes, and cost of living across all 50 U.S. states to find wealth-building opportunities.',
    icon: 'map-pin',
  });
}
