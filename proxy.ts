import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

/**
 * Root proxy (Next.js 16's name for what used to be `middleware.ts`).
 * Refreshes the Supabase session cookie and bounces signed-out visitors off
 * the signed-in-only areas before any client JS runs (no flash of the app
 * shell).
 *
 * Next 16 always runs proxy on the Node.js runtime (the old middleware file
 * ran on Edge), so on Vercel it executes in the project's function region
 * from vercel.json — next to the Supabase database.
 */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  /*
   * Run ONLY on the signed-in areas: the same prefixes as PROTECTED_PREFIXES
   * in lib/supabase/middleware.ts (tests/proxy-matcher.test.mjs keeps the two
   * in sync). `/:path*` also matches the bare prefix, e.g. `/dashboard`.
   *
   * This used to match every page, which cost a proxy run on each visit and,
   * for anyone who had ever signed in, a call to Supabase Auth. Narrowing it
   * does not stop sessions from refreshing, because nothing else on the
   * server depends on this refresh:
   *
   * - No page, layout or Server Component reads the session on the server.
   *   Every other signed-in UI (/apps/*, /pricing, /login, /signup,
   *   /reset-password, the app shell, analytics) reads it in the browser, and
   *   the browser client refreshes the tokens and saves the new cookies
   *   itself.
   * - API routes authenticate with an `Authorization: Bearer` access token
   *   (lib/auth-helpers.ts), not with the session cookies.
   * - The only cookie-based server code is two Route Handlers
   *   (app/auth/callback, app/api/auth/signup). They create a new session
   *   rather than reading an existing one, and Route Handlers can write
   *   cookies, so they do not need a refresh here.
   *
   * If you add a Server Component, layout or page that reads the session
   * through createServerSupabaseClient(), add its path to this list. A Server
   * Component cannot write cookies, so a token it refreshes is never saved;
   * the browser then presents the old, already-used refresh token and
   * Supabase signs the user out.
   */
  matcher: ['/dashboard/:path*', '/account/:path*', '/onboarding/:path*', '/admin/:path*'],
};
