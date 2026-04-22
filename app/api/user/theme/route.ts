import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';
import { authenticateRequest, isAuthError } from '@/lib/auth-helpers';

// POST /api/user/theme  { theme: 'light' | 'dark' }
//
// Persists a user's preferred theme. For signed-out users, the client falls
// back to localStorage — so this route silently no-ops (200) when unauth'd,
// to keep the client-side fire-and-forget write simple.
export async function POST(request: NextRequest) {
  let body: { theme?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { theme } = body;
  if (theme !== 'light' && theme !== 'dark') {
    return NextResponse.json(
      { error: "theme must be 'light' or 'dark'" },
      { status: 400 }
    );
  }

  const auth = await authenticateRequest(request);
  if (isAuthError(auth)) {
    // Signed-out users: the client persists to localStorage; nothing to do here.
    return NextResponse.json({ ok: true, persisted: false });
  }

  const supabase = createServiceClient() as any;
  const { error } = await supabase
    .from('users')
    .update({ theme })
    .eq('id', auth.user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, persisted: true });
}
