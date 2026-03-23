import type { OnboardingAnswers } from '@/lib/supabase/client';

// App IDs that map to the APPS array in AppLibrary
const APP_IDS = {
  CAR: 'car-affordability',
  COMPOUND: 'compound-interest',
  INDEX_FUND: 'index-fund-visualizer',
  SCORP: 's-corp-optimizer',
  SCORP_INV: 's-corp-investment',
  RETIREMENT: 'retirement-strategy',
  COAST_FIRE: 'coast-fire',
  RENT_VS_BUY: 'rent-vs-buy',
  DEBT: 'debt-paydown',
  GEO_ARB: 'geographic-arbitrage',
  NET_WORTH: 'net-worth',
  BUDGET: 'budget',
  GAMBLING: 'gambling-redirect',
} as const;

type AppId = (typeof APP_IDS)[keyof typeof APP_IDS];

// Each rule adds score weight to specific apps
interface ScoringRule {
  match: (answers: OnboardingAnswers) => boolean;
  scores: Partial<Record<AppId, number>>;
}

const SCORING_RULES: ScoringRule[] = [
  // === describes_you rules ===
  {
    match: (a) => a.describes_you === 'Business owner',
    scores: {
      [APP_IDS.SCORP]: 10,
      [APP_IDS.SCORP_INV]: 9,
      [APP_IDS.NET_WORTH]: 5,
      [APP_IDS.BUDGET]: 4,
    },
  },
  {
    match: (a) => a.describes_you === 'Self-employed',
    scores: {
      [APP_IDS.SCORP]: 8,
      [APP_IDS.SCORP_INV]: 7,
      [APP_IDS.BUDGET]: 5,
      [APP_IDS.NET_WORTH]: 4,
    },
  },
  {
    match: (a) => a.describes_you === 'Employee',
    scores: {
      [APP_IDS.BUDGET]: 6,
      [APP_IDS.COMPOUND]: 5,
      [APP_IDS.NET_WORTH]: 4,
      [APP_IDS.INDEX_FUND]: 3,
    },
  },
  {
    match: (a) => a.describes_you === 'Student',
    scores: {
      [APP_IDS.BUDGET]: 8,
      [APP_IDS.COMPOUND]: 6,
      [APP_IDS.DEBT]: 5,
      [APP_IDS.GAMBLING]: 3,
    },
  },
  {
    match: (a) => a.describes_you === 'Retired',
    scores: {
      [APP_IDS.RETIREMENT]: 10,
      [APP_IDS.NET_WORTH]: 6,
      [APP_IDS.BUDGET]: 5,
      [APP_IDS.INDEX_FUND]: 4,
    },
  },

  // === financial_focus rules ===
  {
    match: (a) => a.financial_focus === 'Building wealth',
    scores: {
      [APP_IDS.COMPOUND]: 10,
      [APP_IDS.INDEX_FUND]: 8,
      [APP_IDS.NET_WORTH]: 6,
      [APP_IDS.COAST_FIRE]: 5,
    },
  },
  {
    match: (a) => a.financial_focus === 'Getting out of debt',
    scores: {
      [APP_IDS.DEBT]: 10,
      [APP_IDS.BUDGET]: 8,
      [APP_IDS.NET_WORTH]: 4,
      [APP_IDS.GAMBLING]: 3,
    },
  },
  {
    match: (a) => a.financial_focus === 'Planning retirement',
    scores: {
      [APP_IDS.RETIREMENT]: 10,
      [APP_IDS.COAST_FIRE]: 9,
      [APP_IDS.COMPOUND]: 5,
      [APP_IDS.INDEX_FUND]: 4,
    },
  },
  {
    match: (a) => a.financial_focus === 'Buying vs renting',
    scores: {
      [APP_IDS.RENT_VS_BUY]: 10,
      [APP_IDS.BUDGET]: 5,
      [APP_IDS.NET_WORTH]: 4,
      [APP_IDS.GEO_ARB]: 3,
    },
  },
  {
    match: (a) => a.financial_focus === 'Optimizing taxes',
    scores: {
      [APP_IDS.SCORP]: 10,
      [APP_IDS.SCORP_INV]: 9,
      [APP_IDS.GEO_ARB]: 5,
      [APP_IDS.NET_WORTH]: 3,
    },
  },

  // === investing_status rules ===
  {
    match: (a) => a.investing_status === 'Yes actively',
    scores: {
      [APP_IDS.INDEX_FUND]: 6,
      [APP_IDS.NET_WORTH]: 5,
      [APP_IDS.COAST_FIRE]: 4,
      [APP_IDS.SCORP_INV]: 3,
    },
  },
  {
    match: (a) => a.investing_status === 'Just starting',
    scores: {
      [APP_IDS.COMPOUND]: 7,
      [APP_IDS.INDEX_FUND]: 6,
      [APP_IDS.BUDGET]: 4,
      [APP_IDS.GAMBLING]: 3,
    },
  },
  {
    match: (a) => a.investing_status === 'Not yet',
    scores: {
      [APP_IDS.COMPOUND]: 8,
      [APP_IDS.BUDGET]: 7,
      [APP_IDS.DEBT]: 4,
      [APP_IDS.GAMBLING]: 5,
    },
  },

  // === own_or_rent rules ===
  {
    match: (a) => a.own_or_rent === 'Rent',
    scores: {
      [APP_IDS.RENT_VS_BUY]: 6,
      [APP_IDS.GEO_ARB]: 4,
    },
  },
  {
    match: (a) => a.own_or_rent === 'Looking to buy',
    scores: {
      [APP_IDS.RENT_VS_BUY]: 8,
      [APP_IDS.BUDGET]: 4,
      [APP_IDS.NET_WORTH]: 3,
      [APP_IDS.CAR]: 2,
    },
  },
  {
    match: (a) => a.own_or_rent === 'Own',
    scores: {
      [APP_IDS.NET_WORTH]: 4,
      [APP_IDS.BUDGET]: 3,
    },
  },

  // === tool_familiarity rules ===
  {
    match: (a) => a.tool_familiarity === 'Total beginner',
    scores: {
      [APP_IDS.BUDGET]: 6,
      [APP_IDS.COMPOUND]: 5,
      [APP_IDS.NET_WORTH]: 4,
    },
  },
  {
    match: (a) => a.tool_familiarity === 'Some experience',
    scores: {
      [APP_IDS.INDEX_FUND]: 3,
      [APP_IDS.COAST_FIRE]: 2,
    },
  },
  {
    match: (a) => a.tool_familiarity === 'Pretty savvy',
    scores: {
      [APP_IDS.SCORP]: 3,
      [APP_IDS.GEO_ARB]: 3,
      [APP_IDS.RETIREMENT]: 2,
    },
  },

  // === Combo bonuses ===
  {
    match: (a) =>
      a.describes_you === 'Business owner' && a.financial_focus === 'Optimizing taxes',
    scores: {
      [APP_IDS.SCORP]: 5,
      [APP_IDS.SCORP_INV]: 5,
    },
  },
  {
    match: (a) =>
      a.tool_familiarity === 'Total beginner' && a.financial_focus === 'Building wealth',
    scores: {
      [APP_IDS.COMPOUND]: 5,
      [APP_IDS.BUDGET]: 4,
    },
  },
  {
    match: (a) =>
      a.financial_focus === 'Planning retirement' &&
      (a.describes_you === 'Retired' || a.describes_you === 'Employee'),
    scores: {
      [APP_IDS.COAST_FIRE]: 4,
      [APP_IDS.RETIREMENT]: 4,
    },
  },
];

