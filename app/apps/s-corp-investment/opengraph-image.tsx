import { createAppOgImage, ogImageSize } from '@/lib/og-image-utils';

export const runtime = 'edge';
export const alt = 'S-Corp Retirement Contribution Calculator';
export const size = ogImageSize;
export const contentType = 'image/png';

export default async function Image() {
  return createAppOgImage({
    title: 'S-Corp Retirement Contribution Calculator',
    description:
      'Maximize retirement savings through S-Corp contributions including employee deferrals and profit sharing.',
    icon: 'wallet',
  });
}
