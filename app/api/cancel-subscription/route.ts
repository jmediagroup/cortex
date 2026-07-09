import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { createServiceClient } from '@/lib/supabase/client';
import { authenticateRequest, isAuthError, errorResponse } from '@/lib/auth-helpers';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Authenticate request and extract user ID from token
    // This prevents users from canceling other users' subscriptions
    const authResult = await authenticateRequest(request);
    if (isAuthError(authResult)) {
      return errorResponse(authResult.error, authResult.status);
    }

    const { user } = authResult;
    const userId = user.id;

    // Rate limiting by authenticated user ID (more accurate than IP for logged-in users)
    const rateLimit = checkRateLimit(`cancel:${userId}`, RATE_LIMITS.cancelSubscription);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimit.limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.resetTime.toString(),
            'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    const supabase = createServiceClient();

    // Get user's subscription ID from database
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('stripe_subscription_id, stripe_customer_id')
      .eq('id', userId)
      .single() as {
        data: {
          stripe_subscription_id?: string;
          stripe_customer_id?: string;
        } | null;
        error: any;
      };

    if (fetchError || !userData) {
      console.error('[Cancel Subscription] Failed to fetch user data:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 500 }
      );
    }

    // No subscription on file — nothing to cancel; ensure they're on free.
    if (!userData.stripe_subscription_id) {
      const { error: updateError } = await (supabase
        .from('users')
        .update as any)({
          tier: 'free',
          subscription_status: 'canceled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (updateError) {
        console.error('[Cancel Subscription] Failed to update tier:', updateError);
        return NextResponse.json({ error: 'Failed to update tier' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        immediate: true,
        message: 'No active subscription found. Your plan is set to Free.',
      });
    }

    // Schedule cancellation at the end of the paid period so the member keeps
    // the access they already paid for. The tier is NOT downgraded here — the
    // customer.subscription.deleted webhook flips it to free when the period
    // actually ends.
    try {
      const subscription = await stripe.subscriptions.update(
        userData.stripe_subscription_id,
        { cancel_at_period_end: true },
      );

      return NextResponse.json({
        success: true,
        immediate: false,
        cancelAt: subscription.cancel_at ?? subscription.current_period_end ?? null,
        message: 'Your subscription will cancel at the end of the current billing period. You keep Finance Pro until then.',
      });
    } catch (stripeError: any) {
      console.error('[Cancel Subscription] Stripe API error:', stripeError);

      // Subscription no longer exists in Stripe — reconcile to free locally.
      if (stripeError.code === 'resource_missing') {
        const { error: updateError } = await (supabase
          .from('users')
          .update as any)({
            tier: 'free',
            subscription_status: 'canceled',
            stripe_subscription_id: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        if (updateError) {
          return NextResponse.json({ error: 'Failed to update tier' }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          immediate: true,
          message: 'Subscription not found in Stripe; your plan is set to Free.',
        });
      }

      return NextResponse.json(
        { error: stripeError.message || 'Failed to cancel subscription' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('[Cancel Subscription] Unexpected error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