/**
 * Score all apps based on onboarding answers and return ordered app IDs.
 */
export function getRecommendedAppOrder(answers: OnboardingAnswers): string[] {
  const scores: Record<string, number> = {};

  // Initialize all app scores to 0
  for (const id of Object.values(APP_IDS)) {
    scores[id] = 0;
  }

  // Apply all matching rules
  for (const rule of SCORING_RULES) {
    if (rule.match(answers)) {
      for (const [appId, score] of Object.entries(rule.scores)) {
        scores[appId] = (scores[appId] || 0) + score;
      }
    }
  }

  // Sort by score descending, then preserve original order for ties
  const allAppIds = Object.values(APP_IDS);
  return [...allAppIds].sort((a, b) => {
    const scoreDiff = scores[b] - scores[a];
    if (scoreDiff !== 0) return scoreDiff;
    return allAppIds.indexOf(a) - allAppIds.indexOf(b);
  });
}

/**
 * Get the top recommended app for the CTA.
 */
export function getTopRecommendedApp(answers: OnboardingAnswers): {
  id: string;
  name: string;
} {
  const ordered = getRecommendedAppOrder(answers);
  const topId = ordered[0];

  const APP_NAMES: Record<string, string> = {
    'car-affordability': 'Car Affordability',
    'compound-interest': 'Compound Interest Calculator',
    'index-fund-visualizer': 'Index Fund Growth Visualizer',
    's-corp-optimizer': 'S-Corp Optimizer',
    's-corp-investment': 'S-Corp Investment Optimizer',
    'retirement-strategy': 'Retirement Strategy Engine',
    'coast-fire': 'Coast FIRE Calculator',
    'rent-vs-buy': 'Rent vs Buy Reality Engine',
    'debt-paydown': 'Debt Paydown Strategy Optimizer',
    'geographic-arbitrage': 'Geographic Arbitrage Calculator',
    'net-worth': 'Net Worth Engine',
    'budget': 'Household Budgeting System',
    'gambling-redirect': 'Gambling Spend Redirect',
  };

  return { id: topId, name: APP_NAMES[topId] || topId };
}
