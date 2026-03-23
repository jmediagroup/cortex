import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';

// GET /api/scenarios/shared/[token] - Fetch a public shared scenario (no auth required)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  }

  const supabase = createServiceClient() as any;

  const { data, error } = await supabase
    .from('scenarios')
    .select('tool_id, tool_name, inputs, key_result, share_token')
    .eq('share_token', token)
    .eq('is_public', true)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Scenario not found' }, { status: 404 });
  }

  return NextResponse.json({ scenario: data });
}
