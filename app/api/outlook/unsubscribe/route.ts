import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';
import { isValidUUID } from '@/lib/validation';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://moneyguymutants.com';

async function unsubscribe(token: string): Promise<boolean> {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from('outlook_subscribers')
    .update({ unsubscribed_at: new Date().toISOString() })
    .eq('unsubscribe_token', token);

  if (error) {
    console.error('Failed to unsubscribe outlook subscriber:', error);
    return false;
  }
  return true;
}

// GET must not mutate: corporate link scanners and mail-client prefetchers
// follow every URL in an email, and a destructive GET would silently
// unsubscribe real readers. Show a one-button confirmation page instead;
// the actual unsubscribe happens on POST.
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token || !isValidUUID(token)) {
    return NextResponse.redirect(new URL('/thinking?unsubscribe=invalid', APP_URL));
  }

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Unsubscribe · Money Guy Mutants</title></head>
<body style="margin:0;padding:24px;background:#054C7D;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:480px;margin:48px auto;background:#0a4a73;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px 24px;color:#cfdde8;line-height:1.6;text-align:center;">
    <h1 style="color:#f5f7fa;font-size:22px;font-weight:700;margin:0 0 12px;">Unsubscribe from the Outlook?</h1>
    <p style="margin:0 0 24px;">You'll stop receiving the Money Guy Mutants Investment Outlook emails.</p>
    <form method="POST" action="/api/outlook/unsubscribe?token=${encodeURIComponent(token)}" style="margin:0;">
      <input type="hidden" name="confirm" value="1">
      <button type="submit" style="display:inline-block;background:#F26531;color:#ffffff;padding:12px 24px;border:none;border-radius:4px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;font-size:14px;cursor:pointer;">Unsubscribe</button>
    </form>
    <p style="margin:24px 0 0;font-size:13px;color:#8fb0c4;">Changed your mind? Just close this page.</p>
  </div>
</body></html>`;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

// POST serves two callers:
// - The confirmation page's form above (body contains confirm=1) — redirect
//   to the friendly unsubscribed page.
// - Mail clients doing RFC 8058 one-click List-Unsubscribe-Post (body is
//   "List-Unsubscribe=One-Click") — respond with JSON.
export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  let fromConfirmPage = false;
  try {
    const form = await request.formData();
    fromConfirmPage = form.get('confirm') === '1';
  } catch {
    // No parseable body — treat as one-click.
  }

  if (!token || !isValidUUID(token)) {
    if (fromConfirmPage) {
      return NextResponse.redirect(new URL('/thinking?unsubscribe=invalid', APP_URL), 303);
    }
    return NextResponse.json({ success: false }, { status: 400 });
  }

  const ok = await unsubscribe(token);

  if (fromConfirmPage) {
    return NextResponse.redirect(
      new URL(ok ? '/thinking/unsubscribed' : '/thinking?unsubscribe=error', APP_URL),
      303,
    );
  }
  return ok
    ? NextResponse.json({ success: true })
    : NextResponse.json({ success: false }, { status: 500 });
}
