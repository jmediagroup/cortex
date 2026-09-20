/**
 * Pure validation helpers for the ads admin API. Kept free of server-only
 * imports so they can be unit-tested (tests/ads.test.mjs) and reused by the
 * admin editors for client-side feedback.
 */
import {
  AD_FORMATS,
  AD_TIERS,
  ADVERTISER_CATEGORIES,
  CAMPAIGN_STATUSES,
  CREATIVE_LIMITS,
  TOOL_IDS,
  type AdFormat,
} from './types';

export class AdsValidationError extends Error {}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_RE.test(value);
}

export function slugify(input: string): string {
  const slug = (input || '')
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return slug || 'untitled';
}

type Body = Record<string, unknown>;

function str(value: unknown, field: string, { required = false, max = 2000 } = {}): string | null {
  if (value === undefined || value === null) {
    if (required) throw new AdsValidationError(`${field} is required`);
    return null;
  }
  if (typeof value !== 'string') throw new AdsValidationError(`${field} must be a string`);
  const trimmed = value.trim();
  if (required && !trimmed) throw new AdsValidationError(`${field} is required`);
  if (trimmed.length > max) throw new AdsValidationError(`${field} must be ${max} characters or fewer`);
  return trimmed || null;
}

function bool(value: unknown, field: string): boolean {
  if (typeof value !== 'boolean') throw new AdsValidationError(`${field} must be true or false`);
  return value;
}

function int(value: unknown, field: string, { min = -Infinity, max = Infinity } = {}): number {
  const n = typeof value === 'string' ? Number(value) : value;
  if (typeof n !== 'number' || !Number.isInteger(n)) throw new AdsValidationError(`${field} must be an integer`);
  if (n < min) throw new AdsValidationError(`${field} must be at least ${min}`);
  if (n > max) throw new AdsValidationError(`${field} must be at most ${max}`);
  return n;
}

function stringArray(value: unknown, field: string, allowed?: readonly string[]): string[] {
  if (!Array.isArray(value)) throw new AdsValidationError(`${field} must be an array`);
  const out: string[] = [];
  for (const v of value) {
    if (typeof v !== 'string') throw new AdsValidationError(`${field} must contain only strings`);
    const s = v.trim();
    if (!s) continue;
    if (allowed && !allowed.includes(s)) throw new AdsValidationError(`${field}: unknown value "${s}"`);
    if (!out.includes(s)) out.push(s);
  }
  return out;
}

function timestamp(value: unknown, field: string): string | null {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string') throw new AdsValidationError(`${field} must be an ISO timestamp`);
  const t = Date.parse(value);
  if (Number.isNaN(t)) throw new AdsValidationError(`${field} must be an ISO timestamp`);
  return new Date(t).toISOString();
}

function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Advertisers
// ---------------------------------------------------------------------------

export const ADVERTISER_FIELDS = [
  'slug',
  'name',
  'url',
  'description',
  'tagline',
  'cta',
  'category',
  'is_active',
  'notes',
] as const;

/** Whitelist + validate advertiser columns. `partial` = PATCH semantics. */
export function pickAdvertiserFields(body: Body, { partial = false } = {}): Body {
  const out: Body = {};
  const has = (f: string) => body[f] !== undefined;

  if (has('name') || !partial) out.name = str(body.name, 'name', { required: true, max: 120 });
  if (has('slug')) out.slug = slugify(String(body.slug));
  else if (!partial) out.slug = slugify(String(out.name ?? ''));
  if (has('url') || !partial) {
    const url = str(body.url, 'url', { required: true, max: 2000 })!;
    if (!isHttpUrl(url)) throw new AdsValidationError('url must be an http(s) URL');
    out.url = url;
  }
  if (has('description')) out.description = str(body.description, 'description', { max: 500 });
  if (has('tagline')) out.tagline = str(body.tagline, 'tagline', { max: 120 });
  if (has('cta')) out.cta = str(body.cta, 'cta', { max: 30 });
  if (has('category') || !partial) {
    const category = str(body.category, 'category', { required: true }) as string;
    if (!ADVERTISER_CATEGORIES.includes(category as (typeof ADVERTISER_CATEGORIES)[number])) {
      throw new AdsValidationError('Invalid category');
    }
    out.category = category;
  }
  if (has('is_active')) out.is_active = bool(body.is_active, 'is_active');
  if (has('notes')) out.notes = str(body.notes, 'notes', { max: 2000 });
  return out;
}

// ---------------------------------------------------------------------------
// Placements (slug is immutable — the code references it)
// ---------------------------------------------------------------------------

export const PLACEMENT_FIELDS = ['name', 'formats', 'rotation_interval_ms', 'is_active'] as const;

export function pickPlacementFields(body: Body): Body {
  const out: Body = {};
  if (body.name !== undefined) out.name = str(body.name, 'name', { required: true, max: 120 });
  if (body.formats !== undefined) {
    const formats = stringArray(body.formats, 'formats', AD_FORMATS);
    if (!formats.length) throw new AdsValidationError('formats must include at least one format');
    out.formats = formats;
  }
  if (body.rotation_interval_ms !== undefined) {
    out.rotation_interval_ms = int(body.rotation_interval_ms, 'rotation_interval_ms', { min: 1000, max: 600000 });
  }
  if (body.is_active !== undefined) out.is_active = bool(body.is_active, 'is_active');
  return out;
}

