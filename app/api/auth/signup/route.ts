import { createHash } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/client';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit';
import { assessSignup, normalizeEmail } from '@/lib/email-hygiene';
import { verifyTurnstileToken } from '@/lib/turnstile';
import { sanitizeString } from '@/lib/validation';
import { safeNextPath } from '@/lib/safe-redirect';
import { siteUrl } from '@/lib/site-url';
import { errorResponse } from '@/lib/auth-helpers';

/**
 * POST /api/auth/signup
 *
 * The single server-side chokepoint for account creation. Signup used to run
 * entirely in the browser (`supabase.auth.signUp()` with the public anon key),
 * which meant there was nowhere to enforce a rate limit, a CAPTCHA, or an
 * email policy — and it showed: the admin user list filled with never-verified
 * "free" accounts on Gmail alias addresses.
 *
 * Layers applied here, cheapest first:
 *   1. Honeypot field + form-fill timing  (free, catches naive bots)
 *   2. Rate limits by IP and by *normalized* email
 *   3. Turnstile verification             (when configured)
 *   4. Email hygiene policy               (disposable / lookalike / alias)
 *   5. Alias-collision check against existing accounts
 *   6. Password strength
 *
 * IMPORTANT: this route only protects signups that come through our own UI.
 * The Supabase anon key is public, so a determined bot can still POST directly
 * to the Supabase auth endpoint. The fix for that is enabling CAPTCHA
 * protection in the Supabase dashboard — see SECURITY_SIGNUP_HARDENING.md.
 */

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** Minimum plausible time for a human to fill the form, in milliseconds. */
const MIN_FORM_FILL_MS = 2500;

/** Upper bound guards against a stale tab replaying an ancient timestamp. */
const MAX_FORM_AGE_MS = 6 * 60 * 60 * 1000;

const MIN_PASSWORD_LENGTH = 10;

/**
 * Hashes the client IP with a server-side salt so we can cluster signups by
 * origin without storing raw addresses. Returns null when no salt is
 * configured — an unsalted hash of a 32-bit address space is trivially
 * reversible, so we'd rather store nothing.
 */
function hashClientIp(ip: string): string | null {
  const salt = process.env.SIGNUP_IP_SALT;
  if (!salt || ip === 'unknown') return null;
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex');
}

/**
 * The response a bot gets. Identical in shape to a real success so automated
 * probing can't distinguish "blocked" from "account created, check your email"
 * and tune around our rules.
 */
function decoySuccess() {
  return NextResponse.json({ success: true, requiresVerification: true });
}

