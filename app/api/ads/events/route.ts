import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit';
import { isUuid } from '@/lib/ads/validation';
import { AD_FORMATS, AD_TIERS, TOOL_IDS } from '@/lib/ads/types';

const EVENT_TYPES = ['impression', 'click'] as const;
const SLUG_RE = /^[a-z0-9-]{1,64}$/;

const noContent = () => new NextResponse(null, { status: 204 });

function optionalString(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null;
  const v = value.trim();
  return v && v.length <= max ? v : null;
}

/**
 * POST /api/ads/events
 * Impression/click beacon. Accepts JSON (fetch) or a text body (sendBeacon).
 * Always answers 204 — tracking must never break the page. Events for
 * fallback ads (no campaign id) are acknowledged but not stored.
 */
export async function POST(request: NextRequest) {
  let payload: Record<string, unknown>;
  try {
    const raw = await request.text();
    payload = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
  } catch {
    return noContent();
  }
  if (!payload || typeof payload !== 'object') return noContent();

  const type = payload.type;
  if (!EVENT_TYPES.includes(type as (typeof EVENT_TYPES)[number])) return noContent();

  const sessionId = optionalString(payload.sessionId, 100);
  const limiterKey = `ad-events:${sessionId ?? getClientIP(request.headers)}`;
  const limit = checkRateLimit(limiterKey, RATE_LIMITS.adEvents);
  if (!limit.success) return new NextResponse(null, { status: 429 });

  // Fallback ads carry no campaign — nothing to attribute, so skip the insert.
  if (!isUuid(payload.campaignId)) return noContent();

  const placement = optionalString(payload.placement, 64);
  const toolId = optionalString(payload.toolId, 64);
  const format = optionalString(payload.format, 32);
  const tier = optionalString(payload.tier, 32);

  const row = {
    event_type: type as (typeof EVENT_TYPES)[number],
    campaign_id: payload.campaignId as string,
    creative_id: isUuid(payload.creativeId) ? payload.creativeId : null,
    advertiser_id: isUuid(payload.advertiserId) ? payload.advertiserId : null,
    placement_slug: placement && SLUG_RE.test(placement) ? placement : null,
    tool_id: toolId && (TOOL_IDS as readonly string[]).includes(toolId) ? toolId : null,
    format: format && (AD_FORMATS as readonly string[]).includes(format) ? format : null,
    session_id: sessionId,
    tier: tier && (AD_TIERS as readonly string[]).includes(tier) ? tier : null,
    page_path: optionalString(payload.pagePath, 300),
  };

  try {
    const supabase = createServiceClient();
    const { error } = await supabase.from('ad_events').insert(row);
    if (error) console.error('[ads] event insert failed:', error.message);
  } catch (error) {
    console.error('[ads] event insert failed:', error);
  }

  return noContent();
}
