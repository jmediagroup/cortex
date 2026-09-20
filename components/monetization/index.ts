// Monetization Components

// Pro Gating
export { default as ProGatedPreview } from './ProGatedPreview';
export { default as ProUpsellCard } from './ProUpsellCard';

// Ads (admin-managed; see ADS.md)
export { default as IABAd } from './IABAd';
export { default as AdSlot } from './AdSlot';
export { default as InlineAd } from './InlineAd';
export { AdProvider, useAdVisibility, type AdVisibility } from './AdProvider';

// Legacy affiliate configuration (now the fallback for lib/ads/fallback.ts)
export {
  affiliates,
  contextAffiliates,
  getAffiliatesForContext,
  getAffiliatesByCategory,
  type AffiliateConfig,
  type ContextAffiliates,
} from './affiliates';

// Legacy ad copy configuration (seed source + fallback)
export {
  affiliateAdCopy,
  getAdCopy,
  getRandomVariation,
  type AdCopy,
  type AdCopySet,
} from './ad-copy';
