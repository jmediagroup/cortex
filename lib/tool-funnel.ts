/**
 * The monetization funnel's event contract (docs/monetization/HANDOFF.md,
 * task 0.2) and the pure helpers that keep its payloads free of PII.
 *
 * Standing rule 8: analytics never carry PII or raw financial inputs — only
 * tool ids, short slugs/buckets and booleans. `sanitizeFunnelData` enforces
 * that for every funnel event: `trackEvent` and `trackServerEvent` run it, so
 * a later phase cannot send an email address or a dollar figure by accident.
 * Anything not on the allow list below is dropped, not stored.
 *
 * No browser, React or Supabase imports, so Node's test runner can load it.
 */
import { TOOL_IDS } from './ads/types';

export const FUNNEL_EVENTS = [
  'tool_viewed',
  'tool_calculation_completed',
  'result_exit_intent',
  'offer_impression',
  'offer_click',
  'report_email_requested',
  'report_email_sent',
  'unlock_cta_viewed',
  'unlock_cta_clicked',
  'checkout_started',
  'checkout_completed',
  'advisor_intake_started',
  'advisor_intake_submitted',
] as const;
export type FunnelEvent = (typeof FUNNEL_EVENTS)[number];

/** The only keys each funnel event may carry. */
export const FUNNEL_EVENT_KEYS: Record<FunnelEvent, readonly string[]> = {
  tool_viewed: ['tool_id', 'referrer_host', 'utm_source', 'utm_medium', 'utm_campaign', 'is_landing_page'],
  tool_calculation_completed: ['tool_id', 'is_logged_in', 'from_scenario', 'input_bucket'],
  result_exit_intent: ['tool_id', 'time_after_result'],
  offer_impression: ['tool_id', 'campaign_slug', 'placement_slug'],
  offer_click: ['tool_id', 'campaign_slug', 'placement_slug'],
  report_email_requested: ['tool_id', 'consent_marketing'],
  report_email_sent: ['tool_id', 'consent_marketing'],
  unlock_cta_viewed: ['tool_id', 'plan'],
  unlock_cta_clicked: ['tool_id', 'plan'],
  checkout_started: ['plan', 'billing', 'tool_id'],
  checkout_completed: ['plan', 'billing', 'tool_id'],
  advisor_intake_started: ['tool_id', 'asset_band'],
  advisor_intake_submitted: ['tool_id', 'asset_band'],
};

/** Keys whose value must be a boolean. Every other key takes a short slug. */
const BOOLEAN_KEYS = new Set(['is_logged_in', 'from_scenario', 'is_landing_page', 'consent_marketing']);

/** Checkout can start outside a tool (e.g. /pricing); every other event belongs to one. */
const TOOL_OPTIONAL = new Set<FunnelEvent>(['checkout_started', 'checkout_completed']);

const MAX_SLUG_LENGTH = 64;

export function isFunnelEvent(eventType: string): eventType is FunnelEvent {
  return (FUNNEL_EVENTS as readonly string[]).includes(eventType);
}

/**
 * Lower-cases a value into a short slug (`a-z 0-9 . _ : -`), or returns null
 * for anything that could be personal or financial: an email address, a bare
 * number or amount ("85000", "$1,200.50"), or nothing usable at all.
 */
export function toSafeSlug(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const raw = value.trim();
  if (!raw || raw.includes('@') || /^[\d\s$€£.,%+-]+$/.test(raw)) return null;
  const slug = raw
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9._:-]/g, '')
    .slice(0, MAX_SLUG_LENGTH);
  return slug || null;
}

/**
 * The payload a funnel event may store: allowed keys only, booleans where a
 * boolean is expected, safe slugs everywhere else. Returns null when the event
 * should not be recorded at all: its `tool_id` is missing (where one is
 * required) or isn't a known tool.
 */
export function sanitizeFunnelData(
  eventType: FunnelEvent,
  data: Record<string, unknown> | null | undefined,
): Record<string, string | boolean> | null {
  const out: Record<string, string | boolean> = {};
  for (const key of FUNNEL_EVENT_KEYS[eventType]) {
    const value = data?.[key];
    if (value === undefined || value === null) continue;
    if (BOOLEAN_KEYS.has(key)) {
      if (typeof value === 'boolean') out[key] = value;
      continue;
    }
    const slug = toSafeSlug(value);
    if (slug) out[key] = slug;
  }
  const hasTool = data?.tool_id !== undefined && data?.tool_id !== null;
  if (hasTool ? !isKnownTool(out.tool_id) : !TOOL_OPTIONAL.has(eventType)) return null;
  return out;
}

export function isKnownTool(toolId: unknown): toolId is string {
  return typeof toolId === 'string' && (TOOL_IDS as readonly string[]).includes(toolId);
}

// ---------------------------------------------------------------------------
// Acquisition source, captured once per browser session
// ---------------------------------------------------------------------------

/** Our own domains: a referrer from any of them is internal navigation. */
const OWN_HOSTS = ['moneyguymutants.com', 'cortex.vip'];

export interface SessionAttribution {
  referrer_host?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

/**
 * The host of an external referrer ("google.com"), never its path or query —
 * those can carry search terms or personal data. Null for none, for a
 * malformed value, or for our own site.
 */
export function referrerHost(referrer: string | null | undefined, ownHost: string): string | null {
  if (!referrer) return null;
  let host: string;
  try {
    host = new URL(referrer).hostname.toLowerCase();
  } catch {
    return null;
  }
  const bare = host.replace(/^www\./, '');
  const own = ownHost.toLowerCase().replace(/^www\./, '');
  if (!bare || bare === own || OWN_HOSTS.includes(bare)) return null;
  return toSafeSlug(bare);
}

/** First-touch attribution for a session from the landing page's referrer and URL. */
export function buildAttribution(referrer: string, search: string, ownHost: string): SessionAttribution {
  const params = new URLSearchParams(search);
  const attribution: SessionAttribution = {};
  const host = referrerHost(referrer, ownHost);
  if (host) attribution.referrer_host = host;
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign'] as const) {
    const value = toSafeSlug(params.get(key));
    if (value) attribution[key] = value;
  }
  return attribution;
}

/**
 * Crawlers, link previews and headless browsers. Keep in step with the
 * user-agent filter in v_scorecard_events
 * (supabase/migrations/20260929120000_monetization_scorecard.sql).
 */
export const BOT_USER_AGENT =
  /(bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|facebookexternalhit|embedly|python|curl|wget|httpclient|puppeteer|playwright|selenium|phantomjs)/i;

export function isLikelyBot(userAgent: string | null | undefined): boolean {
  return BOT_USER_AGENT.test(userAgent ?? '');
}

// ---------------------------------------------------------------------------
// Completion timing
// ---------------------------------------------------------------------------

/**
 * Calculators recompute live as inputs change, so a result is on screen from
 * the first render. A calculation counts as completed once the visitor has
 * changed something and then left the inputs alone this long — long enough
 * to read the new result, short enough not to miss quick visits.
 */
export const COMPLETION_SETTLE_MS = 1500;

/** Coarse bucket for how long a visitor stayed after their result. */
export function timeAfterResultBucket(ms: number): string {
  const s = ms / 1000;
  if (s < 10) return 'under-10s';
  if (s < 60) return '10-60s';
  if (s < 300) return '1-5m';
  return 'over-5m';
}
