import { createHash } from 'crypto';

/**
 * One-way hashes for identifiers we need to count or cluster but must never
 * store in the clear (IPs, email addresses) — CLAUDE.md rule 8.
 *
 * Dependency-free so it can be unit-tested with plain `node --test`.
 */

/** The server-side salt. RATE_LIMIT_SALT wins; SIGNUP_IP_SALT is the older name. */
function salt(): string {
  return process.env.RATE_LIMIT_SALT || process.env.SIGNUP_IP_SALT || '';
}

/** True when a salt is configured, so a stored hash can't be reversed by brute force. */
export function hasPrivacySalt(): boolean {
  return salt().length > 0;
}

/**
 * Hash for a short-lived rate-limit key. Always returns a hash: without a
 * salt it is weaker, but these rows expire within a day and only hold a
 * counter, so the limiter keeps working before a salt is configured.
 */
export function rateLimitKeyHash(key: string): string {
  return createHash('sha256').update(`rl:${salt()}:${key}`).digest('hex');
}

/**
 * Hash for an identifier that is *stored* (auth_events). Returns null when no
 * salt is configured or the value is unknown — an unsalted hash of an IPv4
 * address or a common email can be reversed with a lookup table, so storing
 * nothing is the safer default.
 */
export function storedIdentifierHash(value: string | null | undefined, purpose: 'ip' | 'email'): string | null {
  const s = salt();
  if (!s || !value || value === 'unknown') return null;
  return createHash('sha256').update(`${purpose}:${s}:${value}`).digest('hex');
}
