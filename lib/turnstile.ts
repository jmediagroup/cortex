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
