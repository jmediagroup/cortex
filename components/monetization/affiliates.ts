/**
 * Affiliate Configuration
 *
 * Central configuration for all affiliate links used across the app.
 * Each calculator/app context can have multiple relevant affiliates.
 */

export interface AffiliateConfig {
  id: string;
  name: string;
  url: string;
  description: string;
  tagline?: string;
  cta?: string; // Call to action button text
  category: 'budgeting' | 'investing' | 'banking' | 'debt' | 'insurance' | 'taxes' | 'cashback' | 'security' | 'rewards' | 'credit-cards';
}

export interface ContextAffiliates {
  primary: AffiliateConfig;
  secondary?: AffiliateConfig;
  rotating?: AffiliateConfig[]; // For contexts with multiple rotating affiliates
}

/**
 * Affiliate definitions
 */
export const affiliates: Record<string, AffiliateConfig> = {
  rocketMoney: {
    id: 'rocket-money',
    name: 'Rocket Money',
    url: 'https://rocketmoney.com/join/T5maFFH9Ik',
    description: 'Get control of your subscriptions, stay on top of your spending, and put your savings on autopilot.',
    tagline: 'The money app that works for you',
    category: 'budgeting',
  },
  sofi: {
    id: 'sofi',
    name: 'SoFi',
    url: 'https://www.sofi.com/invite/money?gcp=0b701f36-b327-415f-b781-0c645da63064&isAliasGcp=false',
    description: 'Get up to $325 in cash bonuses when you open a SoFi Checking and Savings account and set up eligible direct deposit.',
    tagline: 'Get up to $325 in bonuses',
    category: 'banking',
  },
  cashApp: {
    id: 'cash-app',
    name: 'Cash App',
    url: 'https://cash.app/app/XWZVQ7P',
    description: 'Get $5 when you send $5+ with Cash App. Use code XWZVQ7P when you sign up.',
    tagline: 'Get $5 free',
    category: 'banking',
  },
  rakuten: {
    id: 'rakuten',
    name: 'Rakuten',
    url: 'https://www.rakuten.com/r/DREWJE68?eeid=44971',
    description: 'Get paid for the purchases you\'re already making! Join Rakuten and get cash back on qualifying purchases.',
    tagline: 'Cash back on every purchase',
    category: 'cashback',
  },
  ibotta: {
    id: 'ibotta',
    name: 'Ibotta',
    url: 'https://ibotta.onelink.me/iUfE/1005cd3f?friend_code=lbmuevm',
    description: 'Why pay full price? Ibotta gives you cash back at 500,000+ locations on things you already buy.',
    tagline: 'Stop leaving money on the table',
    cta: 'Download Free',
    category: 'cashback',
  },
  nordvpn: {
    id: 'nordvpn',
    name: 'NordVPN',
    url: 'https://refer-nordvpn.com/hgCxnyyGxQs',
    description: 'Protecting your assets starts with protecting your digital footprint. Join 14 million users who secure their wealth.',
    tagline: 'The smartest financial move',
    cta: 'Secure Your Data',
    category: 'security',
  },
  weward: {
    id: 'weward',
    name: 'WeWard',
    url: 'https://wewardapp.go.link/1ddeb?adj_label=MagneticCamel8205',
    description: 'You\'re already walking. Get paid for it. WeWard turns your steps into rewards you can redeem for real value.',
    tagline: 'The easiest side hustle',
    cta: 'Get Paid to Walk',
    category: 'rewards',
  },
  chaseFreedom: {
    id: 'chase-freedom',
    name: 'Chase Freedom',
    url: 'https://www.referyourchasecard.com/18d/ED5VLYLOHP',
    description: '$0 annual fee. $200 bonus. Unlimited cash back. Start with a card that doesn\'t charge you to own it.',
    tagline: '$0 annual fee. Unlimited rewards.',
    cta: 'Apply Now',
    category: 'credit-cards',
  },
  capitalOneVentureX: {
    id: 'capital-one-venture-x',
    name: 'Capital One Venture X',
    url: 'https://i.capitalone.com/JiniLWqmU',
    description: 'Don\'t just save for a rainy day—plan your next adventure. Earn unlimited 2X miles on every purchase.',
    tagline: 'Give your goals a destination',
    cta: 'Start Your Journey',
    category: 'credit-cards',
  },
  discoverCard: {
    id: 'discover-card',
    name: 'Discover Card',
    url: 'https://refer.discover.com/s/wgsxg3?advocate.partner_share_id=741305675',
    description: 'Join Discover and we both get $100. No annual fee. Great rewards. Total clarity.',
    tagline: 'Get $100 for your first purchase',
    cta: 'Claim My Bonus',
    category: 'credit-cards',
  },
  amazonPrimeCard: {
    id: 'amazon-prime-card',
    name: 'Amazon Prime Card',
    url: 'https://www.amazon.com/dp/BT00LN946S?externalReferenceId=96491538-3e8f-4e95-858c-71f12864a64a',
    description: 'Get a $150 Amazon Gift Card instantly upon approval. No waiting, no points to redeem—just a head start.',
    tagline: 'Instantly add $150 to your budget',
    cta: 'Claim Your $150',
    category: 'credit-cards',
  },
};

