import { createAppOgImage, ogImageSize } from '@/lib/og-image-utils';

export const runtime = 'edge';
export const alt = 'Rent vs. Buy Calculator';
export const size = ogImageSize;
export const contentType = 'image/png';

export default async function Image() {
  return createAppOgImage({
    title: 'Rent vs. Buy Calculator',
    description:
      'Compare renting vs buying a home with opportunity cost, maintenance, taxes, and mobility factors.',
    icon: 'scale',
  });
}
