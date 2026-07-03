import { createAppOgImage, ogImageSize } from '@/lib/og-image-utils';

export const runtime = 'edge';
export const alt = 'S-Corp Tax Savings Calculator';
export const size = ogImageSize;
export const contentType = 'image/png';

export default async function Image() {
  return createAppOgImage({
    title: 'S-Corp Tax Savings Calculator',
    description:
      'Calculate S-Corp tax savings and find your ideal salary/distribution split to minimize self-employment tax.',
    icon: 'landmark',
  });
}
