import { NextRequest, NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { createServiceClient } from '@/lib/supabase/client';
import { stripe } from '@/lib/stripe/server';
import { computeMrr } from '@/lib/stripe/mrr';
import { authenticateRequest, isAuthError, errorResponse } from '@/lib/auth-helpers';
import { isAdmin } from '@/lib/admin';

/** A total a temporary failure left incomplete: shown once, never cached. */
class IncompleteMrrError extends Error {
  readonly mrr: number;
  constructor(mrr: number, reason: string) {
    super(reason);
    this.mrr = mrr;
  }
}

// MRR takes one Stripe call per subscriber, so the total is cached for 10
// minutes in Next's data cache, shared by every function instance. The GET
// handler checks the admin before reading it, and nothing in here depends on
// the request. When the cached copy is stale the admin still gets it
// instantly while it refreshes in the background.
const getCachedMrr = unstable_cache(
  async (): Promise<number> => {
    const supabase = createServiceClient();
    const { data: subscribers, error } = (await supabase
      .from('users')
      .select('stripe_subscription_id')
      .not('stripe_subscription_id', 'is', null)) as {
      data: { stripe_subscription_id: string }[] | null;
      error: { message: string } | null;
    };
    if (error) throw new IncompleteMrrError(0, `Could not load subscribers: ${error.message}`);

    let failures = 0;
    const subscriptions = await Promise.all(
      (subscribers ?? []).map(async (u) => {
        try {
          return await stripe.subscriptions.retrieve(u.stripe_subscription_id);
        } catch (err) {
          // A subscription Stripe doesn't know counts as nothing; that answer
          // won't change, so it is safe to cache. Anything else may be a blip.
          if ((err as { code?: string }).code !== 'resource_missing') failures += 1;
          return null;
        }
      }),
    );

    const mrr = computeMrr(subscriptions);
    if (failures > 0) {
      throw new IncompleteMrrError(mrr, `${failures} Stripe subscription lookup(s) failed`);
    }
    return mrr;
  },
  ['admin-stats-mrr'],
  { revalidate: 600 },
);

async function getMrr(): Promise<number> {
  try {
    return await getCachedMrr();
  } catch (err) {
    if (err instanceof IncompleteMrrError) {
      // Same number the dashboard always showed after a failed lookup; the
      // next load tries again instead of serving it from the cache.
      console.warn('[Admin Stats] MRR not cached:', err.message);
      return err.mrr;
    }
    throw err;
  }
}

/**
 * GET /api/admin/stats
 * Overview stats for the admin dashboard
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

    // Fetch user counts by tier in parallel with recent signups
    const [tierCounts, recentSignups, last30dSignups] = await Promise.all([
      // Users by tier
      Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('tier', 'free'),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('tier', 'finance_pro'),
      ]) as Promise<{ count: number | null; error: any }[]>,

      // Signups in last 7 days
      supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) as unknown as { count: number | null; error: any },

      // Signups in last 30 days
      supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) as unknown as { count: number | null; error: any },
    ]);

    // Fetch recent events count
    const { count: eventsLast7d } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) as { count: number | null; error: any };

    // MRR from subscribers' Stripe subscriptions, cached (see getCachedMrr).
    // Only reached once the admin check above has passed.
    const mrr = await getMrr();

    return NextResponse.json({
      users: {
        total: tierCounts[0]?.count || 0,
        free: tierCounts[1]?.count || 0,
        finance_pro: tierCounts[2]?.count || 0,
      },
      signups: {
        last7d: recentSignups?.count || 0,
        last30d: last30dSignups?.count || 0,
      },
      events: {
        last7d: eventsLast7d || 0,
      },
      revenue: {
        mrr,
      },
    });
  } catch (error: any) {
    console.error('[Admin Stats] Unexpected error:', error);
    return errorResponse(error.message || 'Internal server error', 500);
  }
}
