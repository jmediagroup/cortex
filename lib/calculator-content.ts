/**
 * Centralized content for all calculator pages.
 * Used for: JSON-LD structured data (FAQ, WebApplication, Breadcrumb),
 * AEO content blocks, and inter-page linking.
 */

export interface FAQ {
  question: string;
  answer: string;
}

export interface RelatedTool {
  slug: string;
  name: string;
  description: string;
}

export interface CalculatorContent {
  slug: string;
  name: string;
  shortName: string;
  description: string;
  intro: string;
  category: string;
  features: string[];
  faqs: FAQ[];
  relatedTools: string[]; // slugs referencing other calculators
}

export const CALCULATOR_CONTENT: Record<string, CalculatorContent> = {
  'compound-interest': {
    slug: 'compound-interest',
    name: 'Compound Interest Calculator',
    shortName: 'Compound Interest',
    description: 'Calculate compound interest and visualize long-term wealth growth with custom contributions.',
    intro: 'The Compound Interest Calculator helps you understand how your money grows over time through the power of compounding. Enter your initial investment, monthly contributions, expected return rate, and time horizon to see a detailed projection of your wealth accumulation. This tool visualizes the difference between your contributions and the interest earned, showing how compound growth accelerates over longer periods.',
    category: 'FinanceApplication',
    features: ['Compound growth projection', 'Monthly contribution modeling', 'Interactive growth chart', 'Contribution vs. interest breakdown'],
    faqs: [
      {
        question: 'What is compound interest?',
        answer: 'Compound interest is interest calculated on both the initial principal and the accumulated interest from previous periods. Unlike simple interest, which only earns on the original amount, compound interest allows your money to grow exponentially over time.',
      },
      {
        question: 'How often is interest typically compounded?',
        answer: 'Interest can be compounded daily, monthly, quarterly, or annually. Most savings accounts compound daily or monthly, while many investment returns are effectively compounded continuously. More frequent compounding results in slightly higher returns.',
      },
      {
        question: 'What is the Rule of 72?',
        answer: 'The Rule of 72 is a quick way to estimate how long it takes to double your money. Divide 72 by your annual return rate to get the approximate number of years. For example, at 8% annual return, your money doubles in roughly 9 years (72 / 8 = 9).',
      },
    ],
    relatedTools: ['retirement-strategy', 'index-fund-visualizer', 'net-worth'],
  },
  'budget': {
    slug: 'budget',
    name: 'Household Budget Calculator',
    shortName: 'Budget',
    description: 'Smart budget calculator with AI-powered optimization for household expense tracking and allocation.',
    intro: 'The Household Budget Calculator helps you plan and optimize your monthly spending. Enter your income and expenses across categories like housing, transportation, food, and savings to see how your budget allocates resources. The tool includes tension metrics that reveal where your budget is stretched thin and flexibility analysis to show where you have room to adjust.',
    category: 'FinanceApplication',
    features: ['AI-powered budget optimization', 'Tension metrics', 'Category allocation', 'Flexibility analysis'],
    faqs: [
      {
        question: 'What is the 50/30/20 budget rule?',
        answer: 'The 50/30/20 rule suggests allocating 50% of after-tax income to needs (housing, food, utilities), 30% to wants (entertainment, dining out), and 20% to savings and debt repayment. This calculator helps you see how your actual spending compares to this guideline.',
      },
      {
        question: 'How do I reduce my monthly expenses?',
        answer: 'Start by identifying your largest expense categories. Housing typically takes the biggest share — consider if downsizing or relocating could help. Review subscriptions, negotiate bills, and track discretionary spending. The budget optimizer highlights categories where small changes have the biggest impact.',
      },
      {
        question: 'What are budget tension metrics?',
        answer: 'Budget tension metrics measure how stretched each category is relative to recommended allocations. High tension in a category means you are spending significantly more than typical benchmarks, which may indicate financial stress in that area.',
      },
    ],
    relatedTools: ['net-worth', 'debt-paydown', 'geographic-arbitrage'],
  },
  'retirement-strategy': {
    slug: 'retirement-strategy',
    name: 'Retirement Planning Calculator',
    shortName: 'Retirement Strategy',
    description: 'Advanced retirement calculator with RMD calculations, Roth conversion planning, and sequence risk analysis.',
    intro: 'The Retirement Planning Calculator models your withdrawal strategy across multiple account types — traditional IRA, Roth IRA, 401(k), and taxable accounts. It calculates Required Minimum Distributions (RMDs), evaluates Roth conversion opportunities, and stress-tests your plan against sequence-of-returns risk. Use it to optimize when and how much to withdraw from each account to minimize lifetime taxes.',
    category: 'FinanceApplication',
    features: ['RMD calculations', 'Roth conversion planning', 'Sequence risk analysis', 'Multi-account withdrawal strategy', 'Tax optimization'],
    faqs: [
      {
        question: 'What is sequence-of-returns risk?',
        answer: 'Sequence-of-returns risk is the danger that poor investment returns early in retirement will permanently deplete your portfolio, even if average returns over the full period are acceptable. A market downturn in your first few years of withdrawal can be devastating because you are selling shares at low prices to fund living expenses.',
      },
      {
        question: 'When do Required Minimum Distributions (RMDs) start?',
        answer: 'As of 2024, RMDs from traditional IRAs and 401(k)s must begin at age 73 (increasing to 75 in 2033 under SECURE 2.0). Roth IRAs do not have RMDs during the owner\'s lifetime. Failing to take an RMD results in a 25% penalty on the amount not withdrawn.',
      },
      {
        question: 'Should I do a Roth conversion?',
        answer: 'A Roth conversion makes sense when you expect your tax rate in retirement to be higher than your current rate, or when you want to reduce future RMDs. The best time is often in low-income years between retirement and when Social Security or RMDs begin. This calculator helps you model the long-term tax impact.',
      },
    ],
    relatedTools: ['compound-interest', 's-corp-investment', 'net-worth'],
  },
  'index-fund-visualizer': {
    slug: 'index-fund-visualizer',
    name: 'Index Fund Visualizer',
    shortName: 'Index Funds',
    description: 'Visualize index fund performance and compare passive investment strategies over time.',
    intro: 'The Index Fund Visualizer lets you explore how passive index fund investments perform over different time periods. Compare major index funds, see the impact of expense ratios on long-term returns, and understand why low-cost index investing is one of the most reliable wealth-building strategies available to everyday investors.',
    category: 'FinanceApplication',
    features: ['Historical performance visualization', 'Expense ratio impact analysis', 'Fund comparison', 'Dollar-cost averaging simulation'],
    faqs: [
      {
        question: 'What is an index fund?',
        answer: 'An index fund is a type of mutual fund or ETF designed to track a specific market index, such as the S&P 500. Instead of trying to beat the market through active management, index funds aim to match market returns at very low cost. They offer broad diversification and typically have expense ratios under 0.10%.',
      },
      {
        question: 'Why do expense ratios matter?',
        answer: 'Expense ratios are annual fees charged as a percentage of your investment. Even a small difference compounds dramatically over time. A 1% higher expense ratio on a $100,000 investment over 30 years at 8% return costs you over $150,000 in lost growth.',
      },
      {
        question: 'What is dollar-cost averaging?',
        answer: 'Dollar-cost averaging means investing a fixed amount at regular intervals regardless of market conditions. When prices are low, you buy more shares; when prices are high, you buy fewer. This strategy reduces the impact of market volatility and removes the temptation to time the market.',
      },
    ],
    relatedTools: ['compound-interest', 'retirement-strategy', 'net-worth'],
  },
  'gambling-redirect': {
    slug: 'gambling-redirect',
    name: 'Gambling Opportunity Cost Calculator',
    shortName: 'Gambling Redirect',
    description: 'See the true cost of gambling by calculating what that money could grow into if invested instead.',
    intro: 'The Gambling Opportunity Cost Calculator shows you the real price of gambling by illustrating what your wagers could become if invested in the market instead. Enter your typical gambling spend, and the tool calculates the opportunity cost over 5, 10, 20, and 30-year horizons. It is not a judgment tool — it is a clarity tool that helps you make informed decisions about how you allocate discretionary income.',
    category: 'FinanceApplication',
    features: ['Opportunity cost projection', 'Multi-timeframe analysis', 'Investment comparison', 'House edge visualization'],
    faqs: [
      {
        question: 'What is opportunity cost in gambling?',
        answer: 'Opportunity cost is what you give up by choosing one option over another. When you gamble, the opportunity cost is the potential investment growth of that money. For example, $200/month in gambling over 20 years at 8% market returns represents over $118,000 in lost wealth.',
      },
      {
        question: 'What is the house edge?',
        answer: 'The house edge is the mathematical advantage the casino has on every bet. Slot machines typically have a 2-15% house edge, roulette has 5.26%, and blackjack has about 0.5% with optimal play. Over time, the house edge guarantees that gamblers lose money on average.',
      },
      {
        question: 'Is occasional gambling always bad financially?',
        answer: 'Occasional small-stakes gambling can be viewed as entertainment spending, similar to movies or concerts. The key is treating it as a fixed entertainment budget, not an income strategy. This calculator helps you understand the true cost so you can decide if that entertainment value is worth it to you.',
      },
    ],
    relatedTools: ['compound-interest', 'budget', 'net-worth'],
  },
  'car-affordability': {
    slug: 'car-affordability',
    name: 'Car Affordability Calculator',
    shortName: 'Car Affordability',
    description: 'Calculate how much car you can afford using the 20/3/8 rule with depreciation and opportunity cost analysis.',
    intro: 'The Car Affordability Calculator uses the 20/3/8 rule to determine how much car you can truly afford: 20% minimum down payment, 3-year maximum loan term, and 8% maximum of gross income on total vehicle costs. Beyond the basic calculation, it factors in depreciation curves, insurance costs, maintenance, and the opportunity cost of tying up capital in a depreciating asset.',
    category: 'FinanceApplication',
    features: ['20/3/8 rule analysis', 'Depreciation modeling', 'Opportunity cost calculation', 'Total cost of ownership breakdown'],
    faqs: [
      {
        question: 'What is the 20/3/8 rule for car buying?',
        answer: 'The 20/3/8 rule is a guideline for responsible car purchasing: put at least 20% down, finance for no more than 3 years, and keep total vehicle expenses (payment, insurance, gas, maintenance) under 8% of your gross monthly income. Following this rule helps prevent being "car poor."',
      },
      {
        question: 'How fast do cars depreciate?',
        answer: 'New cars lose roughly 20-30% of their value in the first year and about 15% per year after that. After 5 years, most cars are worth 35-40% of their original price. This is why buying a 2-3 year old used car is often the best financial decision — someone else absorbs the steepest depreciation.',
      },
      {
        question: 'Should I buy or lease a car?',
        answer: 'Buying is almost always better financially if you keep the car for 5+ years. Leasing has lower monthly payments but you build no equity and face mileage restrictions and wear penalties. Leasing only makes sense if you need a new car every 2-3 years for business reasons or if the lease includes significant tax benefits.',
      },
    ],
    relatedTools: ['budget', 'debt-paydown', 'net-worth'],
  },
  'rent-vs-buy': {
    slug: 'rent-vs-buy',
    name: 'Rent vs. Buy Calculator',
    shortName: 'Rent vs. Buy',
    description: 'Compare renting vs buying a home with opportunity cost, maintenance, taxes, and mobility factors.',
    intro: 'The Rent vs. Buy Calculator goes beyond simple monthly payment comparisons to model the true financial impact of homeownership versus renting. It accounts for property taxes, maintenance costs, opportunity cost of the down payment, mortgage interest deductions, home appreciation, and the flexibility premium of renting. The result shows your projected net worth under each scenario over your chosen time horizon.',
    category: 'FinanceApplication',
    features: ['Net worth comparison', 'Opportunity cost modeling', 'Tax impact analysis', 'Break-even timeline', 'Mobility premium calculation'],
    faqs: [
      {
        question: 'Is buying always better than renting?',
        answer: 'No. Buying makes financial sense when you plan to stay 5+ years, have a stable income, and local price-to-rent ratios are favorable. In expensive markets or when you might relocate soon, renting and investing the difference in the stock market often produces better financial outcomes.',
      },
      {
        question: 'What is the price-to-rent ratio?',
        answer: 'The price-to-rent ratio divides a home\'s purchase price by annual rent for a comparable property. A ratio under 15 generally favors buying, 15-20 is a gray area, and over 20 typically favors renting. For example, a $400,000 home with equivalent rent of $2,000/month has a ratio of 16.7 ($400,000 / $24,000).',
      },
      {
        question: 'What hidden costs does homeownership have?',
        answer: 'Beyond the mortgage, homeowners pay property taxes (1-2% of home value annually), insurance, maintenance (budget 1-2% annually), HOA fees if applicable, and closing costs (2-5% at purchase and sale). These costs often add 40-60% on top of the mortgage payment.',
      },
    ],
    relatedTools: ['budget', 'geographic-arbitrage', 'net-worth'],
  },
  'debt-paydown': {
    slug: 'debt-paydown',
    name: 'Debt Payoff Calculator',
    shortName: 'Debt Paydown',
    description: 'Compare debt paydown strategies: avalanche, snowball, and hybrid methods with psychological weighting.',
    intro: 'The Debt Payoff Calculator compares three strategies for eliminating debt: the avalanche method (highest interest first), the snowball method (smallest balance first), and a hybrid approach that balances mathematical optimization with psychological motivation. Enter all your debts with their balances, interest rates, and minimum payments to see a payoff timeline and total interest cost for each strategy.',
    category: 'FinanceApplication',
    features: ['Avalanche vs. snowball comparison', 'Hybrid strategy', 'Payoff timeline visualization', 'Interest savings calculation', 'Psychological weighting'],
    faqs: [
      {
        question: 'What is the debt avalanche method?',
        answer: 'The debt avalanche method prioritizes paying off debts with the highest interest rate first while making minimum payments on all others. This approach minimizes total interest paid and is mathematically optimal, but it may take longer to fully pay off the first debt, which can reduce motivation.',
      },
      {
        question: 'What is the debt snowball method?',
        answer: 'The debt snowball method prioritizes paying off the smallest balance first regardless of interest rate. When a small debt is paid off, its payment rolls into the next smallest debt, creating momentum. While it costs more in total interest, research shows people are more likely to stick with this approach due to the psychological wins of eliminating debts quickly.',
      },
      {
        question: 'Should I pay off debt or invest?',
        answer: 'As a general rule, pay off debt with interest rates above 6-7% before investing (except for employer 401(k) matching, which you should always capture). For debt below 4-5%, investing may be better since long-term market returns historically exceed 8%. The 4-7% range is a personal decision based on your risk tolerance.',
      },
    ],
    relatedTools: ['budget', 'compound-interest', 'net-worth'],
  },
  'geographic-arbitrage': {
    slug: 'geographic-arbitrage',
    name: 'Geographic Arbitrage Calculator',
    shortName: 'Geographic Arbitrage',
    description: 'Compare income, taxes, and cost of living across all 50 U.S. states to find wealth-building opportunities.',
    intro: 'The Geographic Arbitrage Calculator helps you evaluate the financial impact of relocating across U.S. states. It compares state income taxes, cost of living adjustments, and purchasing power to show how the same income and lifestyle can produce dramatically different wealth outcomes depending on where you live. Use it to find states where your money stretches furthest.',
    category: 'FinanceApplication',
    features: ['50-state comparison', 'Tax impact analysis', 'Cost of living adjustment', 'Wealth-building projection', 'Purchasing power comparison'],
    faqs: [
      {
        question: 'What is geographic arbitrage?',
        answer: 'Geographic arbitrage means earning income at rates typical of one location while spending at the cost of living of a cheaper location. For example, earning a San Francisco salary while living in a lower-cost state, or working remotely from an area with no state income tax. It is one of the most powerful wealth-building strategies available.',
      },
      {
        question: 'Which states have no income tax?',
        answer: 'Nine states have no state income tax: Alaska, Florida, Nevada, New Hampshire (dividends and interest only until 2027), South Dakota, Tennessee, Texas, Washington, and Wyoming. However, no-income-tax states may compensate with higher property taxes, sales taxes, or fees.',
      },
      {
        question: 'How much can I save by relocating?',
        answer: 'The savings depend on your income and the cost of living difference. A household earning $150,000 moving from California (13.3% top state tax rate) to Texas (0% income tax) could save $10,000-15,000 per year in state taxes alone, before factoring in lower housing and living costs.',
      },
    ],
    relatedTools: ['budget', 'rent-vs-buy', 'retirement-strategy'],
  },
  'net-worth': {
    slug: 'net-worth',
    name: 'Net Worth Calculator',
    shortName: 'Net Worth',
    description: 'Track your net worth, assets, and liabilities with liquidity analysis and momentum tracking.',
    intro: 'The Net Worth Calculator gives you a clear picture of your financial health by tallying your assets (cash, investments, property, retirement accounts) against your liabilities (mortgages, loans, credit cards). Beyond the headline number, it analyzes your liquidity ratio, asset diversification, and net worth momentum to help you understand not just where you are, but how fast you are moving toward your financial goals.',
    category: 'FinanceApplication',
    features: ['Asset and liability tracking', 'Liquidity analysis', 'Momentum tracking', 'Diversification breakdown', 'Trend visualization'],
    faqs: [
      {
        question: 'What is net worth?',
        answer: 'Net worth is the total value of everything you own (assets) minus everything you owe (liabilities). Assets include cash, investments, retirement accounts, real estate equity, and valuable personal property. Liabilities include mortgages, student loans, car loans, credit card debt, and any other obligations.',
      },
      {
        question: 'What is a good net worth by age?',
        answer: 'A common benchmark is that your net worth should equal your annual salary by age 30, three times by 40, and six times by 50. The median net worth in the U.S. is about $193,000 for all ages, but this varies dramatically by age group. More important than comparing to others is tracking your own trajectory over time.',
      },
      {
        question: 'How often should I calculate my net worth?',
        answer: 'Tracking net worth monthly or quarterly provides the best balance between staying informed and not obsessing over short-term market fluctuations. The most important thing is consistency — picking a regular interval and sticking with it so you can identify trends.',
      },
    ],
    relatedTools: ['budget', 'compound-interest', 'retirement-strategy'],
  },
  's-corp-optimizer': {
    slug: 's-corp-optimizer',
    name: 'S-Corp Tax Savings Calculator',
    shortName: 'S-Corp Optimizer',
    description: 'Calculate S-Corp tax savings and find your ideal salary/distribution split to minimize self-employment tax.',
    intro: 'The S-Corp Tax Savings Calculator helps self-employed individuals and small business owners estimate how much they could save by electing S-Corporation status. It models the optimal split between salary (subject to payroll taxes) and distributions (not subject to self-employment tax) while keeping the salary at a "reasonable compensation" level that the IRS would accept.',
    category: 'FinanceApplication',
    features: ['Salary vs. distribution optimization', 'Self-employment tax savings', 'Reasonable compensation analysis', 'Net tax comparison'],
    faqs: [
      {
        question: 'How does an S-Corp save on taxes?',
        answer: 'As a sole proprietor or LLC, all business profit is subject to 15.3% self-employment tax (Social Security + Medicare). With an S-Corp election, only your salary is subject to payroll taxes — the remaining profit taken as distributions avoids self-employment tax. On $150,000 in profit, this can save $10,000-20,000 annually.',
      },
      {
        question: 'What is "reasonable compensation" for an S-Corp?',
        answer: 'The IRS requires S-Corp owners who perform services to pay themselves a "reasonable" salary before taking distributions. This is based on what someone in a similar role, industry, and location would earn. Setting salary too low triggers IRS scrutiny. A common benchmark is 40-60% of total business income.',
      },
      {
        question: 'When does S-Corp status make financial sense?',
        answer: 'S-Corp election typically makes sense when your business consistently earns $50,000+ in profit after reasonable compensation. Below that threshold, the additional accounting costs, payroll processing fees, and tax filing complexity may outweigh the tax savings.',
      },
    ],
    relatedTools: ['s-corp-investment', 'budget', 'retirement-strategy'],
  },
  's-corp-investment': {
    slug: 's-corp-investment',
    name: 'S-Corp Retirement Contribution Calculator',
    shortName: 'S-Corp Retirement',
    description: 'Maximize retirement savings through S-Corp contributions including employee deferrals and profit sharing.',
    intro: 'The S-Corp Retirement Contribution Calculator helps S-Corp owners maximize their tax-advantaged retirement savings. It models employee deferrals (up to $23,000 in 2024, plus $7,500 catch-up for 50+), employer profit-sharing contributions (up to 25% of W-2 salary), and the combined limits under IRS Section 415. This tool is essential for S-Corp owners who want to shelter the maximum amount from taxes while building retirement wealth.',
    category: 'FinanceApplication',
    features: ['401(k) deferral calculation', 'Profit sharing optimization', 'Catch-up contribution modeling', 'IRS Section 415 limit tracking'],
    faqs: [
      {
        question: 'How much can an S-Corp owner contribute to a 401(k)?',
        answer: 'For 2024, an S-Corp owner can contribute up to $23,000 as an employee deferral ($30,500 if age 50+) plus up to 25% of W-2 salary as an employer profit-sharing contribution. The total combined limit is $69,000 ($76,500 with catch-up). This means an S-Corp owner with a $140,000 salary could contribute up to $58,000.',
      },
      {
        question: 'What is employer profit sharing in an S-Corp?',
        answer: 'Employer profit sharing allows the S-Corp to contribute up to 25% of an employee\'s W-2 compensation to their retirement plan. For an owner paying themselves a $120,000 salary, the company can contribute an additional $30,000 to their 401(k). This is a deductible business expense that reduces corporate taxes.',
      },
      {
        question: 'Should I choose a Solo 401(k) or SEP IRA for my S-Corp?',
        answer: 'A Solo 401(k) is generally better for S-Corp owners because it allows both employee deferrals and employer contributions, enabling higher total contributions at lower salary levels. A SEP IRA only allows employer contributions (up to 25% of salary), so you need a higher salary to reach the same contribution level.',
      },
    ],
    relatedTools: ['s-corp-optimizer', 'retirement-strategy', 'compound-interest'],
  },
  'coast-fire': {
    slug: 'coast-fire',
    name: 'Coast FIRE Calculator',
    shortName: 'Coast FIRE',
    description: 'Calculate when you can stop saving for retirement and let compound growth do the rest.',
    intro: 'The Coast FIRE Calculator determines the point at which your existing retirement savings, growing through compound interest alone, will be sufficient to fund your retirement without any additional contributions. Once you reach your "Coast FIRE" number, you only need to earn enough to cover current expenses — you no longer need to save for retirement, giving you the freedom to take lower-paying but more fulfilling work.',
    category: 'FinanceApplication',
    features: ['Coast FIRE number calculation', 'Target age modeling', 'Growth projection', 'Savings milestone tracking'],
    faqs: [
      {
        question: 'What is Coast FIRE?',
        answer: 'Coast FIRE (Financial Independence, Retire Early) is the point where you have enough invested that compound growth alone will fund your retirement by a target age — even if you never save another dollar. It does not mean you can stop working, but you no longer need to save, which dramatically reduces income requirements.',
      },
      {
        question: 'How is Coast FIRE different from regular FIRE?',
        answer: 'Regular FIRE means having enough saved to cover all living expenses indefinitely (typically 25x annual expenses). Coast FIRE is an earlier milestone — you still need income for current expenses, but not for retirement savings. It is often reachable 10-15 years before full FIRE.',
      },
      {
        question: 'What return rate should I assume for Coast FIRE?',
        answer: 'Most Coast FIRE calculations use 7% real (inflation-adjusted) return, which reflects the historical average for a diversified stock portfolio. Use 5-6% for a more conservative estimate, especially if you have a shorter time horizon or bond-heavy allocation.',
      },
    ],
    relatedTools: ['retirement-strategy', 'compound-interest', 'net-worth'],
  },
  'capital-gains-tax': {
    slug: 'capital-gains-tax',
    name: 'Capital Gains Tax Calculator',
    shortName: 'Capital Gains Tax',
    description: 'Estimate the 2026 tax on a stock sale and see how much you can realize before each tax cliff.',
    intro: 'The Capital Gains Tax Calculator answers a single question: if you sell this much stock, what actually happens? It models the full 2026 picture — the 0%, 15%, and 20% long-term capital-gains brackets, the 3.8% Net Investment Income Tax, the §199A QBI deduction, the ACA premium-tax-credit cliff, Medicare IRMAA tiers, and Virginia state tax — then shows how much of a gain fits under each threshold. Long-term gains stack on top of your ordinary income, so the room left in the 0% bracket depends on everything else you earn. Use the slider to find the largest gain you can take before the next dollar gets more expensive.',
    category: 'FinanceApplication',
    features: ['0/15/20% long-term bracket ladder', '0%-bracket headroom calculator', 'NIIT, ACA, and IRMAA cliff detection', 'Next-dollar marginal rate', 'Federal + Virginia tax breakdown'],
    faqs: [
      {
        question: 'What is the difference between long-term and short-term capital gains?',
        answer: 'Long-term capital gains apply to assets held more than one year and are taxed at preferential rates of 0%, 15%, or 20% depending on your taxable income. Short-term gains (assets held one year or less) are taxed as ordinary income at rates up to 37%, making them far less efficient.',
      },
      {
        question: 'How does the 0% capital gains bracket work?',
        answer: 'Long-term gains stack on top of your ordinary income. If your total taxable income (ordinary income plus gains) stays under the 0% breakpoint — $49,450 for single filers and $98,900 for married-filing-jointly in 2026 — those gains are taxed at 0% federally. The calculator shows exactly how much room you have left in that bracket.',
      },
      {
        question: 'What tax cliffs should I watch when selling stock?',
        answer: 'Beyond the 0→15→20% bracket steps, a large gain can trigger the 3.8% Net Investment Income Tax (above $200k/$250k MAGI), bump your Medicare IRMAA tier (raising premiums two years later), or push you over the 400% federal-poverty ACA subsidy cliff — which forfeits the entire premium tax credit. The tool flags the headroom before each one.',
      },
      {
        question: 'How are capital gains taxed in Virginia?',
        answer: 'Virginia has no preferential capital-gains rate — all gains are taxed as ordinary income at rates up to 5.75%. So even a gain that is federally tax-free in the 0% bracket still owes Virginia tax. The calculator includes Virginia state tax in every total.',
      },
    ],
    relatedTools: ['s-corp-optimizer', 'retirement-strategy', 'net-worth'],
  },
};

