/**
 * Fallback ads built from the legacy hard-coded config
 * (components/monetization/affiliates.ts + ad-copy.ts).
 *
 * Used when the database has no rows for a placement/tool, or when
 * GET /api/ads fails on the client. Client-safe.
 */
import { affiliates, contextAffiliates, type AffiliateConfig } from '@/components/monetization/affiliates';
import { affiliateAdCopy, type AdCopySet } from '@/components/monetization/ad-copy';
import type { AdFormat, ServedAd } from './types';

export const FALLBACK_ROTATION_MS = 15000;

/** Formats each placement renders — mirrors the seeded ad_placements rows. */
export const FALLBACK_PLACEMENT_FORMATS: Record<string, AdFormat[]> = {
  'tool-inline-top': ['leaderboard', 'mobile_banner'],
  'tool-below-results': ['large_rectangle'],
  'tool-sidebar': ['medium_rectangle'],
};

const LEGACY_FORMAT_KEY: Record<AdFormat, keyof AdCopySet> = {
  medium_rectangle: 'mediumRectangle',
  leaderboard: 'leaderboard',
  mobile_banner: 'mobileBanner',
  large_rectangle: 'largeRectangle',
};

// Tools that never had a contextAffiliates mapping get a sensible default.
const UNMAPPED_DEFAULTS: AffiliateConfig[] = [affiliates.sofi, affiliates.rocketMoney, affiliates.rakuten];

/** Advertisers that rotate on a tool under the legacy config. */
export function getFallbackAdvertisers(toolId: string): AffiliateConfig[] {
  const ctx = contextAffiliates[toolId];
  if (!ctx) return UNMAPPED_DEFAULTS;
  const list = ctx.rotating && ctx.rotating.length ? ctx.rotating : [ctx.primary];
  const seen = new Set<string>();
  return list.filter((a) => (seen.has(a.id) ? false : (seen.add(a.id), true)));
}

/** Build ServedAd[] for a placement/tool from the legacy config. */
export function buildFallbackAds(placementSlug: string, toolId: string): ServedAd[] {
  const formats = FALLBACK_PLACEMENT_FORMATS[placementSlug] ?? [];
  if (!formats.length) return [];
  const ctx = contextAffiliates[toolId];
  const primaryId = ctx?.primary?.id;
  const ads: ServedAd[] = [];

  for (const advertiser of getFallbackAdvertisers(toolId)) {
    const copySet = affiliateAdCopy[advertiser.id];
    if (!copySet) continue;
    for (const format of formats) {
      const copies = copySet[LEGACY_FORMAT_KEY[format]] ?? [];
      for (const copy of copies) {
        ads.push({
          campaignId: null,
          creativeId: null,
          advertiser: { id: null, slug: advertiser.id, name: advertiser.name, url: advertiser.url },
          format,
          headline: copy.headline,
          body: copy.body,
          bodyLine2: copy.bodyLine2,
          cta: copy.cta,
          weight: 1,
          priority: advertiser.id === primaryId ? 10 : 0,
          hideForTiers: ['finance_pro'],
        });
      }
    }
  }
  return ads;
}
