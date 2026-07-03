import { createAppOgImage, ogImageSize } from '@/lib/og-image-utils';

export const runtime = 'edge';
export const alt = 'Capital Gains Tax Calculator';
export const size = ogImageSize;
export const contentType = 'image/png';

export default async function Image() {
  return createAppOgImage({
    title: 'Capital Gains Tax Calculator',
    description:
      'Estimate the 2026 tax on a stock sale and see how much you can realize before each tax cliff.',
    icon: 'landmark',
  });
}
