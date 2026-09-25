/** The parts of a Stripe subscription that MRR depends on. */
export interface MrrSubscription {
  status: string;
  items: {
    data: ReadonlyArray<{
      price?: {
        unit_amount: number | null;
        recurring: { interval: string } | null;
      } | null;
    }>;
  };
}

/**
 * Monthly recurring revenue in dollars, rounded to cents: active
 * subscriptions only, priced by their first item, with yearly prices spread
 * over 12 months. `null` entries (subscriptions that could not be loaded)
 * count as nothing. These are the rules the admin dashboard has always used.
 */
export function computeMrr(subscriptions: ReadonlyArray<MrrSubscription | null>): number {
  let mrr = 0;
  for (const sub of subscriptions) {
    if (sub && sub.status === 'active') {
      const price = sub.items.data[0]?.price;
      if (price?.unit_amount && price?.recurring) {
        const amount = price.unit_amount / 100;
        mrr += price.recurring.interval === 'year' ? amount / 12 : amount;
      }
    }
  }
  return Math.round(mrr * 100) / 100;
}
