import type Stripe from 'stripe';
import { stripe } from '@/lib/stripe/server';
import { createServiceClient, type Database } from '@/lib/supabase/client';
import { getTierFromSubscription } from '@/lib/stripe/tier';
import { isPaidStatus, pickBestSubscription } from '@/lib/stripe/select-subscription';
import type { Tier } from '@/lib/access-control';

type UsersRow = Database['public']['Tables']['users']['Row'];
type BillingColumns = Pick<
  UsersRow,
  'id' | 'email' | 'tier' | 'stripe_customer_id' | 'stripe_subscription_id' | 'subscription_status'
>;

export interface ReconcileResult {
  tier: Tier;
  previousTier: Tier;
  /** The subscription now driving the tier (may be canceled / null). */
  subscription: Stripe.Subscription | null;
  customerId: string | null;
}

/**
 * Re-derives a user's billing columns from Stripe — the source of truth — and
 * writes them to `public.users`.
 *
 * Every write to `tier` / `stripe_*` / `subscription_status` in the app goes
 * through here (webhook, post-checkout verification, cancel, account page
 * sync). That gives one place with one rule, and makes each caller idempotent
 * and safe to run in any order:
 *
 *   - It looks at ALL of the customer's subscriptions, not the one named in an
 *     event, so a stale `customer.subscription.updated` for an old subscription
 *     can't downgrade someone who has since re-subscribed.
 *   - It considers both the customer id stored on the row and any extra ids the
 *     caller knows about (e.g. from an event), so a user who accidentally ended
 *     up with two Stripe customers is still resolved correctly.
 *   - It upserts, so an auth user whose `public.users` row is missing (the
 *     signup trigger swallows errors by design) still gets the tier they paid
 *     for instead of a silent no-op UPDATE.
 *
 * The most recent subscription id is kept on the row even when it is
 * canceled — the admin subscriptions page uses it to show churn — so callers
 * must check `subscription_status` (or the live Stripe object) before acting
 * on it.
 */
export async function reconcileUserSubscription(opts: {
  userId: string;
  /** Extra Stripe customer ids to consider besides the one on the users row. */
  customerIds?: Array<string | null | undefined>;
  /** Used only when the users row has to be created. */
  email?: string | null;
}): Promise<ReconcileResult> {
  const supabase = createServiceClient();

  const { data: row, error: rowError } = await supabase
    .from('users')
    .select('id, email, tier, stripe_customer_id, stripe_subscription_id, subscription_status')
    .eq('id', opts.userId)
    .maybeSingle<BillingColumns>();

  if (rowError) {
    throw new Error(`Failed to load user ${opts.userId}: ${rowError.message}`);
  }

  const previousTier: Tier = row?.tier ?? 'free';

  const customerIds = new Set(
    [row?.stripe_customer_id, ...(opts.customerIds ?? [])].filter(
      (id): id is string => typeof id === 'string' && id.startsWith('cus_'),
    ),
  );

  // A row that knows a subscription but not its customer (legacy data, or a
  // customer id that was never persisted) must still find that subscription —
  // otherwise a paying member would be reconciled to "free".
  if (row?.stripe_subscription_id) {
    try {
      const known = await stripe.subscriptions.retrieve(row.stripe_subscription_id);
      customerIds.add(typeof known.customer === 'string' ? known.customer : known.customer.id);
    } catch (err) {
      const e = err as { code?: string; message?: string };
      if (e.code !== 'resource_missing') {
        throw new Error(`Stripe subscriptions.retrieve failed for ${row.stripe_subscription_id}: ${e.message}`);
      }
    }
  }

  const subscriptions: Stripe.Subscription[] = [];
  for (const customerId of customerIds) {
    try {
      const page = await stripe.subscriptions.list({
        customer: customerId,
        status: 'all',
        limit: 100,
      });
      subscriptions.push(...page.data);
    } catch (err) {
      const e = err as { code?: string; message?: string };
      // A deleted customer simply has no subscriptions; anything else is a
      // real failure and must not be reconciled as "free".
      if (e.code !== 'resource_missing') {
        throw new Error(`Stripe subscriptions.list failed for ${customerId}: ${e.message}`);
      }
    }
  }

  const best = pickBestSubscription(subscriptions);
  const tier: Tier = best && isPaidStatus(best.status) ? getTierFromSubscription(best) : 'free';

  const customerId =
    (best ? (typeof best.customer === 'string' ? best.customer : best.customer.id) : null) ??
    row?.stripe_customer_id ??
    [...customerIds][0] ??
    null;

  const payload: Database['public']['Tables']['users']['Insert'] = {
    id: opts.userId,
    email: row?.email ?? opts.email ?? '',
    tier,
    stripe_customer_id: customerId,
    stripe_subscription_id: best?.id ?? row?.stripe_subscription_id ?? null,
    subscription_status: best?.status ?? (row?.stripe_subscription_id ? row.subscription_status : null),
    updated_at: new Date().toISOString(),
  };

  const { error: writeError } = await supabase
    .from('users')
    .upsert(payload as never, { onConflict: 'id' });

  if (writeError) {
    throw new Error(`Failed to write billing state for ${opts.userId}: ${writeError.message}`);
  }

  return { tier, previousTier, subscription: best, customerId };
}

/**
 * Makes sure `public.users` has a row for this auth user. The signup trigger
 * normally creates it, but it is written to swallow errors rather than block
 * signup, so a missing row is possible and must not break checkout.
 */
export async function ensureUserRow(userId: string, email: string | null | undefined) {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from('users')
    .select('id, email, tier, stripe_customer_id, stripe_subscription_id, subscription_status')
    .eq('id', userId)
    .maybeSingle<BillingColumns>();
  if (data) return data;

  const insert: Database['public']['Tables']['users']['Insert'] = {
    id: userId,
    email: email ?? '',
    tier: 'free',
  };
  const { error } = await supabase.from('users').upsert(insert as never, { onConflict: 'id' });
  if (error) throw new Error(`Failed to create users row for ${userId}: ${error.message}`);

  return { ...insert, stripe_customer_id: null, stripe_subscription_id: null, subscription_status: null } as BillingColumns;
}

/**
 * Persist a freshly created Stripe customer id on the users row immediately,
 * so an abandoned checkout doesn't leave the next attempt creating yet
 * another customer.
 */
export async function saveCustomerId(userId: string, customerId: string) {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from('users')
    .update({ stripe_customer_id: customerId, updated_at: new Date().toISOString() } as never)
    .eq('id', userId);
  if (error) {
    // Non-fatal: reconcile() will pick the id up from the subscription later.
    console.error('[Stripe] Failed to persist customer id', { userId, customerId, error: error.message });
  }
}
