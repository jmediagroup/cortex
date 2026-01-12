import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe/server';
import { createServiceClient, type Database } from '@/lib/supabase/client';
import { type Tier } from '@/lib/access-control';
import { trackServerEvent } from '@/lib/analytics-server';

// Map Stripe price IDs to tier names
function getPriceIdToTierMap(): Record<string, Tier> {
  return {
    // Finance Pro (monthly and annual)
    [process.env.NEXT_PUBLIC_STRIPE_FINANCE_PRO_MONTHLY_PRICE_ID!]: 'finance_pro',
    [process.env.NEXT_PUBLIC_STRIPE_FINANCE_PRO_ANNUAL_PRICE_ID!]: 'finance_pro',

    // Elite (monthly and annual)
    [process.env.NEXT_PUBLIC_STRIPE_ELITE_MONTHLY_PRICE_ID!]: 'elite',
    [process.env.NEXT_PUBLIC_STRIPE_ELITE_ANNUAL_PRICE_ID!]: 'elite',

    // Legacy (maps to finance_pro for backward compatibility)
    [process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID!]: 'finance_pro',
  };
}

// Determine tier from a Stripe subscription
function getTierFromSubscription(subscription: Stripe.Subscription): Tier {
  const priceId = subscription.items.data[0]?.price.id;
  if (!priceId) return 'free';

  const priceToTierMap = getPriceIdToTierMap();
  return priceToTierMap[priceId] || 'free';
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  console.log('[Webhook] Received webhook request');

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
    console.log(`[Webhook] Event verified: ${event.type} (${event.id})`);
  } catch (err: any) {
    console.error(`[Webhook] Signature verification failed: ${err.message}`);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  const supabase = createServiceClient();

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const userId = subscription.metadata.userId;

        console.log(`[Webhook] Processing subscription ${event.type}`, {
          subscriptionId: subscription.id,
          customerId,
          userId,
          status: subscription.status,
          metadata: subscription.metadata
        });

        if (!userId) {
          console.error('[Webhook] No userId in subscription metadata');
          break;
        }

        // Determine tier from subscription price ID
        const tier = subscription.status === 'active' ? getTierFromSubscription(subscription) : 'free';

        console.log(`[Webhook] Determined tier: ${tier} for subscription ${subscription.id}`);

        const { data, error } = await (supabase
          .from('users')
          .update as any)({
            tier,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscription.id,
            subscription_status: subscription.status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        if (error) {
          console.error('[Webhook] Database update failed:', error);
        } else {
          console.log(`[Webhook] Successfully updated user tier to ${tier} for userId:`, userId);

          // Track subscription upgrade event
          if (event.type === 'customer.subscription.created' || subscription.status === 'active') {
            await trackServerEvent(userId, 'subscription_upgrade', {
              new_tier: tier,
              subscription_id: subscription.id,
              subscription_status: subscription.status,
            });
          }
        }

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata.userId;

        if (!userId) {
          console.error('No userId in subscription metadata');
          break;
        }

        const oldTier = getTierFromSubscription(subscription);

        await (supabase
          .from('users')
          .update as any)({
            tier: 'free',
            subscription_status: 'canceled',
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        // Track subscription cancellation
        await trackServerEvent(userId, 'subscription_cancel', {
          old_tier: oldTier,
          new_tier: 'free',
          subscription_id: subscription.id,
        });

        break;
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;

        console.log('[Webhook] Processing checkout.session.completed', {
          sessionId: session.id,
          userId,
          customerId: session.customer,
          subscriptionId: session.subscription,
          metadata: session.metadata
        });

        if (!userId) {
          console.error('[Webhook] No userId in session metadata:', session.metadata);
          break;
        }

        // Get the subscription
        const subscriptionId = session.subscription as string;

        if (!subscriptionId) {
          console.error('[Webhook] No subscription ID in checkout session');
          break;
        }

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        console.log('[Webhook] Retrieved subscription:', {
          id: subscription.id,
          status: subscription.status
        });

        // Determine tier from subscription price ID
        const tier = getTierFromSubscription(subscription);

        console.log(`[Webhook] Determined tier: ${tier} from checkout session`);

        const { data, error} = await (supabase
          .from('users')
          .update as any)({
            tier,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: subscriptionId,
            subscription_status: subscription.status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        if (error) {
          console.error('[Webhook] Database update failed:', error);
        } else {
          console.log(`[Webhook] Successfully updated user tier to ${tier} for userId:`, userId);

          // Track successful checkout/upgrade
          await trackServerEvent(userId, 'subscription_upgrade', {
            new_tier: tier,
            subscription_id: subscriptionId,
            subscription_status: subscription.status,
            checkout_session_id: session.id,
          });
        }

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
