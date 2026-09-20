import { NextRequest, NextResponse } from 'next/server';
import { getAdsForPlacement } from '@/lib/ads/public';
import { buildFallbackAds, FALLBACK_ROTATION_MS } from '@/lib/ads/fallback';
import { TOOL_IDS, type AdsResponse } from '@/lib/ads/types';

const SLUG_RE = /^[a-z0-9-]{1,64}$/;
const CACHE_CONTROL = 'public, s-maxage=300, stale-while-revalidate=3600';

/**
 * GET /api/ads?placement=tool-inline-top&tool=budget
 * Public, cached read of the creatives eligible for one placement + tool.
 * Falls back to the legacy hard-coded config when the DB has nothing.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const placement = searchParams.get('placement') ?? '';
  const tool = searchParams.get('tool') ?? '';

  if (!SLUG_RE.test(placement)) {
    return NextResponse.json({ error: 'Invalid placement' }, { status: 400 });
  }
  if (!(TOOL_IDS as readonly string[]).includes(tool)) {
    return NextResponse.json({ error: 'Unknown tool' }, { status: 400 });
  }

  let body: AdsResponse;
  try {
    const result = await getAdsForPlacement(placement, tool);
    if (result && result.ads.length > 0) {
      body = { ...result, source: 'db' };
    } else {
      body = { ads: buildFallbackAds(placement, tool), rotationIntervalMs: FALLBACK_ROTATION_MS, source: 'fallback' };
    }
  } catch (error) {
    console.error('[ads] GET /api/ads failed, serving fallback:', error);
    body = { ads: buildFallbackAds(placement, tool), rotationIntervalMs: FALLBACK_ROTATION_MS, source: 'fallback' };
  }

  return NextResponse.json(body, { headers: { 'Cache-Control': CACHE_CONTROL } });
}
