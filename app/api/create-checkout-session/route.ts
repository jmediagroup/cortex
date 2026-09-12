import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession, stripe } from '@/lib/stripe/server';
import { ensureUserRow, reconcileUserSubscription, saveCustomerId } from '@/lib/stripe/reconcile';
import { isPaidStatus } from '@/lib/stripe/select-subscription';
import { authenticateRequest, isAuthError, errorResponse } from '@/lib/auth-helpers';
import { isValidPriceId, isAllowedPriceId } from '@/lib/validation';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

/**
 * POST /api/create-checkout-session  { priceId }
 *
 * Starts a Stripe Checkout for the signed-in user. Guards:
 *   - the price id must be one we sell (env allow-list)
 *   - a user who already has a live subscription is refused (409) so a
 *     double-click, a second tab, or a stale "free" tier in the DB can't
 *     produce two subscriptions and double billing
 *   - a newly created Stripe customer is persisted immediately, so an
 *     abandoned checkout doesn't leave the next attempt creating another one
 */
export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request.headers);
    const rateLimit = checkRateLimit(`checkout:${clientIP}`, RATE_LIMITS.checkout);
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

    const body = (await request.json().catch(() => null)) as { priceId?: unknown } | null;
    const priceId = body?.priceId;

    if (typeof priceId !== 'string' || !isValidPriceId(priceId)) {
      return errorResponse('Invalid price ID format', 400);
    }
    if (!isAllowedPriceId(priceId)) {
      return errorResponse('Price ID not allowed', 400);
    }

    const authResult = await authenticateRequest(request);
    if (isAuthError(authResult)) {
      return errorResponse(authResult.error, authResult.status);
    }
    const { user } = authResult;

    if (!user.email) {
      return errorResponse('Your account has no email address on file', 400);
    }

    // The signup trigger can (by design) fail without blocking signup, so the
    // users row may be missing. Create it rather than 404-ing a paying user.
    const row = await ensureUserRow(user.id, user.email);

    // Refuse to sell a second subscription. Stripe is the source of truth
    // here, not our cached tier — a webhook that hasn't landed yet must not
    // let the user pay twice.
    if (row.stripe_customer_id || row.stripe_subscription_id) {
      const state = await reconcileUserSubscription({ userId: user.id, email: user.email });
      if (state.subscription && isPaidStatus(state.subscription.status)) {
        return NextResponse.json(
          {
            error: 'You already have an active subscription. Manage it from your account page.',
            code: 'already_subscribed',
            tier: state.tier,
          },
          { status: 409 },
        );
      }
    }

    let customerId = row.stripe_customer_id;
    if (customerId) {
      // Make sure the stored customer still exists in Stripe (it may have been
      // deleted from the dashboard); otherwise fall through and create a new one.
      try {
        const customer = await stripe.customers.retrieve(customerId);
        if ('deleted' in customer && customer.deleted) customerId = null;
      } catch (err) {
        if ((err as { code?: string }).code === 'resource_missing') customerId = null;
        else throw err;
      }
    }

    const result = await createCheckoutSession({
      customerId,
      priceId,
      userId: user.id,
      userEmail: user.email,
    });

    if (result.createdCustomer || result.customerId !== row.stripe_customer_id) {
      await saveCustomerId(user.id, result.customerId);
    }

    return NextResponse.json({ sessionId: result.session.id, url: result.session.url });
  } catch (error) {
    const e = error as { message?: string };
    console.error('Error creating checkout session:', e.message ?? error);
    return errorResponse('Could not start checkout. Please try again.', 500);
  }
}
