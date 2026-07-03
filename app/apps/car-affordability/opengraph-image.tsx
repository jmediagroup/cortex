import { createAppOgImage, ogImageSize } from '@/lib/og-image-utils';

export const runtime = 'edge';
export const alt = 'Car Affordability Calculator';
export const size = ogImageSize;
export const contentType = 'image/png';

export default async function Image() {
  return createAppOgImage({
    title: 'Car Affordability Calculator',
    description:
      'Calculate how much car you can afford using the 20/3/8 rule with depreciation and opportunity cost analysis.',
    icon: 'car',
  });
}
