import { NextRequest, NextResponse } from 'next/server';
import { getOffersForTool } from '@/lib/offers/server';
import { TOOL_IDS } from '@/lib/ads/types';

const CACHE_CONTROL = 'public, s-maxage=300, stale-while-revalidate=3600';

/**
 * GET /api/offers?tool=coast-fire
 * The disclosed offers a tool may show after its result (none while offers
 * are switched off). Public and cached; affiliate links never leave the
 * server — the card links to /go/<ref>.
 */
export async function GET(request: NextRequest) {
  const tool = new URL(request.url).searchParams.get('tool') ?? '';
  if (!(TOOL_IDS as readonly string[]).includes(tool)) {
    return NextResponse.json({ error: 'Unknown tool' }, { status: 400 });
  }
  const offers = await getOffersForTool(tool);
  return NextResponse.json({ offers }, { headers: { 'Cache-Control': CACHE_CONTROL } });
}
