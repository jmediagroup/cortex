import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient, type Database } from '@/lib/supabase/client';
import { createCheckoutSession } from '@/lib/stripe/server';
import { authenticateRequest, isAuthError, errorResponse } from '@/lib/auth-helpers';
import { validateRequiredFields, isValidPriceId, isAllowedPriceId } from '@/lib/validation';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting by IP
    const clientIP = getClientIP(request.headers);
    const rateLimit = checkRateLimit(`checkout:${clientIP}`, RATE_LIMITS.checkout);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimit.limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.resetTime.toString(),
            'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    const body = await request.json();
    const { priceId } = body;

    // Validate input
    const validation = validateRequiredFields(body, ['priceId']);
    if (!validation.valid) {
      return errorResponse(`Missing required fields: ${validation.missing?.join(', ')}`, 400);
    }

    if (!isValidPriceId(priceId)) {
      return errorResponse('Invalid price ID format', 400);
    }

    if (!isAllowedPriceId(priceId)) {
      return errorResponse('Price ID not allowed', 400);
    }

    // Authenticate user
    const authResult = await authenticateRequest(request);
    if (isAuthError(authResult)) {
      return errorResponse(authResult.error, authResult.status);
    }

    const { user } = authResult;

    // Get user data from database
    const supabase = createServiceClient();
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return errorResponse('User not found', 404);
    }

    // Create Stripe checkout session
    const session = await createCheckoutSession(
      (userData as Database['public']['Tables']['users']['Row']).stripe_customer_id || null,
      priceId,
      user.id,
      user.email!
    );

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
