import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';
import { renderMarkdown } from '@/lib/outlook/markdown';
import { getOutlookForDigest } from '@/lib/outlook/content';
import { sendDigestEmail } from '@/lib/outlook/email';
import type { OutlookType } from '@/lib/outlook/types';

const CRON_SECRET = process.env.CRON_SECRET;

// How many days back a post is still considered fresh enough to send. This
// window means a post that deployed a little late — after the cron already
// fired — still goes out on the next run instead of being silently dropped.
const LOOKBACK_DAYS: Record<OutlookType, number> = {
  daily: 1,
  weekly: 7,
};

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
  // ?force=1 re-sends even if this post is already in the send log (manual replay).
  const force = request.nextUrl.searchParams.get('force') === '1';

  const outlookData = await getOutlookForDigest(type, targetDate, LOOKBACK_DAYS[type]);

  if (!outlookData) {
    // A scheduled send found nothing to send — this is an unhealthy state
    // (missed publish or date mismatch). Warn so it surfaces in Vercel logs.
    console.warn(
      `[outlook/${type}] no ${type} outlook within ${LOOKBACK_DAYS[type]}d of ${targetDate} — nothing sent`,
    );
    return NextResponse.json({
      sent: 0,
      skipped: true,
      reason: `No ${type} outlook within ${LOOKBACK_DAYS[type]} day(s) of ${targetDate}.`,
    });
  }

  const outlook = outlookData.list;
  const supabase = createServiceClient();

  // Claim the send: insert a log row keyed on (type, slug). A unique-violation
  // means this post already went out — skip to avoid double-sending, unless the
  // caller explicitly forced a replay.
  const { error: claimError } = await supabase.from('outlook_email_sends').insert({
    type,
    slug: outlook.slug,
    outlook_date: outlook.date,
  });

  if (claimError) {
    if (claimError.code === '23505') {
      if (!force) {
        console.log(`[outlook/${type}] ${outlook.slug} already sent — skipping`);
        return NextResponse.json({
          sent: 0,
          skipped: true,
          reason: 'Already sent.',
          slug: outlook.slug,
        });
      }
      // force: the log row exists; fall through and re-send.
      console.warn(`[outlook/${type}] forced replay of ${outlook.slug}`);
    } else {
      console.error(`[outlook/${type}] failed to claim send:`, claimError);
      return NextResponse.json({ error: 'Failed to claim send' }, { status: 500 });
    }
  }

  const leadHtml = await renderMarkdown(outlookData.leadMarkdown);

  const { data: subscribers, error } = await supabase
    .from('outlook_subscribers')
    .select('email, unsubscribe_token')
    .not('confirmed_at', 'is', null);

  if (error) {
    console.error(`[outlook/${type}] failed to load subscribers:`, error);
    return NextResponse.json({ error: 'Failed to load subscribers' }, { status: 500 });
  }

  const recipients = subscribers ?? [];
  let sent = 0;
  let failed = 0;

  // Throttle to a safe Resend rate. Sequential is fine for low volume; bump to
  // chunked Promise.all + sleep when subscriber count grows.
  for (const sub of recipients) {
    const result = await sendDigestEmail({
      outlook,
      leadHtml,
      leadText: outlookData.leadText,
      to: sub.email,
      unsubscribeToken: sub.unsubscribe_token,
    });
    if (result.success) sent += 1;
    else failed += 1;
  }

  // Record the outcome on the claimed row (best-effort — don't fail the response).
  const { error: updateError } = await supabase
    .from('outlook_email_sends')
    .update({
      recipient_count: recipients.length,
      sent_count: sent,
      failed_count: failed,
      completed_at: new Date().toISOString(),
    })
    .eq('type', type)
    .eq('slug', outlook.slug);
  if (updateError) {
    console.error(`[outlook/${type}] failed to record send outcome:`, updateError);
  }

  console.log(
    `[outlook/${type}] sent ${sent}/${recipients.length} for ${outlook.slug} (failed ${failed})`,
  );

  return NextResponse.json({
    sent,
    failed,
    total: recipients.length,
    slug: outlook.slug,
    type: outlook.type,
    date: outlook.date,
  });
}
