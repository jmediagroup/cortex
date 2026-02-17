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

    // Fetch user counts by tier in parallel with recent signups and Stripe data
    const [tierCounts, recentSignups, last30dSignups, stripeBalance] = await Promise.all([
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

      // Stripe balance
      stripe.balance.retrieve().catch(() => null),
    ]);

    // Fetch recent events count
    const { count: eventsLast7d } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) as { count: number | null; error: any };

    // Parse Stripe balance
    let monthlyRevenue = 0;
    if (stripeBalance) {
      const usdBalance = stripeBalance.available?.find((b: any) => b.currency === 'usd');
      monthlyRevenue = usdBalance ? usdBalance.amount / 100 : 0;
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
        balance: monthlyRevenue,
      },
    });
  } catch (error: any) {
    console.error('[Admin Stats] Unexpected error:', error);
    return errorResponse(error.message || 'Internal server error', 500);
  }
}
