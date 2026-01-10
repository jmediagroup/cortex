/**
 * Centralized Access Control for Multi-Sector Subscription System
 *
 * This module provides utilities for managing tier-based access across
 * multiple sectors (Finance, Health, Education, etc.)
 */

export type Tier = 'free' | 'finance_pro' | 'elite';
export type Sector = 'finance';  // Expand: 'health' | 'education' | etc.

/**
 * Determines if a user has access to a specific app based on their tier
 *
 * Access Rules:
 * - Free tier: Access to all 'free' apps across all sectors
 * - Sector Pro (e.g., finance_pro): Access to all apps (free + pro) in that sector
 * - Elite: Access to all apps (free + pro) across ALL sectors
 *
 * @param app - The app configuration with tier and sector
 * @param userTier - The user's current subscription tier
 * @returns boolean - Whether the user can access the app
 */
export function hasAppAccess(
  app: { tier: 'free' | 'pro'; sector: Sector },
  userTier: Tier
): boolean {
  // Free apps are accessible to everyone
  if (app.tier === 'free') return true;

  // Elite tier gets everything
  if (userTier === 'elite') return true;

  // Sector-specific pro access
  if (app.tier === 'pro') {
    if (app.sector === 'finance' && userTier === 'finance_pro') return true;
    // Future sectors:
    // if (app.sector === 'health' && userTier === 'health_pro') return true;
    // if (app.sector === 'education' && userTier === 'education_pro') return true;
  }

  return false;
}

/**
 * Checks if a user has pro-level features in a specific component
 * Used for feature-level gating within apps (e.g., Auto-Optimize in Retirement Engine)
 *
 * @param sector - The sector the feature belongs to
 * @param userTier - The user's current subscription tier
 * @returns boolean - Whether the user has pro access for this sector
 */
export function hasProAccess(sector: Sector, userTier: Tier): boolean {
  // Elite gets pro access everywhere
  if (userTier === 'elite') return true;

  // Sector-specific pro access
  if (sector === 'finance' && userTier === 'finance_pro') return true;
  // Future: if (sector === 'health' && userTier === 'health_pro') return true;

  return false;
}

/**
 * Returns the display name for a tier
 *
 * @param tier - The tier to get the display name for
 * @returns string - Human-readable tier name
 */
export function getTierDisplayName(tier: Tier): string {
  const names: Record<Tier, string> = {
    'free': 'Free',
    'finance_pro': 'Finance Pro',
    'elite': 'Elite',
  };
  return names[tier];
}

/**
 * Returns the color scheme for a tier (used in UI badges)
 *
 * @param tier - The tier to get the color for
 * @returns string - Tailwind color name
 */
export function getTierColor(tier: Tier): string {
  const colors: Record<Tier, string> = {
    'free': 'slate',
    'finance_pro': 'indigo',
    'elite': 'purple',
  };
  return colors[tier];
}

/**
 * Determines if a user can upgrade from their current tier to a target tier
 *
 * @param currentTier - The user's current tier
 * @param targetTier - The tier they want to upgrade to
 * @returns boolean - Whether the upgrade is valid
 */
export function canUpgradeTo(currentTier: Tier, targetTier: Tier): boolean {
  const hierarchy: Record<Tier, number> = {
    'free': 0,
    'finance_pro': 1,
    'elite': 2,
  };

  return hierarchy[targetTier] > hierarchy[currentTier];
}

/**
 * Gets the monthly price for a tier
 *
 * @param tier - The tier to get pricing for
 * @returns number - Monthly price in dollars
 */
export function getTierMonthlyPrice(tier: Tier): number {
  const prices: Record<Tier, number> = {
    'free': 0,
    'finance_pro': 9,
    'elite': 29,
  };
  return prices[tier];
}

/**
 * Gets the annual price for a tier
 *
 * @param tier - The tier to get pricing for
 * @returns number - Annual price in dollars
 */
export function getTierAnnualPrice(tier: Tier): number {
  const prices: Record<Tier, number> = {
    'free': 0,
    'finance_pro': 90,
    'elite': 290,
  };
  return prices[tier];
}

/**
 * Calculates annual savings for a tier
 *
 * @param tier - The tier to calculate savings for
 * @returns number - Dollars saved per year
 */
export function getAnnualSavings(tier: Tier): number {
  const monthly = getTierMonthlyPrice(tier);
  const annual = getTierAnnualPrice(tier);
  return (monthly * 12) - annual;
}

/**
 * Determines if a user should see an upgrade prompt
 *
 * @param currentTier - The user's current tier
 * @param requiredTier - The tier required for a feature
 * @returns boolean - Whether to show upgrade prompt
 */
export function shouldShowUpgradePrompt(currentTier: Tier, requiredTier: Tier): boolean {
  return canUpgradeTo(currentTier, requiredTier);
}

/**
 * Gets the recommended upgrade path for a user trying to access locked content
 *
 * @param currentTier - The user's current tier
 * @param requiredSector - The sector they're trying to access
 * @returns Tier - The recommended tier to upgrade to
 */
export function getRecommendedUpgrade(currentTier: Tier, requiredSector: Sector): Tier {
  if (currentTier === 'free') {
    // From free, recommend sector-specific pro
    if (requiredSector === 'finance') return 'finance_pro';
    // Future: if (requiredSector === 'health') return 'health_pro';
  }

  if (currentTier === 'finance_pro' && requiredSector !== 'finance') {
    // If they have one sector pro and want another, recommend Elite
    return 'elite';
  }

  // Default: recommend Elite
  return 'elite';
}
