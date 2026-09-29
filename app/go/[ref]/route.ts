import { after, NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';
import { trackServerEvent } from '@/lib/analytics-server';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit';
import { POST_RESULT_PLACEMENT, TOOL_IDS } from '@/lib/ads/types';
import { isUuid } from '@/lib/ads/validation';
import { isLikelyBot } from '@/lib/tool-funnel';
import { loadOfferCampaign } from '@/lib/offers/server';
import {
  buildOutboundUrl,
  buildSubId,
  offersEnabled,
  servableOffers,
  sessionShort,
} from '@/lib/offers/eligibility';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ ref: string }> };

const NO_STORE = {
  'Cache-Control': 'no-store',
  'X-Robots-Tag': 'noindex, nofollow',
};

function redirect(location: string | URL) {
  const res = NextResponse.redirect(location, 302);
  for (const [k, v] of Object.entries(NO_STORE)) res.headers.set(k, v);
  return res;
}

/**
 * GET /go/<campaign slug or id>?tool=<tool id>&s=<analytics session>&c=<creative id>
 *
 * The only way out to an affiliate link. It re-checks the campaign against
 * the same rules as the offer card (lib/offers/eligibility.ts) on fresh data:
 * offers switched off, a program that isn't approved, a paused/expired
 * campaign or a <<PASTE…>> placeholder all send the visitor back to the tool
 * instead. Otherwise it logs the click (ad_events 'outbound' + an offer_click
 * event, never for bots) after responding, fills the sub-id, and redirects.
 */
export async function GET(request: NextRequest, { params }: Params) {
  const { ref } = await params;
  const url = new URL(request.url);
  const tool = url.searchParams.get('tool') ?? '';
  const knownTool = (TOOL_IDS as readonly string[]).includes(tool);
  const back = () => redirect(new URL(knownTool ? `/apps/${tool}` : '/apps', request.url));

  if (!knownTool || !offersEnabled() || !(isUuid(ref) || /^[a-z0-9-]{1,80}$/.test(ref))) return back();

  let row;
  try {
    row = await loadOfferCampaign(ref);
  } catch (error) {
    console.error('[go] campaign load failed:', error instanceof Error ? error.message : error);
    return back();
  }
  if (!row) return back();

  const [offer] = servableOffers([row], tool, { enabled: true });
  if (!offer || !row.campaign.tracking_url) return back();

  const rawSession = url.searchParams.get('s') ?? '';
  const sessionId = /^[A-Za-z0-9-]{1,100}$/.test(rawSession) ? rawSession : null;
  const creativeParam = url.searchParams.get('c');
  const creativeId = isUuid(creativeParam) && row.creatives.some((c) => c.id === creativeParam) ? creativeParam : null;

  const subId = buildSubId(row.campaign.sub_id_template, {
    toolId: tool,
    sessionShort: sessionShort(sessionId ?? 'no-session'),
  });
  const destination = buildOutboundUrl(row.campaign.tracking_url, subId);

  const counted =
    !isLikelyBot(request.headers.get('user-agent')) &&
    checkRateLimit(`go:${getClientIP(request.headers)}`, RATE_LIMITS.adEvents).success;
  if (counted) {
    after(async () => {
      const supabase = createServiceClient();
      const { error } = await supabase.from('ad_events').insert({
        event_type: 'outbound',
        campaign_id: offer.campaignId,
        creative_id: creativeId,
        advertiser_id: offer.advertiserId,
        placement_slug: POST_RESULT_PLACEMENT,
        tool_id: tool,
        format: 'offer_card',
        session_id: sessionId,
      });
      if (error) console.error('[go] ad_events insert failed:', error.message);
      await trackServerEvent(
        null,
        'offer_click',
        { tool_id: tool, campaign_slug: offer.ref, placement_slug: POST_RESULT_PLACEMENT },
        sessionId ?? undefined,
      );
    });
  }

  return redirect(destination);
}
