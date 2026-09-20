import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';
import { errorResponse } from '@/lib/auth-helpers';
import { requireAdmin } from '@/lib/cms/admin';

/** GET /api/admin/ads/placements — every placement (slugs are fixed in code). */
export async function GET(request: NextRequest) {
  try {
    const denied = await requireAdmin(request);
    if (denied) return denied;

    const supabase = createServiceClient();
    const { data, error } = await supabase.from('ad_placements').select('*').order('slug', { ascending: true });
    if (error) {
      console.error('[ads placements list] Error:', error);
      return errorResponse('Failed to load placements', 500);
    }
    return NextResponse.json({ placements: data ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[ads placements list] Unexpected error:', error);
    return errorResponse(message, 500);
  }
}
