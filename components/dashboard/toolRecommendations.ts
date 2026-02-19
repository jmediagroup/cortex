export interface ToolInfo {
  slug: string;
  name: string;
  description: string;
}

export const toolDirectory: Record<string, ToolInfo> = {
  'coast-fire': {
    slug: 'coast-fire',
    name: 'Coast FIRE Calculator',
    description: 'Find out if your savings can grow to retirement on their own',
  },
  'car-affordability': {
    slug: 'car-affordability',
    name: 'Car Affordability',
    description: 'See what car payment fits your actual budget',
  },
  'compound-interest': {
    slug: 'compound-interest',
    name: 'Compound Interest',
    description: 'Watch your money grow with the power of compounding',
  },
  'debt-paydown': {
    slug: 'debt-paydown',
    name: 'Debt Paydown Optimizer',
    description: 'Find the fastest, cheapest path to becoming debt-free',
  },
  'gambling-redirect': {
    slug: 'gambling-redirect',
    name: 'Gambling Redirect',
    description: 'See what investing your gambling budget would return instead',
  },
  'geographic-arbitrage': {
    slug: 'geographic-arbitrage',
    name: 'Geographic Arbitrage',
    description: 'Calculate how much you could save by moving cities',
  },
  'index-fund-visualizer': {
    slug: 'index-fund-visualizer',
    name: 'Index Fund Visualizer',
    description: 'Compare index fund strategies and projected returns',
  },
  'net-worth': {
    slug: 'net-worth',
    name: 'Net Worth Engine',
    description: 'Track and project your total financial picture',
  },
  'rent-vs-buy': {
    slug: 'rent-vs-buy',
    name: 'Rent vs. Buy',
    description: 'Run the real numbers on renting versus buying a home',
  },
  'retirement-strategy': {
    slug: 'retirement-strategy',
    name: 'Retirement Strategy',
    description: 'Build a complete retirement savings roadmap',
  },
  's-corp-investment': {
    slug: 's-corp-investment',
    name: 'S-Corp Investment',
    description: 'Model S-Corp investment returns vs. other structures',
  },
  's-corp-optimizer': {
    slug: 's-corp-optimizer',
    name: 'S-Corp Optimizer',
    description: 'Find your optimal S-Corp salary and distribution split',
  },
};

export const toolRelationships: Record<string, string[]> = {
  'coast-fire': ['compound-interest', 'retirement-strategy', 'index-fund-visualizer'],
  'car-affordability': ['rent-vs-buy', 'debt-paydown', 'net-worth'],
  'compound-interest': ['coast-fire', 'retirement-strategy', 'index-fund-visualizer'],
  'debt-paydown': ['net-worth', 'compound-interest', 'gambling-redirect'],
  'gambling-redirect': ['debt-paydown', 'compound-interest', 'net-worth'],
  'geographic-arbitrage': ['rent-vs-buy', 'coast-fire', 'retirement-strategy'],
  'index-fund-visualizer': ['compound-interest', 'coast-fire', 'retirement-strategy'],
  'net-worth': ['debt-paydown', 'rent-vs-buy', 's-corp-investment'],
  'rent-vs-buy': ['geographic-arbitrage', 'car-affordability', 'net-worth'],
  'retirement-strategy': ['coast-fire', 'compound-interest', 'index-fund-visualizer'],
  's-corp-investment': ['s-corp-optimizer', 'net-worth', 'retirement-strategy'],
  's-corp-optimizer': ['s-corp-investment', 'net-worth', 'retirement-strategy'],
};

export function getRecommendedTools(context: string): ToolInfo[] {
  const slugs = toolRelationships[context] || [];
  return slugs
    .map((slug) => toolDirectory[slug])
    .filter((tool): tool is ToolInfo => !!tool);
}
