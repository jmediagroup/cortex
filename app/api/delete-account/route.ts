import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripe } from '@/lib/stripe/server';
import { createServiceClient } from '@/lib/supabase/client';
import { authenticateRequest, isAuthError, errorResponse } from '@/lib/auth-helpers';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

/** Subscription statuses that are already over and need no cancel call. */
const TERMINAL: ReadonlySet<Stripe.Subscription.Status> = new Set(['canceled', 'incomplete_expired']);

/**
 * POST /api/delete-account
 *
 * Permanently deletes the caller's account:
 *   1. Cancels every non-terminal Stripe subscription on their customer(s)
 *      immediately. Hard-fails if that errors, so we never delete an account
 *      that is still being billed. Already-canceled subscriptions are skipped
 *      rather than treated as an error (the old code refused to delete the
 *      account of anyone whose subscription had simply ended).
 *   2. Deletes the Stripe customer (best-effort) so their email/card details
 *      don't outlive the account. Stripe keeps invoices for accounting.
 *   3. Removes their marketing/outlook subscription rows (PII) — that FK is
 *      ON DELETE SET NULL, so it is NOT cleaned up automatically.
 *   4. Deletes the auth user. `public.users` (and events, scenarios, …)
 *      cascade off `auth.users`, so this is the step that actually removes
 *      the account; a belt-and-braces users-row delete follows.
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (isAuthError(authResult)) {
      return errorResponse(authResult.error, authResult.status);
    }
    const { user } = authResult;
    const userId = user.id;
    const email = user.email ?? null;

    const rateLimit = checkRateLimit(`delete:${userId}`, RATE_LIMITS.cancelSubscription);
    if (!rateLimit.success) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const supabase = createServiceClient();

    const { data: row } = await supabase
      .from('users')
      .select('stripe_customer_id, stripe_subscription_id')
      .eq('id', userId)
      .maybeSingle<{ stripe_customer_id: string | null; stripe_subscription_id: string | null }>();

    // --- 1. Stop billing --------------------------------------------------
    const customerIds = new Set<string>();
    if (row?.stripe_customer_id) customerIds.add(row.stripe_customer_id);

    // A subscription id on the row whose customer we don't have stored
    // (legacy rows) — resolve its customer so we sweep everything.
    if (row?.stripe_subscription_id) {
      try {
        const sub = await stripe.subscriptions.retrieve(row.stripe_subscription_id);
        customerIds.add(typeof sub.customer === 'string' ? sub.customer : sub.customer.id);
      } catch (err) {
        if ((err as { code?: string }).code !== 'resource_missing') throw err;
      }
    }

    for (const customerId of customerIds) {
      let subs: Stripe.Subscription[] = [];
      try {
        subs = (await stripe.subscriptions.list({ customer: customerId, status: 'all', limit: 100 })).data;
      } catch (err) {
        if ((err as { code?: string }).code === 'resource_missing') continue; // customer already gone
        throw err;
      }

      for (const sub of subs) {
        if (TERMINAL.has(sub.status)) continue;
        try {
          await stripe.subscriptions.cancel(sub.id);
        } catch (err) {
          const e = err as { code?: string; message?: string };
          if (e.code === 'resource_missing') continue;
          console.error('[Delete Account] Stripe cancellation failed:', sub.id, e.message);
          return NextResponse.json(
            {
              error:
                'We could not cancel your active subscription, so your account was not deleted. Please try again, or cancel your subscription first.',
            },
            { status: 502 },
          );
        }
      }
    }

    // --- 2. Remove the Stripe customer (PII) — best-effort ----------------
    for (const customerId of customerIds) {
      try {
        await stripe.customers.del(customerId);
      } catch (err) {
        const e = err as { code?: string; message?: string };
        if (e.code !== 'resource_missing') {
          console.error('[Delete Account] Failed to delete Stripe customer', customerId, e.message);
        }
      }
    }

    // --- 3. Marketing / outlook rows (PII) --------------------------------
    const { error: outlookByUserErr } = await supabase
      .from('outlook_subscribers')
      .delete()
      .eq('user_id', userId);
    if (outlookByUserErr) {
      console.error('[Delete Account] Failed to delete outlook subscription by user_id:', outlookByUserErr);
    }
    if (email) {
      const { error: outlookByEmailErr } = await supabase
        .from('outlook_subscribers')
        .delete()
        .eq('email', email);
      if (outlookByEmailErr) {
        console.error('[Delete Account] Failed to delete outlook subscription by email:', outlookByEmailErr);
      }
    }

    // --- 4. The account itself --------------------------------------------
    // Auth first: public.users cascades from auth.users, and deleting the
    // profile row before the auth user would leave a login that works but
    // has no profile if this call failed part-way.
    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(userId);
    if (deleteAuthError) {
      console.error('[Delete Account] Failed to delete from Supabase Auth:', deleteAuthError);
      return NextResponse.json(
        { error: 'Failed to delete account from authentication system' },
        { status: 500 },
      );
    }

    const { error: deleteUserError } = await supabase.from('users').delete().eq('id', userId);
    if (deleteUserError) {
      // Cascade normally handles this; log so a missing FK is noticed.
      console.error('[Delete Account] Failed to delete from users table:', deleteUserError);
    }

    return NextResponse.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    const e = error as { message?: string };
    console.error('[Delete Account] Unexpected error:', e.message ?? error);
    return errorResponse('Could not delete your account. Please try again.', 500);
  }
}
