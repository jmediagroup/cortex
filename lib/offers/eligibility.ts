/**
 * The rules for the one disclosed offer shown after a calculator result
 * (docs/monetization/HANDOFF.md, Phase 1). Pure — no server, browser or
 * React imports — so the offer API, the /go redirect, the admin "why isn't
 * this live?" check and the tests all apply exactly the same rules.
 *
 * Standing rules this enforces:
 *   6 — nothing renders unless the program is `approved` and no link or copy
 *       still holds a <<PASTE…>> placeholder;
 *   7 — NEXT_PUBLIC_OFFERS_ENABLED is the kill switch, off unless "true";
 *   8 — the sub-id carries only the tool id and a short hash of the session.
 */
import { isCampaignLive } from '../ads/select';
import { hasPlaceholder, isHttpUrl } from '../ads/validation';
import { POST_RESULT_PLACEMENT, TOOL_IDS } from '../ads/types';

/** Kill switch. Inlined at build time, so changing it in Vercel needs a redeploy. */
export function offersEnabled(flag: string | undefined = process.env.NEXT_PUBLIC_OFFERS_ENABLED): boolean {
  return flag === 'true';
}

export interface OfferAdvertiser {
  id: string;
  name: string;
  is_active: boolean;
  program_status: string;
  disclosure_text: string | null;
}

export interface OfferCampaign {
  id: string;
  slug: string | null;
  name?: string;
  status: string;
  starts_at: string | null;
  ends_at: string | null;
  tracking_url: string | null;
  sub_id_template: string | null;
  tool_ids: string[] | null;
  exclude_tool_ids?: string[] | null;
  hide_for_tiers: string[];
  weight: number;
  priority: number;
}

export interface OfferCreative {
  id: string;
  format: string;
  headline: string;
  body: string | null;
  cta: string;
  weight: number;
  is_active: boolean;
}

/**
 * Every reason this campaign/creative can't be shown or linked to right now,
 * in plain English for the admin. Empty means it may render.
 */
export function offerBlockers(
  input: {
    enabled: boolean;
    placementSlug: string | null;
    advertiser: OfferAdvertiser | null;
    campaign: OfferCampaign;
    creative?: OfferCreative | null;
  },
  now: Date = new Date(),
): string[] {
  const { enabled, placementSlug, advertiser, campaign, creative } = input;
  const reasons: string[] = [];
  if (!enabled) reasons.push('Offers are switched off (NEXT_PUBLIC_OFFERS_ENABLED is not "true").');
  if (placementSlug !== POST_RESULT_PLACEMENT) reasons.push(`The campaign isn't on the "${POST_RESULT_PLACEMENT}" placement.`);
  if (!advertiser) {
    reasons.push('The campaign has no advertiser.');
  } else {
    if (advertiser.program_status !== 'approved') {
      reasons.push(`The advertiser's program status is "${advertiser.program_status}", not "approved".`);
    }
    if (!advertiser.is_active) reasons.push('The advertiser is switched off.');
    if (hasPlaceholder(advertiser.name) || hasPlaceholder(advertiser.disclosure_text)) {
      reasons.push("The advertiser's name or disclosure still has a <<PASTE…>> placeholder.");
    }
  }
  if (campaign.status !== 'active') {
    reasons.push(`The campaign is "${campaign.status}", not "active".`);
  } else if (!isCampaignLive(campaign, now)) {
    reasons.push("Today is outside the campaign's start/end dates.");
  }
  const url = campaign.tracking_url?.trim() ?? '';
  if (!url) reasons.push('The campaign has no affiliate link.');
  else if (hasPlaceholder(url)) reasons.push('The affiliate link is still a <<PASTE_AFFILIATE_URL>> placeholder.');
  else if (!isHttpUrl(url)) reasons.push('The affiliate link is not an http(s) URL.');
  if (creative === null || (creative !== undefined && (!creative.is_active || creative.format !== 'offer_card'))) {
    reasons.push('The campaign has no active offer-card creative.');
  } else if (
    creative &&
    (hasPlaceholder(creative.headline) || hasPlaceholder(creative.body) || hasPlaceholder(creative.cta))
  ) {
    reasons.push("The offer copy still has a <<PASTE…>> placeholder — replace it with the program's approved wording.");
  }
  return reasons;
}

