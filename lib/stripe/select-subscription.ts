import type Stripe from 'stripe';

/**
 * Pure helpers for deciding which of a customer's Stripe subscriptions
 * represents their entitlement. Kept free of imports and env access so it can
 * be unit-tested with plain `node --test`.
 */

/**
 * Statuses under which the subscriber KEEPS their paid tier. `past_due` is
 * included on purpose — Stripe is still retrying the charge (dunning), so
 * downgrading over a single failed retry would strip access from a paying
 * customer. Terminal states fall through to 'free'.
 */
export const PAID_STATUSES: ReadonlySet<Stripe.Subscription.Status> = new Set<
  Stripe.Subscription.Status
>(['active', 'trialing', 'past_due']);

export function isPaidStatus(status: Stripe.Subscription.Status | null | undefined): boolean {
  return status != null && PAID_STATUSES.has(status);
}

/** Rank of a status when several subscriptions exist; lower wins. */
const STATUS_RANK: Record<Stripe.Subscription.Status, number> = {
  active: 0,
  trialing: 1,
  past_due: 2,
  unpaid: 3,
  incomplete: 4,
  paused: 5,
  canceled: 6,
  incomplete_expired: 7,
};

/**
 * Picks the subscription that should drive the user's tier.
 *
 * Preference order: any paid-status subscription beats any non-paid one; among
 * equals the most recently created wins. Returns `null` when the list is empty.
 *
 * Deterministic and order-independent, which is the whole point: Stripe can
 * deliver `customer.subscription.updated` for an OLD subscription after the
 * user has already started a NEW one, and a handler that trusts the event
 * payload alone would downgrade a paying customer. Feeding the full list of a
 * customer's subscriptions through this function makes every event a
 * harmless re-sync.
 */
export function pickBestSubscription<T extends Pick<Stripe.Subscription, 'status' | 'created'>>(
  subscriptions: readonly T[],
): T | null {
  if (subscriptions.length === 0) return null;

  return subscriptions.reduce<T | null>((best, candidate) => {
    if (!best) return candidate;
    const bestRank = STATUS_RANK[best.status] ?? 99;
    const candidateRank = STATUS_RANK[candidate.status] ?? 99;
    if (candidateRank !== bestRank) return candidateRank < bestRank ? candidate : best;
    return candidate.created > best.created ? candidate : best;
  }, null);
}

/**
 * Builds a price-id → tier lookup, skipping unset ids. (Indexing an object
 * with an undefined env var produces a literal "undefined" key — harmless, but
 * misleading in logs and easy to mistake for a real price.)
 */
export function buildPriceTierMap<T extends string>(
  entries: ReadonlyArray<readonly [priceId: string | undefined | null, tier: T]>,
): Record<string, T> {
  const map: Record<string, T> = {};
  for (const [priceId, tier] of entries) {
    if (priceId) map[priceId] = tier;
  }
  return map;
}

type SubscriptionLike = {
  status: Stripe.Subscription.Status;
  items: { data: Array<{ price: { id: string } }> };
};

/** Tier implied by a subscription's first price, ignoring its status. */
export function tierForPrice<T extends string>(
  subscription: SubscriptionLike,
  priceMap: Record<string, T>,
  free: T,
): T {
  const priceId = subscription.items.data[0]?.price.id;
  if (!priceId) return free;
  return priceMap[priceId] ?? free;
}

/** Tier the subscriber is entitled to right now: price-derived only while paid. */
export function resolveTier<T extends string>(
  subscription: SubscriptionLike,
  priceMap: Record<string, T>,
  free: T,
): T {
  return isPaidStatus(subscription.status) ? tierForPrice(subscription, priceMap, free) : free;
}
