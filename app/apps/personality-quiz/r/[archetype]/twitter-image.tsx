import { ImageResponse } from 'next/og';
import { ARCHETYPES, type ArchetypeId } from '@/lib/personality-quiz-data';
import { ShareCard, SHARE_SIZES } from '@/lib/personality-quiz-og';

export const runtime = 'edge';
export const alt = 'Cortex Financial Personality Quiz result';
export const size = SHARE_SIZES.landscape;
export const contentType = 'image/png';

export default async function Image({
  params,
}: {
  params: Promise<{ archetype: string }>;
}) {
  const { archetype } = await params;
  const id = (archetype in ARCHETYPES ? archetype : 'accumulator') as ArchetypeId;

  return new ImageResponse(
    <ShareCard archetypeId={id} width={size.width} height={size.height} />,
    { ...size },
  );
}
