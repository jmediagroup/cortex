import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';
import { errorResponse } from '@/lib/auth-helpers';
import { requireAdmin } from '@/lib/cms/admin';
import { AdsValidationError, isUuid, pickAdvertiserFields, revalidateAds } from '@/lib/ads/admin';

type Params = { params: Promise<{ id: string }> };

/** GET /api/admin/ads/advertisers/:id */
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const denied = await requireAdmin(request);
    if (denied) return denied;

    const { id } = await params;
    if (!isUuid(id)) return errorResponse('Advertiser not found', 404);

    const supabase = createServiceClient();
    const { data, error } = await supabase.from('ad_advertisers').select('*').eq('id', id).maybeSingle();
    if (error || !data) return errorResponse('Advertiser not found', 404);
    return NextResponse.json({ advertiser: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[ads advertiser get] Unexpected error:', error);
    return errorResponse(message, 500);
  }
}

/** PATCH /api/admin/ads/advertisers/:id */
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const denied = await requireAdmin(request);
    if (denied) return denied;

    const { id } = await params;
    if (!isUuid(id)) return errorResponse('Advertiser not found', 404);

    const body = await request.json();
    const updates = pickAdvertiserFields(body, { partial: true });
    if (Object.keys(updates).length === 0) return NextResponse.json({ id });

    const supabase = createServiceClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('ad_advertisers') as any)
      .update(updates)
      .eq('id', id)
      .select('id,slug')
      .maybeSingle();
    if (error) {
      if (error.code === '23505') return errorResponse('An advertiser with that slug already exists', 409);
      console.error('[ads advertiser update] Error:', error);
      return errorResponse('Failed to update advertiser', 500);
    }
    if (!data) return errorResponse('Advertiser not found', 404);

    revalidateAds();
    return NextResponse.json({ id: data.id, slug: data.slug });
  } catch (error) {
    if (error instanceof AdsValidationError) return errorResponse(error.message, 400);
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[ads advertiser update] Unexpected error:', error);
    return errorResponse(message, 500);
  }
}

/** DELETE /api/admin/ads/advertisers/:id — cascades to campaigns + creatives. */
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const denied = await requireAdmin(request);
    if (denied) return denied;

    const { id } = await params;
    if (!isUuid(id)) return errorResponse('Advertiser not found', 404);

    const supabase = createServiceClient();
    const { error } = await supabase.from('ad_advertisers').delete().eq('id', id);
    if (error) {
      console.error('[ads advertiser delete] Error:', error);
      return errorResponse('Failed to delete advertiser', 500);
    }

    revalidateAds();
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[ads advertiser delete] Unexpected error:', error);
    return errorResponse(message, 500);
  }
}
