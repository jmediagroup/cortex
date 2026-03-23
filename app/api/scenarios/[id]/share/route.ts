import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';
import { authenticateRequest, isAuthError, unauthorizedResponse } from '@/lib/auth-helpers';

// POST /api/scenarios/[id]/share - Make a scenario public and return its share URL
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest(request);
  if (isAuthError(auth)) return unauthorizedResponse(auth.error);

  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'Missing scenario id' }, { status: 400 });
  }

  const supabase = createServiceClient() as any;

  // Verify ownership
  const { data: existing } = await supabase
    .from('scenarios')
    .select('user_id, share_token')
    .eq('id', id)
    .single();

  if (!existing || existing.user_id !== auth.user.id) {
    return NextResponse.json({ error: 'Scenario not found' }, { status: 404 });
  }

  // Set is_public = true
  const { data, error } = await supabase
    .from('scenarios')
    .update({ is_public: true })
    .eq('id', id)
    .select('share_token')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    share_token: data.share_token,
    share_url: `https://cortex.vip/s/${data.share_token}`,
  });
}
