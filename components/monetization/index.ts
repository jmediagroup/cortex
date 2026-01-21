// Monetization Components
export { default as AffiliateLink } from './AffiliateLink';
export { default as ContextualAd } from './ContextualAd';
export { default as RotatingAd } from './RotatingAd';
export { default as AdContainer } from './AdContainer';

// IAB-Compliant Ad Components
export { default as IABAd } from './IABAd';
export { default as StickySidebarAd } from './StickySidebarAd';
export { default as BelowResultsAd } from './BelowResultsAd';
export { default as MobileBannerAd } from './MobileBannerAd';

// Affiliate Configuration
export {
  affiliates,
  contextAffiliates,
  getAffiliatesForContext,
  getAffiliatesByCategory,
  type AffiliateConfig,
  type ContextAffiliates,
} from './affiliates';

// Ad Copy Configuration
export {
  affiliateAdCopy,
  getAdCopy,
  getRandomVariation,
  type AdCopy,
  type AdCopySet,
} from './ad-copy';
