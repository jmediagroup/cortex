/**
 * Site-wide kill switch for the banner ads (standing rule 7 in CLAUDE.md:
 * every monetized surface has an env flag that defaults OFF).
 *
 * Banners render only when NEXT_PUBLIC_BANNER_ADS_ENABLED is exactly "true".
 * It is inlined at build time, so changing it in Vercel takes a redeploy.
 * Pausing campaigns in /admin/ads is not enough on its own: with no active
 * campaign, AdSlot falls back to the hard-coded advertisers in
 * components/monetization/affiliates.ts.
 */
export function bannerAdsEnabled(
  flag: string | undefined = process.env.NEXT_PUBLIC_BANNER_ADS_ENABLED,
): boolean {
  return flag === 'true';
}
