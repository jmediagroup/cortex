import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { safeNextPath } from '@/lib/safe-redirect';

// Always run on the server per-request; never cache.
export const dynamic = 'force-dynamic';

/**
 * GET /auth/callback
 *
 * The single entry point for every Supabase auth email link (signup
 * verification and password recovery). The link lands here with a PKCE
 * `?code=` that we exchange for a session, writing the auth cookies on THIS
 * origin so the session survives the redirect. Without this route the code is
 * never exchanged and the user lands on a protected page with no session.
 *
 * `next` is the post-verification destination (validated to a same-origin
 * path); it carries the free `/onboarding` vs. Pro `/dashboard?plan=…` intent.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = safeNextPath(url.searchParams.get('next'), '/dashboard');

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=auth_callback', url.origin));
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    // Most common cause: the link was opened in a different browser than the
    // one that started signup (no PKCE verifier). Send them to log in.
    return NextResponse.redirect(
      new URL(`/login?error=auth_callback&reason=${encodeURIComponent(error.message)}`, url.origin),
    );
  }

  // Redirect relative to the current origin so the cookies we just set persist.
  return NextResponse.redirect(new URL(next, url.origin));
}
