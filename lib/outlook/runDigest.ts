import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';
import { renderMarkdown } from '@/lib/outlook/markdown';
import { getLatestOutlookForEmail } from '@/lib/outlook/content';
import { sendDigestEmail } from '@/lib/outlook/email';
import type { OutlookType } from '@/lib/outlook/types';

const CRON_SECRET = process.env.CRON_SECRET;

function todayInET(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function authorized(request: NextRequest): boolean {
  if (!CRON_SECRET) return true; // No secret configured: allow (dev only).
  const header = request.headers.get('authorization');
  return header === `Bearer ${CRON_SECRET}`;
}

export async function runDigest(
  request: NextRequest,
  type: OutlookType,
): Promise<NextResponse> {
  if (!authorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const targetDate = request.nextUrl.searchParams.get('date') || todayInET();
  const found = await getLatestOutlookForEmail(type, targetDate);

  // No post for today — also accept the latest post that's <= today, but only if
  // it's the same calendar week (for weekly) or the same calendar day (for daily).
  const outlookData =
    found ??
    (type === 'weekly' ? await getLatestOutlookForEmail(type) : null);

  if (!outlookData) {
    return NextResponse.json({
      sent: 0,
      skipped: true,
      reason: `No ${type} outlook found for ${targetDate}.`,
    });
  }

  const leadHtml = await renderMarkdown(outlookData.leadMarkdown);

  const supabase = createServiceClient();
  const { data: subscribers, error } = (await supabase
    .from('outlook_subscribers')
    .select('email, unsubscribe_token')
    .not('confirmed_at', 'is', null)) as {
    data: { email: string; unsubscribe_token: string }[] | null;
    error: { message: string } | null;
  };

  if (error) {
    console.error('Failed to load outlook subscribers:', error);
    return NextResponse.json({ error: 'Failed to load subscribers' }, { status: 500 });
  }

  const recipients = subscribers ?? [];
  let sent = 0;
  let failed = 0;

  // Throttle to a safe Resend rate (10/sec). Sequential is fine for low volume;
  // bump to chunked Promise.all + sleep when subscriber count grows.
  for (const sub of recipients) {
    const result = await sendDigestEmail({
      outlook: outlookData.list,
      leadHtml,
      leadText: outlookData.leadText,
      to: sub.email,
      unsubscribeToken: sub.unsubscribe_token,
    });
    if (result.success) sent += 1;
    else failed += 1;
  }

  return NextResponse.json({
    sent,
    failed,
    total: recipients.length,
    slug: outlookData.list.slug,
    type: outlookData.list.type,
    date: outlookData.list.date,
  });
}
