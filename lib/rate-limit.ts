/**
 * Simple in-memory rate limiter for API endpoints
 * For production at scale, consider using Redis-based rate limiting via Upstash
 * @version 1.0.0
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store (cleared on serverless cold starts, which is acceptable for basic protection)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
const CLEANUP_INTERVAL = 60000; // 1 minute
let lastCleanup = Date.now();

function cleanupExpiredEntries() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;

  lastCleanup = now;
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}

export interface RateLimitConfig {
  /** Maximum requests allowed in the window */
  limit: number;
  /** Time window in seconds */
  windowSeconds: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
}

/**
 * Check if a request should be rate limited.
 *
 * This counter lives in this serverless instance's memory only, so on Vercel
 * every warm instance keeps its own count. Route code should prefer
 * `checkSharedRateLimit` (lib/rate-limit-shared.ts), which shares one counter
 * across instances through Postgres and falls back to this function.
 *
 * @param identifier - Unique identifier for the requester (IP, user ID, etc.)
 * @param config - Rate limit configuration
 * @param cost - Hits to count. 0 reads the bucket without changing it: the
 *   result is `success: true` while there is room for at least one more hit.
 * @returns Rate limit result
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig,
  cost = 1,
): RateLimitResult {
  cleanupExpiredEntries();

  const now = Date.now();
  const key = identifier;
  const entry = rateLimitStore.get(key);
  const live = entry && entry.resetTime >= now ? entry : null;

  if (cost <= 0) {
    const count = live?.count ?? 0;
    return {
      success: count < config.limit,
      limit: config.limit,
      remaining: Math.max(0, config.limit - count),
      resetTime: live?.resetTime ?? now + config.windowSeconds * 1000,
    };
  }

  // If no entry exists or window has expired, create new entry
  if (!live) {
    const resetTime = now + config.windowSeconds * 1000;
    rateLimitStore.set(key, { count: cost, resetTime });
    return {
      success: cost <= config.limit,
      limit: config.limit,
      remaining: Math.max(0, config.limit - cost),
      resetTime,
    };
  }

  // Increment count
  live.count += cost;
  const entryRef = live;

  // Check if limit exceeded
  if (entryRef.count > config.limit) {
    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      resetTime: entryRef.resetTime,
    };
  }

  return {
    success: true,
    limit: config.limit,
    remaining: config.limit - entryRef.count,
    resetTime: entryRef.resetTime,
  };
}

/** Seconds until `resetTime`, at least 1 — for `Retry-After` headers. */
export function retryAfterSeconds(resetTime: number, now = Date.now()): number {
  return Math.max(1, Math.ceil((resetTime - now) / 1000));
}

/** Test helper: forget every in-memory bucket. */
export function resetInMemoryRateLimits(): void {
  rateLimitStore.clear();
}

/**
 * Get client IP from request headers
 * Works with Vercel, Cloudflare, and direct connections
 */
export function getClientIP(headers: Headers): string {
  // Try common proxy headers
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIP = headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Vercel-specific
  const vercelForwardedFor = headers.get('x-vercel-forwarded-for');
  if (vercelForwardedFor) {
    return vercelForwardedFor.split(',')[0].trim();
  }

  // Cloudflare
  const cfConnectingIP = headers.get('cf-connecting-ip');
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  return 'unknown';
}

/**
 * Preset rate limit configurations for different endpoint types
 */
export const RATE_LIMITS = {
  // Checkout: 10 requests per minute per IP
  checkout: { limit: 10, windowSeconds: 60 },

  // Cancel subscription: 5 requests per minute per user
  cancelSubscription: { limit: 5, windowSeconds: 60 },

  // Portal session: 10 requests per minute per user
  portalSession: { limit: 10, windowSeconds: 60 },

  // Webhooks: Higher limit for Stripe (100 per minute per IP)
  webhook: { limit: 100, windowSeconds: 60 },

  // General API: 60 requests per minute per IP
  general: { limit: 60, windowSeconds: 60 },

  // Email resend: 3 requests per 5 minutes per email
  emailResend: { limit: 3, windowSeconds: 300 },

  // Enterprise lead form: 10 requests per minute per IP
  enterpriseLead: { limit: 10, windowSeconds: 60 },

  // Outlook subscribe form: 5 requests per 5 minutes per IP
  outlookSubscribe: { limit: 5, windowSeconds: 300 },

  // "What's Your Why" AI synthesis: 5 reflections per 5 minutes per user
  whySynthesis: { limit: 5, windowSeconds: 300 },

  // Signup burst: 2 account creations per minute per IP. Catches scripted
  // hammering; a household behind one NAT still comfortably fits.
  signupBurst: { limit: 2, windowSeconds: 60 },

  // Signup sustained: 5 account creations per hour per IP.
  signupIp: { limit: 5, windowSeconds: 3600 },

  // Signup per normalized email: 3 attempts per hour. Keyed on the canonical
  // address, so an alias farm (a.b.c@gmail.com, ab.c@gmail.com, …) all share
  // one bucket instead of getting a fresh allowance per alias.
  signupEmail: { limit: 3, windowSeconds: 3600 },

  // Ad impression/click beacons: 120 per minute per browser session (a page
  // with several rotating slots stays well under this).
  adEvents: { limit: 120, windowSeconds: 60 },

  // --- Login (app/api/auth/login) -------------------------------------------
  // Burst per IP: 5 attempts a minute — enough for a few typos, not a script.
  loginBurst: { limit: 5, windowSeconds: 60 },
  // Sustained per IP: 30 per 15 minutes. A shared office / NAT still fits.
  loginIp: { limit: 30, windowSeconds: 900 },
  // Per normalized email: 10 attempts per 15 minutes, from any IP. This is
  // what stops a password-guessing run against one account, even when the
  // attacker spreads it across many IPs.
  loginEmail: { limit: 10, windowSeconds: 900 },
  // Site-wide failed-login spike detector: the 101st failure in an hour sends
  // one ops alert (lib/ops-alert.ts). It never blocks anyone.
  loginFailureSpike: { limit: 100, windowSeconds: 3600 },

  // --- AI (app/api/why) -----------------------------------------------------
  // Per user per day, on top of whySynthesis' 5-per-5-minutes burst limit.
  aiUserDaily: { limit: 20, windowSeconds: 86_400 },
  // Per IP per hour, so one person with several accounts can't multiply it.
  aiIpHourly: { limit: 30, windowSeconds: 3600 },
  // Rule-based /api/ai/insights (no model call, unauthenticated): per IP.
  aiInsights: { limit: 30, windowSeconds: 60 },

  // Public health check (app/api/health): per IP. Uptime monitors poll once a
  // minute at most.
  health: { limit: 30, windowSeconds: 60 },
} as const;
