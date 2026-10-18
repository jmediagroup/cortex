/**
 * Search landing pages — /calculators/<slug>
 *
 * Each entry wraps one of the existing calculators in a keyword-led hero and a
 * signup CTA, for paid traffic: every CTA carries `?ref=lp-<slug>`, so
 * signups can be attributed per page. They are not linked from the nav.
 *
 * `/apps/<tool>` owns the organic query (TARGET-QUERIES.md, D-A), so these
 * pages point their canonical there and stay out of the sitemap. The long-form
 * sections, FAQs and guide links render from the tool's entry in
 * lib/calculator-content.ts; only the hero, steps and CTA live here.
 *
 * Content rules (keep these when adding pages):
 *  - `keyword` is the exact phrase the page targets; it appears in the H1 and
 *    title, naturally.
 *  - Sentence-case headlines ending in a period (site voice).
 */

import { CALCULATOR_CONTENT } from '@/lib/calculator-content';

export type LandingToolKey =
  | 'compound-interest'
  | 'coast-fire'
  | 'debt-paydown'
  | 'rent-vs-buy'
  | 'car-affordability'
  | 's-corp-optimizer'
  | 'capital-gains-tax'
  | 'net-worth';

export interface LandingPage {
  /** URL slug under /calculators/. Should be (or contain) the keyword. */
  slug: string;
  /** Key into CALCULATOR_CONTENT + the embedded component map. */
  tool: LandingToolKey;
  /** Exact target search phrase, lower case. */
  keyword: string;
  /** <title> without the site suffix. ≤ 60 chars. */
  metaTitle: string;
  /** Meta description. 140–160 chars. */
  metaDescription: string;
  /** Extra keyword variants for the meta keywords tag. */
  keywords: string[];
  /** H1. Sentence case, ends with a period. */
  h1: string;
  /** One-sentence subhead under the H1. */
  subhead: string;
  /** Three short "what you'll get" bullets shown beside the calculator. */
  promise: [string, string, string];
  /** Three numbered steps under "How it works". */
  howItWorks: [string, string, string];
  /** CTA block copy. */
  cta: { headline: string; sub: string; button: string };
  /** Other landing slugs to cross-link. */
  relatedPages: string[];
  /** ISO date of last substantive content change. */
  updated: string;
}

