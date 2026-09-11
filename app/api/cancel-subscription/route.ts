import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { reconcileUserSubscription } from '@/lib/stripe/reconcile';
import { isPaidStatus } from '@/lib/stripe/select-subscription';
import { authenticateRequest, isAuthError, errorResponse } from '@/lib/auth-helpers';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

/**
 * POST /api/cancel-subscription
 *
 * Schedules the caller's subscription to end at the close of the current
 * billing period, so they keep what they paid for. The tier is NOT flipped
 * here — the `customer.subscription.deleted` webhook (or any later re-sync)
 * moves them to free once the period actually ends.
 *
 * The live subscription is looked up via `reconcileUserSubscription` rather
 * than the cached id on the users row, so a stale row (already-canceled id,
 * a subscription started from the billing portal, a second Stripe customer)
 * can't make this return a 500 or cancel the wrong thing.
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (isAuthError(authResult)) {
      return errorResponse(authResult.error, authResult.status);
    }
    const { user } = authResult;

    const rateLimit = checkRateLimit(`cancel:${user.id}`, RATE_LIMITS.cancelSubscription);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': Math.max(1, Math.ceil((rateLimit.resetTime - Date.now()) / 1000)).toString(),
          },
        },
      );
    }

    const before = await reconcileUserSubscription({ userId: user.id, email: user.email });
    const subscription = before.subscription;

    // Nothing live to cancel — the re-sync above has already put them on the
    // tier Stripe says they should have.
    if (!subscription || !isPaidStatus(subscription.status)) {
      return NextResponse.json({
        success: true,
        immediate: true,
        tier: before.tier,
        message:
          before.tier === 'free'
            ? 'No active subscription found. Your plan is set to Free.'
            : 'No active Stripe subscription found; your plan has been re-synced.',
      });
    }

    if (subscription.cancel_at_period_end) {
      return NextResponse.json({
        success: true,
        immediate: false,
        alreadyScheduled: true,
        cancelAt: subscription.cancel_at ?? subscription.current_period_end ?? null,
        message: 'Your subscription is already set to cancel at the end of the current billing period.',
      });
    }

    const updated = await stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: true,
    });

    // Keep the row in step with Stripe even if the webhook is slow.
    await reconcileUserSubscription({ userId: user.id, customerIds: [before.customerId] });

    return NextResponse.json({
      success: true,
      immediate: false,
      cancelAt: updated.cancel_at ?? updated.current_period_end ?? null,
      message:
        'Your subscription will cancel at the end of the current billing period. You keep Finance Pro until then.',
    });
  } catch (error) {
    const e = error as { message?: string; code?: string };
    console.error('[Cancel Subscription] Unexpected error:', e.message ?? error);
    return errorResponse('Could not cancel your subscription. Please try again.', 500);
  }
}
