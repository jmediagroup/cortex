/**
 * Guard shared by the Vercel Cron routes (the outlook digests and the analytics
 * cleanup). Once the CRON_SECRET env var is set, Vercel automatically attaches
 * `Authorization: Bearer $CRON_SECRET` to every cron invocation.
 *
 * Fails closed in production when the secret is missing: without it, anyone
 * who finds the URL could trigger the job. Local dev without a secret is
 * allowed for convenience.
 */
export function isAuthorizedCronRequest(request: Request, label: string): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      console.error(`[${label}] CRON_SECRET is not set — refusing to run in production`);
      return false;
    }
    return true; // Local dev convenience.
  }
  const header = request.headers.get('authorization');
  return header === `Bearer ${secret}`;
}
