import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripe } from '@/lib/stripe/server';
import { reconcileUserSubscription } from '@/lib/stripe/reconcile';
import { authenticateRequest, isAuthError, errorResponse } from '@/lib/auth-helpers';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

/**
 * POST /api/verify-checkout  { sessionId }
 *
 * Reconciles a user's tier straight from Stripe when they return from
 * checkout, instead of trusting `?success=true`. Covers the pay-but-no-access
 * gap: if the webhook is delayed, dropped, or misconfigured, the user still
 * gets the tier they paid for as soon as they land on the dashboard.
 *
 * Ownership is enforced by matching the session's `metadata.userId` to the
 * authenticated caller, so a user can't pass someone else's session id.
 *
 * The write goes through `reconcileUserSubscription`, which looks at the
 * customer's whole subscription list — so replaying an OLD success URL (a
 * bookmark, browser history) can never downgrade someone who has since
 * started a newer subscription.
 */
export async function POST(request: NextRequest) {
  const authResult = await authenticateRequest(request);
  if (isAuthError(authResult)) {
    return errorResponse(authResult.error, authResult.status);
  }
  const { user } = authResult;

  const rateLimit = checkRateLimit(`verify-checkout:${user.id}`, RATE_LIMITS.general);
  if (!rateLimit.success) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
  }

  let sessionId: unknown;
  try {
    ({ sessionId } = await request.json());
  } catch {
    return errorResponse('Invalid request body', 400);
  }

  if (typeof sessionId !== 'string' || !sessionId.startsWith('cs_')) {
    return errorResponse('Invalid session id', 400);
  }

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    return errorResponse('Checkout session not found', 404);
  }

  // Ownership: the session must belong to the authenticated user.
  const owner = session.metadata?.userId ?? session.client_reference_id;
  if (owner !== user.id) {
    return errorResponse('This checkout session does not belong to you', 403);
  }

  const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;

  try {
    const result = await reconcileUserSubscription({
      userId: user.id,
      customerIds: [customerId],
      email: user.email,
    });

    const paid = session.payment_status === 'paid' || session.status === 'complete';

    return NextResponse.json({
      tier: result.tier,
      reconciled: true,
      status: session.status,
      // Lets the dashboard tell "payment still processing" apart from "done".
      pending: paid && result.tier === 'free',
    });
  } catch (error) {
    const e = error as { message?: string };
    console.error('[Verify Checkout] Failed to reconcile tier:', e.message ?? error);
    return errorResponse('Failed to reconcile subscription', 500);
  }
}
