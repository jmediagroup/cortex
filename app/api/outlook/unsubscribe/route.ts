import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';
import { isValidUUID } from '@/lib/validation';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://moneyguymutants.com';

async function handle(token: string | null, asJson: boolean) {
  if (!token || !isValidUUID(token)) {
    if (asJson) return NextResponse.json({ success: false }, { status: 400 });
    return NextResponse.redirect(new URL('/thinking?unsubscribe=invalid', APP_URL));
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from('outlook_subscribers')
    .delete()
    .eq('unsubscribe_token', token);

  if (error) {
    console.error('Failed to unsubscribe outlook subscriber:', error);
    if (asJson) return NextResponse.json({ success: false }, { status: 500 });
    return NextResponse.redirect(new URL('/thinking?unsubscribe=error', APP_URL));
  }

  if (asJson) return NextResponse.json({ success: true });
  return NextResponse.redirect(new URL('/thinking/unsubscribed', APP_URL));
}

export async function GET(request: NextRequest) {
  return handle(request.nextUrl.searchParams.get('token'), false);
}

// One-click List-Unsubscribe-Post per RFC 8058. Mail clients POST here; respond with JSON.
export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  return handle(token, true);
}
