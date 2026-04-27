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

  const { data: row } = (await supabase
    .from('outlook_subscribers')
    .select('id, confirmed_at')
    .eq('confirmation_token', token)
    .maybeSingle()) as { data: { id: string; confirmed_at: string | null } | null };

  if (!row) {
    return NextResponse.redirect(new URL('/thinking?confirm=invalid', APP_URL));
  }

  if (!row.confirmed_at) {
    const update = supabase.from('outlook_subscribers').update as unknown as (
      values: Record<string, unknown>,
    ) => { eq: (col: string, val: string) => Promise<{ error: { message: string } | null }> };
    const { error } = await update({ confirmed_at: new Date().toISOString() }).eq('id', row.id);

    if (error) {
      console.error('Failed to confirm outlook subscriber:', error);
      return NextResponse.redirect(new URL('/thinking?confirm=error', APP_URL));
    }
  }

  return NextResponse.redirect(new URL('/thinking/subscribed', APP_URL));
}
