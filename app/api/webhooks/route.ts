import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe/server';
import { createServiceClient } from '@/lib/supabase/client';
import { reconcileUserSubscription } from '@/lib/stripe/reconcile';
import { trackServerEvent } from '@/lib/analytics-server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type ServiceClient = ReturnType<typeof createServiceClient>;

/**
 * POST /api/webhooks — Stripe webhook receiver.
 *
 * Design: every billing-related event triggers a full re-sync of that user's
 * billing state from Stripe (see lib/stripe/reconcile.ts) rather than
 * applying the event payload directly. Stripe does not guarantee ordering and
 * does retry deliveries, so a handler that trusts the payload can downgrade a
 * paying customer when an old `customer.subscription.updated` lands after a
 * newer one. A full re-sync is idempotent and order-independent by
 * construction, which is what makes it safe to receive the same event twice
 * or out of sequence.
 *
 * Idempotency: the event id is inserted into `webhook_events` BEFORE
 * processing (an atomic claim — a concurrent duplicate delivery hits the
 * primary key and is skipped). If processing fails the claim is released so
 * Stripe's retry gets another go.
 */

/** Event types that can change a user's entitlement. Everything else is ack'd and ignored. */
const BILLING_EVENTS = new Set<Stripe.Event.Type>([
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'customer.subscription.paused',
  'customer.subscription.resumed',
  'invoice.paid',
  'invoice.payment_failed',
]);

interface BillingRefs {
  metadataUserId: string | null;
  subscriptionId: string | null;
  customerId: string | null;
}

function idOf(ref: string | { id: string } | null | undefined): string | null {
  if (!ref) return null;
  return typeof ref === 'string' ? ref : ref.id;
}

/** Pull the user / subscription / customer references out of any billing event. */
function extractRefs(event: Stripe.Event): BillingRefs {
  switch (event.type) {
    case 'checkout.session.completed': {
      const s = event.data.object as Stripe.Checkout.Session;
      return {
        metadataUserId: s.metadata?.userId ?? s.client_reference_id ?? null,
        subscriptionId: idOf(s.subscription),
        customerId: idOf(s.customer),
      };
    }
    case 'invoice.paid':
    case 'invoice.payment_failed': {
      const inv = event.data.object as Stripe.Invoice;
      return {
        metadataUserId: inv.subscription_details?.metadata?.userId ?? null,
        subscriptionId: idOf(inv.subscription),
        customerId: idOf(inv.customer),
      };
    }
    default: {
      const sub = event.data.object as Stripe.Subscription;
      return {
        metadataUserId: sub.metadata?.userId ?? null,
        subscriptionId: sub.id,
        customerId: idOf(sub.customer),
      };
    }
  }
}

/**
 * Resolve the Cortex user id for a Stripe event. Prefers the `userId` we stamp
 * on session/subscription metadata, but falls back to a DB lookup by
 * subscription id then customer id — so a subscription changed outside our
 * checkout (e.g. from the Stripe dashboard or the billing portal) still maps
 * back to the right user instead of silently no-oping.
 */
async function resolveUserId(supabase: ServiceClient, refs: BillingRefs): Promise<string | null> {
  if (refs.metadataUserId) return refs.metadataUserId;

  if (refs.subscriptionId) {
    const { data } = await supabase
      .from('users')
      .select('id')
      .eq('stripe_subscription_id', refs.subscriptionId)
      .maybeSingle();
    if (data?.id) return data.id as string;
  }

  if (refs.customerId) {
    const { data } = await supabase
      .from('users')
      .select('id')
      .eq('stripe_customer_id', refs.customerId)
      .maybeSingle();
    if (data?.id) return data.id as string;
  }

  return null;
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    // Misconfiguration, not a bad request: return 500 so Stripe keeps
    // retrying and the failure is visible in the Stripe dashboard.
    console.error('[Webhook] STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    const e = err as { message?: string };
    console.error(`[Webhook] Signature verification failed: ${e.message}`);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createServiceClient();

  // --- Atomic idempotency claim -------------------------------------------
  const { error: claimError } = await supabase
    .from('webhook_events')
    .insert({ id: event.id, type: event.type } as never);

  if (claimError) {
    if (claimError.code === '23505') {
      // Primary-key collision: already processed (or in flight elsewhere).
      return NextResponse.json({ received: true, duplicate: true });
    }
    console.error('[Webhook] Failed to record event:', claimError);
    return NextResponse.json({ error: 'Failed to record event' }, { status: 500 });
  }

  const releaseClaim = async () => {
    const { error } = await supabase.from('webhook_events').delete().eq('id', event.id);
    if (error) console.error('[Webhook] Failed to release claim for', event.id, error);
  };

  if (!BILLING_EVENTS.has(event.type)) {
    return NextResponse.json({ received: true, ignored: true });
  }

  try {
    const refs = extractRefs(event);
    const userId = await resolveUserId(supabase, refs);

    if (!userId) {
      // Nothing to attach this to (e.g. a subscription created directly in
      // the Stripe dashboard for a customer we don't know). Ack it: a retry
      // would not help, and the next event carrying metadata will re-sync.
      console.error('[Webhook] Could not resolve user for event', event.type, event.id, refs);
      return NextResponse.json({ received: true, unresolved: true });
    }

    const result = await reconcileUserSubscription({
      userId,
      customerIds: [refs.customerId],
    });

    if (result.previousTier === 'free' && result.tier !== 'free') {
      await trackServerEvent(userId, 'subscription_upgrade', {
        new_tier: result.tier,
        subscription_id: result.subscription?.id,
        subscription_status: result.subscription?.status,
        source_event: event.type,
      });
    } else if (result.previousTier !== 'free' && result.tier === 'free') {
      await trackServerEvent(userId, 'subscription_cancel', {
        old_tier: result.previousTier,
        new_tier: 'free',
        subscription_id: result.subscription?.id,
        source_event: event.type,
      });
    }

    return NextResponse.json({ received: true, tier: result.tier });
  } catch (error) {
    const e = error as { message?: string };
    console.error('[Webhook] handler error:', e.message ?? error);
    // Release the claim so Stripe's retry is processed rather than skipped.
    await releaseClaim();
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
