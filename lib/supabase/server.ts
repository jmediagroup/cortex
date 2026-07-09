import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/supabase/client';

/**
 * Server-side Supabase client bound to the request's cookie store.
 *
 * Use this in Route Handlers and Server Components that need the signed-in
 * user's session (e.g. the auth callback that exchanges a PKCE code for a
 * session and writes the auth cookies). This is the cookie-backed counterpart
 * to the browser client in `./client` and the edge client in `./middleware`.
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
            // store). That's fine — the middleware refreshes the session cookie
            // on the next request, so this can be safely ignored there.
          }
        },
      },
    },
  );
}