/**
 * Context-to-affiliate mapping
 * Maps each calculator/app to its relevant affiliate(s)
 */
export const contextAffiliates: Record<string, ContextAffiliates> = {
  'budget': {
    primary: affiliates.rocketMoney,
  },
  'net-worth': {
    primary: affiliates.rocketMoney,
    rotating: [affiliates.rocketMoney, affiliates.nordvpn],
  },
  'retirement-strategy': {
    primary: affiliates.sofi,
    rotating: [affiliates.sofi, affiliates.cashApp, affiliates.rakuten],
  },
  'debt-paydown': {
    primary: affiliates.amazonPrimeCard,
    rotating: [affiliates.amazonPrimeCard, affiliates.sofi, affiliates.chaseFreedom, affiliates.discoverCard, affiliates.rakuten, affiliates.rocketMoney],
  },
  'compound-interest': {
    primary: affiliates.sofi,
    rotating: [affiliates.sofi, affiliates.rakuten, affiliates.rocketMoney, affiliates.cashApp],
  },
  'index-fund-visualizer': {
    primary: affiliates.sofi,
    rotating: [affiliates.sofi, affiliates.rakuten, affiliates.cashApp, affiliates.ibotta],
  },
  'car-affordability': {
    primary: affiliates.rocketMoney,
    rotating: [affiliates.rocketMoney, affiliates.rakuten, affiliates.sofi, affiliates.capitalOneVentureX, affiliates.discoverCard, affiliates.chaseFreedom, affiliates.amazonPrimeCard],
  },
  'rent-vs-buy': {
    primary: affiliates.rocketMoney,
    rotating: [affiliates.rocketMoney, affiliates.capitalOneVentureX, affiliates.rakuten, affiliates.ibotta],
  },
  'geographic-arbitrage': {
    primary: affiliates.rocketMoney,
    rotating: [affiliates.rocketMoney, affiliates.capitalOneVentureX, affiliates.rakuten, affiliates.ibotta, affiliates.weward, affiliates.nordvpn],
  },
  's-corp-optimizer': {
    primary: affiliates.sofi,
    rotating: [affiliates.sofi, affiliates.rocketMoney, affiliates.capitalOneVentureX, affiliates.amazonPrimeCard, affiliates.rakuten, affiliates.nordvpn],
  },
  's-corp-investment': {
    primary: affiliates.sofi,
    rotating: [affiliates.sofi, affiliates.capitalOneVentureX, affiliates.amazonPrimeCard, affiliates.nordvpn],
  },
};

/**
 * Get affiliates for a specific calculator context
 */
export function getAffiliatesForContext(context: string): ContextAffiliates | null {
  return contextAffiliates[context] || null;
}

/**
 * Get all affiliates for a specific category
 */
export function getAffiliatesByCategory(category: AffiliateConfig['category']): AffiliateConfig[] {
  return Object.values(affiliates).filter(a => a.category === category);
}
