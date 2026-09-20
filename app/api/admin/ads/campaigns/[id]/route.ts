import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';
import { errorResponse } from '@/lib/auth-helpers';
import { requireAdmin } from '@/lib/cms/admin';
import {
  AdsValidationError,
  isUuid,
  pickCampaignFields,
  revalidateAds,
  validateCreatives,
  type CreativeInput,
} from '@/lib/ads/admin';

type Params = { params: Promise<{ id: string }> };

const FULL_SELECT = '*,ad_advertisers(*),ad_placements(*),ad_creatives(*)';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function shapeCampaign(row: any) {
  const { ad_advertisers, ad_placements, ad_creatives, ...campaign } = row;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const creatives = [...((ad_creatives ?? []) as any[])].sort(
    (a, b) => String(a.format).localeCompare(String(b.format)) || String(a.created_at).localeCompare(String(b.created_at)),
  );
  return { ...campaign, advertiser: ad_advertisers ?? null, placement: ad_placements ?? null, creatives };
}

/** GET /api/admin/ads/campaigns/:id — campaign + advertiser + placement + creatives. */
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const denied = await requireAdmin(request);
    if (denied) return denied;

    const { id } = await params;
    if (!isUuid(id)) return errorResponse('Campaign not found', 404);

    const supabase = createServiceClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('ad_campaigns') as any)
      .select(FULL_SELECT)
      .eq('id', id)
      .maybeSingle();
    if (error || !data) return errorResponse('Campaign not found', 404);
    return NextResponse.json({ campaign: shapeCampaign(data) });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[ads campaign get] Unexpected error:', error);
    return errorResponse(message, 500);
  }
}

/**
 * Full sync of a campaign's creatives: rows with an id are updated, rows
 * without one are inserted, and existing rows missing from the list are deleted.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function syncCreatives(supabase: any, campaignId: string, creatives: CreativeInput[]): Promise<string | null> {
  const { data: existingRows, error: loadError } = await supabase
    .from('ad_creatives')
    .select('id')
    .eq('campaign_id', campaignId);
  if (loadError) return loadError.message;
  const existing = new Set<string>((existingRows ?? []).map((r: { id: string }) => r.id));

  const keep = new Set<string>();
  const inserts: Array<Omit<CreativeInput, 'id'> & { campaign_id: string }> = [];
  for (const creative of creatives) {
    const { id, ...fields } = creative;
    if (id && existing.has(id)) {
      keep.add(id);
      const { error } = await supabase.from('ad_creatives').update(fields).eq('id', id).eq('campaign_id', campaignId);
      if (error) return error.message;
    } else {
      inserts.push({ ...fields, campaign_id: campaignId });
    }
  }
  if (inserts.length) {
    const { error } = await supabase.from('ad_creatives').insert(inserts);
    if (error) return error.message;
  }
  const remove = [...existing].filter((id) => !keep.has(id));
  if (remove.length) {
    const { error } = await supabase.from('ad_creatives').delete().in('id', remove).eq('campaign_id', campaignId);
    if (error) return error.message;
  }
  return null;
}

/** PATCH /api/admin/ads/campaigns/:id — update fields and/or sync creatives. */
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const denied = await requireAdmin(request);
    if (denied) return denied;

    const { id } = await params;
    if (!isUuid(id)) return errorResponse('Campaign not found', 404);

    const body = await request.json();
    const updates = pickCampaignFields(body, { partial: true });
    const creatives = body.creatives !== undefined ? validateCreatives(body.creatives) : null;

    const supabase = createServiceClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabase as any;
    const { data: existing } = await sb.from('ad_campaigns').select('id,tool_ids').eq('id', id).maybeSingle();
    if (!existing) return errorResponse('Campaign not found', 404);

    if (Object.keys(updates).length > 0) {
      const { error } = await sb.from('ad_campaigns').update(updates).eq('id', id);
      if (error) {
        if (error.code === '23503') return errorResponse('Advertiser or placement does not exist', 400);
        console.error('[ads campaign update] Error:', error);
        return errorResponse('Failed to update campaign', 500);
      }
    }

    if (creatives) {
      const syncError = await syncCreatives(sb, id, creatives);
      if (syncError) {
        console.error('[ads campaign update] Creative sync error:', syncError);
        return errorResponse('Failed to save creatives', 500);
      }
    }

    revalidateAds([...(existing.tool_ids ?? []), ...((updates.tool_ids as string[] | null | undefined) ?? [])]);
    return NextResponse.json({ id });
  } catch (error) {
    if (error instanceof AdsValidationError) return errorResponse(error.message, 400);
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[ads campaign update] Unexpected error:', error);
    return errorResponse(message, 500);
  }
}

/** DELETE /api/admin/ads/campaigns/:id — creatives cascade; events keep a null campaign. */
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const denied = await requireAdmin(request);
    if (denied) return denied;

    const { id } = await params;
    if (!isUuid(id)) return errorResponse('Campaign not found', 404);

    const supabase = createServiceClient();
    const { error } = await supabase.from('ad_campaigns').delete().eq('id', id);
    if (error) {
      console.error('[ads campaign delete] Error:', error);
      return errorResponse('Failed to delete campaign', 500);
    }

    revalidateAds();
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[ads campaign delete] Unexpected error:', error);
    return errorResponse(message, 500);
  }
}
