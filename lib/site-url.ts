/**
 * The canonical origin for the app, without a trailing slash.
 *
 * Auth redirects (email verification, password recovery) must resolve to a
 * single, allow-listed origin — not `window.location.origin`, which varies by
 * whichever domain the user happened to enter on. Supabase silently drops any
 * redirect that isn't on its Auth allow-list, so deriving the host from the
 * current tab breaks verification for anyone on a non-canonical domain.
 *
 * Prefers `NEXT_PUBLIC_APP_URL` (the same var the Stripe/outlook flows use),
 * falls back to the current origin in the browser, and finally to the
 * production host for SSR safety.
 */
export function siteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '');
  if (configured) return configured;
  if (typeof window !== 'undefined') return window.location.origin;
  return 'https://moneyguymutants.com';
}
