import { createHash } from 'crypto';
import { after, NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/client';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit';
import { assessSignup, normalizeEmail } from '@/lib/email-hygiene';
import { verifyTurnstileToken } from '@/lib/turnstile';
import { sanitizeString } from '@/lib/validation';
import { safeNextPath } from '@/lib/safe-redirect';
import { siteUrl } from '@/lib/site-url';
import { errorResponse } from '@/lib/auth-helpers';
import { checkPassword } from '@/lib/password-policy';
import { sendNewUserNotification } from '@/lib/email';
import { friendlySignupError } from '@/lib/auth-errors';

/**
 * POST /api/auth/signup
 *
 * The single server-side chokepoint for account creation. Signup used to run
 * entirely in the browser (`supabase.auth.signUp()` with the public anon key),
 * which meant there was nowhere to enforce a rate limit, a CAPTCHA, or an
 * email policy — and it showed: the admin user list filled with never-verified
 * "free" accounts on Gmail alias addresses.
 *
 * Order matters here and is deliberate:
 *
 *   1. Shape + email policy + password   (pure validation — a typo costs nothing)
 *   2. Honeypot + timing                 (free, catches naive bots)
 *   3. Rate limits by IP and by *normalized* email
 *   4. Turnstile verification            (when configured)
 *   5. Alias-collision check against existing accounts
 *   6. supabase.auth.signUp
 *
 * Validation runs BEFORE the rate limiter and CAPTCHA so a person who fat-fingers
 * their email or picks a weak password twice doesn't burn their rate-limit
 * budget or a single-use CAPTCHA token on mistakes we could have told them
 * about for free.
 *
 * Responses the form understands:
 *   200 { success, requiresVerification: true }          — check your email
 *   200 { success, requiresVerification: false, next }   — confirmations are off
 *                                                          in Supabase; the user
 *                                                          is signed in already
 *   409 { error, code: 'account_exists' }                — offer log in / reset
 *   429 { error, retryAfter }                            — slow down
 *   400 { error }                                        — fix and retry
 *
 * IMPORTANT: this route only protects signups that come through our own UI.
 * The Supabase anon key is public, so a determined bot can still POST directly
 * to the Supabase auth endpoint. The fix for that is enabling CAPTCHA
 * protection in the Supabase dashboard — see SECURITY_SIGNUP_HARDENING.md.
 */

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Minimum plausible time between the form rendering and a submit. Kept low on
 * purpose: password managers fill and submit in well under a second, and a
 * real person getting a silent fake success is far worse than a lazy bot
 * getting through (Turnstile is the real bot control).
 */
const MIN_FORM_FILL_MS = 1200;

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
 * The response a bot gets when it trips the honeypot. Identical in shape to a
 * real success so automated probing can't distinguish "blocked" from "account
 * created, check your email" and tune around our rules.
 */
function decoySuccess() {
  return NextResponse.json({ success: true, requiresVerification: true });
}

function tooManyRequests(resetTime: number) {
  const retryAfter = Math.max(1, Math.ceil((resetTime - Date.now()) / 1000));
  const minutes = Math.ceil(retryAfter / 60);
  return NextResponse.json(
    {
      error:
        retryAfter > 90
          ? `Too many signup attempts from this connection. Please try again in about ${minutes} minutes.`
          : 'Too many signup attempts in a short time. Please wait a minute and try again.',
      retryAfter,
    },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } },
  );
}

