import { after, NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getClientIP, RATE_LIMITS, retryAfterSeconds } from '@/lib/rate-limit';
import { checkSharedRateLimit } from '@/lib/rate-limit-shared';
import { normalizeEmail } from '@/lib/email-hygiene';
import { captchaMisconfigHint, upstreamCaptchaMisconfig, verifyCaptchaForSupabaseAuth } from '@/lib/turnstile';
import { sendOpsAlert } from '@/lib/ops-alert';
import { checkBotSignals, HONEYPOT_FIELD } from '@/lib/bot-check';
import { friendlyLoginError, loginFailureReason } from '@/lib/auth-errors';
import { logAuthEvent, type AuthEventInput } from '@/lib/auth-events';

/**
 * POST /api/auth/login — the server-side chokepoint for password sign-in.
 *
 * Sign-in used to run entirely in the browser (`signInWithPassword` with the
 * public anon key), so there was nowhere to rate-limit it or record failures.
 * This route mirrors /api/auth/signup:
 *
 *   1. Shape check
 *   2. Honeypot                          (hidden field; free)
 *   3. Rate limits, shared across instances:
 *        per IP (burst + sustained) and per normalized email (any IP)
 *   4. Turnstile                         (ours, or passed through to Supabase)
 *   5. supabase.auth.signInWithPassword  (cookie-backed: sets the session)
 *
 * Every attempt that does not end in a session is written to
 * public.auth_events (hashed identifiers only) — see lib/auth-events.ts.
 *
 * Responses:
 *   200 { success: true }
 *   401 { error, code: 'invalid_credentials' | ... }   — wrong email/password etc.
 *   403 { error, code: 'email_not_confirmed' }         — offer "resend link"
 *   429 { error, retryAfter }                          — slow down
 *   503 { error, code: 'auth_unavailable' }            — Supabase Auth unreachable
 *   400 { error }                                      — fix and retry
 *
 * Like signup, this only protects attempts made through our own UI. A bot can
 * still call Supabase Auth directly with the public anon key; Supabase's
 * CAPTCHA protection and its own rate limits cover that path (see
 * docs/HARDENING.md).
 */

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function tooManyAttempts(resetTime: number) {
  const retryAfter = retryAfterSeconds(resetTime);
  const minutes = Math.ceil(retryAfter / 60);
  return NextResponse.json(
    {
      error:
        retryAfter > 90
          ? `Too many sign-in attempts. Please wait about ${minutes} minutes and try again, or reset your password.`
          : 'Too many sign-in attempts in a short time. Please wait a minute and try again.',
      code: 'rate_limited',
      retryAfter,
    },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } },
  );
}

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request.headers);
  let normalizedEmail: string | null = null;

  // Logging runs after the response is sent so it never slows a login.
  const record = (event: AuthEventInput['event'], reason: string) => {
    const entry: AuthEventInput = { event, reason, normalizedEmail, clientIp: clientIP };
    after(() => logAuthEvent(entry));
  };

  try {
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    const { email: rawEmail, password, captchaToken } = body;

    // --- 1. Shape --------------------------------------------------------------
    if (typeof rawEmail !== 'string' || typeof password !== 'string' || !rawEmail.trim() || !password) {
      return NextResponse.json({ error: 'Enter your email and password.' }, { status: 400 });
    }
    if (rawEmail.length > 320 || password.length > 512) {
      return NextResponse.json({ error: 'Incorrect email or password. Please try again, or reset your password.' }, { status: 400 });
    }

    const email = rawEmail.trim().toLowerCase();
    normalizedEmail = normalizeEmail(email);

    // --- 2. Honeypot -------------------------------------------------------------
    // No fill-time check on login: password managers submit instantly, and
    // there is no decoy we could safely show. A tripped honeypot just looks
    // like a wrong password. Autofill that copies the person's own email or
    // password into the hidden field is NOT a bot (see lib/bot-check.ts).
    const bot = checkBotSignals({
      honeypot: body[HONEYPOT_FIELD],
      formStartedAt: undefined,
      minFillMs: 0,
      requireTiming: false,
      ownValues: [rawEmail, email, password],
    });
    if (!bot.ok) {
      record('login_blocked', 'honeypot');
      return NextResponse.json(
        { error: friendlyLoginError({ code: 'invalid_credentials' }), code: 'invalid_credentials' },
        { status: 401 },
      );
    }

    // --- 3. Rate limits -----------------------------------------------------------
    const burst = await checkSharedRateLimit(`login:burst:${clientIP}`, RATE_LIMITS.loginBurst);
    if (!burst.success) {
      record('login_blocked', 'rate_limited_ip');
      return tooManyAttempts(burst.resetTime);
    }
    const sustained = await checkSharedRateLimit(`login:ip:${clientIP}`, RATE_LIMITS.loginIp);
    if (!sustained.success) {
      record('login_blocked', 'rate_limited_ip');
      return tooManyAttempts(sustained.resetTime);
    }
    // Keyed on the canonical address: every alias of one inbox shares it, and
    // spreading guesses across many IPs doesn't help.
    const perEmail = await checkSharedRateLimit(`login:email:${normalizedEmail}`, RATE_LIMITS.loginEmail);
    if (!perEmail.success) {
      record('login_blocked', 'rate_limited_email');
      return tooManyAttempts(perEmail.resetTime);
    }

    // --- 4. CAPTCHA ----------------------------------------------------------------
    const captcha = await verifyCaptchaForSupabaseAuth(
      typeof captchaToken === 'string' ? captchaToken : null,
      clientIP,
    );
    if (!captcha.success) {
      record('login_blocked', 'captcha_failed');
      return NextResponse.json(
        { error: friendlyLoginError({ code: 'captcha_failed' }), code: 'captcha_failed' },
        { status: 400 },
      );
    }

    // --- 5. Sign in ----------------------------------------------------------------
    // Cookie-backed client: on success it writes the session cookies onto this
    // response, which the browser client (@supabase/ssr) then reads.
    const supabase = await createServerSupabaseClient({ forwardedFor: clientIP });
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: captcha.tokenForSupabase ? { captchaToken: captcha.tokenForSupabase } : undefined,
    });

    if (error || !data.session) {
      const reason = error ? loginFailureReason(error) : 'other';

      // Supabase demanded a CAPTCHA token our setup could never provide (the
      // widget has no site key, or we already spent the token). That is our
      // bug, not the visitor's: telling them to "refresh and try again" just
      // loops them. Say it's temporarily unavailable, log the fix, alert Drew.
      if (reason === 'captcha_failed') {
        const misconfig = upstreamCaptchaMisconfig(captcha, captchaToken);
        if (misconfig) {
          record('login_failed', `captcha_misconfigured_${misconfig}`);
          const hint = captchaMisconfigHint(misconfig);
          console.error(`[auth/login] CAPTCHA misconfigured (${misconfig}): ${hint}`);
          after(() =>
            sendOpsAlert({
              key: `captcha-misconfigured:${misconfig}`,
              subject: 'Sign-in is broken: CAPTCHA misconfigured',
              body: `Supabase rejected a sign-in for CAPTCHA reasons that come from our configuration, not the visitor (${misconfig}).\n\n${hint}\n\nUntil this is fixed, nobody can log in, sign up or reset a password.`,
              dedupeSeconds: 3600,
            }),
          );
          return NextResponse.json(
            {
              error: 'Sign-in is temporarily unavailable on our side. We’re on it, so please try again a little later.',
              code: 'auth_unavailable',
            },
            { status: 503 },
          );
        }
      }

      record('login_failed', reason);
      const status =
        reason === 'email_not_confirmed'
          ? 403
          : reason === 'rate_limited_upstream'
            ? 429
            : reason === 'captcha_failed'
              ? 400
              : reason === 'auth_unavailable'
                ? 503
                : 401;
      const message =
        reason === 'auth_unavailable'
          ? 'Sign-in is temporarily unavailable. Please try again in a few minutes.'
          : friendlyLoginError(error ?? null);
      return NextResponse.json({ error: message, code: reason }, { status });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    // Log the detail server-side only; the person gets plain copy.
    console.error('[auth/login] unexpected error:', err instanceof Error ? err.message : 'unknown');
    record('login_failed', 'server_error');
    return NextResponse.json(
      { error: 'We couldn’t sign you in just now. Please try again in a moment.', code: 'server_error' },
      { status: 500 },
    );
  }
}
