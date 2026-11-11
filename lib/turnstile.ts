/**
 * Cloudflare Turnstile verification.
 *
 * This is the layer that actually stops the signup flood. Every other control
 * in this codebase runs inside our own Next.js routes, and a bot does not have
 * to use them: `NEXT_PUBLIC_SUPABASE_ANON_KEY` is public by design, so anyone
 * can POST straight to `https://<project>.supabase.co/auth/v1/signup` and skip
 * our UI entirely. Supabase only rejects those requests once CAPTCHA
 * protection is switched on in the dashboard (Authentication → Settings →
 * Bot and Abuse Protection), after which *every* auth call — from our forms or
 * from curl — must carry a valid Turnstile token.
 *
 * So the token produced by the widget is used twice:
 *   1. Passed to Supabase as `options.captchaToken`, which is what closes the
 *      direct-API bypass.
 *   2. Verified here in our own signup route, so we can reject and log bots
 *      before spending a Supabase auth call on them.
 *
 * Both sides are inert until the env vars are set, so this ships safely and is
 * enabled by configuration rather than by a redeploy.
 */

const VERIFY_ENDPOINT = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/** True when a secret key is configured and server-side verification is live. */
export function isTurnstileConfigured(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY);
}

/**
 * True once CAPTCHA protection is switched on in the Supabase dashboard
 * (Authentication → Bot and Abuse Protection) and SUPABASE_CAPTCHA_ENABLED is
 * set to "true" to say so.
 *
 * Why it matters: a Turnstile token can be redeemed exactly ONCE. When
 * Supabase verifies it, our own siteverify call must be skipped, or one of the
 * two always fails ("timeout-or-duplicate") and every signup/login is
 * rejected. When Supabase does NOT verify it, we must, or nothing does.
 */
export function isCaptchaVerifiedBySupabase(): boolean {
  return process.env.SUPABASE_CAPTCHA_ENABLED === 'true';
}

/**
 * Turnstile settings that can never work together, as far as this server can
 * tell from its own env. Returns null when nothing is visibly wrong.
 *
 * `site_key_missing`: something requires a token (Supabase CAPTCHA, or our own
 * secret key) but the widget has no site key, so no browser can ever produce
 * one and every sign-in, signup and password reset is rejected. Note that
 * `NEXT_PUBLIC_*` values are baked into the browser bundle at BUILD time:
 * after adding or changing the key in Vercel you must redeploy.
 *
 * Public-safe: names a state, never a value.
 */
export type CaptchaConfigProblem = 'site_key_missing';

export function captchaConfigProblem(env: Record<string, string | undefined> = process.env): CaptchaConfigProblem | null {
  const siteKey = env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const tokenRequired = env.SUPABASE_CAPTCHA_ENABLED === 'true' || Boolean(env.TURNSTILE_SECRET_KEY);
  if (tokenRequired && !siteKey) return 'site_key_missing';
  return null;
}

/**
 * Why Supabase Auth rejected a request with `captcha_failed`, when the cause
 * is our configuration rather than the visitor:
 *
 *  - `no_token`    — Supabase CAPTCHA protection is on but the request carried
 *                    no token: the widget isn't rendering (site key missing
 *                    from the build, or never set).
 *  - `token_spent` — we redeemed the single-use token ourselves before
 *                    Supabase saw it: Supabase CAPTCHA is on but
 *                    SUPABASE_CAPTCHA_ENABLED isn't "true".
 *
 * Returns null when a token did reach Supabase and it still failed — that is
 * an ordinary expired/invalid token, the visitor's to retry.
 */
export type UpstreamCaptchaMisconfig = 'no_token' | 'token_spent';

export function upstreamCaptchaMisconfig(captcha: AuthCaptchaResult, tokenFromClient: unknown): UpstreamCaptchaMisconfig | null {
  if (captcha.tokenForSupabase) return null;
  const hadToken = typeof tokenFromClient === 'string' && tokenFromClient !== '';
  return hadToken && !captcha.skipped ? 'token_spent' : 'no_token';
}

/** Plain-English fix for the server log / ops alert. Names env vars only. */
export function captchaMisconfigHint(kind: UpstreamCaptchaMisconfig): string {
  return kind === 'no_token'
    ? 'Supabase CAPTCHA protection is on, but the request carried no Turnstile token. NEXT_PUBLIC_TURNSTILE_SITE_KEY is missing from this build: set it in Vercel (Production) and REDEPLOY, or turn CAPTCHA off in Supabase until it is.'
    : 'Supabase CAPTCHA protection is on, but our server already redeemed the single-use token. Set SUPABASE_CAPTCHA_ENABLED=true in Vercel and redeploy.';
}

export interface AuthCaptchaResult extends TurnstileResult {
  /** The token to hand to Supabase (`options.captchaToken`), or undefined. */
  tokenForSupabase?: string;
}

/**
 * CAPTCHA handling for routes that call Supabase Auth (signup, login): verify
 * the token ourselves, or pass it through to Supabase — never both. See
 * `isCaptchaVerifiedBySupabase`.
 */
export async function verifyCaptchaForSupabaseAuth(
  token: string | null | undefined,
  remoteIp?: string,
): Promise<AuthCaptchaResult> {
  if (isCaptchaVerifiedBySupabase()) {
    // Supabase rejects a missing/invalid token itself (`captcha_failed`).
    return { success: true, skipped: true, tokenForSupabase: token || undefined };
  }
  return verifyTurnstileToken(token, remoteIp);
}

export interface TurnstileResult {
  success: boolean;
  /** Cloudflare error codes, if any, for logging. */
  errorCodes?: string[];
  /** True when verification was skipped because Turnstile isn't configured. */
  skipped?: boolean;
}

/**
 * Verifies a Turnstile token against Cloudflare.
 *
 * Returns `{ success: true, skipped: true }` when no secret key is configured
 * so the signup flow keeps working before Turnstile is provisioned. Once
 * `TURNSTILE_SECRET_KEY` is set, a missing or invalid token fails closed.
 */
export async function verifyTurnstileToken(
  token: string | null | undefined,
  remoteIp?: string,
): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return { success: true, skipped: true };

  if (!token) {
    return { success: false, errorCodes: ['missing-input-response'] };
  }

  const body = new URLSearchParams({ secret, response: token });
  // `unknown` is what `getClientIP` returns when no proxy header is present;
  // sending it would be rejected as a malformed IP.
  if (remoteIp && remoteIp !== 'unknown') body.set('remoteip', remoteIp);

  try {
    const response = await fetch(VERIFY_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      // Never let a slow challenge endpoint hang a signup request.
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      console.error('[Turnstile] Verify endpoint returned', response.status);
      return { success: false, errorCodes: ['verify-endpoint-error'] };
    }

    const data = (await response.json()) as {
      success: boolean;
      'error-codes'?: string[];
    };

    return { success: data.success === true, errorCodes: data['error-codes'] };
  } catch (error) {
    console.error('[Turnstile] Verification failed:', error);
    // Fail closed: an unverifiable token is treated as an invalid one.
    return { success: false, errorCodes: ['verify-request-failed'] };
  }
}