export const LANDING_PAGES: LandingPage[] = [
  {
    slug: 'compound-interest-calculator',
    tool: 'compound-interest',
    keyword: 'compound interest calculator',
    metaTitle: 'Free Compound Interest Calculator (Monthly Contributions)',
    metaDescription:
      'Free compound interest calculator with monthly contributions. See year-by-year growth, interest vs. what you put in, and what a different rate or timeline changes.',
    keywords: [
      'compound interest calculator',
      'compound interest calculator monthly contributions',
      'savings growth calculator',
      'investment growth calculator',
      'daily compound interest calculator',
      'how does compound interest work',
    ],
    h1: 'Compound interest calculator.',
    subhead:
      'Enter what you have, what you can add each month, and a return rate. See the year-by-year growth and exactly how much of the final number is interest.',
    promise: [
      'Year-by-year chart of contributions vs. interest earned',
      'Adjust rate, timeline and monthly amount instantly',
      'Save the scenario to your free account and compare later',
    ],
    howItWorks: [
      'Start with your current balance and how much you can add every month.',
      'Set an expected annual return — 7% is a common long-run stock market assumption after inflation.',
      'Drag the timeline out. Watch the interest line overtake the contribution line; that crossover is compounding doing the work.',
    ],
    cta: {
      headline: 'Keep this projection.',
      sub: 'A free account saves your scenarios, unlocks every other calculator, and takes about 20 seconds.',
      button: 'Create free account',
    },
    relatedPages: ['coast-fire-calculator', 'net-worth-calculator'],
    updated: '2026-09-20',
  },
  {
    slug: 'coast-fire-calculator',
    tool: 'coast-fire',
    keyword: 'coast fire calculator',
    metaTitle: 'Coast FIRE Calculator (Free): Find Your Coast Number',
    metaDescription:
      'Free Coast FIRE calculator. Enter your age, spending and investments to see the number where compounding alone funds retirement, and how far along you are.',
    keywords: [
      'coast fire calculator',
      'coast fire number',
      'coast fi calculator',
      'coast fire calculator with inflation',
      'when can i stop saving for retirement',
      'coast fire vs fire',
      'barista fire calculator',
    ],
    h1: 'Coast FIRE calculator.',
    subhead:
      'Enter your age, target retirement age, annual spending and what you have invested. See the balance that lets you stop contributing and still retire on time.',
    promise: [
      'Your inflation-adjusted Coast FIRE number and a progress bar toward it',
      'Projected balance at retirement with and without further contributions',
      'Save the scenario to your free account and re-run it as your balance changes',
    ],
    howItWorks: [
      'Enter your current age, the age you want to retire, and what you expect to spend per year in retirement.',
      'Add your current invested balance and monthly contribution, then set growth, inflation and withdrawal-rate assumptions (or keep the defaults).',
      'Read the Coast FIRE number. If your balance is above it, you could stop contributing today; if not, the chart shows the year you cross it.',
    ],
    cta: {
      headline: 'Keep your coast number.',
      sub: 'A free account saves this scenario so you can update the balance each year, and unlocks every other calculator on the site.',
      button: 'Create free account',
    },
    relatedPages: ['compound-interest-calculator', 'net-worth-calculator'],
    updated: '2026-09-20',
  },
  {
    slug: 'debt-snowball-calculator',
    tool: 'debt-paydown',
    keyword: 'debt snowball calculator',
    metaTitle: 'Debt Snowball Calculator vs. Avalanche (Free Payoff Tool)',
    metaDescription:
      'Free debt snowball calculator that runs the avalanche method side by side. Enter each balance, rate and minimum to see payoff date and total interest for both.',
    keywords: [
      'debt snowball calculator',
      'debt avalanche calculator',
      'debt payoff calculator',
      'snowball vs avalanche calculator',
      'debt payoff planner',
      'credit card payoff calculator',
      'how long to pay off debt',
    ],
    h1: 'Debt snowball calculator.',
    subhead:
      'List your debts, set a monthly payoff budget, and compare the snowball, avalanche and a hybrid plan on payoff time and total interest.',
    promise: [
      'Payoff month and total interest for snowball, avalanche and hybrid, side by side',
      'A month-by-month balance chart so you can see where each plan pulls ahead',
      'Save your debt list to your free account and update it as balances fall',
    ],
    howItWorks: [
      'Add each debt with its name, balance, APR and minimum payment. Flag any whose interest is tax-deductible.',
      'Enter the total you can put toward debt every month. Anything above the minimums is the extra that gets targeted.',
      'Compare the three cards. The recommendation tells you whether the avalanche’s interest savings are big enough to justify it, or whether the snowball’s quick wins are the better call.',
    ],
    cta: {
      headline: 'Save your payoff plan.',
      sub: 'With a free account you can store this debt list, update balances each month, and watch the payoff date move closer.',
      button: 'Create free account',
    },
    relatedPages: ['net-worth-calculator', 'compound-interest-calculator'],
    updated: '2026-09-20',
  },
  {
    slug: 'rent-vs-buy-calculator',
    tool: 'rent-vs-buy',
    keyword: 'rent vs buy calculator',
    metaTitle: 'Rent vs Buy Calculator: Net Worth After 5, 10, 20 Years',
    metaDescription:
      'Free rent vs buy calculator that compares net worth, not just monthly payments. Set price, rent, rate and horizon, then adjust appreciation and maintenance.',
    keywords: [
      'rent vs buy calculator',
      'rent or buy calculator',
      'should i rent or buy',
      'buy vs rent home calculator',
      'renting vs buying a house',
      'rent vs buy break even',
    ],
    h1: 'Rent vs buy calculator.',
    subhead:
      'Compare what you would be worth after renting and investing the difference versus buying, with every assumption exposed as a slider.',
    promise: [
      'A year-by-year net worth line for renting and for buying, over your chosen horizon',
      'The break-even year where buying pulls ahead and stays ahead — if it ever does',
      'Save the scenario to your free account and rerun it when rates or prices move',
    ],
    howItWorks: [
      'Enter the purchase price, down payment percentage, mortgage rate, and the rent you would pay instead.',
      'Pick a time horizon, then adjust the reality sliders: home appreciation, rent inflation, investment return, maintenance, property tax and transaction costs.',
      'Read the verdict and the chart. The gap between the two lines at your horizon is the cost of choosing wrong.',
    ],
    cta: {
      headline: 'Save both scenarios.',
      sub: 'A free account keeps this comparison so you can rerun it with real listings, and unlocks the rest of the calculators.',
      button: 'Create free account',
    },
    relatedPages: ['how-much-car-can-i-afford', 'net-worth-calculator'],
    updated: '2026-09-20',
  },
  {
    slug: 'how-much-car-can-i-afford',
    tool: 'car-affordability',
    keyword: 'how much car can i afford',
    metaTitle: 'How Much Car Can I Afford? Free 20/3/8 Rule Calculator',
    metaDescription:
      'Answer “how much car can I afford” with the 20/3/8 rule: 20% down, 3-year loan, payment under 8% of income. Enter your income and loan rate to get a price.',
    keywords: [
      'how much car can i afford',
      'car affordability calculator',
      '20/3/8 rule',
      '20/3/8 car rule calculator',
      'car budget calculator',
      'how much should i spend on a car',
    ],
    h1: 'How much car can I afford?',
    subhead:
      'Enter your gross income and an expected loan rate. The calculator sizes a car price around the 20/3/8 rule so the payment stays under 8% of what you earn.',
    promise: [
      'A maximum car price based on your income, loan rate and down payment',
      'The monthly payment, loan amount, total interest and total paid over 3 years',
      'Save the result to your free account and compare it against real listings',
    ],
    howItWorks: [
      'Enter your annual gross income and the APR you expect on an auto loan. Add any existing car payment so the tool subtracts it from the budget.',
      'Set your down payment percentage. Twenty percent meets the rule; the tool flags anything lower.',
      'Read the maximum price. The payment is fixed at 8% of gross monthly income over 36 months, so the price is the most car that budget supports.',
    ],
    cta: {
      headline: 'Keep your car budget.',
      sub: 'A free account saves this number so you can check listings against it, and gives you every other calculator on the site.',
      button: 'Create free account',
    },
    relatedPages: ['rent-vs-buy-calculator', 'debt-snowball-calculator'],
    updated: '2026-09-20',
  },
  {
    slug: 's-corp-tax-savings-calculator',
    tool: 's-corp-optimizer',
    keyword: 's corp tax savings calculator',
    metaTitle: 'S Corp Tax Savings Calculator: Salary vs. Distribution',
    metaDescription:
      'Free S corp tax savings calculator. Enter net profit and a reasonable salary to compare self-employment tax as a sole proprietor with payroll tax as an S corp.',
    keywords: [
      's corp tax savings calculator',
      's corp vs llc tax calculator',
      'reasonable salary s corp',
      's corp salary calculator',
      's corp election tax savings',
      'self employment tax vs s corp',
      's corp distribution calculator',
    ],
    h1: 'S corp tax savings calculator.',
    subhead:
      'Enter your business profit and the salary you would pay yourself. See the payroll-tax difference between staying a sole proprietor and electing S corp status.',
    promise: [
      'Estimated payroll-tax savings versus a sole proprietorship, in dollars and as a percentage',
      'The distribution amount left after salary — the part that avoids self-employment tax',
      'Save the scenario to your free account and test several salary levels',
    ],
    howItWorks: [
      'Enter your annual net profit — revenue minus business expenses, before paying yourself.',
      'Enter the salary you would pay yourself through payroll. It must be reasonable for your role and industry.',
      'Compare the two bars. The gap is the self-employment tax you would no longer pay on the distribution portion.',
    ],
    cta: {
      headline: 'Keep your salary split.',
      sub: 'A free account saves this scenario so you can compare salary levels with your accountant, and opens every other calculator.',
      button: 'Create free account',
    },
    relatedPages: ['capital-gains-tax-calculator', 'compound-interest-calculator'],
    updated: '2026-09-20',
  },
  {
    slug: 'capital-gains-tax-calculator',
    tool: 'capital-gains-tax',
    keyword: 'capital gains tax calculator',
    metaTitle: 'Capital Gains Tax Calculator: Long-Term vs. Short-Term',
    metaDescription:
      'Free capital gains tax calculator. Enter your income and a planned stock sale to see the tax on the gain, the rate on the next dollar, and 0% bracket headroom.',
    keywords: [
      'capital gains tax calculator',
      'long term capital gains tax calculator',
      'short term vs long term capital gains',
      'capital gains tax on stocks calculator',
      'how much tax on stock sale',
      '0% capital gains bracket calculator',
      'capital gains tax rate',
    ],
    h1: 'Capital gains tax calculator.',
    subhead:
      'Enter your other income, then slide the gain you plan to realize. See the tax on that gain, the effective rate, and how much more you can sell before the rate steps up.',
    promise: [
      'Federal and state tax on the gain, the effective rate, and what you keep after tax',
      'The room left in the 0% long-term bracket and the marginal rate on the next dollar',
      'A full breakdown from income to taxable income to each layer of tax',
    ],
    howItWorks: [
      'Enter your filing status and income before the sale: wages, business income, interest, dividends and any short-term gains.',
      'Choose the standard deduction or enter itemized deductions.',
      'Slide the long-term gain you are considering. The stats update with the tax on that gain, the next-dollar rate, and headroom before the next bracket.',
    ],
    cta: {
      headline: 'Plan the sale before you make it.',
      sub: 'A free account saves this scenario so you can revisit it before year-end, and unlocks every other calculator on the site.',
      button: 'Create free account',
    },
    relatedPages: ['s-corp-tax-savings-calculator', 'compound-interest-calculator'],
    updated: '2026-09-20',
  },
  {
    slug: 'net-worth-calculator',
    tool: 'net-worth',
    keyword: 'net worth calculator',
    metaTitle: 'Net Worth Calculator (Free): Assets, Debts & Momentum',
    metaDescription:
      'Free net worth calculator. Add your accounts, property and debts to get your net worth, liquidity ratio and a 10-year trajectory from savings and growth rate.',
    keywords: [
      'net worth calculator',
      'how to calculate net worth',
      'net worth by age',
      'net worth tracker',
      'personal net worth calculator',
      'what is my net worth',
      'net worth spreadsheet alternative',
    ],
    h1: 'Net worth calculator.',
    subhead:
      'Add what you own and what you owe from a set of templates. Get your net worth, how much of it is liquid, and where it is headed over ten years.',
    promise: [
      'Your net worth, total assets and total liabilities, with a liquid vs. illiquid split',
      'A ten-year trajectory driven by your monthly savings and expected asset growth',
      'Save the snapshot to your free account and add a new one each quarter',
    ],
    howItWorks: [
      'Add assets from the templates — checking, savings, 401(k), IRA, HSA, home, vehicle, brokerage — and enter each balance.',
      'Add liabilities the same way: mortgage, car loan, student loan, credit cards, with balance, rate and remaining term.',
      'Set your monthly savings and an expected growth rate. Switch to the trajectory view to see where the number goes.',
    ],
    cta: {
      headline: 'Save this snapshot.',
      sub: 'A free account stores your net worth so you can add a new snapshot each quarter, and unlocks every other calculator on the site.',
      button: 'Create free account',
    },
    relatedPages: ['coast-fire-calculator', 'debt-snowball-calculator'],
    updated: '2026-09-20',
  },
];

export const LANDING_BY_SLUG: Record<string, LandingPage> = Object.fromEntries(
  LANDING_PAGES.map((p) => [p.slug, p]),
);

export function getLandingPage(slug: string): LandingPage | null {
  return LANDING_BY_SLUG[slug] ?? null;
}

/** The tool content record backing a landing page (name, features, category). */
export function landingToolContent(page: LandingPage) {
  return CALCULATOR_CONTENT[page.tool];
}

/** `?ref=` value carried on every CTA for signup attribution. */
export function landingRef(slug: string): string {
  return `lp-${slug}`;
}
