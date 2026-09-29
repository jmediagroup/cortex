import 'server-only';
import { unstable_cache } from 'next/cache';
import { createServiceClient } from '@/lib/supabase/client';
import { ADS_CACHE_TAGS } from '@/lib/ads/public';
import { POST_RESULT_PLACEMENT } from '@/lib/ads/types';
import { isUuid } from '@/lib/ads/validation';
import {
  offersEnabled,
  servableOffers,
  type OfferAdvertiser,
  type OfferCampaign,
  type OfferCreative,
  type ServedOffer,
} from './eligibility';

export interface OfferCampaignRow {
  placementSlug: string | null;
  advertiser: OfferAdvertiser | null;
  campaign: OfferCampaign;
  creatives: OfferCreative[];
}

const CAMPAIGN_SELECT =
  'id,slug,name,status,starts_at,ends_at,tracking_url,sub_id_template,tool_ids,exclude_tool_ids,hide_for_tiers,weight,priority,' +
  'ad_placements(slug),' +
  'ad_advertisers(id,name,is_active,program_status,disclosure_text),' +
  'ad_creatives(id,format,headline,body,cta,weight,is_active)';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toRow(row: any): OfferCampaignRow {
  const { ad_placements, ad_advertisers, ad_creatives, ...campaign } = row;
  return {
    placementSlug: ad_placements?.slug ?? null,
    advertiser: ad_advertisers ?? null,
    campaign: campaign as OfferCampaign,
    creatives: ((ad_creatives ?? []) as OfferCreative[]).filter((c) => c.format === 'offer_card'),
  };
}

/** Every campaign on the after-the-result placement, whatever its state (admin + offer API). */
export async function loadOfferCampaigns(): Promise<OfferCampaignRow[]> {
  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const { data: placement, error: placementError } = await sb
    .from('ad_placements')
    .select('id,is_active')
    .eq('slug', POST_RESULT_PLACEMENT)
    .maybeSingle();
  if (placementError) throw new Error(placementError.message);
  if (!placement || !placement.is_active) return [];

  const { data, error } = await sb.from('ad_campaigns').select(CAMPAIGN_SELECT).eq('placement_id', placement.id);
  if (error) throw new Error(error.message);
  return (data ?? []).map(toRow);
}

/** One campaign by slug or id, read fresh (the /go redirect must not act on stale state). */
export async function loadOfferCampaign(ref: string): Promise<OfferCampaignRow | null> {
  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query = (supabase as any).from('ad_campaigns').select(CAMPAIGN_SELECT);
  const { data, error } = await (isUuid(ref) ? query.eq('id', ref) : query.eq('slug', ref)).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? toRow(data) : null;
}

/**
 * The offers a tool may show right now. Cached like the banner ads (5 min,
 * busted by admin edits through the same `ads` tag). Errors — including a
 * database that hasn't had the offers migration yet — yield no offers.
 */
export async function getOffersForTool(toolId: string): Promise<ServedOffer[]> {
  if (!offersEnabled()) return [];
  return unstable_cache(
    async () => {
      try {
        return servableOffers(await loadOfferCampaigns(), toolId, { enabled: true });
      } catch (error) {
        console.error('[offers] load failed:', error instanceof Error ? error.message : error);
        return [];
      }
    },
    ['offers', toolId],
    { tags: [ADS_CACHE_TAGS.all, ADS_CACHE_TAGS.tool(toolId)], revalidate: 300 },
  )();
}
