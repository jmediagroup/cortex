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

    // If no subscription exists, just update the tier in database
    if (!userData.stripe_subscription_id) {
      console.log('[Cancel Subscription] No active subscription found, updating tier only');

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
        return NextResponse.json(
          { error: 'Failed to update tier' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Tier updated to free (no active subscription found)'
      });
    }

    // Cancel the Stripe subscription
    console.log('[Cancel Subscription] Canceling subscription:', userData.stripe_subscription_id);

    try {
      const canceledSubscription = await stripe.subscriptions.cancel(
        userData.stripe_subscription_id
      );

      console.log('[Cancel Subscription] Subscription canceled:', canceledSubscription.id);

      // Update database to reflect cancellation
      const { error: updateError } = await (supabase
        .from('users')
        .update as any)({
          tier: 'free',
          subscription_status: 'canceled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (updateError) {
        console.error('[Cancel Subscription] Failed to update database:', updateError);
        // Subscription was canceled in Stripe, but database update failed
        // This is not critical as the webhook will eventually update it
      }

      return NextResponse.json({
        success: true,
        message: 'Subscription canceled successfully'
      });

    } catch (stripeError: any) {
      console.error('[Cancel Subscription] Stripe API error:', stripeError);

      // If subscription doesn't exist in Stripe, just update database
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
          return NextResponse.json(
            { error: 'Failed to update tier' },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: 'Subscription not found in Stripe, tier updated to free'
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
