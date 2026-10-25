/**
 * Centralized content for all calculator pages.
 * Used for: page metadata (toolMetadata), JSON-LD structured data (FAQ,
 * WebApplication, Breadcrumb), the server-rendered explainer under each tool,
 * the sitemap, llms.txt / llms-full.txt, and inter-page linking.
 *
 * Copy rules (docs/monetization/phase-5/TARGET-QUERIES.md):
 *  - Every claim must be true of the FREE tool, or say what is Pro.
 *  - `seo.title` is the full <title> (≤ 60 chars) and never carries the site
 *    name: these pages compete on the calculator query, not the brand.
 *  - Illustrative numbers come from the tool's own formula and defaults and
 *    are labelled as illustrations, not forecasts.
 *  - Section headings are sentence case and end with a period (site voice).
 */
import type { Metadata } from 'next';

export interface FAQ {
  question: string;
  answer: string;
}

export interface RelatedTool {
  slug: string;
  name: string;
  description: string;
}

export interface ContentTable {
  /** One line saying what the table shows. */
  caption: string;
  columns: string[];
  rows: string[][];
  /** Assumptions, and that it is an illustration rather than a forecast. */
  note?: string;
}

export interface ContentSection {
  /** Sentence-case H2. */
  heading: string;
  /** One or more paragraphs of plain text (no markup). */
  paragraphs: string[];
  /** Optional bullet list rendered after the paragraphs. */
  bullets?: string[];
  /** Optional table rendered after the bullets. */
  table?: ContentTable;
}

export interface ToolSeo {
  /** Full <title>, ≤ 60 characters, no site-name suffix. */
  title: string;
  /** Meta description, ≤ 155 characters. */
  description: string;
  /** On-intent query variants. */
  keywords: string[];
}

export interface GuideLink {
  /** Full guide slug, i.e. the filename under content/guides without `.md`. */
  slug: string;
  /** Anchor text. */
  label: string;
}

