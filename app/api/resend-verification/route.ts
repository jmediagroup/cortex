import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit';
import { validateRequiredFields, isValidEmail } from '@/lib/validation';
import { normalizeEmail } from '@/lib/email-hygiene';
import { verifyTurnstileToken } from '@/lib/turnstile';
import { errorResponse } from '@/lib/auth-helpers';

/**
 * POST /api/resend-verification
 * Resends the verification email for a pending signup
 *
 * NOTE: nothing in the app currently calls this — the signup and login pages
 * both call `supabase.auth.resend()` directly. It is an unauthenticated
 * endpoint that sends mail on our domain using the service-role key, so if it
 * stays unused it should be deleted outright. Until then it is hardened to
 * match /api/auth/signup: CAPTCHA-verified, and rate limited on the
 * *normalized* address so alias variants share one bucket.
 */
export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request.headers);
    const body = await request.json();
    const { email, captchaToken } = body;

    // Validate input
    const validation = validateRequiredFields(body, ['email']);
    if (!validation.valid) {
      return errorResponse('Email is required', 400);
    }

    if (!isValidEmail(email)) {
      return errorResponse('Invalid email format', 400);
    }

    const captcha = await verifyTurnstileToken(
      typeof captchaToken === 'string' ? captchaToken : null,
      clientIP,
    );
    if (!captcha.success) {
      return errorResponse('Security check failed. Please refresh and try again.', 400);
    }

    // Rate limit per IP, independent of the address, so one caller can't fan
    // out across many addresses to keep sending mail.
    const ipLimit = checkRateLimit(`resend:ip:${clientIP}`, RATE_LIMITS.emailResend);
    if (!ipLimit.success) {
      const retryAfter = Math.max(1, Math.ceil((ipLimit.resetTime - Date.now()) / 1000));
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.', retryAfter },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } },
      );
    }

    // Rate limit on the canonical address, so `a.b@gmail.com` and
    // `ab@gmail.com` cannot each claim a fresh allowance for one inbox.
    const rateLimit = checkRateLimit(
      `resend:${normalizeEmail(email)}:${clientIP}`,
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
