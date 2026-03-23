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

    // Calculate MRR from database subscribers' actual Stripe subscription data
    // Fetch all subscriber IDs (not just the paginated page)
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