export interface CalculatorContent {
  slug: string;
  name: string;
  shortName: string;
  description: string;
  intro: string;
  category: string;
  features: string[];
  seo: ToolSeo;
  /** Long-form explainer rendered under the tool (may be empty). */
  sections: ContentSection[];
  faqs: FAQ[];
  /** Guides that go deeper on the tool's topic. */
  guides: GuideLink[];
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
    features: [
      'Compound growth projection',
      'Monthly contribution modeling',
      'Interactive growth chart',
      'Contribution vs. interest breakdown',
    ],
    seo: {
      title: 'Compound Interest Calculator With Monthly Contributions',
      description: 'See what a starting balance plus monthly contributions could grow to at a rate you choose, split into what you put in and what compounding added.',
      keywords: [
        'compound interest calculator with monthly contributions',
        'compound interest calculator',
        'monthly compound interest calculator',
        'how much will i have if i invest monthly',
        'investment growth calculator',
        'rule of 72',
      ],
    },
    sections: [
      {
        heading: 'How this compound interest calculator works.',
        paragraphs: [
          'A compound interest calculator answers one question: if I keep adding money and let the returns stay invested, what do I end up with? This one compounds monthly, which matches how most brokerage and savings balances actually grow, and it adds each monthly contribution at the end of the month, after that month’s growth.',
          'The formula behind it is the standard future-value equation. Your starting balance grows by (1 + rate ÷ 12) every month, and every contribution starts its own compounding clock the month after it lands. The chart splits the total into two stacked pieces — what you put in, and what the market added — so the effect of time is visible rather than implied.',
        ],
      },
      {
        heading: 'Why the timeline matters more than the rate.',
        paragraphs: [
          'People fixate on squeezing an extra percent of return. Time does far more. $500 a month at 7% is about $158,000 after 15 years, about $610,000 after 30 years, and about $1.3 million after 40. The last ten years added more than the first thirty combined. That is not a trick of the math; it is the math.',
          'The practical takeaway is that starting is worth more than optimizing. A 25-year-old investing $300 a month generally ends up with more at 65 than a 35-year-old investing $600 a month, at the same 7% return (below about 6%, the order flips). Use the timeline slider to test that for your own numbers.',
        ],
      },
      {
        heading: 'What return rate should you use?',
        paragraphs: [
          'For a diversified stock index fund, planners commonly model 7% real (after inflation) or roughly 10% nominal, based on long-run U.S. market history. Neither is a promise. For a high-yield savings account, use the rate the bank quotes today and remember it will move with the Fed. For a mixed portfolio, 5–6% is a sober middle.',
          'Run the calculator at two or three rates rather than one. If your plan only works at 10%, it is not a plan. If it works at 5%, anything better is upside.',
        ],
        bullets: [
          'Conservative: 4–5% (bonds, CDs, balanced funds)',
          'Moderate: 6–7% (broad index funds, after inflation)',
          'Aggressive: 8–10% (all-stock, nominal, long horizons only)',
        ],
      },
    ],
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
      {
        question: 'Does this calculator include monthly contributions?',
        answer: 'Yes. Set a monthly contribution and the calculator adds it at the end of every month, so each deposit starts compounding the following month. Set it to zero to model a single lump sum.',
      },
      {
        question: 'Is the result adjusted for inflation?',
        answer: 'The number shown is in nominal dollars at whatever rate you enter. To see purchasing power in today’s dollars, use a real return instead — subtract expected inflation (historically about 3%) from your nominal rate.',
      },
      {
        question: 'How is compound interest different from simple interest?',
        answer: 'Simple interest only pays on your original deposit. Compound interest pays on the deposit plus everything it has already earned, so growth accelerates. Over one year the difference is small; over thirty years it is most of the money.',
      },
      {
        question: 'Does compounding daily instead of monthly change much?',
        answer: 'Very little. At 7%, daily compounding yields about 7.25% effective; monthly yields about 7.23%. The gap is a rounding error next to the effect of one more year of contributions.',
      },
      {
        question: 'Can I save my numbers?',
        answer: 'Yes. Create a free account and the Save button stores the scenario so you can come back, tweak it, and compare versions side by side.',
      },
    ],
    guides: [
      { slug: '2026-08-23-index-fund-investing-for-beginners', label: 'Index fund investing for beginners' },
      { slug: '2026-08-16-401k-guide', label: 'How a 401(k) works' },
      { slug: '2026-10-18-2027-contribution-limits', label: '2027 contribution limits: what is official so far' },
    ],
    relatedTools: ['retirement-strategy', 'index-fund-visualizer', 'net-worth'],
  },
  'budget': {
    slug: 'budget',
    name: 'Monthly Budget Calculator',
    shortName: 'Budget',
    description: 'Estimates take-home pay from gross income and splits it across fixed, flexible and future categories to show unallocated dollars, a flexibility index and a tension score; Auto-Optimize is Pro.',
    intro: 'This monthly budget calculator starts from your gross monthly income, estimates take-home pay with a flat tax rate you choose, and lets you assign that money across 11 categories in three groups: fixed commitments, flexible living and future commitments. It shows how much you have allocated, what is left unallocated or how far over you are, a flexibility index and a budget tension score, in monthly or annual terms. Every result comes from simple arithmetic and fixed rules, not AI, so you can check it by hand.',
    category: 'FinanceApplication',
    features: [
      'Take-home estimate from gross monthly income at a 22%, 26% or 32% flat rate',
      '11 categories across Fixed Commitments, Flexible Living and Future Commitments',
      'Unallocated remainder, or the amount you are over, updated as you type',
      'Flexibility index and budget tension score',
      'Monthly or annualized view for irregular expenses',
      'Auto-Optimize: rule-based rebalancing toward slack, savings or stability (Pro)',
    ],
    seo: {
      title: 'Monthly Budget Calculator: Plan Every Dollar by Category',
      description: 'Turn gross monthly pay into a take-home estimate, split it across 11 budget categories, and see what is left unallocated and how much goes to fixed costs.',
      keywords: [
        'monthly budget calculator',
        'budget calculator based on income',
        'household budget calculator',
        'zero based budget calculator',
        'budget by category calculator',
        'how much to spend on each budget category',
      ],
    },
    sections: [
      {
        heading: 'How the monthly budget calculator estimates take-home pay.',
        paragraphs: [
          'Take-home is gross monthly income minus one flat rate meant to cover federal and state income tax plus Social Security and Medicare payroll taxes. You choose Optimistic (22%), Baseline (26%) or Conservative (32%). On the default $8,000 a month, that gives $6,240, $5,920 or $5,440.',
          'These are the tool\'s preset rates, not figures from any tax year\'s brackets. No deductions, credits, retirement contributions or benefit premiums are modeled, so compare the result with a recent pay stub and pick the rate that lands closest.',
        ],
      },
      {
        heading: 'How much to spend on each budget category.',
        paragraphs: [
          'The calculator does not set a target for any category, and its starting amounts are placeholders, not recommendations. What it measures is how much of take-home goes to fixed commitments and how much is left unassigned.',
          'One widely cited published guideline is the 50/30/20 rule, popularized by Elizabeth Warren and Amelia Warren Tyagi in their 2005 book All Your Worth: 50% of after-tax pay to needs, 30% to wants, and 20% to savings and extra debt payments. The tool\'s groups do not map onto it exactly. Groceries and transportation sit under Flexible Living but are often needs, and Debt Payments mixes minimum payments (a need) with any extra (savings).',
          'To compare your plan, add up the categories you count as needs and divide by take-home. The 50/30/20 budget rule guide on this site walks through the split and when to adjust it.',
        ],
      },
      {
        heading: 'Zero-based budgeting vs the 50/30/20 rule.',
        paragraphs: [
          'A zero-based budget gives every dollar of take-home a category until nothing is left. The Unallocated Slack line tracks this directly: it reaches $0 when the plan balances and shows an overage when you have planned more than you take home.',
          'The 50/30/20 rule sets proportions instead of assigning each dollar. The two can work together: build the plan zero-based here, then check the needs, wants and savings split against the rule.',
        ],
      },
      {
        heading: 'What budget tension and the flexibility index mean.',
        paragraphs: [
          'The flexibility index is the share of take-home not already committed to fixed costs: take-home minus Fixed Commitments, divided by take-home. With the defaults ($5,920 take-home, $2,400 fixed) it reads 59%.',
          'Budget tension is one score from 0 to 100, built from the three checks below. With the defaults it is 0, or Low Tension, because fixed costs are about 41% of take-home and $970 is unallocated.',
        ],
        table: {
          caption: 'How the budget tension score adds up',
          columns: ['Check', 'Points added'],
          rows: [
            ['Fixed Commitments are more than 60% of take-home', '40'],
            ['Total allocated is more than take-home', '60'],
            ['Unallocated is less than 5% of take-home (including an overage)', '20'],
          ],
          note: 'The score is capped at 100. Under 30 reads Low Tension, 30 to 69 Moderate, and 70 or more High Fragility. These thresholds are the tool\'s own settings, not a published standard.',
        },
      },
    ],
    faqs: [
      {
        question: 'What is the 50/30/20 budget rule?',
        answer: 'The 50/30/20 rule, popularized by Elizabeth Warren and Amelia Warren Tyagi in their 2005 book All Your Worth, suggests putting 50% of after-tax income toward needs (housing, food, utilities), 30% toward wants (entertainment, dining out) and 20% toward savings and extra debt payments. This calculator does not split your budget into those three buckets, so add up the categories you count as needs, wants and savings and divide each by your take-home to compare.',
      },
      {
        question: 'How do I reduce my monthly expenses?',
        answer: 'Start with the largest numbers in your plan, since a small percentage change there frees the most money. Review subscriptions, compare insurance and utility rates, and set a limit for dining and personal spending. In this calculator, watch the Unallocated Slack line and the tension score as you adjust; Auto-Optimize (Pro) can apply rule-based cuts to flexible categories for you.',
      },
      {
        question: 'What are budget tension metrics?',
        answer: 'Budget tension is a single 0 to 100 score built from three checks: 40 points if fixed commitments are more than 60% of take-home, 60 points if you have allocated more than you take home, and 20 points if less than 5% of take-home is left unallocated. Under 30 reads Low Tension, 30 to 69 Moderate, and 70 or more High Fragility. It does not compare individual categories with benchmarks.',
      },
      {
        question: 'Does the budget optimizer use AI?',
        answer: 'No. The free calculator is plain arithmetic. Auto-Optimize, a Pro feature, applies fixed rules: depending on the goal you pick, it trims selected flexible and sinking-fund amounts toward preset minimums, moves freed money to investing and the emergency buffer, or resets the future categories to set shares of take-home. It never changes Fixed Commitments.',
      },
      {
        question: 'Does this calculator track my actual spending?',
        answer: 'No. It does not connect to bank accounts or import transactions. It is a plan: enter what you expect to spend, or totals you have added up from recent statements, and adjust until the plan fits.',
      },
      {
        question: 'How do I budget for annual or irregular expenses?',
        answer: 'Use the Sinking Funds line for costs that do not arrive monthly, such as car repairs or annual premiums. You can also switch to the Annualized view and type a yearly amount; the tool divides it by 12 for the monthly plan.',
      },
      {
        question: 'Can I save my budget?',
        answer: 'Yes, once you sign in. A free account can save one scenario per tool, and Pro allows unlimited saves.',
      },
    ],
    guides: [
      { slug: '2026-09-20-50-30-20-budget-rule', label: 'The 50/30/20 budget rule' },
      { slug: '2026-07-19-emergency-fund-how-much', label: 'How big an emergency fund should be' },
    ],
    relatedTools: ['net-worth', 'debt-paydown', 'geographic-arbitrage'],
  },
  'retirement-strategy': {
    slug: 'retirement-strategy',
    name: 'Roth Conversion and Withdrawal Calculator',
    shortName: 'Retirement Strategy',
    description: 'Models retirement withdrawals from taxable, traditional and Roth accounts with RMDs, a year-by-year Roth conversion plan and a crash stress test; bracket-filling auto conversions are Pro.',
    intro: 'This Roth conversion calculator models withdrawals from taxable, traditional (IRA or 401(k)) and Roth accounts year by year from your current age to 95. Pick a withdrawal order and a fixed annual conversion amount, and it shows each conversion year\'s taxable income and federal tax, total lifetime taxes, whether the money lasts and the balance left at 95. Taxes use 2026 single-filer federal brackets, indexed for inflation, including the taxable share of Social Security. Results are educational estimates, not tax advice.',
    category: 'FinanceApplication',
    features: [
      'Three withdrawal orders: taxable first, bracket filler and proportional',
      'RMDs from age 73 or 75 based on birth year, using the IRS Uniform Lifetime Table',
      'Year-by-year Roth conversion plan with taxable income and tax for each year',
      'Federal tax with 2026 single-filer brackets indexed for inflation, including taxable Social Security',
      'Sequence-risk stress test: a 12% loss in each of the first three retirement years',
      'Auto-sized conversions that fill the 10%, 12% or 22% bracket (Pro)',
    ],
    seo: {
      title: 'Roth Conversion Calculator: Withdrawals, RMDs and Taxes',
      description: 'Model retirement withdrawals across traditional, Roth and taxable accounts, with RMDs, year-by-year Roth conversions and total lifetime federal taxes.',
      keywords: [
        'roth conversion calculator',
        'how much to convert to roth each year',
        'roth conversion tax bracket',
        'retirement withdrawal strategy calculator',
        'which retirement account to withdraw from first',
        'sequence of returns risk calculator',
      ],
    },
    sections: [
      {
        heading: 'How bracket-filling Roth conversions work.',
        paragraphs: [
          'A Roth conversion moves money from a traditional IRA or 401(k) to a Roth account. The converted amount counts as ordinary income that year, so a common approach is to convert only up to the top of a chosen bracket, often in low-income years after retiring and before Social Security or RMDs begin.',
          'A worked example with the tool\'s 2026 single-filer figures: the 12% bracket ends at $50,400 of taxable income and the standard deduction is $16,100, so the 12% bracket tops out at $66,500 of gross income. In a year with no other taxable income, converting $66,500 would owe about $5,800 in federal tax ($1,240 at 10% plus $4,560 at 12%). Each dollar beyond that would be taxed at 22%.',
          'In the free tool you set a fixed annual amount and the ages to convert. The action plan lists each year\'s taxable income after the standard deduction and the tax on that conversion, so you can adjust the amount to stay under a bracket top. Pro\'s Auto-Optimize sizes each year to fill the 10%, 12% or 22% bracket.',
        ],
        table: {
          caption: 'Default plan: $40,000 converted each year from 65 to 72',
          columns: ['Age', 'Conversion', 'Taxable income after standard deduction', 'Federal tax on the conversion'],
          rows: [
            ['65', '$40,000', '$22,407', '$2,418'],
            ['66', '$40,000', '$21,879', '$2,346'],
            ['67', '$40,000', '$48,180', '$4,676'],
            ['68', '$40,000', '$48,137', '$4,667'],
            ['69', '$40,000', '$48,093', '$4,657'],
            ['70', '$40,000', '$48,048', '$4,647'],
            ['71', '$40,000', '$89,077', '$7,132'],
            ['72', '$40,000', '$125,540', '$8,800'],
          ],
          note: 'Illustration, not a forecast. Tool output with its default inputs: age 62 today, retiring at 65, $85,000 a year of spending, $35,000 a year of Social Security from 67, taxable-first withdrawals, 6.5% growth and 3% inflation, with 2026 single-filer brackets indexed for inflation. Taxable income jumps at 67 when Social Security starts, and again at 71 when the taxable account runs out and traditional withdrawals push the conversion into the 22% bracket.',
        },
      },
      {
        heading: 'Which account to withdraw from first.',
        paragraphs: [
          'The tool compares three orders. Taxable first spends taxable, then traditional, then Roth. Bracket filler draws traditional money up to the top of the 12% bracket each year, then taxable, Roth and any remaining traditional. Proportional draws from each account in line with its balance.',
          'Taxable first is a common default because tax-advantaged accounts keep growing longest, but it can leave low-income years unused and a large traditional balance that drives bigger RMDs later. In the default scenario, bracket filler shows the lowest lifetime taxes and taxable first the largest balance at 95.',
        ],
        table: {
          caption: 'Default inputs, three withdrawal orders',
          columns: ['Withdrawal order', 'Total lifetime federal taxes', 'Balance at 95'],
          rows: [
            ['Taxable first', '$863,661', '$7,455,218'],
            ['Bracket filler', '$750,176', '$7,398,603'],
            ['Proportional', '$764,619', '$7,414,554'],
          ],
          note: 'Illustration, not a forecast. Default inputs, including the $40,000 conversions from 65 to 72. Totals are nominal dollars summed over every year to 95. The balance at 95 counts traditional, Roth and taxable dollars the same, even though traditional money still owes income tax when withdrawn.',
        },
      },
      {
        heading: 'What the sequence-risk stress test assumes.',
        paragraphs: [
          'Turning on the stress test replaces the average return with a 12% loss in each of the first three years of retirement, applied to every account after that year\'s withdrawals. After that, returns go back to your fixed average, with no rebound year.',
          'It is one harsh, fixed scenario, not a probability; real downturns could be deeper, shorter or longer. With the default inputs the money still lasts to 95, but the balance at 95 falls from about $7.5 million to about $1.1 million, because withdrawals continue while prices are down.',
        ],
      },
      {
        heading: 'What this Roth conversion calculator leaves out.',
        paragraphs: [
          'Taxes are federal only and use single-filer brackets, so a married couple filing jointly would generally see more tax than they would owe. There is no state tax, no capital gains tax on taxable withdrawals, no early-withdrawal penalty, and no extra standard deduction for filers 65 and older. Inflation is fixed at 3%.',
          'Conversions also add to the income used for Medicare IRMAA surcharges and ACA premium tax credits, and this tool models neither. The capital gains tax calculator\'s Pro modules show how close an income is to the next IRMAA tier or the ACA cliff.',
        ],
      },
    ],
    faqs: [
      {
        question: 'What is sequence-of-returns risk?',
        answer: 'Sequence-of-returns risk is the danger that poor investment returns early in retirement will permanently deplete your portfolio, even if average returns over the full period are acceptable. A market downturn in your first few years of withdrawal can be devastating because you are selling shares at low prices to fund living expenses.',
      },
      {
        question: 'When do Required Minimum Distributions (RMDs) start?',
        answer: 'As of 2026, RMDs from traditional IRAs and 401(k)s must begin at age 73 (increasing to 75 in 2033 under SECURE 2.0). Roth IRAs do not have RMDs during the owner\'s lifetime. Failing to take an RMD results in a 25% penalty on the amount not withdrawn.',
      },
      {
        question: 'Should I do a Roth conversion?',
        answer: 'A conversion may make sense when you expect your tax rate later to be higher than it is now, or when you want to shrink future RMDs from traditional accounts. Low-income years between retirement and the start of Social Security or RMDs are a common time to consider it. This calculator estimates the federal income tax effect for a single filer; it does not include state tax, Medicare IRMAA or ACA subsidies. It is educational, not tax advice.',
      },
      {
        question: 'How much should I convert to a Roth each year?',
        answer: 'There is no single right amount. Try a few amounts and compare total lifetime taxes, the balance at 95 and each year\'s taxable income in the action plan. Keeping that income just under the top of a bracket you are willing to pay is a common target.',
      },
      {
        question: 'Does this calculator include state taxes or Medicare IRMAA?',
        answer: 'No. It estimates federal income tax only, including the taxable share of Social Security. State tax, IRMAA and ACA subsidies are not modeled, so check them separately before converting.',
      },
      {
        question: 'Why are conversions off before retirement by default?',
        answer: 'The model has no wage income, so a conversion while you are still working would be taxed from the lowest bracket up. You can turn pre-retirement conversions on, but the real tax on top of a salary is usually much higher.',
      },
    ],
    guides: [
      { slug: '2026-09-13-roth-ira-complete-guide', label: 'The complete guide to Roth IRAs' },
      { slug: '2026-10-11-when-to-claim-social-security', label: 'When to claim Social Security' },
      { slug: '2026-10-18-year-end-tax-moves-2026', label: 'Year-end tax moves for 2026' },
      { slug: '2026-10-18-2027-contribution-limits', label: '2027 contribution limits: what is official so far' },
    ],
    relatedTools: ['compound-interest', 's-corp-investment', 'net-worth'],
  },
  'index-fund-visualizer': {
    slug: 'index-fund-visualizer',
    name: 'Index Fund Calculator',
    shortName: 'Index Funds',
    description: 'Projects a starting amount plus monthly or annual contributions in one index fund group at a fixed assumed average, with a simulated volatile path; side-by-side fund comparison is Pro.',
    intro: 'This index fund calculator projects what a starting amount plus regular contributions could grow to in one of four fund groups: S&P 500 (VOO or IVV), total U.S. market (VTI), total world (VT), or tech and growth (QQQM or VUG). It draws a smooth line at a fixed average return for the group you pick, a bumpy simulated path beside it, and the total you put in, then shows the final value and gains. It is not a historical backtest: it does not use real prices or let you pick start and end dates. Tickers are used only to identify the funds and imply no endorsement by, or affiliation with, the fund companies.',
    category: 'FinanceApplication',
    features: [
      'One fund group at a time: S&P 500 (VOO/IVV), total U.S. market (VTI), total world (VT) or tech and growth (QQQM/VUG)',
      'Starting amount plus a monthly or annual contribution, over 1 to 50 years',
      'Smooth projection at a fixed assumed average return for each fund group',
      'Seeded random volatile path you can re-run to see a different market sequence',
      'Expense ratio shown for each fund (displayed, not deducted from the projection)',
      'Side-by-side fund comparison, risk metrics and a Monte Carlo range (Pro)',
    ],
    seo: {
      title: 'Index Fund Calculator: Monthly Investing in VOO, VTI, VT',
      description: 'Project a starting amount plus monthly investing in an S&P 500, total market, world or growth index fund, with a bumpy simulated path beside the average.',
      keywords: [
        'index fund calculator',
        'S&P 500 index fund calculator',
        'VOO calculator',
        'VTI calculator',
        'invest $500 a month in the S&P 500',
        'index fund growth calculator',
        'index fund volatility simulator',
      ],
    },
    sections: [
      {
        heading: 'How the index fund calculator projects growth.',
        paragraphs: [
          'Each fund group gets one fixed average annual return, listed in the assumptions table below. The tool treats these as rough approximations of long-run (10- to 20-year) historical averages. They are not taken from a specific dated data set, and fees are not separately subtracted.',
          'The smooth line converts that average to a monthly rate. Each month\'s contribution is added at the start of the month and then grows for that month. An annual contribution is split into 12 equal monthly amounts rather than invested as one lump.',
          'The volatile path uses the same average but draws a random return every month, scaled by an assumed volatility. The draws are seeded, so you see the same path until you press Re-simulate. Any single path could finish above or below the smooth line.',
          'Neither line is a forecast. Long-run averages depend heavily on the period measured, and real returns could stay below the average for years. Expense ratios are shown but not subtracted, and taxes and inflation are not modeled.',
        ],
      },
      {
        heading: 'VOO vs VTI vs VT vs QQQM in plain words.',
        paragraphs: [
          'VOO and IVV track the S&P 500, about 500 large U.S. companies. VTI tracks the whole U.S. market, adding mid-size and small companies, though most of its value sits in those same large companies. VT adds stocks from dozens of countries outside the U.S. QQQM tracks the Nasdaq-100 and VUG tracks large U.S. growth companies; both lean heavily toward technology, and the tool treats them as one group.',
          'In the free tool you compare groups one at a time: keep your inputs, switch the fund, and note the result. The growth group has both the highest assumed average and the highest assumed volatility, so its volatile path swings the most.',
        ],
        table: {
          caption: 'Assumptions the tool uses for each fund group',
          columns: ['Fund group', 'Tickers', 'Assumed average return', 'Assumed volatility', 'Expense ratio shown'],
          rows: [
            ['S&P 500', 'VOO, IVV', '10.5%', '15.0%', '0.03%'],
            ['Total U.S. market', 'VTI', '10.2%', '16.0%', '0.03%'],
            ['Total world', 'VT', '8.5%', '14.5%', '0.07%'],
            ['Tech and growth', 'QQQM, VUG', '13.5%', '22.0%', '0.15% / 0.04%'],
          ],
          note: 'These values are fixed in the tool and are assumptions, not promises of future returns. Expense ratios are shown for reference and are not deducted; check each fund\'s current documents for its actual fee.',
        },
      },
      {
        heading: 'What $500 a month in an index fund could grow to.',
        paragraphs: [
          'The table runs the tool\'s smooth-line math for $500 a month with no starting balance. You put in $60,000 over 10 years, $120,000 over 20 and $180,000 over 30; everything above that is assumed growth.',
          'Most of the growth arrives late, because each year\'s return builds on a larger balance. Small differences in the assumed average also widen: the 2-point gap between the S&P 500 and total world assumptions is about $10,400 at 10 years and $367,000 at 30.',
        ],
        table: {
          caption: '$500 a month, no starting balance: smooth-line value',
          columns: ['Fund group (assumed average)', '10 years', '20 years', '30 years'],
          rows: [
            ['S&P 500 (10.5%)', '$103,433', '$384,160', '$1,146,073'],
            ['Total U.S. market (10.2%)', '$101,801', '$370,689', '$1,080,897'],
            ['Total world (8.5%)', '$93,058', '$303,460', '$779,175'],
            ['Tech and growth (13.5%)', '$121,356', '$551,900', '$2,079,385'],
            ['Total invested', '$60,000', '$120,000', '$180,000'],
          ],
          note: 'Illustration, not a forecast. Computed with the tool\'s own formula: $0 starting amount, $500 added at the start of each month, compounded monthly at each group\'s fixed assumed average. Fees, taxes and inflation are not included. Actual results could be higher or lower, and returns can be negative.',
        },
      },
    ],
    faqs: [
      {
        question: 'What is an index fund?',
        answer: 'An index fund is a mutual fund or ETF built to track a market index, such as the S&P 500, instead of trying to beat it through active stock picking. Because it holds the companies in the index, it spreads your money across many stocks at once. The funds in this tool show expense ratios from 0.03% to 0.15%.',
      },
      {
        question: 'Why do expense ratios matter?',
        answer: 'An expense ratio is an annual fee charged as a percentage of your balance, so it comes out of your return every year and the gap compounds. This tool displays each fund\'s expense ratio but does not subtract it. As an illustration using the tool\'s own math and default inputs ($10,000 to start, $1,000 a month, 25 years at 10.5%), lowering the average by 0.03 points cuts the smooth-line result by about $7,100, and lowering it by a hypothetical full point cuts it by about $218,000. Illustration only, not a forecast.',
      },
      {
        question: 'What is dollar-cost averaging?',
        answer: 'Dollar-cost averaging means investing a fixed amount at regular intervals regardless of market conditions. When prices are low, you buy more shares; when prices are high, you buy fewer. This strategy reduces the impact of market volatility and removes the temptation to time the market.',
      },
      {
        question: 'Does this index fund calculator use real historical returns?',
        answer: 'No. It applies one fixed average return per fund group and does not look up prices or let you choose start and end dates. To see what a fund actually returned between two dates, you need a backtest tool or the fund\'s own performance history.',
      },
      {
        question: 'How much could $500 a month in VOO grow to?',
        answer: 'Using the tool\'s 10.5% assumption for S&P 500 funds, $500 a month with no starting balance reaches $384,160 after 20 years on the smooth line, from $120,000 invested. That is an illustration, not a forecast; real returns could be higher or lower.',
      },
      {
        question: 'Why does the volatile line change when I re-simulate?',
        answer: 'Each press of Re-simulate draws a new random sequence of monthly returns around the same average. A path that ends above the smooth line is not a better fund, just a luckier sequence.',
      },
      {
        question: 'Can I compare VOO, VTI and VT side by side?',
        answer: 'In the free tool, keep your inputs the same and switch between fund groups to compare final values one at a time. The side-by-side ranking, Sharpe ratio, estimated drawdown and Monte Carlo range are part of Pro.',
      },
    ],
    guides: [
      { slug: '2026-08-23-index-fund-investing-for-beginners', label: 'Index fund investing for beginners' },
    ],
    relatedTools: ['compound-interest', 'retirement-strategy', 'net-worth'],
  },
  'gambling-redirect': {
    slug: 'gambling-redirect',
    name: 'Gambling vs. Investing Calculator',
    shortName: 'Gambling Redirect',
    description: 'Enter a monthly betting budget, a time horizon and an assumed return to see what that money could grow to if it were invested instead.',
    intro: 'This gambling vs investing calculator compares two uses of the same monthly budget: spending it on bets, or investing it. Enter what you spend each month on sports betting, casino games or lottery tickets, pick a time horizon and an assumed annual return, and it shows the total you would spend, what the same deposits could grow to, and how much of that is compounding. It puts a number on a habit without passing judgment on it.',
    category: 'FinanceApplication',
    features: [
      'Monthly betting budget from $10, with a slider up to $5,000 and larger amounts typed in',
      'Time horizon from 1 to 50 years and an assumed annual return from 1% to 15% (10% by default)',
      'Total spent vs what the same money could grow to, with a year-by-year chart',
      'Daily and annual cost of your budget, plus a growth factor',
      'Estimated total amount wagered, expected loss to the house edge and years to reach savings milestones (Pro)',
    ],
    seo: {
      title: 'Gambling vs Investing Calculator: See the Opportunity Cost',
      description: 'Enter what you spend on betting each month and see what the same money could grow to if it were invested instead, over the time horizon you pick.',
      keywords: [
        'gambling vs investing calculator',
        'what if I invested instead of gambling',
        'sports betting vs investing',
        'how much does gambling cost me per year',
        'lottery tickets vs investing',
        'gambling opportunity cost',
      ],
    },
    sections: [
      {
        heading: 'How the gambling vs investing calculator works.',
        paragraphs: [
          'Each month, the calculator adds your betting budget to a running total of money spent. In the investing column, the same amount goes into a balance that grows at your assumed annual return, compounded monthly. Nothing is withdrawn, and taxes and fees are not included.',
          'The default return is 10% a year, before inflation. Markets do not deliver a steady return, and real results could be lower or higher, so it is worth trying a lower rate too.',
        ],
        table: {
          caption: '$250 a month at the default 10% assumed return (illustration, not a forecast)',
          columns: ['Years', 'Total spent', 'Invested instead'],
          rows: [
            ['10', '$30,000', '$51,638'],
            ['20', '$60,000', '$191,424'],
            ['30', '$90,000', '$569,831'],
          ],
          note: 'Computed with the calculator\'s own formula: monthly deposits, monthly compounding, no taxes or fees. Actual returns vary and can be negative.',
        },
      },
      {
        heading: 'What the house edge means.',
        paragraphs: [
          'Casino games and sportsbook lines are priced so that, on average, the operator keeps a share of every dollar wagered. That share is the house edge, also called the hold. Any single bet can win, but across many bets the expected result is a small loss each time money goes back on the table, including winnings that are bet again.',
          'That is why this calculator compares your whole budget with investing, rather than only your losses. Pro adds an estimate of the total amount wagered and the expected loss to the house edge for your inputs.',
        ],
      },
      {
        heading: 'If betting feels out of control.',
        paragraphs: [
          'If betting has started to feel hard to stop, or it is costing more than you planned, you do not have to sort it out alone. The National Problem Gambling Helpline, run by the National Council on Problem Gambling, is free, confidential and open 24/7.',
        ],
        bullets: [
          'Call 1-800-MY-RESET (1-800-697-3738).',
          'The council\'s older number, 1-800-522-4700, is still active.',
          'If you or someone you know is in crisis, call 911 or 988.',
        ],
      },
    ],
    faqs: [
      {
        question: 'What is opportunity cost in gambling?',
        answer: 'Opportunity cost is what you give up by choosing one option over another. When you gamble, the opportunity cost is the potential investment growth of that money. For example, $200/month in gambling over 20 years at 8% market returns represents over $118,000 in lost wealth.',
      },
      {
        question: 'What is the house edge?',
        answer: 'The house edge is the built-in advantage an operator has on each bet. Odds vary by game and bet type, but across many bets the expected result is that the operator keeps a share of what is wagered. That is why a betting budget behaves like a cost over time rather than an investment.',
      },
      {
        question: 'Is occasional gambling always bad financially?',
        answer: 'Occasional small-stakes gambling can be viewed as entertainment spending, similar to movies or concerts. The key is treating it as a fixed entertainment budget, not an income strategy. This calculator helps you understand the true cost so you can decide if that entertainment value is worth it to you.',
      },
      {
        question: 'How much does gambling cost me per year?',
        answer: 'Multiply your typical monthly spend by 12. The calculator shows that as the annual cost, along with a daily figure. At the default $250 a month, that is $3,000 a year, or about $8 a day, and $30,000 over 10 years before any growth is counted.',
      },
      {
        question: 'How is sports betting different from investing?',
        answer: 'Both put money at risk, but they are built differently. A bet is priced so the operator keeps a share on average, so the expected long-run result is a loss. A broad index fund is a share in many companies; its value can fall, sometimes for years, but over long periods it has historically risen. Past results do not promise future ones, and both can lose money.',
      },
      {
        question: 'Does this work for lottery tickets?',
        answer: 'Yes. Enter what you spend on tickets each month as the betting budget. The math is the same for any regular spend: what you would pay out in total versus what the same deposits could grow to at the return you pick.',
      },
      {
        question: 'What return should I use?',
        answer: 'The default is 10% a year before inflation, and the tool accepts anything from 1% to 15%. Try a lower rate as well to see a more cautious picture. No rate is a promise, and investments can lose money in any given year.',
      },
    ],
    guides: [
      { slug: '2026-08-23-index-fund-investing-for-beginners', label: 'Index fund investing for beginners' },
    ],
    relatedTools: ['compound-interest', 'budget', 'net-worth'],
  },
  'car-affordability': {
    slug: 'car-affordability',
    name: 'Car Affordability Calculator',
    shortName: 'Car Affordability',
    description: 'Answer how much car you can afford with the 20/3/8 rule: 20% down, a 3-year loan, and a payment under 8% of gross income.',
    intro: 'The Car Affordability Calculator uses the 20/3/8 rule to size the most car your income supports: at least 20% down, a loan of no more than three years, and a monthly payment of no more than 8% of gross monthly income, minus any car payment you already have. The 20/3/8 rule of thumb is popularized by The Money Guy Show; this independent tool is not affiliated with the show. Enter your income, the loan rate you expect and your down payment, and it reports the maximum price, the payment, the loan amount, the interest and the total paid. The price does not include sales tax, insurance, fuel or maintenance, so budget those separately.',
    category: 'FinanceApplication',
    features: [
      '20/3/8 rule check',
      'Maximum car price from income, rate and down payment',
      'Monthly payment, loan amount and total interest',
      'Existing car payments subtracted from the budget',
    ],
    seo: {
      title: 'How Much Car Can I Afford? 20/3/8 Rule Calculator',
      description: 'Enter your gross income and loan rate. The 20/3/8 rule sizes your maximum car price: 20% down, a 3-year loan, and a payment under 8% of gross income.',
      keywords: [
        'how much car can i afford',
        'car affordability calculator',
        '20/3/8 rule calculator',
        'how much car can i afford on my salary',
        'car payment to income ratio',
      ],
    },
    sections: [
      {
        heading: 'How much car can I afford under the 20/3/8 rule?',
        paragraphs: [
          'The honest answer to how much car can I afford is a payment question, not a sticker-price question. The 20/3/8 rule sets three limits: put at least 20% down, finance for no more than three years, and keep the monthly payment at or under 8% of your gross monthly income. This car affordability calculator holds the second and third limits fixed and solves for the price. Enter your income and the loan rate you expect, and it reports the most car that payment supports along with the loan amount, interest and total paid.',
          'On $150,000 a year, gross monthly income is $12,500 and 8% of that is $1,000. At a 4% APR over 36 months, $1,000 a month supports a loan of about $33,900. With 20% down, that loan buys a car priced around $42,300, with roughly $2,100 of total interest over the three years. On $60,000 a year, the same math gives a $400 payment, a $13,500 loan, and a price near $16,900. Neither figure is what a dealer would try to sell you, and that is the point of the rule.',
        ],
      },
      {
        heading: 'How much car you can afford by salary.',
        paragraphs: [
          'The calculator applies the 20/3/8 rule: the payment is capped at 8% of gross monthly income, the loan runs 36 months, and a 20% down payment sits on top of the loan to give a maximum price. Here is what that produces at four incomes.',
        ],
        table: {
          caption: 'Maximum car price under the 20/3/8 rule at the calculator\'s default 4.0% APR and 20% down',
          columns: ['Gross annual income', 'Monthly payment (8% of gross)', 'Loan amount (36 months)', 'Down payment (20%)', 'Maximum car price'],
          rows: [
            ['$50,000', '$333', '$11,290', '$2,820', '$14,110'],
            ['$75,000', '$500', '$16,940', '$4,230', '$21,170'],
            ['$100,000', '$667', '$22,580', '$5,650', '$28,230'],
            ['$150,000', '$1,000', '$33,870', '$8,470', '$42,340'],
          ],
          note: 'Illustration using the calculator\'s default assumptions, not a forecast. Uses the calculator\'s default 4.0% APR, which is a sample input rather than a quoted or current market rate (enter the rate you are actually offered), its default 20% down payment, a fixed 36-month term and no existing car payments. Payment = 8% of gross monthly income; loan = the amount that payment repays over 36 months at that APR; price = loan ÷ 0.8. The price excludes sales tax, title, fees, insurance, fuel and maintenance, and it is not a loan offer or an approval estimate. Loan, down payment and price are rounded to the nearest $10.',
        },
      },
      {
        heading: 'Why the three-year cap does most of the work.',
        paragraphs: [
          'Dealers sell payments, and stretching the term is how they make an expensive car look cheap. A $30,000 loan at 6% is about $913 a month over three years but only about $438 over seven. The seven-year version costs about $6,800 in interest instead of about $2,900, and for most of that period you owe more than the car is worth, because the balance falls slower than the value does. The lower payment is real; so is the nearly $4,000 of extra interest and the years spent underwater.',
          'Holding the term to 36 months forces the price to fit the payment rather than the other way around. If a car only works on a six- or seven-year loan, the rule’s verdict is that it is too much car for your income right now. The calculator will not extend the term; the only levers it gives you are income, rate and down payment. That is deliberate. A three-year loan on a car you can afford leaves you with a paid-off vehicle and a free payment to redirect into savings while the car still has years of life left.',
        ],
      },
      {
        heading: 'What to do with the number the calculator gives you.',
        paragraphs: [
          'Treat the maximum price as a ceiling, not a target. The 8% payment limit does not include insurance, fuel, maintenance or registration, and a newer or larger car pushes all of those up at the same time. Many people who follow the rule deliberately buy well under the ceiling and put the gap into an emergency fund or investing. The tool shows the payment as a share of pre-tax income, total interest and total paid, so you can see what a cheaper car frees up rather than only what the expensive one costs.',
          'A larger down payment raises the price the tool allows, because the same payment covers a smaller loan. That is mathematically true and often a trap: cash spent on a depreciating car is cash not compounding elsewhere, and the rule’s 20% floor exists to keep you from owing more than the car is worth, not to be exceeded. The slider is there so you can see the trade-off, not to justify a bigger purchase. If you have extra cash, a cheaper car and a larger emergency fund almost always beats a nicer car and a thinner one.',
        ],
        bullets: [
          'Existing car payments are subtracted from the 8% budget before anything else',
          'The APR you get depends on credit; run the tool at the rate you have actually been quoted',
          'Total paid over the loan is shown so you see the real cost, not the payment alone',
          'The rule uses gross income; if your take-home is unusually low, tighten the budget',
        ],
      },
    ],
    faqs: [
      {
        question: 'What is the 20/3/8 rule for car buying?',
        answer: 'The 20/3/8 rule is a guideline for buying a car you can carry: put at least 20% down, finance for no more than 3 years, and keep the monthly payment under 8% of your gross monthly income. This calculator applies the 8% to the loan payment, which is the most common version; a stricter version counts insurance, fuel and maintenance inside the 8% too.',
      },
      {
        question: 'How fast do cars depreciate?',
        answer: 'Most of a car’s value loss comes in its first few years. An iSeeCars study put average five-year depreciation at 41.8% in 2026, with wide variation by segment: trucks lost about 34% and electric vehicles about 57%. Buying a car that is a few years old lets the first owner absorb the steepest part of that drop. This calculator sizes a price; it does not model depreciation.',
      },
      {
        question: 'Should I buy or lease a car?',
        answer: 'Buying is almost always better financially if you keep the car for 5+ years. Leasing has lower monthly payments but you build no equity and face mileage restrictions and wear penalties. Leasing only makes sense if you need a new car every 2-3 years for business reasons or if the lease includes significant tax benefits.',
      },
      {
        question: 'Does the 8% limit cover insurance and fuel too?',
        answer: 'In this calculator, no — the 8% is applied to the loan payment alone, which is the strict version of the rule. Some versions fold in all operating costs. If you use the tool’s number, budget insurance, fuel and maintenance separately, or mentally lower the payment ceiling to leave room for them.',
      },
      {
        question: 'What if I already have a car loan?',
        answer: 'Enter the current monthly payment in the existing-payments field. The tool subtracts it from your 8% budget before sizing a new loan, so two cars together stay under the limit. If the existing payment already consumes the whole budget, the maximum price drops to zero — the rule is telling you to wait.',
      },
      {
        question: 'Can I use the calculator if I plan to pay cash?',
        answer: 'Set the down payment slider to its maximum and the tool will size the price accordingly, but the rule was written for financed purchases. For a cash purchase the better test is whether the car is a small fraction of your liquid net worth and leaves your emergency fund untouched.',
      },
      {
        question: 'Should I put more than 20% down to afford a nicer car?',
        answer: 'The calculator lets you see that a bigger down payment raises the allowed price, but the rule’s intent is the opposite: 20% is a floor that keeps you from being underwater, not a lever for buying more. Extra cash is usually better kept liquid or invested than sunk into a depreciating asset.',
      },
      {
        question: 'Does this work for a used car?',
        answer: 'Yes, and it works better. Used-car loan rates are often somewhat higher, so enter the rate you have been quoted, but the price the rule allows buys far more car on the used market because the first owner absorbed the steepest depreciation. The 20/3/8 limits apply the same way.',
      },
    ],
    guides: [
      { slug: '2026-09-27-how-much-car-can-you-afford', label: 'How much to spend on a car' },
      { slug: '2026-09-20-50-30-20-budget-rule', label: 'The 50/30/20 budget rule' },
    ],
    relatedTools: ['budget', 'debt-paydown', 'net-worth'],
  },
  'rent-vs-buy': {
    slug: 'rent-vs-buy',
    name: 'Rent vs. Buy Calculator',
    shortName: 'Rent vs. Buy',
    description: 'Compare renting vs buying a home with opportunity cost, maintenance, taxes, and mobility factors.',
    intro: 'The Rent vs. Buy Calculator goes beyond monthly payment comparisons to model the net worth impact of buying a home versus renting and investing the difference. It accounts for property taxes, maintenance, insurance, buying and selling costs, home appreciation, rent growth, and what the down payment would have earned if it stayed invested. The result shows projected net worth for each path over your chosen horizon and the year buying pulls ahead, if it does.',
    category: 'FinanceApplication',
    features: [
      'Net worth comparison, year by year',
      'Down payment opportunity cost',
      'Break-even year',
      'Buying and selling cost modeling',
      'Mobility and market-timing scenarios (Pro)',
    ],
    seo: {
      title: 'Rent vs Buy Calculator: Break-Even Year and Net Worth',
      description: 'Compare buying a home with renting and investing the difference. See net worth for each path, the year buying pulls ahead, and which inputs flip it.',
      keywords: [
        'rent vs buy calculator',
        'should i rent or buy a house calculator',
        'rent vs buy break even calculator',
        'rent and invest the difference calculator',
        'how many years to break even buying a house',
      ],
    },
    sections: [
      {
        heading: 'How this rent vs buy calculator keeps score.',
        paragraphs: [
          'A rent vs buy calculator that only compares a mortgage payment to a rent check misses most of the decision. This one tracks two net worth figures over your horizon. The buyer’s is home value minus the remaining mortgage balance minus what it would cost to sell, plus any monthly savings they were able to invest. The renter’s is a portfolio that starts with the down payment and closing costs they never spent, growing at the investment return you set, plus whatever they save each month by paying rent instead of the full cost of owning.',
          'Each year, whichever side pays less in total housing cost invests the difference in their own portfolio. Owning costs include principal and interest on a 30-year fixed loan, property tax, maintenance, and insurance at half a percent of home value. Renting costs the rent, rising every year at the rent-inflation rate you set. The chart draws both net worth lines across the horizon, and the verdict is simply which line is higher at the year you selected, and by how much. A break-even year is reported when buying pulls ahead for good.',
        ],
      },
      {
        heading: 'A worked example with the default numbers.',
        paragraphs: [
          'Take a $500,000 home with 20% down at a 6.5% rate. Principal and interest on the $400,000 loan is about $2,528 a month. Add property tax at 1.2% ($500 a month), maintenance at 1.5% ($625) and insurance ($208), and owning runs about $3,860 a month before any tax deduction. Against $2,800 rent, the renter starts with roughly $1,060 a month to invest, on top of the $110,000 of down payment and closing costs they kept in the market instead of putting into the house.',
          'That $110,000 alone becomes about $237,000 after ten years at 8%. Meanwhile the house at 4% appreciation is worth about $740,000, but selling it costs about $44,000 in fees, and the buyer still owes most of the mortgage. Whether the buyer wins depends on how those pieces net out, and it is rarely obvious without running it. Rent climbing 3.5% a year reaches about $3,950 a month by year ten. At exactly these default numbers renting stays ahead the whole way: about $33,000 ahead at year ten, and the tool finds no break-even year. Higher appreciation, a lower investment return or a cheaper home relative to rent can flip it, which is why every assumption is a slider.',
        ],
      },
      {
        heading: 'Which sliders decide the answer.',
        paragraphs: [
          'Transaction costs are the quiet killer of short holds. Two percent to buy and six percent to sell means an eight percent round trip; on a $500,000 home that is $40,000 that has to be recovered through appreciation and rent savings before buying breaks even. This is why the break-even year, not the monthly payment, is the number to watch. Shorten the horizon to three or four years and the renter wins almost every scenario. A longer stay gives the buyer more years to absorb those costs, though at the default assumptions renting still stays ahead. The costs are the same; the time to absorb them is not.',
          'The other three that matter are appreciation, investment return, and maintenance. Set appreciation and return to values you would accept in a mediocre decade rather than a boom, and use a maintenance figure that includes a roof and an HVAC replacement over the period, because realtor math usually ignores both. Then move each slider one notch at a time and watch which one flips the verdict. If a single optimistic assumption is doing all the work, the decision is closer than the chart makes it look.',
        ],
        bullets: [
          'Home appreciation: 3–4% is close to long-run averages; 6%+ is a bull-market assumption',
          'Alternative investment return: what the renter’s portfolio earns — 7–8% nominal for an index fund',
          'Maintenance: 1–2% of home value per year, higher for older homes',
          'Selling costs: 5–6% for agent commissions and transfer fees',
        ],
      },
    ],
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
      {
        question: 'Why does the calculator start the renter with the down payment?',
        answer: 'Because that money exists either way. The buyer converts it into home equity; the renter keeps it and can invest it. Ignoring what the down payment would earn elsewhere is the most common way rent-vs-buy comparisons overstate the case for buying. The tool grows it at the alternative return you set.',
      },
      {
        question: 'Does the model include the mortgage interest deduction?',
        answer: 'Not in the base comparison. Many households take the standard deduction and get no benefit from mortgage interest, and the benefit that does exist shrinks each year as interest falls. If you itemize and expect a meaningful deduction, treat the buy result as slightly conservative.',
      },
      {
        question: 'What does the break-even year mean?',
        answer: 'It is the first year in which buying’s net worth exceeds renting’s and stays higher for the rest of the horizon. If the tool shows no break-even, renting wins at every year you selected. Extending the horizon or lowering the selling cost are the two changes most likely to produce one.',
      },
      {
        question: 'How should I set the time horizon?',
        answer: 'Use the number of years you genuinely expect to stay in this specific home, not how long you plan to be a homeowner. Job changes, family growth and neighborhood shifts drive moves earlier than people expect. Run it at your honest guess and at three years shorter to see how sensitive the answer is.',
      },
      {
        question: 'Can I model a 15-year mortgage or an adjustable rate?',
        answer: 'The comparison assumes a 30-year fixed loan, which is the most common case. For a 15-year loan, the monthly payment is higher but equity builds faster; you can approximate the effect by raising the rate slightly for a conservative view, but the tool does not change the amortization term directly.',
      },
    ],
    guides: [
      { slug: '2026-07-26-rent-vs-buy-a-home', label: 'Rent vs. buy: how to decide' },
      { slug: '2026-07-19-emergency-fund-how-much', label: 'How big an emergency fund should be' },
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
    features: [
      'Avalanche vs. snowball comparison',
      'Hybrid strategy',
      'Payoff timeline visualization',
      'Interest savings calculation',
      'Psychological weighting',
    ],
    seo: {
      title: 'Debt Snowball vs Avalanche Calculator: Debt-Free Date',
      description: 'List your debts and a monthly budget. Compare snowball, avalanche and a hybrid plan by debt-free date and total interest, side by side. Free, no signup.',
      keywords: [
        'debt snowball calculator',
        'debt avalanche calculator',
        'snowball vs avalanche calculator',
        'debt payoff calculator',
        'credit card payoff calculator multiple cards',
        'pay off debt or invest calculator',
      ],
    },
    sections: [
      {
        heading: 'What a debt snowball calculator shows you.',
        paragraphs: [
          'A debt snowball calculator lines your debts up smallest balance first, pays the minimum on everything, and throws all extra cash at the smallest one. When it is gone, its minimum rolls into the next debt, and the payment grows as each balance disappears. This tool simulates that process month by month, applying interest, paying minimums, and directing the surplus, and reports two things for the plan: how many months until you are debt-free and how much interest you pay along the way, at the budget you entered.',
          'It also runs the same simulation ordered by interest rate — the avalanche — and a hybrid that weights both, so you see the true cost of each choice instead of guessing. The three cards show months and total interest side by side, and the chart plots total balance over time for all three plans on one axis. Often the lines sit nearly on top of each other, which is itself useful information: it means the order barely matters and you can pick the plan you are most likely to stick with.',
        ],
      },
      {
        heading: 'Debt avalanche calculator: when the math matters.',
        paragraphs: [
          'The avalanche minimizes interest, always. How much it saves depends on the spread between your highest and lowest rates and on how long the payoff takes. A 25% credit card next to a 4.5% student loan is a wide spread and the avalanche will win clearly; three cards all near 22% is not, and the two plans converge. The tool’s recommendation is blunt about this: if the avalanche saves more than $500, it tells you the dollar figure and says to use it; if not, it points you to the snowball’s momentum.',
          'Interest is driven by the size of the extra payment far more than by the order. $10,000 at 24% APR paid at $300 a month takes about 56 months and costs about $6,600 in interest. At $500 a month it takes about 26 months and costs about $2,900. Finding another $200 a month saved more than any reordering of the same debts could. So before agonizing over snowball versus avalanche, push the monthly paydown budget up and watch how much faster every plan finishes.',
        ],
      },
      {
        heading: 'Debt payoff calculator inputs that change the answer.',
        paragraphs: [
          'Two settings deserve attention beyond the debts themselves. The tax-deductible flag lowers a debt’s effective rate in the avalanche ordering, using the tax bracket you enter, which matters for some student loan interest and for mortgage interest if you itemize. The invest-return field sets the bar for the verdict at the bottom of the results: paying down any debt with an after-tax APR above that number earns its rate with no market risk, so it belongs ahead of extra investing. Anything below it is a closer call.',
          'The psychological weighting slider builds the hybrid plan. Slide it toward logic and the hybrid orders by rate, behaving like the avalanche; slide it toward behavior and small balances jump the queue, behaving like the snowball. The middle produces a plan that clears one or two quick wins first, then attacks the expensive debt. If you have started and abandoned payoff plans before, be honest about where you sit on that slider — a plan you finish beats a cheaper one you quit.',
        ],
        bullets: [
          'Balance, APR and minimum payment for every debt — get these from the latest statements',
          'Monthly paydown budget: the total you can commit, not just the extra',
          'Tax bracket and deductible flags for an after-tax view of each rate',
          'Expected investment return, used only for the pay-down-or-invest verdict',
        ],
      },
    ],
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
      {
        question: 'How does the calculator handle a debt once it is paid off?',
        answer: 'The month a debt reaches zero, only the unused part of its minimum rolls into the extra pool. From the next month on, its full minimum is redirected to the next target. Total monthly outlay never rises above your budget; the payments just concentrate on fewer debts over time.',
      },
      {
        question: 'What is the hybrid plan and when would I use it?',
        answer: 'The hybrid scores each debt on both interest rate and balance, weighted by the slider you set. It is for people who know the avalanche is cheaper but doubt they will stick with it. A middle setting usually clears one or two small balances early, then behaves like an avalanche.',
      },
      {
        question: 'Should I include my mortgage in the list?',
        answer: 'Usually not. A mortgage’s rate is typically far below consumer debt and its balance would dominate the chart, hiding the differences that matter. Enter it only if you are specifically deciding whether to prepay it, and mark the interest deductible if you itemize.',
      },
      {
        question: 'What if my budget does not cover the minimum payments?',
        answer: 'The tool warns you when the budget is below the sum of minimums, because no ordering strategy works at that point. The immediate fix is to raise the budget or negotiate a lower minimum with a lender; the calculator is only useful once every minimum is covered with something left over.',
      },
      {
        question: 'Why does the recommendation sometimes pick the snowball even though the avalanche is cheaper?',
        answer: 'Because a small interest difference is not worth a plan you might quit. When the avalanche saves under about $500, the tool treats the two as equivalent on cost and favors the snowball for its earlier wins. Above that, it recommends the avalanche and tells you the dollar figure at stake.',
      },
    ],
    guides: [
      { slug: '2026-07-02-debt-avalanche-vs-snowball', label: 'Debt avalanche vs. snowball: which to pick' },
      { slug: '2026-07-19-emergency-fund-how-much', label: 'How big an emergency fund should be' },
    ],
    relatedTools: ['budget', 'compound-interest', 'net-worth'],
  },
  'geographic-arbitrage': {
    slug: 'geographic-arbitrage',
    name: 'Geographic Arbitrage Calculator',
    shortName: 'Geographic Arbitrage',
    description: 'Compare take-home pay, housing and everyday costs between two U.S. cities, then see how the monthly difference could compound if invested.',
    intro: 'This geographic arbitrage calculator compares what the same salary leaves you with in two U.S. cities. Pick where you live now and where you might move, enter your gross pay and any pay change, and it estimates take-home pay, housing and everyday costs, and the yearly surplus in each place. It then shows the monthly difference and how it could compound if invested.',
    category: 'FinanceApplication',
    features: [
      'Two-city comparison across 59 U.S. locations, plus a generic remote, lower-cost scenario',
      'Take-home pay after 2026 federal income tax (single filer, standard deduction), employee Social Security and Medicare, and an approximate state income tax rate',
      'Housing and everyday costs scaled by each city and by your housing and consumption settings',
      'Salary adjustment from 50% to 150% for a pay change or a remote role',
      'Monthly difference and a year-by-year compounded chart',
      'Top five destinations for your inputs, state tax difference, career mobility trade-off and lifestyle score (Pro)',
    ],
    seo: {
      title: 'Geographic Arbitrage Calculator: Compare Two U.S. Cities',
      description: 'Compare take-home pay, approximate state income tax and cost of living between two U.S. cities, and see what the monthly difference could grow to.',
      keywords: [
        'geographic arbitrage calculator',
        'cost of living comparison calculator',
        'cost of living comparison with taxes',
        'moving to a state with no income tax',
        'salary needed in another city',
        'what is geographic arbitrage',
      ],
    },
    sections: [
      {
        heading: 'How the geographic arbitrage calculator works.',
        paragraphs: [
          'For each city, the tool takes your gross salary and subtracts 2026 federal income tax (single filer, standard deduction), employee Social Security and Medicare, and one approximate state income tax rate. Then it subtracts yearly housing and everyday costs. What is left is the yearly surplus, which can be negative.',
          'The headline is the monthly difference between the two surpluses. The chart adds each surplus to a balance once a year and grows it at the return you set (7% by default) over your time horizon (20 years by default).',
          'Illustration, not a forecast: at the defaults, $150,000 with no pay change from San Francisco to Austin, the monthly difference is about $4,450. San Francisco runs a small deficit at these settings, which shows how much the lifestyle sliders matter.',
        ],
        table: {
          caption: 'Default scenario, San Francisco to Austin (illustration, not a forecast)',
          columns: ['Line item', 'San Francisco, CA', 'Austin, TX'],
          rows: [
            ['Take-home pay', '$99,841', '$113,791'],
            ['Housing (yearly)', '$42,000', '$25,200'],
            ['Everyday costs (yearly)', '$58,320', '$35,640'],
            ['Yearly surplus', '-$479', '$52,951'],
          ],
          note: 'Computed with the calculator\'s own formulas and default settings. Your salary, cities and sliders change every line.',
        },
      },
      {
        heading: 'What the tax rate and cost-of-living index represent.',
        paragraphs: [
          'Each city has one approximate effective state income tax rate, applied to your whole salary. It is not a bracket calculation or the state\'s top rate: flat-tax states use their statutory rate, and states with brackets use a mid-bracket figure. New York City and Washington, D.C. include local income tax, and the single rate could overstate or understate your actual bill.',
          'The cost-of-living index scales a fixed monthly baseline for non-housing spending, where 1.0 is the baseline; the list runs from 0.8 to 1.9. Housing is separate: each city has its own monthly figure, scaled by the Housing Standard slider (50 is typical). Everyday costs also scale with the Consumption slider.',
          'These are built-in estimates, not live data, and rates change yearly, so check your state\'s current schedule. The model is calibrated for salaries of $40,000 and up.',
        ],
      },
      {
        heading: 'Cities covered by the calculator.',
        paragraphs: [
          'The calculator covers every state capital, Washington, D.C., and eight more cities: 59 locations in all, plus a Remote / LCOL option for lower-cost living on a city salary. Any two can be compared, such as New York City to Raleigh or Seattle to Boise.',
        ],
        table: {
          caption: 'Locations in the calculator, by state',
          columns: ['State', 'Cities'],
          rows: [
            ['Alabama', 'Montgomery'],
            ['Alaska', 'Juneau'],
            ['Arizona', 'Phoenix'],
            ['Arkansas', 'Little Rock'],
            ['California', 'Los Angeles, Sacramento, San Francisco'],
            ['Colorado', 'Denver'],
            ['Connecticut', 'Hartford'],
            ['Delaware', 'Dover'],
            ['District of Columbia', 'Washington'],
            ['Florida', 'Miami, Tallahassee'],
            ['Georgia', 'Atlanta'],
            ['Hawaii', 'Honolulu'],
            ['Idaho', 'Boise'],
            ['Illinois', 'Springfield'],
            ['Indiana', 'Indianapolis'],
            ['Iowa', 'Des Moines'],
            ['Kansas', 'Topeka'],
            ['Kentucky', 'Frankfort'],
            ['Louisiana', 'Baton Rouge'],
            ['Maine', 'Augusta'],
            ['Maryland', 'Annapolis'],
            ['Massachusetts', 'Boston'],
            ['Michigan', 'Lansing'],
            ['Minnesota', 'St. Paul'],
            ['Mississippi', 'Jackson'],
            ['Missouri', 'Jefferson City'],
            ['Montana', 'Helena'],
            ['Nebraska', 'Lincoln'],
            ['Nevada', 'Carson City'],
            ['New Hampshire', 'Concord'],
            ['New Jersey', 'Trenton'],
            ['New Mexico', 'Santa Fe'],
            ['New York', 'Albany, New York City'],
            ['North Carolina', 'Raleigh, Wilmington'],
            ['North Dakota', 'Bismarck'],
            ['Ohio', 'Columbus'],
            ['Oklahoma', 'Oklahoma City'],
            ['Oregon', 'Salem'],
            ['Pennsylvania', 'Harrisburg'],
            ['Rhode Island', 'Providence'],
            ['South Carolina', 'Columbia'],
            ['South Dakota', 'Pierre'],
            ['Tennessee', 'Nashville'],
            ['Texas', 'Austin'],
            ['Utah', 'Salt Lake City'],
            ['Vermont', 'Montpelier'],
            ['Virginia', 'Alexandria, Arlington, Richmond'],
            ['Washington', 'Olympia, Seattle'],
            ['West Virginia', 'Charleston'],
            ['Wisconsin', 'Madison'],
            ['Wyoming', 'Cheyenne'],
          ],
          note: 'Plus a generic Remote / LCOL scenario. Each location uses one approximate state income tax rate.',
        },
      },
      {
        heading: 'What the comparison leaves out.',
        paragraphs: [
          'If you keep your pay in a remote role, leave Salary Adjustment at 100%; for a pay cut, lower it. At 90% in the default scenario, the monthly difference drops to about $3,600 (illustration, not a forecast). Results are educational estimates, not tax or relocation advice.',
        ],
        bullets: [
          'Property and sales taxes. States without an income tax may collect more through these, so a 0% rate does not mean a lower total tax bill.',
          'Filing statuses other than single, itemized deductions, credits and pre-tax retirement contributions.',
          'Moving costs.',
          'The career cost of leaving a large job market. Pro adds a rough estimate of that trade-off.',
        ],
      },
    ],
    faqs: [
      {
        question: 'What is geographic arbitrage?',
        answer: 'Geographic arbitrage means earning income at rates typical of one location while spending at the cost of living of a cheaper location. For example, earning a San Francisco salary while living in a lower-cost state, or working remotely from an area with no state income tax. For people whose pay does not depend on where they live, it can widen the gap between income and spending.',
      },
      {
        question: 'Which states have no income tax?',
        answer: 'Nine states do not tax wages: Alaska, Florida, Nevada, New Hampshire, South Dakota, Tennessee, Texas, Washington and Wyoming, and the calculator uses a 0% rate for their cities. Some of them tax other kinds of income, and laws change, so check current rules for your state. States without an income tax may collect more through property taxes, sales taxes or fees.',
      },
      {
        question: 'How much can I save by relocating?',
        answer: 'It depends on your income, the two cities, your lifestyle settings and whether your pay changes. As an illustration, not a forecast: at the tool\'s defaults ($150,000, San Francisco to Austin, same pay), its approximate state rates of 9.3% and 0% put the state income tax difference at $13,950 a year, and the full monthly difference after housing and everyday costs at about $4,450. Property and sales taxes are not included, and a pay cut or higher costs could shrink the gap.',
      },
      {
        question: 'How do I find the salary I would need in another city?',
        answer: 'Set your current city, salary and lifestyle sliders, then move Salary Adjustment (50% to 150%) until the target city\'s yearly surplus matches your current one. The same lifestyle settings apply to both cities, so that pay level is a rough answer to what you would need to keep your lifestyle and savings.',
      },
      {
        question: 'Does the calculator use tax brackets for state income tax?',
        answer: 'No. Each city uses one approximate effective rate applied to your whole salary, which keeps the comparison simple but can differ from your real bill. Federal income tax does use 2026 brackets, for a single filer with the standard deduction.',
      },
      {
        question: 'Can I compare a city that is not on the list?',
        answer: 'Not directly. Pick a listed city in the same state for its state tax rate, or the Remote / LCOL option for a lower-cost area, then adjust the Housing Standard and Consumption sliders toward your local costs.',
      },
    ],
    guides: [],
    relatedTools: ['budget', 'rent-vs-buy', 'retirement-strategy'],
  },
  'net-worth': {
    slug: 'net-worth',
    name: 'Net Worth Calculator',
    shortName: 'Net Worth',
    description: 'Track your net worth, assets, and liabilities with liquidity analysis and momentum tracking.',
    intro: 'The Net Worth Calculator gives you a clear picture of your financial position by tallying your assets (cash, investments, property, retirement accounts) against your liabilities (mortgages, loans, credit cards). Beyond the headline number, it shows how much of your net worth is liquid, how many months of debt payments your liquid assets could cover, and your momentum and 10-year trajectory, so you can see not just where you are but how fast you are moving.',
    category: 'FinanceApplication',
    features: [
      'Asset and liability templates',
      'Liquid vs. illiquid split and liquidity index',
      'Months of debt payments covered',
      'Momentum and 10-year trajectory',
      'Momentum Intelligence (Pro)',
    ],
    seo: {
      title: 'Net Worth Calculator: Assets, Debts and Liquidity',
      description: 'Add your accounts, home, car and debts to get your net worth, how much of it is liquid, how many months of payments it covers, and a 10-year trajectory.',
      keywords: [
        'net worth calculator',
        'how to calculate net worth',
        'liquid net worth calculator',
        'free net worth tracker',
        'should i include my home in net worth',
      ],
    },
    sections: [
      {
        heading: 'How this net worth calculator adds it up.',
        paragraphs: [
          'Net worth is everything you own minus everything you owe, and a net worth calculator only earns its place if it makes that tally fast and repeatable. This one gives you templates for the common assets and liabilities so nothing is forgotten, and it marks each asset as liquid or illiquid so the total comes with a shape, not just a size. Enter the balance and confirm the entry; the totals update as you go, and the snapshot view shows assets, liabilities and the net figure with a liquid-versus-illiquid breakdown.',
          'A worked example: $12,000 in checking and savings, $45,000 in a brokerage account, $95,000 in a 401(k), a home entered at its $320,000 cost basis, and an $18,000 car add up to $490,000 in assets. A $240,000 mortgage, a $9,000 car loan and $22,000 in student loans total $271,000 in liabilities. Net worth is $219,000. That is the headline figure, and on its own it says nothing about whether this household could handle a lost job or a large repair — which is what the next two numbers are for.',
        ],
      },
      {
        heading: 'Why liquidity and momentum matter more than the total.',
        paragraphs: [
          'Two households with the same net worth can be in very different shape. In the example above, only $57,000 of the $490,000 is liquid — about 12%. The rest is locked in retirement accounts, a house and a car, none of which can pay a bill next week. The liquidity index shows that share directly, and the resilience figure estimates how many months of debt payments your liquid assets could cover if income stopped, using the rate and term you entered for each loan to estimate its monthly payment.',
          'Momentum is the other lens. The tool combines your monthly savings with the growth rate you set on your assets and expresses the result as a percentage of what you already have. Saving $800 a month on top of 5% growth on $200,000 of assets is about $19,600 a year, a momentum of roughly 10%. At that pace, the trajectory view shows the balance up about 80% after seven years and roughly doubled by year nine. Momentum is the number you control most directly, because savings is the input you can change next month.',
        ],
      },
      {
        heading: 'Net worth by age: how to use benchmarks without being ruled by them.',
        paragraphs: [
          'Searches for net worth by age are usually a search for reassurance, and averages are a poor source of it. Age-based figures are skewed upward by a small number of very wealthy households and say nothing about your cost of living, your career stage, or whether your home is a large share of the total. A 35-year-old renter with $150,000 in index funds and a 35-year-old owner with the same net worth tied up in a house are not in the same position, and no benchmark table captures that. The number that matters is your own, measured the same way every time.',
          'Use the calculator to set that baseline today, then repeat it quarterly with the same entries and the same valuation choices. A rising line built from rising savings is worth more than any comparison to strangers. If you want a rule of thumb anyway, treat the multiples-of-salary benchmarks as milestones to pass rather than grades to be judged on, and pay more attention to the direction and speed of your own line than to where it sits. The trajectory view is there for exactly that purpose.',
        ],
        bullets: [
          'Enter your home at cost basis plus improvements, not a guessed market price',
          'Include retirement accounts at full value; the tool tracks them as illiquid',
          'Use current payoff balances for debts, not original loan amounts',
          'Leave out anything you could not actually sell, like a pension you have not started drawing',
        ],
      },
    ],
    faqs: [
      {
        question: 'What is net worth?',
        answer: 'Net worth is the total value of everything you own (assets) minus everything you owe (liabilities). Assets include cash, investments, retirement accounts, real estate equity, and valuable personal property. Liabilities include mortgages, student loans, car loans, credit card debt, and any other obligations.',
      },
      {
        question: 'What is a good net worth by age?',
        answer: 'There is no single right number. The Federal Reserve’s 2025 Survey of Consumer Finances, released October 2026, put median U.S. family net worth at $215,900, and medians rise steeply with age: roughly $33,000 for families headed by someone under 35 and about $412,000 at 55 to 64. Medians describe a population, not a target, so tracking your own trajectory over time tells you more.',
      },
      {
        question: 'How often should I calculate my net worth?',
        answer: 'Tracking net worth monthly or quarterly provides the best balance between staying informed and not obsessing over short-term market fluctuations. The most important thing is consistency — picking a regular interval and sticking with it so you can identify trends.',
      },
      {
        question: 'Why does the template ask for my home’s cost basis instead of its market value?',
        answer: 'Market values are guesses and they swing. Cost basis plus improvements is a number you actually know, and it keeps a hot housing market from inflating your net worth on paper. If you prefer a market figure, enter it in the same field; just be consistent from one snapshot to the next.',
      },
      {
        question: 'What counts as a liquid asset here?',
        answer: 'Cash, savings, brokerage accounts and crypto are marked liquid by default: money you could reach within days without penalty. Retirement accounts, HSAs, home equity and vehicles are illiquid. You can flip the setting on any asset if your situation differs, such as a brokerage account earmarked for a near-term purchase.',
      },
      {
        question: 'Why do liabilities ask for a rate and a term?',
        answer: 'The tool estimates each debt’s monthly payment from its balance, rate and remaining term, then adds them up to see how many months of payments your liquid assets could cover. It also flags high-interest debts and short-term debts separately, since those are the ones that strain cash flow first.',
      },
      {
        question: 'What growth rate should I set for assets?',
        answer: 'Use a blended figure for everything you own, not the stock market’s return. A household whose assets are mostly a house and retirement funds might use 4–5%; one that is mostly index funds might use 6–7%. The trajectory view is a direction-of-travel estimate, so err on the low side.',
      },
      {
        question: 'Can I track my net worth over time?',
        answer: 'Yes. Save the snapshot to your free account, then come back and save a new one each quarter. Comparing saved scenarios side by side shows whether the total is rising because of savings, market growth, or debt paydown — and that is more useful than any single number.',
      },
    ],
    guides: [
      { slug: '2026-10-18-how-to-calculate-your-net-worth', label: 'How to calculate your net worth' },
      { slug: '2026-07-19-emergency-fund-how-much', label: 'How big an emergency fund should be' },
    ],
    relatedTools: ['budget', 'compound-interest', 'retirement-strategy'],
  },
  's-corp-optimizer': {
    slug: 's-corp-optimizer',
    name: 'S-Corp Tax Savings Calculator',
    shortName: 'S-Corp Optimizer',
    description: 'Calculate S-Corp tax savings and find your ideal salary/distribution split to minimize self-employment tax.',
    intro: 'The S-Corp Tax Savings Calculator helps self-employed people and small business owners estimate how much payroll tax an S corp election could save. Enter net profit and the salary you would pay yourself: it compares self-employment tax as a sole proprietor or LLC with payroll tax on that salary as an S corp, shows the distribution left over, and flags a salary that looks too low to count as reasonable compensation.',
    category: 'FinanceApplication',
    features: [
      'Sole proprietor vs. S corp payroll tax comparison',
      'Estimated self-employment tax savings',
      'Distribution amount after salary',
      'Low-salary warning for reasonable compensation',
    ],
    seo: {
      title: 'S Corp Tax Savings Calculator: S Corp vs LLC',
      description: 'Enter net profit and a reasonable salary to compare self-employment tax as an LLC with payroll tax as an S corp, and see the distribution that avoids it.',
      keywords: [
        's corp tax savings calculator',
        's corp vs llc tax calculator',
        'how much does an s corp save on self employment tax',
        'is an s corp worth it',
        's corp salary vs distribution',
      ],
    },
    sections: [
      {
        heading: 'How this s corp tax savings calculator works.',
        paragraphs: [
          'This s corp tax savings calculator compares one thing: the payroll tax you pay on business profit under each structure. As a sole proprietor or single-member LLC, self-employment tax applies to 92.35% of your net profit at a combined 15.3% rate — 12.4% for Social Security and 2.9% for Medicare. The Social Security portion stops at the annual wage base and an additional Medicare tax applies above an income threshold; the calculator applies both using current-year figures rather than a flat rate, so the estimate holds at higher profits too.',
          'With an S corp election, only the salary you run through payroll is subject to those taxes. Whatever profit remains comes out as a distribution, which is not subject to self-employment or payroll tax. The calculator computes both totals, shows the difference as estimated payroll-tax savings, reports the distribution amount that escapes those taxes, and expresses the reduction as a percentage. A bar chart puts the sole-proprietor figure next to the S corp figure so the gap is visible at a glance, and you can change the salary and watch it move.',
        ],
      },
      {
        heading: 'A worked example, and where the savings come from.',
        paragraphs: [
          'Suppose $150,000 in net profit and a $60,000 salary, both under the Social Security wage base. As a sole proprietor, 15.3% of $138,525 (92.35% of profit) is about $21,200 in self-employment tax. As an S corp, 15.3% of the $60,000 salary is $9,180. The difference — about $12,000 — is the payroll tax avoided on the $90,000 that comes out as a distribution instead of wages. Nothing else changed: same business, same profit, same owner, a different label on 60% of the money.',
          'Raise the salary to $90,000 and the savings fall to about $7,400; the arithmetic is simply 15.3% of whatever moves from salary to distribution. That is why the salary decision is the whole game, and why the IRS cares about it. The lower the salary, the larger the savings and the greater the audit exposure, and there is no formula that makes the two go away together. Use the calculator to see the savings at a defensible salary, not to find the lowest salary that produces an exciting number.',
        ],
      },
      {
        heading: 'S corp vs LLC: the costs the headline number leaves out.',
        paragraphs: [
          'The IRS requires S corp owners who work in the business to pay themselves reasonable compensation before taking distributions — roughly what you would have to pay someone else to do your job. A salary that is obviously below market invites the IRS to reclassify distributions as wages and assess back payroll taxes with penalties and interest. The savings only count if the salary would survive that test, which is why the tool asks for a proposed reasonable salary rather than an optimized one. An accountant familiar with your industry can help set it.',
          'An S corp also costs money to run. You will need a payroll service, quarterly payroll filings, W-2s at year-end, a separate corporate tax return, and possibly state franchise or entity fees depending on where you operate. Salary paid through payroll also reduces the income eligible for the qualified business income deduction, which can claw back part of the benefit at the income-tax level. Subtract all of those from the calculator’s figure before deciding; for a business with modest profit, the overhead can eat most of the savings.',
        ],
        bullets: [
          'Payroll service and filings: a recurring monthly cost',
          'Separate business tax return: higher preparation fees than a Schedule C',
          'State-level fees or taxes on S corps, which vary widely by state',
          'Reduced qualified business income deduction as salary rises',
        ],
      },
    ],
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
      {
        question: 'Why does the calculator apply self-employment tax to 92.35% of profit?',
        answer: 'Because that is how the tax is computed. A sole proprietor gets to exclude the employer-equivalent half of the tax from the base, which works out to multiplying net profit by 92.35% before applying the 15.3% rate. The S corp side has no such adjustment; payroll tax is figured on the full salary.',
      },
      {
        question: 'Does the calculator include income tax, or just payroll tax?',
        answer: 'Payroll tax only. Federal and state income tax are owed on the full profit either way — salary and distributions both flow to your personal return — so they largely cancel out of the comparison. The exception is the qualified business income deduction, which the tool notes but does not model.',
      },
      {
        question: 'Why can the savings figure go negative?',
        answer: 'If you enter a salary higher than your profit, the S corp pays payroll tax on more than the sole proprietor would owe on the whole business. The tool shows the negative figure rather than hiding it, because it means the structure costs more at that salary and you should either lower it or stay put.',
      },
      {
        question: 'How do I pick a reasonable salary to test?',
        answer: 'Start from what your role pays as an employee in your area: job listings, salary surveys, and what you would pay a replacement. Then run the calculator at that figure and at a range around it. A salary far below the market number produces exciting savings that would not survive an examination.',
      },
      {
        question: 'Is an LLC required before electing S corp status?',
        answer: 'An S corp is a tax election, not a business type. Both an LLC and a corporation can elect it by filing with the IRS. Most small owners form an LLC first and elect S corp treatment once profit is high enough that the savings clearly exceed the added payroll and filing costs.',
      },
    ],
    guides: [
      { slug: '2026-08-16-401k-guide', label: 'How a 401(k) works' },
      { slug: '2026-10-18-year-end-tax-moves-2026', label: 'Year-end tax moves for 2026' },
    ],
    relatedTools: ['s-corp-investment', 'budget', 'retirement-strategy'],
  },
  's-corp-investment': {
    slug: 's-corp-investment',
    name: 'S-Corp Retirement Contribution Calculator',
    shortName: 'S-Corp Retirement',
    description: 'For S corp owners: model solo 401(k) employee deferrals and employer profit sharing from your W-2 salary (Pro).',
    intro: 'A Pro tool for S-Corp owners: it models employee deferrals (up to $24,500 in 2026, plus an $8,000 catch-up at 50+), employer profit-sharing contributions (up to 25% of W-2 salary) and the combined limit under IRS Section 415, alongside IRA and HSA contributions, so you can see how much of your pay could go into tax-advantaged accounts.',
    category: 'FinanceApplication',
    features: [
      '401(k) deferral calculation',
      'Profit sharing optimization',
      'Catch-up contribution modeling',
      'IRS Section 415 limit tracking',
    ],
    seo: {
      title: 'S Corp Solo 401(k) Contribution Calculator',
      description: 'For S corp owners: model solo 401(k) employee deferrals and employer profit sharing from your W-2 salary, alongside IRA and HSA. A Pro tool.',
      keywords: [
        's corp solo 401k contribution calculator',
        'how much can an s corp owner contribute to a 401k',
        's corp profit sharing calculator',
        'solo 401k vs sep ira s corp',
      ],
    },
    sections: [],
    faqs: [
      {
        question: 'How much can an S-Corp owner contribute to a 401(k)?',
        answer: 'For 2026, an S-Corp owner can contribute up to $24,500 as an employee deferral ($32,500 if age 50+) plus up to 25% of W-2 salary as an employer profit-sharing contribution. The total combined limit is $72,000 ($80,000 with catch-up). This means an S-Corp owner with a $140,000 salary could contribute up to $59,500.',
      },
      {
        question: 'What is employer profit sharing in an S-Corp?',
        answer: 'Employer profit sharing allows the S-Corp to contribute up to 25% of an employee\'s W-2 compensation to their retirement plan. For an owner paying themselves a $120,000 salary, the company can contribute an additional $30,000 to their 401(k). It is a deductible business expense, which lowers the profit that passes through to your personal return.',
      },
      {
        question: 'Should I choose a Solo 401(k) or SEP IRA for my S-Corp?',
        answer: 'A Solo 401(k) is generally better for S-Corp owners because it allows both employee deferrals and employer contributions, enabling higher total contributions at lower salary levels. A SEP IRA only allows employer contributions (up to 25% of salary), so you need a higher salary to reach the same contribution level.',
      },
    ],
    guides: [
      { slug: '2026-08-16-401k-guide', label: 'How a 401(k) works' },
      { slug: '2026-10-18-2027-contribution-limits', label: '2027 contribution limits: what is official so far' },
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
    features: [
      'Coast FIRE number calculation',
      'Target age modeling',
      'Growth projection',
      'Savings milestone tracking',
    ],
    seo: {
      title: 'Coast FIRE Calculator: Find Your Coast Number by Age',
      description: 'Enter your age, retirement spending and what you\'ve invested. See your inflation-adjusted Coast FIRE number, your progress, and the years left to reach it.',
      keywords: [
        'coast fire calculator',
        'coast fire number',
        'how much do i need to coast fire',
        'coast fire number by age',
        'coast fire calculator with inflation',
        'when can i stop saving for retirement',
      ],
    },
    sections: [
      {
        heading: 'How this coast fire calculator works.',
        paragraphs: [
          'A coast fire calculator works backwards from retirement. First it finds your full FIRE target: annual spending divided by a safe withdrawal rate. At $50,000 a year and a 4% withdrawal rate, that target is $1,250,000. Then it discounts that target back to today using a real growth rate — your expected return minus inflation minus fund fees — over the number of years until you retire. The result is the balance that, left alone and untouched, grows into the full target on its own, with no further contributions from you.',
          'That discounted figure is your Coast FIRE number, and it falls fast as the horizon lengthens. With 35 years to go and 7% real growth, a $1,250,000 target needs only about $117,000 invested today. With 25 years, it needs about $230,000. With 15 years, about $453,000. The calculator plots your current balance against that line and shows a progress bar toward it, so you can see whether you have already crossed the threshold or roughly which year your current monthly contributions will carry you across it.',
        ],
      },
      {
        heading: 'Coast FIRE number by age.',
        paragraphs: [
          'Your Coast FIRE number is the amount invested today that could grow to your full retirement target by 65 with no further contributions, at the calculator\'s assumed return. The later you start, the more you need already invested.',
        ],
        table: {
          caption: 'Coast FIRE number needed today for $50,000 a year of retirement spending, retiring at 65',
          columns: ['Current age', 'Years until 65', 'Coast FIRE number today', 'Share of the $1,250,000 target'],
          rows: [
            ['25', '40', '$89,300', '7%'],
            ['30', '35', '$124,200', '10%'],
            ['35', '30', '$172,700', '14%'],
            ['40', '25', '$240,200', '19%'],
            ['45', '20', '$334,100', '27%'],
          ],
          note: 'Illustration using the calculator\'s default assumptions, not a forecast. Retirement spending of $50,000 a year in today\'s dollars (the calculator\'s default), retirement at 65, a 4% withdrawal rate, 10% growth, 3% inflation and 0.18% fees. FIRE target: $50,000 ÷ 4% = $1,250,000. The calculator\'s real rate is growth minus inflation minus fees: 10% − 3% − 0.18% = 6.82% a year. Coast number = $1,250,000 ÷ 1.0682 raised to the years until 65, assuming no further contributions. Today\'s dollars, rounded to the nearest $100. Returns are not guaranteed.',
        },
      },
      {
        heading: 'What reaching coast fire actually changes.',
        paragraphs: [
          'Coast FIRE is not retirement. It is the point where retirement savings stops being a required line in your budget. If you have $117,000 invested at 30 and never add another dollar, 7% real growth turns it into roughly $1.25 million of today’s purchasing power by 65 — enough to support $50,000 a year at a 4% withdrawal rate. Everything you earn between now and then only has to cover the life you are living now, not the one you will live later, which is a very different financial problem.',
          'That opens choices a full-savings plan does not: a lower-paying job you like more, part-time work, a sabbatical, or simply spending more without guilt. It also lowers the stakes of a bad year, because a missed contribution no longer moves the retirement date. The calculator shows the other path as well — what your balance becomes at retirement if you keep contributing at the current rate, and the annual income that balance would support — so you can compare coasting against pushing on toward full FIRE and decide which you actually want.',
        ],
      },
      {
        heading: 'The assumptions that move your coast number most.',
        paragraphs: [
          'Two inputs dominate. The first is your real growth rate. Dropping from 7% to 5% real over 30 years raises the coast number for a $1.25 million target from about $164,000 to about $289,000 — a 76% jump from two percentage points. The second is years to retirement: every year you push the retirement date out shrinks the number, and every year you pull it in raises it. Because the years sit in the exponent of the formula, a five-year change in either direction is far larger than it looks.',
          'Spending matters too, but linearly: cut planned retirement spending by 10% and both the FIRE target and the coast number drop by exactly 10%. The withdrawal rate works the same way in reverse; moving from 4% to 3.5% raises every figure by about 14%. Run the calculator with a return you would be comfortable defending through a bad decade, not the best one you can find, and treat the coast number as a floor to clear with some margin rather than a finish line to touch and stop.',
        ],
        bullets: [
          'Real growth rate: nominal return minus inflation minus fees — the tool defaults to 10% − 3% − 0.18%',
          'Years to retirement: the exponent in the formula, so small changes compound',
          'Withdrawal rate: 4% is the common default; 3.5% is more conservative and raises every number',
          'Annual spending: scales the target one-for-one',
        ],
      },
    ],
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
      {
        question: 'Why does this calculator adjust the Coast FIRE number for inflation?',
        answer: 'Because you enter spending in today’s dollars. If the tool grew your balance at a nominal 10% but compared it to a target that ignores decades of rising prices, it would overstate how far along you are. Subtracting inflation and fees from the return keeps the whole calculation in today’s purchasing power.',
      },
      {
        question: 'What does the “Projected at Retirement” figure mean?',
        answer: 'It is where your balance lands at your retirement age if you keep making the monthly contribution you entered, at the real growth rate. Compare it with the FIRE target: a projection above the target means you could ease off contributions or retire earlier; below it means you have not reached coast yet.',
      },
      {
        question: 'Should I count my home or emergency fund as invested money?',
        answer: 'No. The Coast FIRE number assumes the balance is invested and compounding at your growth rate for decades. Home equity is not liquid and cash does not grow at market rates. Enter only retirement and brokerage accounts you intend to leave invested until retirement.',
      },
      {
        question: 'I have reached my coast number. Should I actually stop contributing?',
        answer: 'Reaching the number means you could, not that you must. Many people keep contributing at a lower rate as a buffer against weaker returns or higher spending later. A common middle path is to keep capturing any employer match and redirect the rest of your savings toward nearer-term goals.',
      },
      {
        question: 'How often should I re-run the calculation?',
        answer: 'Once or twice a year is enough. Markets move your balance daily, but the coast number itself only changes when your assumptions change. Save the scenario, then update the invested balance and age annually and see whether the crossover year has moved.',
      },
    ],
    guides: [
      { slug: '2026-07-05-coast-fire-explained', label: 'Coast FIRE, explained' },
      { slug: '2026-08-23-index-fund-investing-for-beginners', label: 'Index fund investing for beginners' },
    ],
    relatedTools: ['retirement-strategy', 'compound-interest', 'net-worth'],
  },
  'capital-gains-tax': {
    slug: 'capital-gains-tax',
    name: 'Capital Gains Tax Calculator',
    shortName: 'Capital Gains Tax',
    description: 'Estimate the 2026 tax on a stock sale and see how much you can realize before each tax cliff.',
    intro: 'The Capital Gains Tax Calculator answers a single question: if you sell this much stock, what actually happens? The free version applies the 2026 0%, 15% and 20% long-term capital gains brackets, includes the 3.8% Net Investment Income Tax and Virginia state tax in every total, and shows how much gain still fits in the 0% bracket. Long-term gains stack on top of your ordinary income, so that room depends on everything else you earn. Pro adds the QBI deduction, ACA premium-tax-credit cliff and Medicare IRMAA modules.',
    category: 'FinanceApplication',
    features: [
      '0/15/20% long-term bracket ladder (2026)',
      '0%-bracket headroom calculator',
      'Next-dollar marginal rate',
      'Federal + Virginia tax breakdown, NIIT included',
      'QBI, ACA and IRMAA cliff modules (Pro)',
    ],
    seo: {
      title: '2026 Capital Gains Tax Calculator: 0% Bracket Room',
      description: 'Enter your income and a planned stock sale. See federal tax on the gain, your next-dollar rate, and the room left in the 0% bracket. Adds Virginia tax.',
      keywords: [
        'capital gains tax calculator 2026',
        'how much stock can i sell at 0 capital gains',
        '0% capital gains bracket calculator',
        'tax gain harvesting calculator',
        'long term capital gains tax calculator',
        'virginia capital gains tax calculator',
      ],
    },
    sections: [
      {
        heading: 'How this capital gains tax calculator figures the bill.',
        paragraphs: [
          'A capital gains tax calculator has to stack income in the right order. Ordinary income — wages, business profit, interest, short-term gains — fills the ordinary brackets first. Long-term gains and qualified dividends then sit on top of that stack and are taxed at 0%, 15% or 20% depending on where the total lands. The calculator uses current-year thresholds for each step, so you never have to look them up, and it recomputes every layer from adjusted gross income down to the final bill each time you move the slider.',
          'That stacking is why the same $20,000 gain can cost nothing for one household and $3,000 for another with higher wages. It also produces the most useful number on the page: headroom, the amount of gain you can still realize before the next dollar is taxed at a higher rate. The 0% headroom is the slice worth harvesting in a low-income year, such as a gap between jobs or early retirement, because it resets your cost basis upward without a federal bill. The tool lets you set the slider to that exact figure.',
        ],
      },
      {
        heading: 'Long-term gains you can take at 0% in 2026.',
        paragraphs: [
          'Long-term gains stack on top of your other taxable income, and only the part that lands below the top of the 0% bracket is free of federal tax. The table shows that room at a few wage levels, using the calculator\'s 2026 federal figures.',
        ],
        table: {
          caption: 'Long-term capital gains taxed at 0% federally in 2026, by filing status and wages',
          columns: ['Filing status', 'Wages entered in the calculator', '2026 standard deduction', 'Taxable ordinary income', 'Long-term gain taxed at 0%'],
          rows: [
            ['Single', '$30,000', '$16,100', '$13,900', '$35,550'],
            ['Single', '$50,000', '$16,100', '$33,900', '$15,550'],
            ['Single', '$75,000', '$16,100', '$58,900', '$0'],
            ['Married filing jointly', '$60,000', '$32,200', '$27,800', '$71,100'],
            ['Married filing jointly', '$90,000', '$32,200', '$57,800', '$41,100'],
            ['Married filing jointly', '$120,000', '$32,200', '$87,800', '$11,100'],
          ],
          note: 'Illustration using the calculator\'s default assumptions, not a forecast. Wages means the calculator\'s W-2 wages input, entered before the standard deduction; the calculator subtracts the 2026 standard deduction ($16,100 single, $32,200 married filing jointly) to get taxable income. The 0% bracket ends at $49,450 of taxable income for single filers and $98,900 for joint filers, so the 0% room is that figure minus taxable ordinary income. Assumes wages are the only income (the calculator\'s sample interest and dividend amounts set to $0), the standard deduction, filers under 65 and no Social Security. On those assumptions the 0% room runs out at $65,550 of wages for single filers and $131,100 for joint filers. Federal only: the calculator also adds Virginia state tax, which taxes the whole gain as ordinary income and is left out of this table. Educational only, not tax advice.',
        },
      },
      {
        heading: 'Short term vs long term capital gains.',
        paragraphs: [
          'The holding period is a bright line. Sell an asset you have held one year or less and the gain is short-term, taxed as ordinary income at your regular bracket. Hold it more than a year and it becomes long-term, eligible for the lower 0/15/20% rates. On a $20,000 gain, that can be the difference between $4,800 at a 24% ordinary rate and $3,000 at 15% — or between $6,400 at 32% and $3,000. The rate on the long-term side depends on your total taxable income, not on the size of the gain alone.',
          'The calculator keeps the two separate: short-term gains go in with your ordinary income, and the slider is for long-term gains only. That lets you see both effects at once — short-term gains raise the base your long-term gains stack on, pushing them toward the 15% and 20% steps. If you are a few weeks short of the one-year mark, the tool makes the cost of selling early explicit, and waiting is often the highest-return move available, provided the position is not so concentrated that the risk of holding outweighs the tax.',
        ],
      },
      {
        heading: 'The other layers: NIIT and state tax.',
        paragraphs: [
          'Above an income threshold, the 3.8% net investment income tax applies on top of the capital gains rate, turning the 15% bracket into 18.8% and the 20% bracket into 23.8%. On the same $20,000 gain that is another $760. The threshold is not indexed for inflation, so more households cross it each year. The free calculator includes NIIT in every total; the NIIT headroom view, the qualified business income deduction and the ACA and Medicare premium cliffs are in the Pro tier.',
          'State tax is the other layer people forget. Most states tax capital gains as ordinary income with no preferential rate, so a gain that is federally tax-free in the 0% bracket can still owe state tax on the full amount. The calculator currently models Virginia in every total and shows it as its own line in the breakdown; if you live elsewhere, treat that line as a placeholder and substitute your own state’s rate. A handful of states have no income tax at all, and the difference on a large gain is not small.',
        ],
        bullets: [
          'Ordinary income fills the brackets first; long-term gains stack on top',
          'Long-term rate steps: 0%, then 15%, then 20%, by total taxable income',
          '3.8% NIIT above a fixed income threshold (in every total; headroom view is Pro)',
          'State tax, usually at ordinary rates, on the full gain',
        ],
      },
    ],
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
        answer: 'Beyond the 0→15→20% bracket steps, a large gain can trigger the 3.8% Net Investment Income Tax (above $200k/$250k MAGI), bump your Medicare IRMAA tier (raising premiums two years later), or push you over the 400% federal-poverty ACA subsidy cliff — which forfeits the entire premium tax credit. The Pro modules flag the headroom before each one.',
      },
      {
        question: 'How are capital gains taxed in Virginia?',
        answer: 'Virginia has no preferential capital-gains rate — all gains are taxed as ordinary income at rates up to 5.75%. So even a gain that is federally tax-free in the 0% bracket still owes Virginia tax. The calculator includes Virginia state tax in every total.',
      },
      {
        question: 'What does “next-dollar marginal rate” mean on the results?',
        answer: 'It is the tax rate that would apply to one more dollar of long-term gain beyond what you have already set on the slider. When it jumps — say from 0% to 15%, or when it turns orange — you have just crossed a bracket edge. Backing the slider off to that edge is how you find the most efficient sale size.',
      },
      {
        question: 'Where do qualified dividends fit in?',
        answer: 'Qualified dividends are taxed at the same 0/15/20% rates as long-term gains and stack in the same place. The calculator asks for total ordinary dividends and then the portion that is qualified, so it can tax each piece correctly. Your brokerage’s year-end tax form splits them out for you.',
      },
      {
        question: 'How do I use the tool for tax-gain harvesting?',
        answer: 'Enter your income for the year, then look at the “gains at 0% federal” headroom figure. Realizing exactly that much gain resets your cost basis higher at no federal cost. Click the headroom figure to set the slider there, and note that state tax may still apply.',
      },
      {
        question: 'Does it account for capital losses or carryforwards?',
        answer: 'Not as a separate field. Net your losses against gains yourself and enter the result: a $30,000 gain with $10,000 of realized losses is a $20,000 gain on the slider. Remember that up to $3,000 of net loss per year can also offset ordinary income, which would lower the wages figure.',
      },
      {
        question: 'Why do I need to enter Social Security benefits?',
        answer: 'Because the taxable share of Social Security depends on your other income, including capital gains. A large sale can make more of your benefit taxable, which raises the real cost of the gain. The calculator computes that interaction and shows the taxable portion in the full breakdown.',
      },
    ],
    guides: [
      { slug: '2026-07-12-capital-gains-tax-on-stocks', label: 'How capital gains tax on stocks works' },
      { slug: '2026-10-18-year-end-tax-moves-2026', label: 'Year-end tax moves for 2026' },
    ],
    relatedTools: ['s-corp-optimizer', 'retirement-strategy', 'net-worth'],
  },
  'personality-quiz': {
    slug: 'personality-quiz',
    name: 'Money Personality Quiz',
    shortName: 'Personality Quiz',
    description: 'A free 10-question quiz that maps your money and investing instincts to one of six investor archetypes, with a secondary trait and a shareable result.',
    intro: 'This money personality quiz asks ten multiple-choice questions about how you react to market drops, windfalls and risk, and what money means to you. Your answers add up to scores across six investor archetypes: the highest is your primary type and the next is your secondary trait. It takes about two minutes, it is free, and there is no email sign-up.',
    category: 'EducationalApplication',
    features: [
      '10 multiple-choice questions, about two minutes',
      'A primary archetype plus a secondary trait',
      'Score bars for all six types',
      'Strengths, watch-outs and suggested next tools for your type',
      'A shareable result page for each archetype',
    ],
    seo: {
      title: 'Money Personality Quiz: Which of 6 Investor Types Are You?',
      description: 'Ten quick questions map how you think about money to one of six investor types, from the patient Accumulator to the Visionary. Free, no email needed.',
      keywords: [
        'money personality quiz',
        'financial personality quiz',
        'investor personality quiz',
        'what type of investor am I',
        'investing style quiz',
        'investor archetype quiz',
      ],
    },
    sections: [
      {
        heading: 'The six types in this money personality quiz.',
        paragraphs: [
          'Each type describes a way of thinking about money, with real strengths and blind spots. None is ranked above the others.',
        ],
        bullets: [
          'Accumulator: puts time and consistency first, keeps investing through downturns and lets compounding do the work. The risk is going on autopilot and letting an allocation drift.',
          'Optimizer: hunts for low costs and tax efficiency, and trusts evidence and benchmarks. The risk is adding complexity in pursuit of a theoretically perfect setup.',
          'Fortress Builder: leads with defense, meaning emergency savings, insurance, low debt and diversification. The risk is holding so much cash that inflation quietly eats into it.',
          'Tactician: follows the economy and sectors closely and adjusts based on what they see. The risk is trading too often, letting costs and taxes pile up, and never checking results against a simple index.',
          'Visionary: makes high-conviction, concentrated bets on ideas they believe in and accepts wide swings. The risk is concentration and noticing only the evidence that supports the thesis.',
          'Steward: treats money as a responsibility to family, values and legacy, and thinks across generations. The risk is letting values outweigh returns entirely, or paying more in fees for values-based funds.',
        ],
      },
      {
        heading: 'How the scoring works.',
        paragraphs: [
          'Each question has four answers. Most answers give two points to one archetype, and many also give one point to a second; one answer splits a point each between two types. After the tenth question, the points are totaled for all six types.',
          'Your highest total is your primary type, and the second highest is your secondary trait. If two types tie, the one your answer to the question about what risk means to you pointed to wins; any remaining tie follows a fixed order that starts with the Accumulator.',
          'The result bars show each score against the most that type could earn, because the maximum differs from type to type.',
        ],
      },
      {
        heading: 'This is not a risk tolerance questionnaire.',
        paragraphs: [
          'The quiz describes how you tend to think about money. It does not measure how much risk you can afford to take, and it does not recommend an investment mix. A risk tolerance questionnaire from a brokerage or advisor looks at things like your time horizon, income, savings and goals, which this quiz does not ask about.',
          'Results are descriptive, not predictive. They are for education and self-reflection, not personal financial advice.',
        ],
      },
    ],
    faqs: [
      {
        question: 'How long does the money personality quiz take?',
        answer: 'About two minutes. There are ten questions with four answers each, and you can go back to change an earlier answer before you reach the end.',
      },
      {
        question: 'Do I need to give my email?',
        answer: 'No. The quiz and your result are free, with no sign-up and no email required.',
      },
      {
        question: 'What is a secondary trait?',
        answer: 'It is the type with your second-highest score: the style you lean on after your primary one. It appears next to your primary type on the result screen and carries over when you share your result link.',
      },
      {
        question: 'Can I share my result?',
        answer: 'Yes. Each of the six types has its own result page. From the result screen you can share it to social networks or download an image sized for Instagram.',
      },
      {
        question: 'Can my result change if I retake the quiz?',
        answer: 'Yes. The result depends only on the answers you pick that time, so different answers could give a different type. The result screen has a retake button.',
      },
      {
        question: 'Is one investor type better than the others?',
        answer: 'No. Each type comes with its own strengths and its own things to watch, and the quiz does not rank them. Treat it as a prompt for reflection, not a grade.',
      },
    ],
    guides: [
      { slug: '2026-08-23-index-fund-investing-for-beginners', label: 'Index fund investing for beginners' },
    ],
    relatedTools: ['index-fund-visualizer', 'compound-interest', 'budget'],
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

const BASE_URL = 'https://moneyguymutants.com';

/**
 * Metadata for /apps/<slug>. The title is absolute, so the root layout's
 * " | Money Guy Mutants" template is not appended. Images are left to each
 * route's opengraph-image file (see SEO.md).
 */
export function toolMetadata(slug: string): Metadata {
  const content = CALCULATOR_CONTENT[slug];
  if (!content) throw new Error(`No calculator content for "${slug}"`);
  const url = `${BASE_URL}/apps/${slug}`;
  const { title, description, keywords } = content.seo;
  return {
    title: { absolute: title },
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: { type: 'website', url, title, description },
    twitter: { card: 'summary_large_image', title, description },
  };
}

/**
 * Generate JSON-LD structured data for a calculator page
 */
export function generateCalculatorJsonLd(slug: string) {
  const content = CALCULATOR_CONTENT[slug];
  if (!content) return null;

  const baseUrl = BASE_URL;

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
