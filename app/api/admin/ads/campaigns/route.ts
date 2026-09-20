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
} from '@/lib/ads/admin';
import { CAMPAIGN_STATUSES, TOOL_IDS } from '@/lib/ads/types';

const LIST_SELECT =
  '*,ad_advertisers(id,slug,name,is_active),ad_placements(id,slug,name),ad_creatives(count)';

/**
 * GET /api/admin/ads/campaigns?status=&tool=&advertiser=
 * Campaign rows for the admin table with advertiser/placement embedded.
 */
export async function GET(request: NextRequest) {
  try {
    const denied = await requireAdmin(request);
    if (denied) return denied;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const tool = searchParams.get('tool');
    const advertiser = searchParams.get('advertiser');

    const supabase = createServiceClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase.from('ad_campaigns') as any)
      .select(LIST_SELECT)
      .order('priority', { ascending: false })
      .order('updated_at', { ascending: false })
      .limit(500);
    if (status && (CAMPAIGN_STATUSES as readonly string[]).includes(status)) query = query.eq('status', status);
    if (tool && (TOOL_IDS as readonly string[]).includes(tool)) {
      query = query.or(`tool_ids.is.null,tool_ids.cs.{${tool}}`);
    }
    if (advertiser && isUuid(advertiser)) query = query.eq('advertiser_id', advertiser);

    const { data, error } = await query;
    if (error) {
      console.error('[ads campaigns list] Error:', error);
      return errorResponse('Failed to load campaigns', 500);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const campaigns = (data ?? []).map(({ ad_creatives, ad_advertisers, ad_placements, ...row }: any) => ({
      ...row,
      advertiser: ad_advertisers ?? null,
      placement: ad_placements ?? null,
      creative_count: Array.isArray(ad_creatives) && ad_creatives[0] ? Number(ad_creatives[0].count) : 0,
    }));
    return NextResponse.json({ campaigns });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[ads campaigns list] Unexpected error:', error);
    return errorResponse(message, 500);
  }
}

/**
 * POST /api/admin/ads/campaigns — create a campaign (+ optional creatives).
 */
export async function POST(request: NextRequest) {
  try {
    const denied = await requireAdmin(request);
    if (denied) return denied;

    const body = await request.json();
    const insert = pickCampaignFields(body);
    const creatives = body.creatives !== undefined ? validateCreatives(body.creatives) : [];

    const supabase = createServiceClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('ad_campaigns') as any)
      .insert(insert)
      .select('id')
      .single();
    if (error) {
      if (error.code === '23503') return errorResponse('Advertiser or placement does not exist', 400);
      console.error('[ads campaign create] Error:', error);
      return errorResponse('Failed to create campaign', 500);
    }

    if (creatives.length) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: creativeError } = await (supabase.from('ad_creatives') as any).insert(
        creatives.map((c) => ({
          campaign_id: data.id,
          format: c.format,
          headline: c.headline,
          body: c.body,
          body_line2: c.body_line2,
          cta: c.cta,
          weight: c.weight,
          is_active: c.is_active,
        })),
      );
      if (creativeError) {
        console.error('[ads campaign create] Creative insert error:', creativeError);
        return errorResponse('Campaign created but creatives failed to save', 500);
      }
    }

    revalidateAds((insert.tool_ids as string[] | null | undefined) ?? undefined);
    return NextResponse.json({ id: data.id }, { status: 201 });
  } catch (error) {
    if (error instanceof AdsValidationError) return errorResponse(error.message, 400);
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[ads campaign create] Unexpected error:', error);
    return errorResponse(message, 500);
  }
}
