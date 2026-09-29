import { NextRequest, NextResponse } from 'next/server';
import type { PostgrestError } from '@supabase/supabase-js';
import { createServiceClient } from '@/lib/supabase/client';
import { authenticateRequest, isAuthError, errorResponse } from '@/lib/auth-helpers';
import { getAdminEmails, isAdmin } from '@/lib/admin';
import { parseUserIdList } from '@/lib/monetization/scorecard';

export const dynamic = 'force-dynamic';

type ServiceClient = ReturnType<typeof createServiceClient>;

/** The scorecard migration hasn't been applied to this database yet. */
function isMissingRelation(error: PostgrestError | null): boolean {
  return error?.code === '42P01' || error?.code === 'PGRST205';
}

/**
 * Makes analytics_excluded_users match the current allowlists: every admin
 * (NEXT_PUBLIC_ADMIN_EMAILS, plus the admin making this request) and the ids
 * in ANALYTICS_EXCLUDED_USER_IDS. Their sessions drop out of the views.
 */
async function syncExcludedUsers(
  supabase: ServiceClient,
  currentAdminId: string,
): Promise<{ count: number } | { error: PostgrestError }> {
  const adminEmails = getAdminEmails();
  const envIds = parseUserIdList(process.env.ANALYTICS_EXCLUDED_USER_IDS);

  const [admins, envUsers] = await Promise.all([
    adminEmails.length
      ? supabase.from('users').select('id').in('email', adminEmails)
      : Promise.resolve({ data: [] as { id: string }[], error: null }),
    // Only ids that belong to real accounts (the table references auth.users).
    envIds.length
      ? supabase.from('users').select('id').in('id', envIds)
      : Promise.resolve({ data: [] as { id: string }[], error: null }),
  ]);
  if (admins.error) return { error: admins.error };
  if (envUsers.error) return { error: envUsers.error };

  const reasons = new Map<string, 'admin' | 'env'>();
  for (const { id } of envUsers.data ?? []) reasons.set(id, 'env');
  for (const { id } of admins.data ?? []) reasons.set(id, 'admin');
  reasons.set(currentAdminId, 'admin');

  const rows = [...reasons].map(([user_id, reason]) => ({ user_id, reason }));
  const upsert = await supabase.from('analytics_excluded_users').upsert(rows, { onConflict: 'user_id' });
  if (upsert.error) return { error: upsert.error };

  const prune = await supabase
    .from('analytics_excluded_users')
    .delete()
    .not('user_id', 'in', `(${rows.map((r) => r.user_id).join(',')})`);
  if (prune.error) return { error: prune.error };

  return { count: rows.length };
}

/**
 * GET /api/admin/monetization
 * Rows of the scorecard views (supabase/migrations/20260929120000_monetization_scorecard.sql)
 * for every window; the page picks the window. Admin only.
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (isAuthError(authResult)) {
      return errorResponse(authResult.error, authResult.status);
    }
    if (!isAdmin(authResult.user.email)) {
      return errorResponse('Forbidden', 403);
    }

    const supabase = createServiceClient();

    const excluded = await syncExcludedUsers(supabase, authResult.user.id);
    if ('error' in excluded) {
      if (isMissingRelation(excluded.error)) return NextResponse.json({ setupRequired: true });
      console.error('[Admin Monetization] Excluded-user sync failed:', excluded.error.message);
      return errorResponse('Could not update the excluded users', 500);
    }

    const [traffic, funnel, revenue] = await Promise.all([
      supabase.from('v_site_traffic').select('*'),
      supabase.from('v_tool_funnel').select('*'),
      supabase.from('v_revenue_by_line').select('*'),
    ]);
    const failed = [traffic.error, funnel.error, revenue.error].find(Boolean) ?? null;
    if (failed) {
      if (isMissingRelation(failed)) return NextResponse.json({ setupRequired: true });
      console.error('[Admin Monetization] View query failed:', failed.message);
      return errorResponse('Could not load the scorecard', 500);
    }

    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      excludedUsers: excluded.count,
      traffic: traffic.data ?? [],
      funnel: funnel.data ?? [],
      revenue: revenue.data ?? [],
    });
  } catch (error) {
    console.error('[Admin Monetization] Unexpected error:', error);
    return errorResponse('Internal server error', 500);
  }
}
