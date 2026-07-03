import { createAppOgImage, ogImageSize } from '@/lib/og-image-utils';

export const runtime = 'edge';
export const alt = 'Coast FIRE Calculator';
export const size = ogImageSize;
export const contentType = 'image/png';

export default async function Image() {
  return createAppOgImage({
    title: 'Coast FIRE Calculator',
    description:
      'Calculate when you can stop saving for retirement and let compound growth do the rest.',
    icon: 'trending-up',
  });
}
