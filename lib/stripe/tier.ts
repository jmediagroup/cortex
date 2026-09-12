import type Stripe from 'stripe';
import { type Tier } from '@/lib/access-control';
import {
  PAID_STATUSES,
  isPaidStatus,
  buildPriceTierMap,
  tierForPrice,
  resolveTier,
} from '@/lib/stripe/select-subscription';

export { PAID_STATUSES, isPaidStatus };

/**
 * Maps Stripe price IDs to Cortex tiers. Shared by the webhook, the
 * post-checkout reconciliation endpoint and the checkout allow-list so they
 * can't drift. The pure logic lives in select-subscription.ts (unit-tested);
 * this file only binds it to the environment.
 */
export function getPriceIdToTierMap(): Record<string, Tier> {
  return buildPriceTierMap<Tier>([
    // Finance Pro (monthly and annual)
    [process.env.NEXT_PUBLIC_STRIPE_FINANCE_PRO_MONTHLY_PRICE_ID, 'finance_pro'],
    [process.env.NEXT_PUBLIC_STRIPE_FINANCE_PRO_ANNUAL_PRICE_ID, 'finance_pro'],
    // Legacy Elite (maps to finance_pro for backward compatibility)
    [process.env.NEXT_PUBLIC_STRIPE_ELITE_MONTHLY_PRICE_ID, 'finance_pro'],
    [process.env.NEXT_PUBLIC_STRIPE_ELITE_ANNUAL_PRICE_ID, 'finance_pro'],
    // Legacy (maps to finance_pro for backward compatibility)
    [process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID, 'finance_pro'],
  ]);
}

export function getTierFromSubscription(subscription: Stripe.Subscription): Tier {
  return tierForPrice<Tier>(subscription, getPriceIdToTierMap(), 'free');
}

export function tierForSubscription(subscription: Stripe.Subscription): Tier {
  return resolveTier<Tier>(subscription, getPriceIdToTierMap(), 'free');
}
