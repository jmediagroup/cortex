import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';
import { isValidUUID } from '@/lib/validation';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://cortex.vip';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token || !isValidUUID(token)) {
    return NextResponse.redirect(new URL('/thinking?confirm=invalid', APP_URL));
  }

  const supabase = createServiceClient();

  const { data: row, error: lookupError } = await supabase
    .from('outlook_subscribers')
    .select('id, confirmed_at')
    .eq('confirmation_token', token)
    .maybeSingle();

  if (lookupError) {
    console.error('[outlook/confirm] lookup:', lookupError);
    return NextResponse.redirect(new URL('/thinking?confirm=error', APP_URL));
  }

  if (!row) {
    return NextResponse.redirect(new URL('/thinking?confirm=invalid', APP_URL));
  }

  if (!row.confirmed_at) {
    const { error: updateError } = await supabase
      .from('outlook_subscribers')
      .update({ confirmed_at: new Date().toISOString() })
      .eq('id', row.id);

    if (updateError) {
      console.error('[outlook/confirm] update:', updateError);
      return NextResponse.redirect(new URL('/thinking?confirm=error', APP_URL));
    }
  }

  return NextResponse.redirect(new URL('/thinking/subscribed', APP_URL));
}
