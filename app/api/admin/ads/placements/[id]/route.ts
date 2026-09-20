import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';
import { errorResponse } from '@/lib/auth-helpers';
import { requireAdmin } from '@/lib/cms/admin';
import { AdsValidationError, isUuid, pickPlacementFields, revalidateAds } from '@/lib/ads/admin';

type Params = { params: Promise<{ id: string }> };

/** PATCH /api/admin/ads/placements/:id — name, formats, rotation, active. */
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const denied = await requireAdmin(request);
    if (denied) return denied;

    const { id } = await params;
    if (!isUuid(id)) return errorResponse('Placement not found', 404);

    const body = await request.json();
    const updates = pickPlacementFields(body);
    if (Object.keys(updates).length === 0) return NextResponse.json({ id });

    const supabase = createServiceClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('ad_placements') as any)
      .update(updates)
      .eq('id', id)
      .select('id,slug')
      .maybeSingle();
    if (error) {
      console.error('[ads placement update] Error:', error);
      return errorResponse('Failed to update placement', 500);
    }
    if (!data) return errorResponse('Placement not found', 404);

    revalidateAds();
    return NextResponse.json({ id: data.id, slug: data.slug });
  } catch (error) {
    if (error instanceof AdsValidationError) return errorResponse(error.message, 400);
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[ads placement update] Unexpected error:', error);
    return errorResponse(message, 500);
  }
}
