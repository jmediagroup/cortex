import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/client';

type UserInsert = Database['public']['Tables']['users']['Insert'];

/**
 * POST /api/create-user-record
 * Creates a user record in the public.users table using the service role.
 * Called after successful auth signup as a fallback in case the
 * handle_new_user trigger didn't create the record.
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await request.json();

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'Missing userId or email' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    const record: UserInsert = {
      id: userId,
      email: email,
      tier: 'free',
    };

    // Upsert to handle both cases:
    // 1. Trigger already created the record (ON CONFLICT DO NOTHING)
    // 2. Trigger didn't fire or failed (INSERT succeeds)
    const { error } = await supabase
      .from('users')
      .upsert(record as any, { onConflict: 'id', ignoreDuplicates: true });

    if (error) {
      console.error('[Create User Record] Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create user record' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Create User Record] Unexpected error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
