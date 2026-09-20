import 'server-only';
import { unstable_cache } from 'next/cache';
import { createServiceClient } from '@/lib/supabase/client';
import { filterCampaignsForTool } from './select';
import type { AdFormat, AdsResponse, CampaignRow, CreativeRow, PlacementRow, ServedAd } from './types';

const REVALIDATE_SECONDS = 300;

// Cache tags for on-demand revalidation (busted by lib/ads/admin.ts revalidateAds).
export const ADS_CACHE_TAGS = {
  all: 'ads',
  tool: (toolId: string) => `ads-${toolId}`,
};

type CampaignWithJoins = CampaignRow & {
  ad_advertisers: { id: string; slug: string; name: string; url: string; is_active: boolean } | null;
  ad_creatives: CreativeRow[] | null;
};

/**
 * Read the live campaigns for one placement + tool from the database and
 * flatten them to renderable creatives. Returns `null` when the placement is
 * unknown/inactive or the query fails so the caller can fall back.
 */
async function fetchAdsForPlacement(
  placementSlug: string,
  toolId: string,
): Promise<Omit<AdsResponse, 'source'> | null> {
  const supabase = createServiceClient();

  const { data: placement, error: placementError } = await supabase
    .from('ad_placements')
    .select('id,slug,formats,rotation_interval_ms,is_active')
    .eq('slug', placementSlug)
    .maybeSingle<Pick<PlacementRow, 'id' | 'slug' | 'formats' | 'rotation_interval_ms' | 'is_active'>>();

  if (placementError) {
    console.error(`[ads] placement "${placementSlug}":`, placementError.message);
    return null;
  }
  if (!placement || !placement.is_active) return null;

  const { data, error } = await supabase
    .from('ad_campaigns')
    .select(
      '*,ad_advertisers!inner(id,slug,name,url,is_active),ad_creatives(*)',
    )
    .eq('placement_id', placement.id)
    .eq('status', 'active')
    .eq('ad_advertisers.is_active', true)
    .eq('ad_creatives.is_active', true)
    .order('priority', { ascending: false });

  if (error) {
    console.error(`[ads] campaigns for "${placementSlug}/${toolId}":`, error.message);
    return null;
  }

  const campaigns = filterCampaignsForTool((data ?? []) as unknown as CampaignWithJoins[], toolId);
  const allowedFormats = new Set<AdFormat>(placement.formats ?? []);
  const ads: ServedAd[] = [];

  for (const campaign of campaigns) {
    const advertiser = campaign.ad_advertisers;
    if (!advertiser) continue;
    for (const creative of campaign.ad_creatives ?? []) {
      if (!allowedFormats.has(creative.format)) continue;
      ads.push({
        campaignId: campaign.id,
        creativeId: creative.id,
        advertiser: { id: advertiser.id, slug: advertiser.slug, name: advertiser.name, url: advertiser.url },
        format: creative.format,
        headline: creative.headline,
        body: creative.body ?? undefined,
        bodyLine2: creative.body_line2 ?? undefined,
        cta: creative.cta,
        weight: Math.max(1, campaign.weight) * Math.max(1, creative.weight),
        priority: campaign.priority,
        hideForTiers: campaign.hide_for_tiers ?? [],
      });
    }
  }

  return { ads, rotationIntervalMs: placement.rotation_interval_ms };
}

/**
 * Cached read used by GET /api/ads. Tagged so admin writes can revalidate on
 * demand; otherwise refreshed every 5 minutes.
 */
export async function getAdsForPlacement(
  placementSlug: string,
  toolId: string,
): Promise<Omit<AdsResponse, 'source'> | null> {
  return unstable_cache(
    () => fetchAdsForPlacement(placementSlug, toolId),
    ['ads', placementSlug, toolId],
    { tags: [ADS_CACHE_TAGS.all, ADS_CACHE_TAGS.tool(toolId)], revalidate: REVALIDATE_SECONDS },
  )();
}
