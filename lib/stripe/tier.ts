import type Stripe from 'stripe';
import { type Tier } from '@/lib/access-control';

/**
 * Maps Stripe price IDs to Cortex tiers. Shared by the webhook and the
 * post-checkout reconciliation endpoint so the two can't drift.
 */
export function getPriceIdToTierMap(): Record<string, Tier> {
  return {
    // Finance Pro (monthly and annual)
    [process.env.NEXT_PUBLIC_STRIPE_FINANCE_PRO_MONTHLY_PRICE_ID!]: 'finance_pro',
    [process.env.NEXT_PUBLIC_STRIPE_FINANCE_PRO_ANNUAL_PRICE_ID!]: 'finance_pro',

    // Legacy Elite (maps to finance_pro for backward compatibility)
    [process.env.NEXT_PUBLIC_STRIPE_ELITE_MONTHLY_PRICE_ID!]: 'finance_pro',
    [process.env.NEXT_PUBLIC_STRIPE_ELITE_ANNUAL_PRICE_ID!]: 'finance_pro',

    // Legacy (maps to finance_pro for backward compatibility)
    [process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID!]: 'finance_pro',
  };
}

export function getTierFromSubscription(subscription: Stripe.Subscription): Tier {
  const priceId = subscription.items.data[0]?.price.id;
  if (!priceId) return 'free';
  return getPriceIdToTierMap()[priceId] || 'free';
}

/**
 * Statuses under which the subscriber KEEPS their paid tier. `past_due` is
 * included on purpose — Stripe is still retrying the charge (dunning), so
 * downgrading over a single failed retry would strip access from a paying
 * customer. Terminal states fall through to 'free'.
 */
export const PAID_STATUSES = new Set<Stripe.Subscription.Status>([
  'active',
  'trialing',
  'past_due',
]);

export function tierForSubscription(subscription: Stripe.Subscription): Tier {
  return PAID_STATUSES.has(subscription.status)
    ? getTierFromSubscription(subscription)
    : 'free';
}