// ---------------------------------------------------------------------------
// Campaigns
// ---------------------------------------------------------------------------

export const CAMPAIGN_FIELDS = [
  'advertiser_id',
  'placement_id',
  'name',
  'status',
  'tool_ids',
  'exclude_tool_ids',
  'weight',
  'priority',
  'starts_at',
  'ends_at',
  'hide_for_tiers',
  'notes',
] as const;

export function pickCampaignFields(body: Body, { partial = false } = {}): Body {
  const out: Body = {};
  const has = (f: string) => body[f] !== undefined;

  if (has('name') || !partial) out.name = str(body.name, 'name', { required: true, max: 160 });
  if (has('advertiser_id') || !partial) {
    if (!isUuid(body.advertiser_id)) throw new AdsValidationError('advertiser_id must be a valid id');
    out.advertiser_id = body.advertiser_id;
  }
  if (has('placement_id') || !partial) {
    if (!isUuid(body.placement_id)) throw new AdsValidationError('placement_id must be a valid id');
    out.placement_id = body.placement_id;
  }
  if (has('status')) {
    if (!CAMPAIGN_STATUSES.includes(body.status as (typeof CAMPAIGN_STATUSES)[number])) {
      throw new AdsValidationError('Invalid status');
    }
    out.status = body.status;
  }
  if (has('tool_ids')) {
    out.tool_ids = body.tool_ids === null ? null : stringArray(body.tool_ids, 'tool_ids', TOOL_IDS);
  }
  if (has('exclude_tool_ids')) {
    out.exclude_tool_ids =
      body.exclude_tool_ids === null ? [] : stringArray(body.exclude_tool_ids, 'exclude_tool_ids', TOOL_IDS);
  }
  if (has('weight')) out.weight = int(body.weight, 'weight', { min: 1, max: 1000 });
  if (has('priority')) out.priority = int(body.priority, 'priority', { min: -1000, max: 1000 });
  if (has('starts_at')) out.starts_at = timestamp(body.starts_at, 'starts_at');
  if (has('ends_at')) out.ends_at = timestamp(body.ends_at, 'ends_at');
  if (out.starts_at && out.ends_at && String(out.ends_at) <= String(out.starts_at)) {
    throw new AdsValidationError('ends_at must be after starts_at');
  }
  if (has('hide_for_tiers')) {
    out.hide_for_tiers = body.hide_for_tiers === null ? [] : stringArray(body.hide_for_tiers, 'hide_for_tiers', AD_TIERS);
  }
  if (has('notes')) out.notes = str(body.notes, 'notes', { max: 2000 });
  return out;
}

// ---------------------------------------------------------------------------
// Creatives
// ---------------------------------------------------------------------------

export interface CreativeInput {
  id?: string;
  format: AdFormat;
  headline: string;
  body: string | null;
  body_line2: string | null;
  cta: string;
  weight: number;
  is_active: boolean;
}

/** Validate one creative against its format's copy limits. */
export function validateCreative(raw: unknown, label = 'creative'): CreativeInput {
  if (!raw || typeof raw !== 'object') throw new AdsValidationError(`${label} must be an object`);
  const c = raw as Body;
  const format = c.format;
  if (!AD_FORMATS.includes(format as AdFormat)) throw new AdsValidationError(`${label}: invalid format`);
  const limits = CREATIVE_LIMITS[format as AdFormat];

  const headline = str(c.headline, `${label} headline`, { required: true, max: limits.headline })!;
  const cta = str(c.cta, `${label} CTA`, { required: true, max: limits.cta })!;
  let body: string | null = null;
  let body_line2: string | null = null;
  if (limits.body > 0) {
    body = str(c.body, `${label} body`, { max: limits.body });
    body_line2 = str(c.body_line2, `${label} body line 2`, { max: limits.body });
  }
  const weight = c.weight === undefined ? 1 : int(c.weight, `${label} weight`, { min: 1, max: 1000 });
  const is_active = c.is_active === undefined ? true : bool(c.is_active, `${label} is_active`);

  const out: CreativeInput = { format: format as AdFormat, headline, body, body_line2, cta, weight, is_active };
  if (c.id !== undefined && c.id !== null && c.id !== '') {
    if (!isUuid(c.id)) throw new AdsValidationError(`${label}: invalid id`);
    out.id = c.id;
  }
  return out;
}

export function validateCreatives(raw: unknown): CreativeInput[] {
  if (!Array.isArray(raw)) throw new AdsValidationError('creatives must be an array');
  return raw.map((c, i) => validateCreative(c, `Creative #${i + 1}`));
}

/** Remaining characters for an editor counter; negative means over the limit. */
export function remainingChars(format: AdFormat, field: 'headline' | 'body' | 'cta', value: string): number {
  return CREATIVE_LIMITS[format][field] - value.length;
}