function tooManyRequests(resetTime: number) {
  const retryAfter = Math.max(1, Math.ceil((resetTime - Date.now()) / 1000));
  return NextResponse.json(
    {
      error: 'Too many signup attempts from this connection. Please try again later.',
      retryAfter,
    },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } },
  );
}

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request.headers);
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return errorResponse('Invalid request body', 400);
    }

    const {
      email: rawEmail,
      password,
      firstName: rawFirstName,
      captchaToken,
      // Honeypot: hidden in the form, invisible to humans, irresistible to
      // naive form-fillers.
      website,
      // Client timestamp of when the form was rendered.
      formStartedAt,
      next: rawNext,
    } = body as Record<string, unknown>;

    if (typeof rawEmail !== 'string' || typeof password !== 'string') {
      return errorResponse('Email and password are required', 400);
    }

    const email = rawEmail.trim().toLowerCase();
    const firstName = typeof rawFirstName === 'string' ? sanitizeString(rawFirstName, 60).trim() : '';
    const normalizedEmail = normalizeEmail(email);

    // --- 1. Honeypot + timing -------------------------------------------
    if (typeof website === 'string' && website.trim() !== '') {
      console.warn('[Signup] Honeypot triggered', { ip: clientIP, normalizedEmail });
      return decoySuccess();
    }

    if (typeof formStartedAt === 'number' && Number.isFinite(formStartedAt)) {
      const elapsed = Date.now() - formStartedAt;
      if (elapsed >= 0 && elapsed < MIN_FORM_FILL_MS) {
        console.warn('[Signup] Form submitted too fast', { ip: clientIP, elapsed });
        return decoySuccess();
      }
      if (elapsed > MAX_FORM_AGE_MS) {
        return errorResponse('This form expired. Please refresh the page and try again.', 400);
      }
    }

    // --- 2. Rate limits --------------------------------------------------
    const burst = checkRateLimit(`signup:burst:${clientIP}`, RATE_LIMITS.signupBurst);
    if (!burst.success) return tooManyRequests(burst.resetTime);

    const sustained = checkRateLimit(`signup:ip:${clientIP}`, RATE_LIMITS.signupIp);
    if (!sustained.success) return tooManyRequests(sustained.resetTime);

    // Keyed on the canonical address so every alias of one inbox shares a
    // single bucket.
    const perEmail = checkRateLimit(`signup:email:${normalizedEmail}`, RATE_LIMITS.signupEmail);
    if (!perEmail.success) return tooManyRequests(perEmail.resetTime);

    // --- 3. CAPTCHA ------------------------------------------------------
    const captcha = await verifyTurnstileToken(
      typeof captchaToken === 'string' ? captchaToken : null,
      clientIP,
    );
    if (!captcha.success) {
      console.warn('[Signup] Turnstile rejected', { ip: clientIP, codes: captcha.errorCodes });
      return errorResponse('Security check failed. Please refresh the page and try again.', 400);
    }

    // --- 4. Email policy -------------------------------------------------
    const assessment = assessSignup({ email, firstName });

    if (assessment.decision === 'block') {
      console.warn('[Signup] Blocked by email policy', {
        ip: clientIP,
        normalizedEmail,
        reasons: assessment.reasons,
      });
      if (assessment.reasons.includes('invalid_email')) {
        return errorResponse('Please enter a valid email address.', 400);
      }
      return errorResponse(
        'Please sign up with a permanent personal or work email address.',
        400,
      );
    }

    // --- 5. Password strength -------------------------------------------
    if (password.length < MIN_PASSWORD_LENGTH) {
      return errorResponse(
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
        400,
      );
    }
    if (/^\d+$/.test(password) || /^[a-z]+$/i.test(password)) {
      return errorResponse(
        'Please choose a password with a mix of letters, numbers or symbols.',
        400,
      );
    }

    // --- 6. Alias collision ----------------------------------------------
    // The whole point of normalization: `b.i.l.al@gmail.com` and
    // `bilal@gmail.com` are one inbox and get one account.
    const service = createServiceClient();
    const { data: existing, error: lookupError } = await service
      .from('users')
      .select('id')
      .eq('email_normalized', normalizedEmail)
      .limit(1);

    if (lookupError) {
      // Don't fail the signup on a lookup problem — the DB's unique index and
      // Supabase's own duplicate handling are still behind us.
      console.error('[Signup] Alias lookup failed:', lookupError);
    } else if (existing && existing.length > 0) {
      return errorResponse(
        'An account already exists for this email address. Try logging in, or reset your password.',
        409,
      );
    }

    // --- 7. Create the account -------------------------------------------
    // Cookie-backed client so the PKCE code verifier is written as an
    // httpOnly cookie on this origin; /auth/callback needs it to exchange the
    // emailed code for a session.
    const supabase = await createServerSupabaseClient();
    const next = safeNextPath(typeof rawNext === 'string' ? rawNext : null, '/onboarding');

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${siteUrl()}/auth/callback?next=${encodeURIComponent(next)}`,
        data: firstName ? { first_name: firstName } : undefined,
        captchaToken: typeof captchaToken === 'string' ? captchaToken : undefined,
      },
    });

    if (signUpError) {
      console.error('[Signup] Supabase signUp failed:', signUpError.message);
      return errorResponse(signUpError.message, 400);
    }

    // --- 8. Record abuse metadata ----------------------------------------
    // Best-effort: the account exists either way, and the `handle_new_user`
    // trigger has already written `email_normalized`. This adds the signals
    // only the request context knows about.
    if (data.user?.id) {
      const { error: flagError } = await service
        .from('users')
        .update({
          signup_ip_hash: hashClientIp(clientIP),
          signup_flags: assessment.reasons,
          is_flagged: assessment.decision === 'flag',
        })
        .eq('id', data.user.id);

      if (flagError) {
        console.error('[Signup] Failed to record signup signals:', flagError);
      }
    }

    return NextResponse.json({ success: true, requiresVerification: true });
  } catch (error: unknown) {
    const e = error as { message?: string };
    console.error('[Signup] Unexpected error:', e.message ?? error);
    return errorResponse('Could not create your account. Please try again.', 500);
  }
}