/** What the browser receives: never the affiliate link itself (that stays on the server). */
export interface ServedOffer {
  campaignId: string;
  /** Path segment for /go/<ref>: the campaign slug, or its id when it has none. */
  ref: string;
  creativeId: string;
  advertiserId: string;
  advertiserName: string;
  headline: string;
  body: string | null;
  cta: string;
  /** The advertiser's own disclosure, or null to use the default wording. */
  disclosure: string | null;
  hideForTiers: string[];
  weight: number;
  priority: number;
}

export const DEFAULT_OFFER_DISCLOSURE =
  "Sponsored. We may earn a commission if you sign up through this link. This doesn't change what you pay. Educational content, not financial advice.";

/**
 * The offers a tool may show: one entry per eligible campaign × active
 * offer-card creative. The browser picks one per result (one offer max).
 */
export function servableOffers(
  rows: Array<{
    placementSlug: string | null;
    advertiser: OfferAdvertiser | null;
    campaign: OfferCampaign;
    creatives: OfferCreative[];
  }>,
  toolId: string,
  { enabled, now = new Date() }: { enabled: boolean; now?: Date },
): ServedOffer[] {
  if (!enabled || !(TOOL_IDS as readonly string[]).includes(toolId)) return [];
  const out: ServedOffer[] = [];
  for (const { placementSlug, advertiser, campaign, creatives } of rows) {
    const targets =
      !(campaign.exclude_tool_ids ?? []).includes(toolId) &&
      (campaign.tool_ids === null || campaign.tool_ids.includes(toolId));
    if (!targets || !advertiser) continue;
    for (const creative of creatives) {
      if (offerBlockers({ enabled, placementSlug, advertiser, campaign, creative }, now).length) continue;
      out.push({
        campaignId: campaign.id,
        ref: campaign.slug || campaign.id,
        creativeId: creative.id,
        advertiserId: advertiser.id,
        advertiserName: advertiser.name,
        headline: creative.headline,
        body: creative.body,
        cta: creative.cta,
        disclosure: advertiser.disclosure_text,
        hideForTiers: campaign.hide_for_tiers ?? [],
        weight: Math.max(1, campaign.weight) * Math.max(1, creative.weight),
        priority: campaign.priority,
      });
    }
  }
  return out;
}

/** Offers a viewer may see: only the highest priority present, minus tiers it hides from. */
export function offersForViewer(offers: ServedOffer[], tier: string | null): ServedOffer[] {
  const visible = offers.filter((o) => !tier || !o.hideForTiers.includes(tier));
  if (!visible.length) return [];
  const top = Math.max(...visible.map((o) => o.priority));
  return visible.filter((o) => o.priority === top);
}

// ---------------------------------------------------------------------------
// Outbound link
// ---------------------------------------------------------------------------

/**
 * A short, stable, non-reversible tag for a session (FNV-1a, 8 hex chars):
 * enough for a network report to group clicks, useless for identifying anyone.
 */
export function sessionShort(sessionId: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < sessionId.length; i += 1) {
    hash ^= sessionId.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

/** Fills a sub-id template; only {tool_id} and {session_short} are known. */
export function buildSubId(template: string | null, values: { toolId: string; sessionShort: string }): string {
  const filled = (template || '{tool_id}-{session_short}')
    .split('{tool_id}')
    .join(values.toolId)
    .split('{session_short}')
    .join(values.sessionShort);
  return filled.replace(/[^A-Za-z0-9_.-]/g, '').slice(0, 100);
}

/**
 * The affiliate link with the sub-id filled in wherever it contains {sub_id}
 * (the network's own sub-id parameter, e.g. Impact's subId1={sub_id}).
 * Without that token the link is used exactly as approved.
 */
export function buildOutboundUrl(trackingUrl: string, subId: string): string {
  const value = encodeURIComponent(subId);
  return trackingUrl.split('{sub_id}').join(value).split('%7Bsub_id%7D').join(value);
}
