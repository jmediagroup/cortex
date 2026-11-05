import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/supabase/client';

/**
 * When signup/login run on our server, Supabase Auth sees Vercel's IP, not the
 * visitor's, so its own per-IP limits (e.g. sign-ins per hour) are shared by
 * everyone. Supabase can rate-limit on the real visitor IP instead if we send
 * it in `sb-forwarded-for` — but only with a *secret* API key (`sb_secret_…`;
 * the legacy anon/service_role keys are ignored) and only once "IP Address
 * Forwarding" is enabled under Authentication → Rate Limits.
 *
 * Off unless SUPABASE_AUTH_IP_FORWARDING="true" and SUPABASE_SECRET_KEY is
 * set. The secret key is only ever sent to Supabase as the `apikey` header;
 * it is never written to a cookie or returned to the browser.
 */
function authIpForwarding(ip: string | undefined): { key: string; ip: string } | null {
  const key = process.env.SUPABASE_SECRET_KEY;
  if (process.env.SUPABASE_AUTH_IP_FORWARDING !== 'true' || !key || !ip || ip === 'unknown') return null;
  return { key, ip };
}

/**
 * Server-side Supabase client bound to the request's cookie store.
 *
 * Use this in Route Handlers and Server Components that need the signed-in
 * user's session (e.g. the auth callback that exchanges a PKCE code for a
 * session and writes the auth cookies). This is the cookie-backed counterpart
 * to the browser client in `./client` and the proxy client in `./middleware`.
 */
export async function createServerSupabaseClient(options: { forwardedFor?: string } = {}) {
  const cookieStore = await cookies();
  const forwarding = authIpForwarding(options.forwardedFor);

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    forwarding?.key ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      ...(forwarding ? { global: { headers: { 'sb-forwarded-for': forwarding.ip } } } : {}),
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>,
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // `set` throws when called from a Server Component (immutable cookie
            // store), so a token refreshed there is never saved. That is only
            // safe on paths where proxy.ts runs first and refreshes the cookie
            // before the page renders — if a Server Component reads the
            // session, add its path to the matcher in proxy.ts. Route Handlers
            // can set cookies, so they are unaffected.
          }
        },
      },
    },
  );
}
