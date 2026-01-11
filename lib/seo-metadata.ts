import { Metadata } from 'next';

const BASE_URL = 'https://cortex.io'; // Update with your actual domain

interface SEOConfig {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
  canonical?: string;
}

export function generateMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords,
    ogImage = '/og-image.png',
    canonical,
  } = config;

  return {
    title: `${title} | Cortex`,
    description,
    keywords: keywords.join(', '),
    authors: [{ name: 'Cortex Technologies' }],
    creator: 'Cortex Technologies',
    publisher: 'Cortex Technologies',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: canonical || BASE_URL,
      title,
      description,
      siteName: 'Cortex - Tools for Long-Term Thinking',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
      creator: '@cortextools',
    },
    alternates: {
      canonical: canonical || BASE_URL,
    },
    verification: {
      google: 'your-google-verification-code',
      // Add other verification codes as needed
    },
  };
}

// SEO configurations for each page
export const SEO_CONFIGS = {
  home: {
    title: 'Cortex - Financial Decision Tools & Budget Planning Software',
    description: 'Free online financial calculators and budget planning tools. Retirement planning, compound interest calculator, budget optimizer, net worth tracker, and more. Make smarter money decisions with Cortex.',
    keywords: [
      'financial calculator',
      'budget planner',
      'retirement calculator',
      'compound interest calculator',
      'net worth tracker',
      'budget optimizer',
      'financial planning tool',
      'money management app',
      'investment calculator',
      'debt payoff calculator',
      'financial decision making',
      'personal finance software',
    ],
  },
  budget: {
    title: 'Free Household Budget Calculator & AI Budget Optimizer',
    description: 'Smart budget calculator with AI-powered optimization. Track monthly expenses, allocate resources efficiently, and optimize your household budget. Free budget planning tool with tension metrics and flexibility analysis.',
    keywords: [
      'budget calculator',
      'household budget planner',
      'budget optimizer',
      'AI budget tool',
      'monthly budget calculator',
      'expense tracker',
      'budget allocation tool',
      'family budget planner',
      'budget management software',
      'smart budgeting app',
      'budget planning calculator',
      'resource allocation',
      'budget tension analysis',
      'flexible budget tool',
    ],
  },
  netWorth: {
    title: 'Net Worth Calculator & Wealth Tracker - Free Financial Tool',
    description: 'Track your net worth, assets, and liabilities with our free calculator. Analyze liquidity, momentum, and visualize your financial trajectory. Comprehensive wealth tracking for personal finance.',
    keywords: [
      'net worth calculator',
      'wealth tracker',
      'asset tracker',
      'liability calculator',
      'financial health tracker',
      'net worth analysis',
      'wealth management tool',
      'personal finance tracker',
      'net worth growth',
      'financial trajectory',
      'liquidity analysis',
      'wealth building calculator',
    ],
  },
  compoundInterest: {
    title: 'Compound Interest Calculator - Free Investment Growth Tool',
    description: 'Calculate compound interest and visualize long-term wealth growth. See how your investments grow over time with custom contributions. Free tool for retirement planning and investment analysis.',
    keywords: [
      'compound interest calculator',
      'investment calculator',
      'wealth growth calculator',
      'retirement savings calculator',
      'compound growth',
      'investment growth calculator',
      'savings calculator',
      'compound returns',
      'long-term investment calculator',
      'wealth accumulation calculator',
    ],
  },
  retirement: {
    title: 'Retirement Planning Calculator - Withdrawal Strategy Optimizer',
    description: 'Advanced retirement calculator with RMD calculations, Roth conversion planning, and sequence risk analysis. Plan your retirement withdrawal strategy with tax optimization.',
    keywords: [
      'retirement calculator',
      'retirement planning',
      'RMD calculator',
      'Roth conversion calculator',
      'retirement withdrawal strategy',
      'retirement income calculator',
      '401k calculator',
      'IRA calculator',
      'retirement planning tool',
      'tax-efficient retirement',
      'sequence risk',
      'retirement strategy',
    ],
  },
  sCorpOptimizer: {
    title: 'S-Corp Tax Calculator - Self-Employment Tax Savings Tool',
    description: 'Calculate S-Corp tax savings and find your ideal salary/distribution split. Maximize self-employment tax savings with our free S-Corporation tax optimizer.',
    keywords: [
      'S-Corp calculator',
      's-corporation tax calculator',
      'self-employment tax savings',
      'S-Corp salary calculator',
      'distribution vs salary',
      'S-Corp tax optimizer',
      'small business tax calculator',
      'LLC vs S-Corp calculator',
      'self-employment tax calculator',
      'business tax savings',
    ],
  },
  sCorpInvestment: {
    title: 'S-Corp Retirement Contribution Calculator - 401k Optimizer',
    description: 'Maximize retirement savings through S-Corp contributions. Calculate employee deferrals, profit sharing, and company matching for S-Corporation owners.',
    keywords: [
      'S-Corp 401k calculator',
      's-corporation retirement',
      'S-Corp retirement calculator',
      'solo 401k calculator',
      'profit sharing calculator',
      'S-Corp contribution calculator',
      'small business retirement',
      'S-Corp retirement planning',
    ],
  },
  carAffordability: {
    title: 'Car Affordability Calculator - 20/3/8 Rule Auto Loan Tool',
    description: 'Calculate how much car you can afford using the 20/3/8 rule. Factor in depreciation, opportunity cost, and true cost of vehicle ownership.',
    keywords: [
      'car affordability calculator',
      'auto loan calculator',
      '20/3/8 rule calculator',
      'car buying calculator',
      'vehicle affordability',
      'car payment calculator',
      'auto financing calculator',
      'car depreciation calculator',
      'true cost of car ownership',
    ],
  },
  rentVsBuy: {
    title: 'Rent vs Buy Calculator - Home Ownership Cost Comparison',
    description: 'Compare renting vs buying a home with real-world factors: opportunity cost, maintenance, taxes, and mobility. Make informed housing decisions.',
    keywords: [
      'rent vs buy calculator',
      'rent or buy calculator',
      'home buying calculator',
      'renting vs buying',
      'home ownership calculator',
      'real estate calculator',
      'mortgage vs rent',
      'housing cost calculator',
      'home affordability calculator',
    ],
  },
  debtPaydown: {
    title: 'Debt Payoff Calculator - Avalanche vs Snowball Method',
    description: 'Compare debt paydown strategies: avalanche, snowball, and hybrid methods. Calculate payoff timelines with psychological weighting and opportunity cost.',
    keywords: [
      'debt payoff calculator',
      'debt snowball calculator',
      'debt avalanche calculator',
      'debt paydown calculator',
      'debt elimination calculator',
      'debt reduction calculator',
      'pay off debt calculator',
      'debt strategy calculator',
      'debt free calculator',
    ],
  },
  geoArbitrage: {
    title: 'Geographic Arbitrage Calculator - Cost of Living Comparison',
    description: 'Compare income, taxes, and cost of living across all 50 U.S. states. Calculate wealth-building potential through geographic arbitrage.',
    keywords: [
      'geographic arbitrage calculator',
      'cost of living calculator',
      'state tax calculator',
      'relocation calculator',
      'cost of living comparison',
      'state income tax calculator',
      'moving calculator',
      'best states for taxes',
      'wealth building by location',
    ],
  },
};
