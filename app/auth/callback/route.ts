import { NextResponse } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { safeNextPath } from '@/lib/safe-redirect';

// Always run on the server per-request; never cache.
export const dynamic = 'force-dynamic';

const OTP_TYPES: EmailOtpType[] = ['signup', 'email', 'recovery', 'invite', 'magiclink', 'email_change'];

function isOtpType(value: string | null): value is EmailOtpType {
  return value !== null && (OTP_TYPES as string[]).includes(value);
}

/**
 * Where to send someone once their link has been exchanged for a session.
 *
 * Priority: an explicit `next` on the URL (the PKCE path still carries one),
 * then the intent we stored in user metadata at signup (so a token-hash link,
 * which has no `next`, still lands Pro-intent users on checkout), then the
 * type's natural home.
 */
function resolveNext(
  url: URL,
  type: EmailOtpType | null,
  metadata: Record<string, unknown> | undefined,
): string {
  const explicit = url.searchParams.get('next');
  if (explicit) return safeNextPath(explicit, '/dashboard');

  if (type === 'recovery') return '/reset-password';

  const stored = metadata?.signup_next;
  if (typeof stored === 'string') return safeNextPath(stored, '/onboarding');

  return type === 'signup' || type === 'email' ? '/onboarding' : '/dashboard';
}

function loginRedirect(url: URL, code: string, next?: string | null) {
  const target = new URL('/login', url.origin);
  target.searchParams.set('notice', code);
  if (next) target.searchParams.set('redirect', next);
  return NextResponse.redirect(target);
}

/**
 * GET /auth/callback
 *
 * The single entry point for every Supabase auth email link (signup
 * verification, password recovery, email change, magic link).
 *
 * Two link shapes are accepted:
 *
 *  1. `?token_hash=…&type=signup` — the shape our email templates produce
 *     (`emails/*.html`). It is verified server-side with `verifyOtp`, which
 *     needs nothing from the browser, so the link works from ANY device or
 *     mail app, not just the browser that started signup.
 *
 *  2. `?code=…` — Supabase's default PKCE shape, kept for backwards
 *     compatibility with the stock templates. PKCE needs the code-verifier
 *     cookie that was set when signup ran, so it only works in that same
 *     browser. When it fails, the address has still been confirmed by
 *     Supabase's verify endpoint, so we send the person to log in with a
 *     message that says so instead of a bare error.
 *
 * Either way the session cookies are written on THIS origin so they survive
 * the redirect to `next`.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get('token_hash');
  const rawType = url.searchParams.get('type');
  const code = url.searchParams.get('code');
  const explicitNext = url.searchParams.get('next');

  // Supabase redirects here with `error`/`error_code` when its own verify step
  // fails (expired or already-used link, disabled provider, …).
  const providerError = url.searchParams.get('error_code') ?? url.searchParams.get('error');
  if (providerError && !tokenHash && !code) {
    const expired = providerError === 'otp_expired' || providerError === 'access_denied';
    return loginRedirect(url, expired ? 'link_expired' : 'link_invalid', explicitNext);
  }

  const supabase = await createServerSupabaseClient();

  // --- Token-hash links (device independent) --------------------------------
  if (tokenHash && isOtpType(rawType)) {
    const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: rawType });
    if (error) {
      const expired = /expired|invalid|not found/i.test(error.message);
      return loginRedirect(url, expired ? 'link_expired' : 'link_invalid', explicitNext);
    }
    const next = resolveNext(url, rawType, data.user?.user_metadata);
    return NextResponse.redirect(new URL(next, url.origin));
  }

  // --- PKCE links (same browser only) --------------------------------------
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      // The most common cause is opening the link in a different browser than
      // the one that signed up (no PKCE verifier cookie). By the time we get
      // here Supabase has already confirmed the address, so a normal login
      // will work — tell them that rather than showing a dead end.
      const missingVerifier = /verifier|code challenge|flow state|invalid request/i.test(error.message);
      return loginRedirect(
        url,
        missingVerifier ? 'verified_login_required' : 'link_invalid',
        explicitNext,
      );
    }
    const next = resolveNext(url, isOtpType(rawType) ? rawType : null, data.user?.user_metadata);
    return NextResponse.redirect(new URL(next, url.origin));
  }

  return loginRedirect(url, 'auth_callback', explicitNext);
}
