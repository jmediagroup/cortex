import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe/server';
import { createServiceClient } from '@/lib/supabase/client';
import { getTierFromSubscription, tierForSubscription } from '@/lib/stripe/tier';
import { trackServerEvent } from '@/lib/analytics-server';

type ServiceClient = ReturnType<typeof createServiceClient>;

/**
 * Resolve the Cortex user id for a Stripe event. Prefers the `userId` we stamp
 * on session/subscription metadata, but falls back to a DB lookup by
 * subscription id then customer id — so a subscription changed outside our
 * checkout (e.g. from the Stripe dashboard or the billing portal) still maps
 * back to the right user instead of silently no-oping.
 */
async function resolveUserId(
  supabase: ServiceClient,
  opts: { metadataUserId?: string | null; subscriptionId?: string | null; customerId?: string | null },
): Promise<string | null> {
  if (opts.metadataUserId) return opts.metadataUserId;

  if (opts.subscriptionId) {
    const { data } = await supabase
      .from('users')
      .select('id')
      .eq('stripe_subscription_id', opts.subscriptionId)
      .maybeSingle();
    if (data?.id) return data.id as string;
  }

  if (opts.customerId) {
    const { data } = await supabase
      .from('users')
      .select('id')
      .eq('stripe_customer_id', opts.customerId)
      .maybeSingle();
    if (data?.id) return data.id as string;
  }

  return null;
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    console.error('[Webhook] No signature found in request');
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`[Webhook] Signature verification failed: ${err.message}`);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Idempotency: skip events we've already fully processed (Stripe retries
  // deliveries, and can send the same event more than once).
  const { data: alreadyProcessed } = await supabase
    .from('webhook_events')
    .select('id')
    .eq('id', event.id)
    .maybeSingle();
  if (alreadyProcessed) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const userId = await resolveUserId(supabase, {
          metadataUserId: subscription.metadata.userId,
          subscriptionId: subscription.id,
          customerId,
        });

        if (!userId) {
          console.error('[Webhook] Could not resolve userId for subscription', subscription.id);
          break;
        }

        const tier = tierForSubscription(subscription);

        const { error } = await (supabase.from('users').update as any)({
          tier,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscription.id,
          subscription_status: subscription.status,
          updated_at: new Date().toISOString(),
        }).eq('id', userId);

        if (error) {
          console.error('[Webhook] Database update failed:', error);
          throw new Error('DB update failed');
        }

        if (event.type === 'customer.subscription.created' || subscription.status === 'active') {
          await trackServerEvent(userId, 'subscription_upgrade', {
            new_tier: tier,
            subscription_id: subscription.id,
            subscription_status: subscription.status,
          });
        }

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = await resolveUserId(supabase, {
          metadataUserId: subscription.metadata.userId,
          subscriptionId: subscription.id,
          customerId: subscription.customer as string,
        });

        if (!userId) {
          console.error('[Webhook] Could not resolve userId for deleted subscription', subscription.id);
          break;
        }

        const oldTier = getTierFromSubscription(subscription);

        const { error } = await (supabase.from('users').update as any)({
          tier: 'free',
          subscription_status: 'canceled',
          updated_at: new Date().toISOString(),
        }).eq('id', userId);

        if (error) {
          console.error('[Webhook] Database update failed:', error);
          throw new Error('DB update failed');
        }

        await trackServerEvent(userId, 'subscription_cancel', {
          old_tier: oldTier,
          new_tier: 'free',
          subscription_id: subscription.id,
        });

        break;
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;
        const userId = await resolveUserId(supabase, {
          metadataUserId: session.metadata?.userId,
          subscriptionId,
          customerId,
        });

        if (!userId) {
          console.error('[Webhook] Could not resolve userId for checkout session', session.id);
          break;
        }

        if (!subscriptionId) {
          console.error('[Webhook] No subscription ID in checkout session');
          break;
        }

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const tier = tierForSubscription(subscription);

        const { error } = await (supabase.from('users').update as any)({
          tier,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          subscription_status: subscription.status,
          updated_at: new Date().toISOString(),
        }).eq('id', userId);

        if (error) {
          console.error('[Webhook] Database update failed:', error);
          throw new Error('DB update failed');
        }

        await trackServerEvent(userId, 'subscription_upgrade', {
          new_tier: tier,
          subscription_id: subscriptionId,
          subscription_status: subscription.status,
          checkout_session_id: session.id,
        });

        break;
      }

      default:
        // Unhandled event type — nothing to do, but still mark it processed below.
        break;
    }

    // Mark processed only after the handler succeeded, so a failed handler is
    // retried by Stripe rather than silently skipped.
    await supabase
      .from('webhook_events')
      .insert({ id: event.id, type: event.type, processed_at: new Date().toISOString() } as any);

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[Webhook] handler error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
