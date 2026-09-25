import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';
import { isAuthorizedCronRequest } from '@/lib/cron-auth';

export const dynamic = 'force-dynamic';

/** Analytics rows (public.events) older than this are deleted. */
const RETENTION_DAYS = 365;

/**
 * GET /api/cron/delete-old-events — daily Vercel cron (see vercel.json).
 *
 * Keeps the analytics table from growing forever by calling
 * delete_old_events(retention_days), which
 * supabase/migrations/20260925120000_events_retention.sql creates. The window
 * is passed explicitly: the older zero-argument function was redefined to 90
 * days and never scheduled. Until that migration is applied, the call fails
 * with "function not found" and deletes nothing.
 */
async function run(request: NextRequest): Promise<NextResponse> {
  if (!isAuthorizedCronRequest(request, 'events-retention')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase.rpc('delete_old_events', {
    retention_days: RETENTION_DAYS,
  });

  if (error) {
    console.error('[events-retention] delete_old_events failed:', error.message);
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
  }

  const deleted = data ?? 0;
  console.log(`[events-retention] deleted ${deleted} events older than ${RETENTION_DAYS} days`);
  return NextResponse.json({ deleted, retentionDays: RETENTION_DAYS });
}

export async function GET(request: NextRequest) {
  return run(request);
}

export async function POST(request: NextRequest) {
  return run(request);
}
