/**
 * Returns `input` only when it is a safe, same-origin relative path.
 *
 * Prevents open-redirect / phishing via a `redirect`/`next` query param: an
 * absolute or protocol-relative URL handed to `router.push()` or
 * `NextResponse.redirect()` would navigate the user off-site. We only allow a
 * path that starts with a single "/" and is not "//" or "/\" (both of which
 * browsers treat as protocol-relative to another host).
 */
export function safeNextPath(
  input: string | null | undefined,
  fallback = '/dashboard',
): string {
  if (!input) return fallback;
  if (input[0] !== '/') return fallback;
  if (input.startsWith('//') || input.startsWith('/\\')) return fallback;
  return input;
}
