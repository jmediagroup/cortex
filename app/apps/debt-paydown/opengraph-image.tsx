import { createAppOgImage, ogImageSize } from '@/lib/og-image-utils';

export const runtime = 'edge';
export const alt = 'Debt Payoff Calculator';
export const size = ogImageSize;
export const contentType = 'image/png';

export default async function Image() {
  return createAppOgImage({
    title: 'Debt Payoff Calculator',
    description:
      'Compare debt paydown strategies: avalanche, snowball, and hybrid methods with psychological weighting.',
    icon: 'trending-down',
  });
}
