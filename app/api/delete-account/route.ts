import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { createServiceClient } from '@/lib/supabase/client';
import { authenticateRequest, isAuthError, errorResponse } from '@/lib/auth-helpers';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

/**
 * POST /api/delete-account
 * Permanently deletes a user account:
 * 1. Cancels any active Stripe subscription
 * 2. Deletes user data from the users table
 * 3. Deletes user from Supabase Auth
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate request
    const authResult = await authenticateRequest(request);
    if (isAuthError(authResult)) {
      return errorResponse(authResult.error, authResult.status);
    }

    const { user } = authResult;
    const userId = user.id;

    // Rate limiting
    const rateLimit = checkRateLimit(`delete:${userId}`, RATE_LIMITS.cancelSubscription);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const supabase = createServiceClient();

    console.log(`[Delete Account] Starting account deletion for user: ${userId}`);

    // Step 1: Get user data to check for active subscription
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

    if (fetchError) {
      console.error('[Delete Account] Failed to fetch user data:', fetchError);
      // Continue anyway - user might exist in auth but not in users table
    }

    // Step 2: Cancel Stripe subscription if exists
    if (userData?.stripe_subscription_id) {
      console.log(`[Delete Account] Canceling subscription: ${userData.stripe_subscription_id}`);
      try {
        await stripe.subscriptions.cancel(userData.stripe_subscription_id);
        console.log('[Delete Account] Subscription canceled successfully');
      } catch (stripeError: any) {
        // Log but don't fail - subscription might already be canceled
        console.error('[Delete Account] Stripe cancellation error:', stripeError.message);
      }
    }

    // Step 3: Delete from users table
    console.log('[Delete Account] Deleting from users table');
    const { error: deleteUserError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (deleteUserError) {
      console.error('[Delete Account] Failed to delete from users table:', deleteUserError);
      // Continue anyway - we still want to delete from auth
    }

    // Step 4: Delete from Supabase Auth (requires service role)
    console.log('[Delete Account] Deleting from Supabase Auth');
    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(userId);

    if (deleteAuthError) {
      console.error('[Delete Account] Failed to delete from Supabase Auth:', deleteAuthError);
      return NextResponse.json(
        { error: 'Failed to delete account from authentication system' },
        { status: 500 }
      );
    }

    console.log(`[Delete Account] Successfully deleted account for user: ${userId}`);

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error: any) {
    console.error('[Delete Account] Unexpected error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
