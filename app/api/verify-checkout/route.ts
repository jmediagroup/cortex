import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripe } from '@/lib/stripe/server';
import { createServiceClient } from '@/lib/supabase/client';
import { authenticateRequest, isAuthError, errorResponse } from '@/lib/auth-helpers';
import { tierForSubscription } from '@/lib/stripe/tier';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

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
    session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['subscription'] });
  } catch {
    return errorResponse('Checkout session not found', 404);
  }

  // Ownership: the session must belong to the authenticated user.
  if (session.metadata?.userId !== user.id) {
    return errorResponse('This checkout session does not belong to you', 403);
  }

  // Not paid yet (or abandoned) — report free without touching the row.
  if (session.payment_status !== 'paid' && session.status !== 'complete') {
    return NextResponse.json({ tier: 'free', reconciled: false, status: session.status });
  }

  const subscription =
    typeof session.subscription === 'string'
      ? await stripe.subscriptions.retrieve(session.subscription)
      : (session.subscription as Stripe.Subscription | null);

  if (!subscription) {
    return NextResponse.json({ tier: 'free', reconciled: false });
  }

  const tier = tierForSubscription(subscription);
  const supabase = createServiceClient();
  const { error } = await (supabase.from('users').update as any)({
    tier,
    stripe_customer_id: session.customer as string,
    stripe_subscription_id: subscription.id,
    subscription_status: subscription.status,
    updated_at: new Date().toISOString(),
  }).eq('id', user.id);

  if (error) {
    console.error('[Verify Checkout] Failed to reconcile tier:', error);
    return errorResponse('Failed to reconcile subscription', 500);
  }

  return NextResponse.json({ tier, reconciled: true });
}
