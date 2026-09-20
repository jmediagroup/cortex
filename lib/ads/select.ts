/**
 * Pure ad-selection helpers. No imports with runtime side effects so these can
 * be unit-tested with plain `node --test` (see tests/ads.test.mjs).
 */
import type { CampaignStatus } from './types';

export interface SelectableCampaign {
  status: CampaignStatus | string;
  tool_ids: string[] | null;
  exclude_tool_ids?: string[] | null;
  starts_at?: string | null;
  ends_at?: string | null;
  hide_for_tiers?: string[] | null;
}

/** Active AND inside its optional [starts_at, ends_at] window. */
export function isCampaignLive(campaign: SelectableCampaign, now: Date = new Date()): boolean {
  if (campaign.status !== 'active') return false;
  const t = now.getTime();
  if (campaign.starts_at) {
    const start = Date.parse(campaign.starts_at);
    if (!Number.isNaN(start) && start > t) return false;
  }
  if (campaign.ends_at) {
    const end = Date.parse(campaign.ends_at);
    if (!Number.isNaN(end) && end <= t) return false;
  }
  return true;
}

/** NULL tool_ids = every tool; exclude_tool_ids always wins. */
export function campaignTargetsTool(campaign: SelectableCampaign, toolId: string): boolean {
  if (campaign.exclude_tool_ids && campaign.exclude_tool_ids.includes(toolId)) return false;
  if (campaign.tool_ids === null || campaign.tool_ids === undefined) return true;
  return campaign.tool_ids.includes(toolId);
}

/** True when the campaign must not be shown to a viewer of this tier. */
export function isHiddenForTier(campaign: SelectableCampaign, tier: string | null | undefined): boolean {
  if (!tier) return false;
  return Boolean(campaign.hide_for_tiers && campaign.hide_for_tiers.includes(tier));
}

/**
 * Live campaigns that target `toolId`. When `tier` is given, campaigns hidden
 * for that tier are dropped too.
 */
export function filterCampaignsForTool<T extends SelectableCampaign>(
  campaigns: T[],
  toolId: string,
  options: { now?: Date; tier?: string | null } = {},
): T[] {
  const now = options.now ?? new Date();
  return campaigns.filter(
    (c) => isCampaignLive(c, now) && campaignTargetsTool(c, toolId) && !isHiddenForTier(c, options.tier),
  );
}

/**
 * Weighted random pick. Items with a non-positive or non-finite weight are
 * never chosen. `rnd` must return a number in [0, 1).
 */
export function pickWeighted<T>(
  items: T[],
  weightFn: (item: T) => number,
  rnd: () => number = Math.random,
): T | null {
  let total = 0;
  const weights = items.map((item) => {
    const w = weightFn(item);
    const safe = Number.isFinite(w) && w > 0 ? w : 0;
    total += safe;
    return safe;
  });
  if (total <= 0) return null;
  let r = rnd() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r < 0) return items[i];
  }
  // Floating point edge: return the last weighted item.
  for (let i = items.length - 1; i >= 0; i--) if (weights[i] > 0) return items[i];
  return null;
}

/**
 * Build a rotation order: higher priority first, and within the same priority
 * a weighted shuffle (heavier items tend to come first).
 */
export function orderForRotation<T>(
  items: T[],
  priorityFn: (item: T) => number,
  weightFn: (item: T) => number,
  rnd: () => number = Math.random,
): T[] {
  const byPriority = new Map<number, T[]>();
  for (const item of items) {
    const p = priorityFn(item) || 0;
    if (!byPriority.has(p)) byPriority.set(p, []);
    byPriority.get(p)!.push(item);
  }
  const priorities = [...byPriority.keys()].sort((a, b) => b - a);
  const out: T[] = [];
  for (const p of priorities) {
    const pool = [...byPriority.get(p)!];
    while (pool.length) {
      const picked = pickWeighted(pool, weightFn, rnd) ?? pool[0];
      out.push(picked);
      pool.splice(pool.indexOf(picked), 1);
    }
  }
  return out;
}

/**
 * Split text into segments so money amounts / percentages can be highlighted
 * without dangerouslySetInnerHTML. e.g. "Get $325 back" ->
 * [{text:'Get '}, {text:'$325', highlight:true}, {text:' back'}]
 */
export function splitHighlightSegments(text: string): Array<{ text: string; highlight: boolean }> {
  const re = /(\$[\d,]+(?:\.\d{2})?|\d+(?:\.\d+)?%)/g;
  const segments: Array<{ text: string; highlight: boolean }> = [];
  let last = 0;
  for (const match of text.matchAll(re)) {
    const start = match.index ?? 0;
    if (start > last) segments.push({ text: text.slice(last, start), highlight: false });
    segments.push({ text: match[0], highlight: true });
    last = start + match[0].length;
  }
  if (last < text.length) segments.push({ text: text.slice(last), highlight: false });
  return segments;
}
