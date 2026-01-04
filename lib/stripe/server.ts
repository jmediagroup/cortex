import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
});

export async function createCheckoutSession(
  customerId: string | null,
  priceId: string,
  userId: string,
  userEmail: string
) {
  // Create or retrieve Stripe customer
  let finalCustomerId = customerId;

  if (!customerId) {
    // Create a new Stripe customer
    const customer = await stripe.customers.create({
      email: userEmail,
      metadata: {
        userId,
      },
    });
    finalCustomerId = customer.id;
  }

  // Create checkout session with metadata on both session and subscription
  const session = await stripe.checkout.sessions.create({
    customer: finalCustomerId as string,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
    metadata: {
      userId,
    },
    subscription_data: {
      metadata: {
        userId,
      },
    },
  });

  return session;
}

export async function createCustomerPortalSession(customerId: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  });

  return session;
}
