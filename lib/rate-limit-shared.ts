import { createServiceClient } from '@/lib/supabase/client';
import { checkRateLimit, type RateLimitConfig, type RateLimitResult } from '@/lib/rate-limit';
import { rateLimitKeyHash } from '@/lib/privacy-hash';

/**
 * Rate limiting shared by every serverless instance.
 *
 * `checkRateLimit` in lib/rate-limit.ts keeps its counters in memory, and on
 * Vercel each warm function instance has its own memory — so a bot whose
 * requests land on ten instances gets ten times the allowance. This version
 * keeps one counter per key in Postgres (`public.rate_limit_buckets`, updated
 * atomically by the `rate_limit_hit` function), so the limit holds no matter
 * which instance answers.
 *
 * Fail-soft by design: if the database call fails (the migration isn't
 * applied yet, Supabase is slow or down) it falls back to the in-memory
 * limiter rather than letting everything through or blocking everyone. The
 * call is capped at 1.5s so a slow database never stalls a login.
 *
 * Keys are hashed before they leave this process, so the table never holds a
 * raw IP or email address.
 */

const DB_TIMEOUT_MS = 1500;

let warnedFallback = false;

export interface SharedRateLimitResult extends RateLimitResult {
  /** 'shared' when Postgres answered, 'memory' when we fell back. */
  source: 'shared' | 'memory';
}

export async function checkSharedRateLimit(
  key: string,
  config: RateLimitConfig,
  options: { cost?: number } = {},
): Promise<SharedRateLimitResult> {
  const cost = options.cost ?? 1;
  let timer: ReturnType<typeof setTimeout> | undefined;

  try {
    const supabase = createServiceClient();
    const rpc = supabase.rpc('rate_limit_hit', {
      p_key: rateLimitKeyHash(key),
      p_limit: config.limit,
      p_window_seconds: config.windowSeconds,
      p_cost: cost,
    });

    const { data, error } = await Promise.race([
      rpc,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('rate_limit_hit timed out')), DB_TIMEOUT_MS);
      }),
    ]);
    clearTimeout(timer);

    const row = Array.isArray(data) ? data[0] : null;
    if (error || !row) throw error ?? new Error('rate_limit_hit returned no row');

    const resetTime = new Date(row.reset_at).getTime();
    return {
      success: row.allowed,
      limit: config.limit,
      remaining: Math.max(0, config.limit - row.hits),
      resetTime: Number.isFinite(resetTime) ? resetTime : Date.now() + config.windowSeconds * 1000,
      source: 'shared',
    };
  } catch (err) {
    clearTimeout(timer);
    if (!warnedFallback) {
      warnedFallback = true;
      console.warn(
        '[rate-limit] shared limiter unavailable, using in-memory fallback:',
        (err as { message?: string } | null)?.message ?? 'unknown error',
      );
    }
    return { ...checkRateLimit(key, config, cost), source: 'memory' };
  }
}
