import { getArticles, getCategories } from '@/lib/wordpress/client';
import { getAllOutlooks } from '@/lib/outlook/content';

// /llms.txt — curated, machine-readable index for LLMs and AI search engines.
// Spec: https://llmstxt.org
//
// We hand-pick the highest-signal sections (calculators + recent articles)
// rather than dumping the whole sitemap. The goal is: when an AI agent fetches
// this file, it gets a clear map of what moneyguymutants.com is and what to read.

export const revalidate = 3600; // 1 hour

const BASE_URL = 'https://moneyguymutants.com';

const CALCULATORS: Array<{ name: string; slug: string; summary: string }> = [
  {
    name: 'Compound Interest Calculator',
    slug: 'compound-interest',
    summary:
      'Project investment growth over time with custom contributions, compounding frequency, and inflation adjustments.',
  },
  {
    name: 'Budget Planner',
    slug: 'budget',
    summary:
      'Allocate a household budget across categories with tension-and-flexibility analysis and AI-assisted optimization.',
  },
  {
    name: 'Retirement Strategy',
    slug: 'retirement-strategy',
    summary:
      'Plan retirement withdrawals with RMDs, Roth conversions, sequence-of-returns risk, and tax-aware drawdown.',
  },
  {
    name: 'Index Fund Visualizer',
    slug: 'index-fund-visualizer',
    summary:
      'Compare long-term outcomes across index fund allocations and contribution schedules.',
  },
  {
    name: 'Net Worth Tracker',
    slug: 'net-worth',
    summary:
      'Track assets, liabilities, liquidity, and momentum to visualize your overall financial trajectory.',
  },
  {
    name: 'Debt Paydown',
    slug: 'debt-paydown',
    summary:
      'Compare avalanche, snowball, and hybrid debt-elimination strategies with payoff timelines and opportunity cost.',
  },
  {
    name: 'Car Affordability',
    slug: 'car-affordability',
    summary:
      'Apply the 20/3/8 rule with depreciation and opportunity cost to see what car you can actually afford.',
  },
  {
    name: 'Rent vs. Buy',
    slug: 'rent-vs-buy',
    summary:
      'Compare renting and buying a home with maintenance, taxes, mobility, and opportunity cost factored in.',
  },
  {
    name: 'Geographic Arbitrage',
    slug: 'geographic-arbitrage',
    summary:
      'Compare income, taxes, and cost of living across all 50 U.S. states to model relocation outcomes.',
  },
  {
    name: 'Coast FIRE',
    slug: 'coast-fire',
    summary:
      'Find the savings target after which compound growth alone funds retirement — no further contributions required.',
  },
  {
    name: 'S-Corp Tax Optimizer',
    slug: 's-corp-optimizer',
    summary:
      'Find the salary/distribution split that maximizes self-employment tax savings for an S-Corp owner.',
  },
  {
    name: 'S-Corp Retirement Contributions',
    slug: 's-corp-investment',
    summary:
      'Maximize Solo 401(k) deferrals, profit sharing, and employer matching for S-Corp owners.',
  },
];

export async function GET() {
  let articleSection = '';
  let topicsSection = '';

  try {
    const [{ articles }, categories] = await Promise.all([
      getArticles(50),
      getCategories(),
    ]);

    if (categories.length > 0) {
      topicsSection = [
        '## Topics',
        '',
        ...categories.map(
          (c) => `- [${c.name}](${BASE_URL}/articles?category=${c.slug}): ${c.count} article${c.count === 1 ? '' : 's'}`,
        ),
        '',
      ].join('\n');
    }

    if (articles.length > 0) {
      articleSection = [
        '## Articles',
        '',
        '> The most recent long-form guides on personal finance, investing, retirement, and decision-making.',
        '',
        ...articles.map((a) => {
          const excerpt = a.excerpt.replace(/\s+/g, ' ').trim().slice(0, 200);
          return `- [${a.title}](${BASE_URL}/articles/${a.slug}): ${excerpt}`;
        }),
        '',
      ].join('\n');
    }
  } catch (error) {
    console.error('llms.txt: failed to fetch articles or categories', error);
  }

  // Recent market outlooks from local markdown. These are the freshest pages
  // on the site (published every weekday), so they lead the content sections.
  let outlookSection = '';
  try {
    const outlooks = getAllOutlooks().slice(0, 30);
    if (outlooks.length > 0) {
      outlookSection = [
        '## Market Outlook',
        '',
        '> Money Guy Mutants Research publishes a daily investment outlook every weekday morning (plus a weekly recap) covering markets, the Fed, earnings, and specific tickers and sectors. Newest first.',
        '',
        ...outlooks.map((o) => {
          const summary = o.summary.replace(/\s+/g, ' ').trim().slice(0, 200);
          return `- [${o.title}](${BASE_URL}/thinking/${o.slug}): ${o.date} — ${summary}`;
        }),
        '',
        `- [Full outlook archive](${BASE_URL}/thinking)`,
        `- [Outlook RSS feed](${BASE_URL}/thinking/rss.xml)`,
        '',
      ].join('\n');
    }
  } catch (error) {
    console.error('llms.txt: failed to load outlooks', error);
  }

  const body = [
    '# Money Guy Mutants',
    '',
    '> Money Guy Mutants builds free, interactive decision-support tools for life\'s biggest choices, starting with personal finance. We pair interactive calculators (compound interest, retirement strategy, budget, debt paydown, S-Corp tax optimization, geographic arbitrage, and more) with long-form articles that explain the reasoning behind each tool, plus a daily investment outlook from Money Guy Mutants Research.',
    '',
    'This site is operated by J Media Group LLC. Content is original, written for an English-speaking U.S. audience, and updated regularly. Calculators are free to use without an account; saving scenarios requires sign-in.',
    '',
    'Disclosure: Money Guy Mutants provides educational tools only. Nothing on this site is financial, legal, or tax advice.',
    '',
    '## Calculators',
    '',
    '> Free, interactive personal finance calculators. Each tool runs entirely in the browser; no signup required to use them.',
    '',
    ...CALCULATORS.map(
      (c) => `- [${c.name}](${BASE_URL}/apps/${c.slug}): ${c.summary}`,
    ),
    '',
    outlookSection,
    topicsSection,
    articleSection,
    '## Reference',
    '',
    `- [Sitemap](${BASE_URL}/sitemap.xml): full machine-readable index of every public URL`,
    `- [Article RSS feed](${BASE_URL}/articles/rss.xml): subscribe to new articles`,
    `- [Outlook RSS feed](${BASE_URL}/thinking/rss.xml): subscribe to the daily and weekly market outlook`,
    `- [Full content corpus](${BASE_URL}/llms-full.txt): every article and market outlook concatenated as plain text, optimized for LLM ingestion`,
    `- [About Money Guy Mutants](${BASE_URL}/about)`,
    `- [Pricing](${BASE_URL}/pricing)`,
    '',
    '## Optional',
    '',
    `- [Terms of Service](${BASE_URL}/terms)`,
    `- [Security](${BASE_URL}/security)`,
    `- [Changelog](${BASE_URL}/changelog)`,
    `- [Roadmap](${BASE_URL}/roadmap)`,
    '',
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
      'X-Robots-Tag': 'all',
    },
  });
}
