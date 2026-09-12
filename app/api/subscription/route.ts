import { NextRequest, NextResponse } from 'next/server';
import { reconcileUserSubscription } from '@/lib/stripe/reconcile';
import { authenticateRequest, isAuthError, errorResponse } from '@/lib/auth-helpers';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

/**
 * GET /api/subscription
 *
 * Returns the caller's live billing state, re-synced from Stripe. The account
 * page calls this on load, which doubles as a self-healing step: anyone whose
 * row drifted from Stripe (missed webhook, manual dashboard change) is
 * corrected the moment they look at their account.
 */
export async function GET(request: NextRequest) {
  const authResult = await authenticateRequest(request);
  if (isAuthError(authResult)) {
    return errorResponse(authResult.error, authResult.status);
  }
  const { user } = authResult;

  const rateLimit = checkRateLimit(`subscription:${user.id}`, RATE_LIMITS.general);
  if (!rateLimit.success) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
  }

  try {
    const result = await reconcileUserSubscription({ userId: user.id, email: user.email });
    const sub = result.subscription;

    return NextResponse.json({
      tier: result.tier,
      hasBillingAccount: Boolean(result.customerId),
      subscription: sub
        ? {
            id: sub.id,
            status: sub.status,
            cancelAtPeriodEnd: sub.cancel_at_period_end,
            cancelAt: sub.cancel_at,
            currentPeriodEnd: sub.current_period_end,
            interval: sub.items.data[0]?.price?.recurring?.interval ?? null,
            amount: sub.items.data[0]?.price?.unit_amount ?? null,
          }
        : null,
    });
  } catch (error) {
    const e = error as { message?: string };
    console.error('[Subscription] Failed to load billing state:', e.message ?? error);
    return errorResponse('Could not load your subscription right now.', 500);
  }
}
