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
    const { userId, email, firstName } = await request.json();

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'Missing userId or email' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    const trimmedFirstName =
      typeof firstName === 'string' ? firstName.trim().slice(0, 60) : '';
    const record: UserInsert = {
      id: userId,
      email: email,
      tier: 'free',
      ...(trimmedFirstName ? { first_name: trimmedFirstName } : {}),
    };

    // Insert the row if the auth trigger didn't fire. If the row already
    // exists, fall through and patch in the optional first_name so it isn't
    // dropped just because the trigger ran first.
    const { error: insertError } = await supabase
      .from('users')
      .upsert(record as any, { onConflict: 'id', ignoreDuplicates: true });

    if (insertError) {
      console.error('[Create User Record] Database error:', insertError);
      return NextResponse.json(
        { error: 'Failed to create user record' },
        { status: 500 }
      );
    }

    if (trimmedFirstName) {
      const { error: updateError } = await (supabase
        .from('users')
        .update as any)({ first_name: trimmedFirstName })
        .eq('id', userId);
      if (updateError) {
        console.error('[Create User Record] Failed to set first_name:', updateError);
      }
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
