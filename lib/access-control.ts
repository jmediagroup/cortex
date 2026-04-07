/**
 * Centralized Access Control for Subscription System
 *
 * Two-tier model: Free and Pro (finance_pro).
 * Pro users get full access to all tools and an ad-free experience.
 */

export type Tier = 'free' | 'finance_pro';
export type Sector = 'finance';  // Expand: 'health' | 'education' | etc.

/**
 * Determines if a user has access to a specific app based on their tier
 *
 * Access Rules:
 * - Free tier: Access to all 'free' apps across all sectors
 * - Pro (finance_pro): Access to all apps (free + pro) in that sector
 */
export function hasAppAccess(
  app: { tier: 'free' | 'pro'; sector: Sector },
  userTier: Tier
): boolean {
  if (app.tier === 'free') return true;
  if (userTier === 'finance_pro') return true;
  return false;
}

/**
 * Checks if a user has pro-level features in a specific component
 * Used for feature-level gating within apps (e.g., Auto-Optimize in Retirement Engine)
 */
export function hasProAccess(sector: Sector, userTier: Tier): boolean {
  if (sector === 'finance' && userTier === 'finance_pro') return true;
  return false;
}

/**
 * Returns the display name for a tier
 */
export function getTierDisplayName(tier: Tier): string {
  const names: Record<Tier, string> = {
    'free': 'Free',
    'finance_pro': 'Pro',
  };
  return names[tier];
}

/**
 * Returns the color scheme for a tier (used in UI badges)
 */
export function getTierColor(tier: Tier): string {
  const colors: Record<Tier, string> = {
    'free': 'slate',
    'finance_pro': 'indigo',
  };
  return colors[tier];
}

/**
 * Determines if a user can upgrade from their current tier to a target tier
 */
export function canUpgradeTo(currentTier: Tier, targetTier: Tier): boolean {
  const hierarchy: Record<Tier, number> = {
    'free': 0,
    'finance_pro': 1,
  };
  return hierarchy[targetTier] > hierarchy[currentTier];
}

/**
 * Gets the monthly price for a tier
 */
export function getTierMonthlyPrice(tier: Tier): number {
  const prices: Record<Tier, number> = {
    'free': 0,
    'finance_pro': 9,
  };
  return prices[tier];
}

/**
 * Gets the annual price for a tier
 */
export function getTierAnnualPrice(tier: Tier): number {
  const prices: Record<Tier, number> = {
    'free': 0,
    'finance_pro': 90,
  };
  return prices[tier];
}

/**
 * Calculates annual savings for a tier
 */
export function getAnnualSavings(tier: Tier): number {
  const monthly = getTierMonthlyPrice(tier);
  const annual = getTierAnnualPrice(tier);
  return (monthly * 12) - annual;
}

/**
 * Determines if a user should see an upgrade prompt
 */
export function shouldShowUpgradePrompt(currentTier: Tier, requiredTier: Tier): boolean {
  return canUpgradeTo(currentTier, requiredTier);
}

/**
 * Gets the recommended upgrade path for a user trying to access locked content
 */
export function getRecommendedUpgrade(currentTier: Tier, requiredSector: Sector): Tier {
  if (currentTier === 'free') return 'finance_pro';
  return 'finance_pro';
}

/**
 * Determines if ads/affiliate content should be shown to a user
 *
 * Ad Visibility Rules:
 * - Not logged in: Show ads (guests see ads)
 * - Free tier: Show ads
 * - Pro: No ads (ad-free experience)
 */
export function shouldShowAds(userTier: Tier | null, isLoggedIn: boolean): boolean {
  if (!isLoggedIn) return true;
  if (userTier === 'free' || userTier === null) return true;
  return false;
}

/**
 * Checks if a user has an ad-free experience
 */
export function hasAdFreeExperience(userTier: Tier | null): boolean {
  return userTier === 'finance_pro';
}
