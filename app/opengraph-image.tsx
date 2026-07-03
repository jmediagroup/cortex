import { ImageResponse } from 'next/og';
import { BrandOgCard } from '@/lib/brand-og-card';

export const runtime = 'edge';

export const alt = 'Money Guy Mutants — Financial tools, calculators & guides';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(<BrandOgCard />, { ...size });
}
