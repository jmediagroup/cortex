import { NextRequest, NextResponse } from 'next/server';
import { createCustomerPortalSession } from '@/lib/stripe/server';
import { createServiceClient } from '@/lib/supabase/client';
import { authenticateRequest, isAuthError, errorResponse } from '@/lib/auth-helpers';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

/**
 * POST /api/create-portal-session
 *
 * Opens the Stripe Customer Portal for the signed-in user: update card,
 * download invoices, resume a scheduled cancellation. Requires the portal to
 * be configured once in the Stripe dashboard (Settings → Billing → Customer
 * portal).
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (isAuthError(authResult)) {
      return errorResponse(authResult.error, authResult.status);
    }
    const { user } = authResult;

    const rateLimit = checkRateLimit(`portal:${user.id}`, RATE_LIMITS.portalSession);
    if (!rateLimit.success) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const supabase = createServiceClient();
    const { data: row } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .maybeSingle<{ stripe_customer_id: string | null }>();

    if (!row?.stripe_customer_id) {
      return errorResponse('No billing account found', 404);
    }

    const session = await createCustomerPortalSession(row.stripe_customer_id);
    return NextResponse.json({ url: session.url });
  } catch (error) {
    const e = error as { message?: string };
    console.error('Error creating portal session:', e.message ?? error);
    return errorResponse('Could not open the billing portal. Please try again.', 500);
  }
}
