import Stripe from 'stripe';
import { siteUrl } from '@/lib/site-url';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
});

export interface CheckoutSessionResult {
  session: Stripe.Checkout.Session;
  /** The customer the session was created for. */
  customerId: string;
  /** True when this call had to create a new Stripe customer. */
  createdCustomer: boolean;
}

export async function createCheckoutSession(opts: {
  customerId: string | null;
  priceId: string;
  userId: string;
  userEmail: string;
}): Promise<CheckoutSessionResult> {
  const { priceId, userId, userEmail } = opts;
  let customerId = opts.customerId;
  let createdCustomer = false;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: userEmail,
      metadata: { userId },
    });
    customerId = customer.id;
    createdCustomer = true;
  }

  const origin = siteUrl();

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    // Carry the session id back so /dashboard can reconcile the tier
    // server-side if the webhook is delayed or fails.
    success_url: `${origin}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/pricing?canceled=true`,
    // Both metadata blocks AND client_reference_id carry the user id, so any
    // Stripe object we get back (session, subscription, invoice) can be mapped
    // to a Cortex user without a DB lookup.
    client_reference_id: userId,
    metadata: { userId },
    subscription_data: { metadata: { userId } },
  });

  return { session, customerId, createdCustomer };
}

export async function createCustomerPortalSession(customerId: string) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${siteUrl()}/account`,
  });
}