/**
 * Get related tool details from slugs
 */
export function getRelatedTools(slug: string): RelatedTool[] {
  const content = CALCULATOR_CONTENT[slug];
  if (!content) return [];

  return content.relatedTools
    .map((relatedSlug) => {
      const related = CALCULATOR_CONTENT[relatedSlug];
      if (!related) return null;
      return {
        slug: related.slug,
        name: related.name,
        description: related.description,
      };
    })
    .filter((tool): tool is RelatedTool => tool !== null);
}

/**
 * Generate JSON-LD structured data for a calculator page
 */
export function generateCalculatorJsonLd(slug: string) {
  const content = CALCULATOR_CONTENT[slug];
  if (!content) return null;

  const baseUrl = 'https://moneyguymutants.com';

  return {
    '@context': 'https://schema.org',
    '@graph': [
      // BreadcrumbList
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: baseUrl,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Financial Tools',
            item: `${baseUrl}/apps`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: content.name,
            item: `${baseUrl}/apps/${slug}`,
          },
        ],
      },
      // WebApplication
      {
        '@type': 'WebApplication',
        '@id': `${baseUrl}/apps/${slug}#application`,
        name: content.name,
        description: content.description,
        url: `${baseUrl}/apps/${slug}`,
        applicationCategory: content.category,
        operatingSystem: 'Web',
        browserRequirements: 'Requires JavaScript',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        featureList: content.features,
        author: {
          '@id': `${baseUrl}/#organization`,
        },
      },
      // FAQPage
      {
        '@type': 'FAQPage',
        mainEntity: content.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
    ],
  };
}
