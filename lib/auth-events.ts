import { createServiceClient } from '@/lib/supabase/client';
import { storedIdentifierHash } from '@/lib/privacy-hash';
import { checkSharedRateLimit } from '@/lib/rate-limit-shared';
import { RATE_LIMITS } from '@/lib/rate-limit';
import { sendOpsAlert } from '@/lib/ops-alert';

/**
 * Security log for failed and blocked logins (`public.auth_events`).
 *
 * Every login that does not succeed — wrong password, unverified email,
 * CAPTCHA failure, rate limit, honeypot — is recorded with a reason code and
 * salted hashes of the normalized email and client IP. Nothing else: no raw
 * email, no IP, no password, no user agent.
 *
 * It is also written to the server log (hashes only), so failures show up in
 * Vercel logs even before the migration is applied.
 *
 * Best-effort: a logging problem never changes what the person sees.
 */

export interface AuthEventInput {
  event: 'login_failed' | 'login_blocked';
  reason: string;
  normalizedEmail: string | null;
  clientIp: string;
}

export async function logAuthEvent(input: AuthEventInput): Promise<void> {
  const emailHash = storedIdentifierHash(input.normalizedEmail, 'email');
  const ipHash = storedIdentifierHash(input.clientIp, 'ip');

  console.warn('[auth] login not completed', {
    event: input.event,
    reason: input.reason,
    // First 12 hex chars are plenty to eyeball clusters in the log.
    email: emailHash?.slice(0, 12) ?? null,
    ip: ipHash?.slice(0, 12) ?? null,
  });

  try {
    const { error } = await createServiceClient().from('auth_events').insert({
      event: input.event,
      reason: input.reason.slice(0, 60),
      email_hash: emailHash,
      ip_hash: ipHash,
    });
    if (error) console.error('[auth] could not record auth event:', error.message);
  } catch (err) {
    console.error('[auth] could not record auth event:', err instanceof Error ? err.message : 'unknown');
  }

  // Site-wide spike detector: counts every failure; the first one past the
  // hourly threshold sends one alert. It never blocks a login.
  try {
    const spike = await checkSharedRateLimit('login-failures:global', RATE_LIMITS.loginFailureSpike);
    if (!spike.success && spike.remaining === 0) {
      await sendOpsAlert({
        key: 'login-failure-spike',
        subject: 'Spike in failed logins',
        body: `More than ${RATE_LIMITS.loginFailureSpike.limit} failed or blocked logins in the last hour. This can be a credential-stuffing attempt. Check public.auth_failed_login_daily (or auth_events grouped by email_hash / ip_hash) in Supabase. Per-IP and per-account rate limits are already active.`,
        dedupeSeconds: 3600,
      });
    }
  } catch {
    // ignore
  }
}
