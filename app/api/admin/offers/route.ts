import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';
import { errorResponse } from '@/lib/auth-helpers';
import { requireAdmin } from '@/lib/cms/admin';
import { loadOfferCampaigns } from '@/lib/offers/server';
import { offerBlockers, offersEnabled } from '@/lib/offers/eligibility';
import { parseConversionsCsv } from '@/lib/offers/conversions';

export const dynamic = 'force-dynamic';

/** The offers migration hasn't been applied to this database yet. */
function isMissingSchema(message: string): boolean {
  return /does not exist|could not find|schema cache/i.test(message);
}

/**
 * GET /api/admin/offers
 * Every after-the-result campaign with what still blocks it (same rules as
 * the site), plus the latest recorded conversions. Admin only.
 */
export async function GET(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  try {
    const enabled = offersEnabled();
    const rows = await loadOfferCampaigns();
    const campaigns = rows.map(({ placementSlug, advertiser, campaign, creatives }) => {
      const reasons = new Set<string>();
      const active = creatives.filter((c) => c.is_active);
      const creativeList = active.length ? active : [null];
      for (const creative of creativeList) {
        offerBlockers({ enabled, placementSlug, advertiser, campaign, creative }).forEach((r) => reasons.add(r));
      }
      return {
        id: campaign.id,
        slug: campaign.slug,
        name: campaign.name ?? campaign.slug ?? campaign.id,
        status: campaign.status,
        toolIds: campaign.tool_ids,
        advertiserName: advertiser?.name ?? null,
        programStatus: advertiser?.program_status ?? null,
        blockers: [...reasons],
      };
    });

    const supabase = createServiceClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: conversions, error } = await (supabase.from('offer_conversions') as any)
      .select('id,occurred_on,status,amount_cents,source,external_id,tool_id,note,ad_campaigns(slug)')
      .order('occurred_on', { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);

    return NextResponse.json({ enabled, campaigns, conversions: conversions ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (isMissingSchema(message)) return NextResponse.json({ setupRequired: true });
    console.error('[admin offers] load failed:', message);
    return errorResponse('Could not load offers', 500);
  }
}

/**
 * POST /api/admin/offers  { csv: string }
 * Imports a network conversion report. Rows with a network id update the
 * row already imported under that id; rows without one are added.
 */
export async function POST(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  let csv: unknown;
  try {
    csv = (await request.json())?.csv;
  } catch {
    return errorResponse('Send JSON: { "csv": "..." }', 400);
  }
  if (typeof csv !== 'string' || !csv.trim()) return errorResponse('Paste the CSV first', 400);
  if (csv.length > 1_000_000) return errorResponse('That file is too large; split it up', 400);

  const { rows, errors } = parseConversionsCsv(csv);
  if (!rows.length) return NextResponse.json({ imported: 0, errors }, { status: errors.length ? 400 : 200 });

  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const slugs = [...new Set(rows.map((r) => r.campaignSlug))];
  const { data: campaigns, error: campaignError } = await sb.from('ad_campaigns').select('id,slug').in('slug', slugs);
  if (campaignError) return errorResponse('Could not look up campaigns', 500);
  const idBySlug = new Map<string, string>((campaigns ?? []).map((c: { id: string; slug: string }) => [c.slug, c.id]));

  const unknown = slugs.filter((s) => !idBySlug.has(s));
  for (const s of unknown) errors.push(`No campaign with the slug "${s}"; those rows were skipped.`);

  const records = rows
    .filter((r) => idBySlug.has(r.campaignSlug))
    .map(({ campaignSlug, ...r }) => ({ ...r, campaign_id: idBySlug.get(campaignSlug), source: 'csv' }));
  const withId = records.filter((r) => r.external_id);
  const withoutId = records.filter((r) => !r.external_id);

  if (withId.length) {
    const { error } = await sb.from('offer_conversions').upsert(withId, { onConflict: 'external_id' });
    if (error) return errorResponse(`Import failed: ${error.message}`, 500);
  }
  if (withoutId.length) {
    const { error } = await sb.from('offer_conversions').insert(withoutId);
    if (error) return errorResponse(`Import failed: ${error.message}`, 500);
  }
  return NextResponse.json({ imported: records.length, errors });
}
