import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { createServiceClient } from '@/lib/supabase/client';
import { authenticateRequest, isAuthError, errorResponse } from '@/lib/auth-helpers';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

/**
 * POST /api/delete-account
 * Permanently deletes a user account:
 * 1. Cancels any active Stripe subscription (hard-fail if it errors, so we
 *    never delete the account while it's still being billed).
 * 2. Removes their marketing/outlook subscription (PII) — the FK is
 *    ON DELETE SET NULL, so it is NOT cleaned up automatically.
 * 3. Deletes the users row.
 * 4. Deletes the auth user (events + scenarios cascade off auth.users).
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (isAuthError(authResult)) {
      return errorResponse(authResult.error, authResult.status);
    }

    const { user } = authResult;
    const userId = user.id;
    const email = user.email ?? null;

    const rateLimit = checkRateLimit(`delete:${userId}`, RATE_LIMITS.cancelSubscription);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const supabase = createServiceClient();

    // Step 1: cancel any Stripe subscription BEFORE deleting anything, and stop
    // if we can't — otherwise a transient Stripe error would leave an active
    // subscription billing a card with no account left to manage it.
    const { data: userData } = await supabase
      .from('users')
      .select('stripe_subscription_id')
      .eq('id', userId)
      .single() as { data: { stripe_subscription_id?: string } | null };

    if (userData?.stripe_subscription_id) {
      try {
        await stripe.subscriptions.cancel(userData.stripe_subscription_id);
      } catch (stripeError: any) {
        if (stripeError?.code !== 'resource_missing') {
          console.error('[Delete Account] Stripe cancellation failed:', stripeError?.message);
          return NextResponse.json(
            {
              error:
                'We could not cancel your active subscription, so your account was not deleted. Please try again, or cancel your subscription first.',
            },
            { status: 502 }
          );
        }
        // resource_missing: subscription already gone — safe to continue.
      }
    }

    // Step 2: remove marketing/outlook subscription rows (PII). FK is SET NULL,
    // so these survive the users-row delete unless we remove them explicitly.
    const { error: outlookByUserErr } = await supabase
      .from('outlook_subscribers')
      .delete()
      .eq('user_id', userId);
    if (outlookByUserErr) {
      console.error('[Delete Account] Failed to delete outlook subscription by user_id:', outlookByUserErr);
    }
    if (email) {
      const { error: outlookByEmailErr } = await supabase
        .from('outlook_subscribers')
        .delete()
        .eq('email', email);
      if (outlookByEmailErr) {
        console.error('[Delete Account] Failed to delete outlook subscription by email:', outlookByEmailErr);
      }
    }

    // Step 3: delete the users row.
    const { error: deleteUserError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);
    if (deleteUserError) {
      console.error('[Delete Account] Failed to delete from users table:', deleteUserError);
      // Continue — we still want to remove the auth user.
    }

    // Step 4: delete the auth user (events + scenarios cascade off auth.users).
    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(userId);
    if (deleteAuthError) {
      console.error('[Delete Account] Failed to delete from Supabase Auth:', deleteAuthError);
      return NextResponse.json(
        { error: 'Failed to delete account from authentication system' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Account deleted successfully' });
  } catch (error: any) {
    console.error('[Delete Account] Unexpected error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
