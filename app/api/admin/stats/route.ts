import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';
import { stripe } from '@/lib/stripe/server';
import { authenticateRequest, isAuthError, errorResponse } from '@/lib/auth-helpers';
import { isAdmin } from '@/lib/admin';

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
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('tier', 'elite'),
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

    // Calculate MRR from database subscribers' actual Stripe subscription data
    let mrr = 0;
    const { data: allSubscribers } = await supabase
      .from('users')
      .select('stripe_subscription_id')
      .not('stripe_subscription_id', 'is', null) as { data: { stripe_subscription_id: string }[] | null };

    if (allSubscribers) {
      const results = await Promise.all(
        allSubscribers.map(async (u) => {
          try {
            return await stripe.subscriptions.retrieve(u.stripe_subscription_id);
          } catch {
            return null;
          }
        })
      );
      for (const sub of results) {
        if (sub && sub.status === 'active') {
          const price = sub.items.data[0]?.price;
          if (price?.unit_amount && price?.recurring) {
            const amount = price.unit_amount / 100;
            mrr += price.recurring.interval === 'year' ? amount / 12 : amount;
          }
        }
      }
    }

    return NextResponse.json({
      users: {
        total: tierCounts[0]?.count || 0,
        free: tierCounts[1]?.count || 0,
        finance_pro: tierCounts[2]?.count || 0,
        elite: tierCounts[3]?.count || 0,
      },
      signups: {
        last7d: recentSignups?.count || 0,
        last30d: last30dSignups?.count || 0,
      },
      events: {
        last7d: eventsLast7d || 0,
      },
      revenue: {
        mrr: Math.round(mrr * 100) / 100,
      },
    });
  } catch (error: any) {
    console.error('[Admin Stats] Unexpected error:', error);
    return errorResponse(error.message || 'Internal server error', 500);
  }
}