function accountExists() {
  return NextResponse.json(
    {
      error:
        'An account already exists for this email. Log in instead, or reset your password if you’ve forgotten it.',
      code: 'account_exists',
    },
    { status: 409 },
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
      // naive form-fillers. (Named so no browser autofill heuristic matches it.)
      mgm_hp: honeypot,
      // Client timestamp of when the form was rendered.
      formStartedAt,
      next: rawNext,
      // Attribution (`lp-<slug>` from a search landing page, or a campaign id).
      source: rawSource,
    } = body as Record<string, unknown>;

    const signupSource =
      typeof rawSource === 'string' ? rawSource.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 60) : '';

    // --- 1. Validation --------------------------------------------------------
    if (typeof rawEmail !== 'string' || typeof password !== 'string') {
      return errorResponse('Email and password are required.', 400);
    }

    const email = rawEmail.trim().toLowerCase();
    const firstName = typeof rawFirstName === 'string' ? sanitizeString(rawFirstName, 60).trim() : '';
    const normalizedEmail = normalizeEmail(email);

    const assessment = assessSignup({ email, firstName });
    if (assessment.decision === 'block') {
      console.warn('[Signup] Blocked by email policy', {
        ip: clientIP,
        normalizedEmail,
        reasons: assessment.reasons,
      });
      if (assessment.reasons.includes('invalid_email')) {
        return errorResponse('That doesn’t look like a valid email address. Please check it and try again.', 400);
      }
      return errorResponse(
        'Please sign up with a permanent personal or work email address — temporary inboxes aren’t supported.',
        400,
      );
    }

    // Single shared policy (lib/password-policy.ts) so the reset-password
    // screen can't set something weaker than signup accepts.
    const passwordCheck = checkPassword(password);
    if (!passwordCheck.ok) {
      return errorResponse(passwordCheck.message, 400);
    }

    // --- 2. Honeypot + timing ------------------------------------------------
    if (typeof honeypot === 'string' && honeypot.trim() !== '') {
      console.warn('[Signup] Honeypot triggered', { ip: clientIP, normalizedEmail });
      return decoySuccess();
    }

    // Our form always sends `formStartedAt`. A client that omits it is not our
    // form; a submit that arrives faster than the page could be read is a
    // script. Both get a *visible* "try again" rather than a silent decoy —
    // a person who autofilled with a password manager can hit this, and
    // they must never be left waiting for an email that isn't coming.
    // Negative elapsed = client clock behind ours; treat as fine.
    if (typeof formStartedAt !== 'number' || !Number.isFinite(formStartedAt)) {
      console.warn('[Signup] Missing form timing', { ip: clientIP, normalizedEmail });
      return errorResponse('Something went wrong with the form. Please refresh the page and try again.', 400);
    }
    const elapsed = Date.now() - formStartedAt;
    if (elapsed >= 0 && elapsed < MIN_FORM_FILL_MS) {
      console.warn('[Signup] Form submitted too fast', { ip: clientIP, elapsed });
      return errorResponse('That was quick! Please double-check your details and submit again.', 400);
    }

    // --- 3. Rate limits ------------------------------------------------------
    const burst = checkRateLimit(`signup:burst:${clientIP}`, RATE_LIMITS.signupBurst);
    if (!burst.success) return tooManyRequests(burst.resetTime);

    const sustained = checkRateLimit(`signup:ip:${clientIP}`, RATE_LIMITS.signupIp);
    if (!sustained.success) return tooManyRequests(sustained.resetTime);

    // Keyed on the canonical address so every alias of one inbox shares a
    // single bucket.
    const perEmail = checkRateLimit(`signup:email:${normalizedEmail}`, RATE_LIMITS.signupEmail);
    if (!perEmail.success) return tooManyRequests(perEmail.resetTime);

    // --- 4. CAPTCHA ----------------------------------------------------------
    const captcha = await verifyTurnstileToken(
      typeof captchaToken === 'string' ? captchaToken : null,
      clientIP,
    );
    if (!captcha.success) {
      console.warn('[Signup] Turnstile rejected', { ip: clientIP, codes: captcha.errorCodes });
      return errorResponse('The security check didn’t pass. Please refresh the page and try again.', 400);
    }

    // --- 5. Alias collision --------------------------------------------------
    // The whole point of normalization: `b.i.l.al@gmail.com` and
    // `bilal@gmail.com` are one inbox and get one account. Product decision:
    // tell the person plainly and point them at log in / reset — a repeat
    // signup that silently "sends a link" that never arrives is the worst
    // possible experience for someone who simply forgot they have an account.
    const service = createServiceClient();
    const { data: existing, error: lookupError } = await service
      .from('users')
      .select('id')
      .eq('email_normalized', normalizedEmail)
      .limit(1);

    if (lookupError) {
      // Don't fail the signup on a lookup problem — Supabase's own duplicate
      // handling (step 6) is still behind us.
      console.error('[Signup] Alias lookup failed:', lookupError);
    } else if (existing && existing.length > 0) {
      return accountExists();
    }

    // --- 6. Create the account -----------------------------------------------
    // Cookie-backed client so the PKCE code verifier is written as a cookie on
    // this origin; /auth/callback can then exchange a `?code=` link opened in
    // this same browser. Links from our own templates use `token_hash`
    // instead and work from any device — see app/auth/callback/route.ts.
    const supabase = await createServerSupabaseClient();
    const next = safeNextPath(typeof rawNext === 'string' ? rawNext : null, '/onboarding');

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${siteUrl()}/auth/callback?next=${encodeURIComponent(next)}`,
        // `signup_next` lets the callback route honour Pro intent even when the
        // link (token_hash shape) carries no `next` of its own.
        data: {
          ...(firstName ? { first_name: firstName } : {}),
          signup_next: next,
          ...(signupSource ? { signup_source: signupSource } : {}),
        },
        captchaToken: typeof captchaToken === 'string' ? captchaToken : undefined,
      },
    });

    if (signUpError) {
      console.error('[Signup] Supabase signUp failed:', signUpError.code, signUpError.message);
      if (signUpError.code === 'user_already_exists' || /already registered/i.test(signUpError.message)) {
        return accountExists();
      }
      return errorResponse(friendlySignupError(signUpError), 400);
    }

    // Supabase obfuscates a repeat signup for an address that already exists
    // (with email confirmations on) by returning a user with an empty
    // `identities` array instead of an error. Surface it honestly — same
    // policy as step 5.
    const identities = data.user?.identities;
    const isRepeatSignup = Array.isArray(identities) && identities.length === 0;
    if (isRepeatSignup) {
      return accountExists();
    }

    // --- 7. Make sure the profile row exists ---------------------------------
    // The `handle_new_user` trigger inserts public.users inside the auth
    // transaction, but it swallows errors so it can never block signup. If it
    // did fail, repair it here so nobody ends up with an auth account and no
    // profile (which would break tier lookups, onboarding, and checkout).
    if (data.user?.id) {
      const { data: profile } = await service
        .from('users')
        .select('id')
        .eq('id', data.user.id)
        .maybeSingle();

      if (!profile) {
        console.warn('[Signup] Profile row missing after signUp; repairing', { userId: data.user.id });
        const { error: repairError } = await service.from('users').upsert(
          {
            id: data.user.id,
            email,
            tier: 'free',
            first_name: firstName || null,
          },
          { onConflict: 'id', ignoreDuplicates: true },
        );
        if (repairError) {
          console.error('[Signup] Failed to repair profile row:', repairError);
        }
      }

      // --- 8. Record abuse metadata (best-effort) ---------------------------
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

    // --- 9. Notify the site owner --------------------------------------------
    if (data.user) {
      // `after()` runs once the response has been flushed, so a slow or failing
      // email provider can never delay signup or cost someone their account.
      after(async () => {
        const notification = await sendNewUserNotification({
          email,
          firstName: firstName || null,
          userId: data.user?.id ?? null,
          signupFlags: assessment.reasons,
          isFlagged: assessment.decision === 'flag',
        });

        if (!notification.success) {
          console.error('[Signup] New user notification failed:', notification.error);
        }
      });
    }

    // With "Confirm email" switched off in Supabase, signUp returns a live
    // session and the cookie-backed client has already written the auth
    // cookies on this response — the person is signed in right now.
    if (data.session) {
      return NextResponse.json({ success: true, requiresVerification: false, next });
    }

    return NextResponse.json({ success: true, requiresVerification: true });
  } catch (error: unknown) {
    const e = error as { message?: string };
    console.error('[Signup] Unexpected error:', e.message ?? error);
    return errorResponse('We couldn’t create your account just now. Please try again in a moment.', 500);
  }
}
