import { createAppOgImage, ogImageSize } from '@/lib/og-image-utils';

export const runtime = 'edge';
export const alt = 'Net Worth Calculator';
export const size = ogImageSize;
export const contentType = 'image/png';

export default async function Image() {
  return createAppOgImage({
    title: 'Net Worth Calculator',
    description:
      'Track your net worth, assets, and liabilities with liquidity analysis and momentum tracking.',
    icon: 'bar-chart',
  });
}
