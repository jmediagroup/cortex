import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createServiceClient } from '@/lib/supabase/client';
import { authenticateRequest, isAuthError, unauthorizedResponse } from '@/lib/auth-helpers';
import { hasProAccess, type Tier } from '@/lib/access-control';
import { CALCULATOR_CONTENT } from '@/lib/calculator-content';

// Tool ids a scenario may be saved under: every calculator with content
// plus the two non-calculator tools that also save.
const VALID_TOOL_IDS = new Set<string>([
  ...Object.keys(CALCULATOR_CONTENT),
  'whats-your-why',
  'personality-quiz',
]);
// Inputs are a small bag of form values; cap the serialized size so a
// hostile client can't fill the row with megabytes of JSON.
const MAX_INPUTS_BYTES = 20 * 1024;
const MAX_TOOL_NAME_CHARS = 120;
const MAX_KEY_RESULT_CHARS = 500;

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v) && Object.getPrototypeOf(v) === Object.prototype;

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
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  if (!isPlainObject(body)) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { tool_id, tool_name, inputs, key_result } = body;

  if (!tool_id || !tool_name || !inputs) {
    return NextResponse.json({ error: 'Missing required fields: tool_id, tool_name, inputs' }, { status: 400 });
  }
  if (typeof tool_id !== 'string' || !VALID_TOOL_IDS.has(tool_id)) {
    return NextResponse.json({ error: 'Unknown tool_id' }, { status: 400 });
  }
  if (typeof tool_name !== 'string' || tool_name.length > MAX_TOOL_NAME_CHARS) {
    return NextResponse.json({ error: 'Invalid tool_name' }, { status: 400 });
  }
  if (key_result != null && (typeof key_result !== 'string' || key_result.length > MAX_KEY_RESULT_CHARS)) {
    return NextResponse.json({ error: 'Invalid key_result' }, { status: 400 });
  }
  if (!isPlainObject(inputs)) {
    return NextResponse.json({ error: 'inputs must be a JSON object' }, { status: 400 });
  }
  if (Buffer.byteLength(JSON.stringify(inputs), 'utf8') > MAX_INPUTS_BYTES) {
    return NextResponse.json({ error: `inputs too large (max ${MAX_INPUTS_BYTES / 1024} KB)` }, { status: 413 });
  }

  // Check user tier for save limits
  const { data: userData } = await supabase
    .from('users')
    .select('tier')
    .eq('id', auth.user.id)
    .single();

  const userTier = ((userData as { tier?: string } | null)?.tier || 'free') as Tier;
  const isPro = hasProAccess('finance', userTier);

  if (!isPro) {
    // Free users: max 1 scenario per tool.
    // NOTE: count-then-insert is not atomic — two concurrent saves can both
    // see count 0 and both insert. The limit is a soft product cap, not a
    // security boundary; a DB-side constraint/trigger would close the race.
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
      share_token: crypto.randomUUID(),
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
