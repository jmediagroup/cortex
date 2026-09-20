import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';
import { errorResponse } from '@/lib/auth-helpers';
import { requireAdmin } from '@/lib/cms/admin';
import { AdsValidationError, pickAdvertiserFields, revalidateAds } from '@/lib/ads/admin';

/**
 * GET /api/admin/ads/advertisers — every advertiser + its campaign count.
 */
export async function GET(request: NextRequest) {
  try {
    const denied = await requireAdmin(request);
    if (denied) return denied;

    const supabase = createServiceClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('ad_advertisers') as any)
      .select('*,ad_campaigns(count)')
      .order('name', { ascending: true });
    if (error) {
      console.error('[ads advertisers list] Error:', error);
      return errorResponse('Failed to load advertisers', 500);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const advertisers = (data ?? []).map(({ ad_campaigns, ...row }: any) => ({
      ...row,
      campaign_count: Array.isArray(ad_campaigns) && ad_campaigns[0] ? Number(ad_campaigns[0].count) : 0,
    }));
    return NextResponse.json({ advertisers });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[ads advertisers list] Unexpected error:', error);
    return errorResponse(message, 500);
  }
}

/**
 * POST /api/admin/ads/advertisers — create an advertiser.
 */
export async function POST(request: NextRequest) {
  try {
    const denied = await requireAdmin(request);
    if (denied) return denied;

    const body = await request.json();
    const insert = pickAdvertiserFields(body);

    const supabase = createServiceClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('ad_advertisers') as any)
      .insert(insert)
      .select('id,slug')
      .single();
    if (error) {
      if (error.code === '23505') return errorResponse('An advertiser with that slug already exists', 409);
      console.error('[ads advertiser create] Error:', error);
      return errorResponse('Failed to create advertiser', 500);
    }

    revalidateAds();
    return NextResponse.json({ id: data.id, slug: data.slug }, { status: 201 });
  } catch (error) {
    if (error instanceof AdsValidationError) return errorResponse(error.message, 400);
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[ads advertiser create] Unexpected error:', error);
    return errorResponse(message, 500);
  }
}
