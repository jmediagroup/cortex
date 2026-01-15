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
 * Check if a request should be rate limited
 * @param identifier - Unique identifier for the requester (IP, user ID, etc.)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  cleanupExpiredEntries();

  const now = Date.now();
  const key = identifier;
  const entry = rateLimitStore.get(key);

  // If no entry exists or window has expired, create new entry
  if (!entry || entry.resetTime < now) {
    const resetTime = now + config.windowSeconds * 1000;
    rateLimitStore.set(key, { count: 1, resetTime });
    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      resetTime,
    };
  }

  // Increment count
  entry.count++;

  // Check if limit exceeded
  if (entry.count > config.limit) {
    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  return {
    success: true,
    limit: config.limit,
    remaining: config.limit - entry.count,
    resetTime: entry.resetTime,
  };
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
} as const;
