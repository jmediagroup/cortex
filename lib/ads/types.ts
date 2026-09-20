/**
 * Ads — client-safe types and constants.
 *
 * Nothing in this file touches the database or the server; it is imported by
 * both the public ad components and the admin editors.
 */

export const AD_FORMATS = ['medium_rectangle', 'leaderboard', 'mobile_banner', 'large_rectangle'] as const;
export type AdFormat = (typeof AD_FORMATS)[number];

export const AD_FORMAT_LABELS: Record<AdFormat, string> = {
  medium_rectangle: 'Medium rectangle (300×250)',
  leaderboard: 'Leaderboard (728×90)',
  mobile_banner: 'Mobile banner (320×100)',
  large_rectangle: 'Large rectangle (336×280)',
};

export const PLACEMENT_SLUGS = ['tool-inline-top', 'tool-below-results', 'tool-sidebar'] as const;
export type PlacementSlug = (typeof PLACEMENT_SLUGS)[number];

export const CAMPAIGN_STATUSES = ['draft', 'active', 'paused', 'archived'] as const;
export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];

export const ADVERTISER_CATEGORIES = [
  'budgeting',
  'investing',
  'banking',
  'debt',
  'insurance',
  'taxes',
  'cashback',
  'security',
  'rewards',
  'credit-cards',
] as const;
export type AdvertiserCategory = (typeof ADVERTISER_CATEGORIES)[number];

export const AD_TIERS = ['free', 'finance_pro'] as const;

/** Every tool under /apps that can host an ad slot. */
export const TOOL_IDS = [
  'budget',
  'capital-gains-tax',
  'car-affordability',
  'coast-fire',
  'compound-interest',
  'debt-paydown',
  'gambling-redirect',
  'geographic-arbitrage',
  'index-fund-visualizer',
  'net-worth',
  'personality-quiz',
  'rent-vs-buy',
  'retirement-strategy',
  's-corp-investment',
  's-corp-optimizer',
  'whats-your-why',
] as const;
export type ToolId = (typeof TOOL_IDS)[number];

/** Per-format copy limits (characters). Enforced by the admin API + editor. */
export const CREATIVE_LIMITS: Record<AdFormat, { headline: number; body: number; cta: number }> = {
  leaderboard: { headline: 90, body: 0, cta: 30 },
  mobile_banner: { headline: 40, body: 0, cta: 30 },
  medium_rectangle: { headline: 40, body: 60, cta: 30 },
  large_rectangle: { headline: 40, body: 60, cta: 30 },
};

/** The shape handed to the ad components — one renderable creative. */
export interface ServedAd {
  /** Null for legacy fallback ads (nothing to attribute in the DB). */
  campaignId: string | null;
  creativeId: string | null;
  advertiser: { id: string | null; slug: string; name: string; url: string };
  format: AdFormat;
  headline: string;
  body?: string;
  bodyLine2?: string;
  cta: string;
  /** Campaign weight × creative weight; drives the weighted initial pick. */
  weight: number;
  /** Campaign priority; orders the rotation (higher first). */
  priority: number;
  /** Tiers that must never see this ad (filtered client-side by AdSlot). */
  hideForTiers: string[];
}

export interface AdsResponse {
  ads: ServedAd[];
  rotationIntervalMs: number;
  source: 'db' | 'fallback';
}

export type AdEventType = 'impression' | 'click';

export interface AdEventPayload {
  type: AdEventType;
  campaignId?: string | null;
  creativeId?: string | null;
  advertiserId?: string | null;
  placement: string;
  toolId: string;
  format: AdFormat;
  sessionId: string;
  pagePath?: string;
}

// ---------------------------------------------------------------------------
// Row shapes (mirror the tables in 20260920120000_create_ads_tables.sql)
// ---------------------------------------------------------------------------

export interface AdvertiserRow {
  id: string;
  slug: string;
  name: string;
  url: string;
  description: string | null;
  tagline: string | null;
  cta: string | null;
  category: AdvertiserCategory;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlacementRow {
  id: string;
  slug: string;
  name: string;
  formats: AdFormat[];
  rotation_interval_ms: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CampaignRow {
  id: string;
  slug: string | null;
  advertiser_id: string;
  placement_id: string;
  name: string;
  status: CampaignStatus;
  tool_ids: string[] | null;
  exclude_tool_ids: string[];
  weight: number;
  priority: number;
  starts_at: string | null;
  ends_at: string | null;
  hide_for_tiers: string[];
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreativeRow {
  id: string;
  campaign_id: string;
  seed_key: string | null;
  format: AdFormat;
  headline: string;
  body: string | null;
  body_line2: string | null;
  cta: string;
  weight: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
