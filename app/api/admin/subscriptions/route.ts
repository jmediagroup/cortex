import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';
import { stripe } from '@/lib/stripe/server';
import { authenticateRequest, isAuthError, errorResponse } from '@/lib/auth-helpers';
import { isAdmin } from '@/lib/admin';

/**
 * GET /api/admin/subscriptions
 * List active subscriptions with Stripe data
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = (page - 1) * limit;

    const supabase = createServiceClient();

    // Get users with active subscriptions
    const { data: subscribers, count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact' })
      .not('stripe_subscription_id', 'is', null)
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1) as {
        data: any[] | null;
        count: number | null;
        error: any;
      };

    if (error) {
      console.error('[Admin Subscriptions] Query error:', error);
      return errorResponse('Failed to fetch subscriptions', 500);
    }

    // Enrich with Stripe data for the first page (to avoid too many API calls)
    const enriched = await Promise.all(
      (subscribers || []).map(async (user) => {
        if (!user.stripe_subscription_id) return { ...user, stripe: null };

        try {
          const subscription = await stripe.subscriptions.retrieve(user.stripe_subscription_id);
          return {
            ...user,
            stripe: {
              status: subscription.status,
              current_period_end: subscription.current_period_end,
              cancel_at_period_end: subscription.cancel_at_period_end,
              plan_amount: subscription.items.data[0]?.price?.unit_amount,
              plan_interval: subscription.items.data[0]?.price?.recurring?.interval,
            },
          };
        } catch {
          return { ...user, stripe: null };
        }
      })
    );

    // Get Stripe MRR
    let mrr = 0;
    try {
      const subscriptions = await stripe.subscriptions.list({
        status: 'active',
        limit: 100,
      });
      for (const sub of subscriptions.data) {
        const price = sub.items.data[0]?.price;
        if (price?.unit_amount && price?.recurring) {
          const amount = price.unit_amount / 100;
          mrr += price.recurring.interval === 'year' ? amount / 12 : amount;
        }
      }
    } catch {
      // Stripe API error, MRR stays 0
    }

    return NextResponse.json({
      subscriptions: enriched,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
      mrr: Math.round(mrr * 100) / 100,
    });
  } catch (error: any) {
    console.error('[Admin Subscriptions] Unexpected error:', error);
    return errorResponse(error.message || 'Internal server error', 500);
  }
}
