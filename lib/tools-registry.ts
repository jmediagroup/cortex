/**
 * The canonical list of tools shown on the homepage grid and the /apps hub.
 * Plain data (no 'use client') so BOTH server components (metadata, JSON-LD)
 * and client components can import it. Importing a non-component export from
 * a 'use client' module into a server component yields a client reference,
 * not the value.
 */
import type { MarketingIconName } from '@/components/marketing/Icons';

export type MarketingTool = {
  icon: MarketingIconName;
  title: string;
  desc: string;
  href: string;
  tag?: 'FREE' | 'PRO';
  featured?: boolean;
};

export const DEFAULT_TOOLS: MarketingTool[] = [
  {
    icon: 'calculator',
    title: 'Compound Interest Calculator',
    desc: 'See how your money grows over time with different contribution strategies and rates.',
    href: '/apps/compound-interest',
    tag: 'FREE',
  },
  {
    icon: 'barChart',
    title: 'Index Fund Growth Visualizer',
    desc: 'Simulate historical returns and volatility for popular index ETFs like VOO, VTI, VT, and QQQM.',
    href: '/apps/index-fund-visualizer',
    tag: 'FREE',
  },
  {
    icon: 'wallet',
    title: 'Household Budgeting System',
    desc: 'Allocate resources under constraints with AI-powered optimization and flexibility analysis.',
    href: '/apps/budget',
    tag: 'FREE',
  },
  {
    icon: 'dices',
    title: 'Gambling Spend Redirect',
    desc: 'See the wealth gap between playing the odds and owning the market. Redirect toward real wealth.',
    href: '/apps/gambling-redirect',
    tag: 'FREE',
  },
  {
    icon: 'trendUp',
    title: 'Retirement Strategy Engine',
    desc: 'Decumulation planning with Roth conversions, tax optimization, and sequence risk analysis.',
    href: '/apps/retirement-strategy',
    tag: 'PRO',
    featured: true,
  },
  {
    icon: 'anchor',
    title: 'Coast FIRE Calculator',
    desc: 'Find out if your current savings will grow to your retirement number on their own — no more contributions needed.',
    href: '/apps/coast-fire',
    tag: 'FREE',
  },
  {
    icon: 'compass',
    title: 'Net Worth Engine',
    desc: 'Track assets and liabilities, analyze liquidity, and visualize your financial trajectory.',
    href: '/apps/net-worth',
    tag: 'PRO',
    featured: true,
  },
  {
    icon: 'landmark',
    title: 'Rent vs Buy Reality Engine',
    desc: 'Compare renting vs buying with opportunity cost, maintenance drag, and tax treatment.',
    href: '/apps/rent-vs-buy',
    tag: 'PRO',
  },
  {
    icon: 'trendDown',
    title: 'Debt Paydown Optimizer',
    desc: 'Compare avalanche vs snowball strategies with psychological weighting and opportunity cost.',
    href: '/apps/debt-paydown',
    tag: 'PRO',
  },
  {
    icon: 'mapPin',
    title: 'Geographic Arbitrage',
    desc: 'Calculate wealth-building potential by comparing income, taxes, and cost of living across all 50 states.',
    href: '/apps/geographic-arbitrage',
    tag: 'PRO',
  },
  {
    icon: 'building',
    title: 'S-Corp Investment Optimizer',
    desc: 'Maximize retirement contributions while optimizing your S-Corp owner compensation.',
    href: '/apps/s-corp-investment',
    tag: 'PRO',
  },
  {
    icon: 'scale',
    title: 'S-Corp Optimizer',
    desc: 'Calculate self-employment tax savings and find your ideal salary/distribution split.',
    href: '/apps/s-corp-optimizer',
    tag: 'PRO',
  },
  {
    icon: 'landmark',
    title: 'Capital Gains Tax Estimator',
    desc: 'See how much stock you can sell before each tax cliff — models the 0/15/20% brackets, NIIT, IRMAA, ACA, and Virginia tax for 2026.',
    href: '/apps/capital-gains-tax',
    tag: 'FREE',
  },
  {
    icon: 'car',
    title: 'Car Affordability Calculator',
    desc: 'Understand the true cost of vehicle ownership including depreciation and opportunity cost.',
    href: '/apps/car-affordability',
    tag: 'PRO',
  },
  {
    icon: 'brain',
    title: 'Financial Personality Quiz',
    desc: 'Map your money instincts to one of six investor archetypes — from patient Accumulator to high-conviction Visionary.',
    href: '/apps/personality-quiz',
    tag: 'FREE',
  },
  {
    icon: 'compass',
    title: "What's Your Why",
    desc: 'Eight reflective questions that surface what actually drives your money decisions — reflected back as a personal read on your relationship with money.',
    href: '/apps/whats-your-why',
    tag: 'PRO',
  },
];
