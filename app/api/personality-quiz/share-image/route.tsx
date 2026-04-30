import { ImageResponse } from 'next/og';
import { ARCHETYPES, type ArchetypeId } from '@/lib/personality-quiz-data';
import { ShareCard, SHARE_SIZES } from '@/lib/personality-quiz-og';

export const runtime = 'edge';

/**
 * Returns a punchy share-card PNG for download flows. Defaults to
 * 1080×1350 portrait — Instagram-friendly aspect ratio. Pass
 * `?f=landscape` to get the 1200×630 link-preview variant from a
 * single endpoint.
 *
 * Query params:
 *   a — primary archetype id (required-ish; falls back to accumulator)
 *   s — secondary archetype id (currently unused by the visual, but
 *       reserved so we can layer it in later without breaking links)
 *   f — 'portrait' (default) | 'landscape'
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const rawA = url.searchParams.get('a') ?? '';
  const rawF = url.searchParams.get('f') ?? 'portrait';

  const archetypeId = (rawA in ARCHETYPES ? rawA : 'accumulator') as ArchetypeId;
  const format: 'portrait' | 'landscape' =
    rawF === 'landscape' ? 'landscape' : 'portrait';
  const { width, height } = SHARE_SIZES[format];

  return new ImageResponse(
    <ShareCard archetypeId={archetypeId} width={width} height={height} />,
    {
      width,
      height,
      headers: {
        'Cache-Control': 'public, max-age=86400, s-maxage=604800, immutable',
      },
    },
  );
}
