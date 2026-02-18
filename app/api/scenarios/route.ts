import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';
import { authenticateRequest, isAuthError, unauthorizedResponse } from '@/lib/auth-helpers';
import { hasProAccess, type Tier } from '@/lib/access-control';

// GET /api/scenarios - List all scenarios for the authenticated user
export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (isAuthError(auth)) return unauthorizedResponse(auth.error);

  const supabase = createServiceClient() as any;

  const { data, error } = await supabase
    .from('scenarios')
    .select('*')
    .eq('user_id', auth.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ scenarios: data });
}

// POST /api/scenarios - Save a new scenario
export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (isAuthError(auth)) return unauthorizedResponse(auth.error);

  const supabase = createServiceClient() as any;
  const body = await request.json();

  const { tool_id, tool_name, inputs, key_result } = body;

  if (!tool_id || !tool_name || !inputs) {
    return NextResponse.json({ error: 'Missing required fields: tool_id, tool_name, inputs' }, { status: 400 });
  }

  // Check user tier for save limits
  const { data: userData } = await supabase
    .from('users')
    .select('subscription_status')
    .eq('id', auth.user.id)
    .single();

  const userTier = ((userData as { subscription_status?: string } | null)?.subscription_status === 'active' ? 'finance' : 'free') as Tier;
  const isPro = hasProAccess('finance', userTier);

  if (!isPro) {
    // Free users: max 1 scenario per tool
    const { count } = await supabase
      .from('scenarios')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', auth.user.id)
      .eq('tool_id', tool_id);

    if (count && count >= 1) {
      return NextResponse.json(
        { error: 'FREE_LIMIT_REACHED', message: 'Free accounts can save 1 scenario per tool. Upgrade to Pro for unlimited saves.' },
        { status: 403 }
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('scenarios')
    .insert({
      user_id: auth.user.id,
      tool_id,
      tool_name,
      inputs,
      key_result: key_result || '',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ scenario: data }, { status: 201 });
}

// DELETE /api/scenarios - Delete a scenario by id
export async function DELETE(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (isAuthError(auth)) return unauthorizedResponse(auth.error);

  const supabase = createServiceClient() as any;
  const { searchParams } = new URL(request.url);
  const scenarioId = searchParams.get('id');

  if (!scenarioId) {
    return NextResponse.json({ error: 'Missing scenario id' }, { status: 400 });
  }

  // Verify ownership before deleting
  const { data: existing } = await supabase
    .from('scenarios')
    .select('user_id')
    .eq('id', scenarioId)
    .single();

  if (!existing || existing.user_id !== auth.user.id) {
    return NextResponse.json({ error: 'Scenario not found' }, { status: 404 });
  }

  const { error } = await supabase
    .from('scenarios')
    .delete()
    .eq('id', scenarioId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
