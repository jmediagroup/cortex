import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit';
import { validateRequiredFields, isValidEmail } from '@/lib/validation';
import { errorResponse } from '@/lib/auth-helpers';

/**
 * POST /api/resend-verification
 * Resends the verification email for a pending signup
 * Rate limited to prevent abuse
 */
export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request.headers);
    const body = await request.json();
    const { email } = body;

    // Validate input
    const validation = validateRequiredFields(body, ['email']);
    if (!validation.valid) {
      return errorResponse('Email is required', 400);
    }

    if (!isValidEmail(email)) {
      return errorResponse('Invalid email format', 400);
    }

    // Rate limit by email + IP combination to prevent abuse
    const rateLimit = checkRateLimit(
      `resend:${email.toLowerCase()}:${clientIP}`,
      RATE_LIMITS.emailResend
    );

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000)),
          },
        }
      );
    }

    const supabase = createServiceClient();

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.toLowerCase(),
    });

    if (error) {
      console.error('Resend verification error:', error);
      return errorResponse(error.message, 400);
    }

    return NextResponse.json({
      success: true,
      remaining: rateLimit.remaining,
    });
  } catch (error: any) {
    console.error('Resend verification error:', error);
    return errorResponse('Failed to resend verification email', 500);
  }
}
