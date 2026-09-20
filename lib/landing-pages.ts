/**
 * Search landing pages — /calculators/<slug>
 *
 * Each entry is a keyword-targeted page that wraps one of the existing
 * calculators in long-form, crawlable content and a clear signup CTA. They
 * are intentionally NOT linked from the main nav or footer: they exist for
 * organic search and paid traffic, and every CTA carries `?ref=lp-<slug>` so
 * signups can be attributed per page.
 *
 * Content rules (keep these when adding pages):
 *  - `keyword` is the exact phrase the page targets; it appears in the H1,
 *    title, first paragraph and at least one H2, naturally.
 *  - Numbers and rules cited in `sections`/`faqs` must be evergreen or
 *    clearly dated. Tax figures belong in the calculators, not the prose.
 *  - `faqs` should NOT duplicate the tool's own FAQs in
 *    lib/calculator-content.ts — those already render on /apps/<tool>.
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

export interface LandingFAQ {
  question: string;
  answer: string;
}

export interface LandingSection {
  /** Sentence-case H2. */
  heading: string;
  /** One or more paragraphs of plain text (no markup). */
  paragraphs: string[];
  /** Optional bullet list rendered after the paragraphs. */
  bullets?: string[];
}

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
  /** Long-form sections (2–4). */
  sections: LandingSection[];
  /** 4–6 FAQs distinct from the tool's own. */
  faqs: LandingFAQ[];
  /** CTA block copy. */
  cta: { headline: string; sub: string; button: string };
  /** Guide slugs under /guides to cross-link (must exist in content/guides). */
  relatedGuides: string[];
  /** Other landing slugs to cross-link. */
  relatedPages: string[];
  /** ISO date of last substantive content change (for the sitemap). */
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
    sections: [
      {
        heading: 'How this compound interest calculator works.',
        paragraphs: [
          'A compound interest calculator answers one question: if I keep adding money and let the returns stay invested, what do I end up with? This one compounds monthly, which matches how most brokerage and savings balances actually grow, and it treats each monthly contribution as invested at the start of that month.',
          'The formula behind it is the standard future-value equation. Your starting balance grows by (1 + rate ÷ 12) every month, and every contribution starts its own compounding clock the month it lands. The chart splits the total into two stacked pieces — what you put in, and what the market added — so the effect of time is visible rather than implied.',
        ],
      },
      {
        heading: 'Why the timeline matters more than the rate.',
        paragraphs: [
          'People fixate on squeezing an extra percent of return. Time does far more. $500 a month at 7% is about $122,000 after 15 years, about $610,000 after 30 years, and about $1.3 million after 40. The last ten years added more than the first thirty combined. That is not a trick of the math; it is the math.',
          'The practical takeaway is that starting is worth more than optimizing. A 25-year-old investing $300 a month generally ends up with more at 65 than a 35-year-old investing $600 a month, at the same return. Use the timeline slider to test that for your own numbers.',
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
        question: 'Does this calculator include monthly contributions?',
        answer:
          'Yes. Set a monthly contribution and the calculator adds it every month before compounding, so each deposit earns its own growth from the month it is made. Set it to zero to model a single lump sum.',
      },
      {
        question: 'Is the result adjusted for inflation?',
        answer:
          'The number shown is in nominal dollars at whatever rate you enter. To see purchasing power in today’s dollars, use a real return instead — subtract expected inflation (historically about 3%) from your nominal rate.',
      },
      {
        question: 'How is compound interest different from simple interest?',
        answer:
          'Simple interest only pays on your original deposit. Compound interest pays on the deposit plus everything it has already earned, so growth accelerates. Over one year the difference is small; over thirty years it is most of the money.',
      },
      {
        question: 'Does compounding daily instead of monthly change much?',
        answer:
          'Very little. At 7%, daily compounding yields about 7.25% effective; monthly yields about 7.23%. The gap is a rounding error next to the effect of one more year of contributions.',
      },
      {
        question: 'Can I save my numbers?',
        answer:
          'Yes. Create a free account and the Save button stores the scenario so you can come back, tweak it, and compare versions side by side.',
      },
    ],
    cta: {
      headline: 'Keep this projection.',
      sub: 'A free account saves your scenarios, unlocks every other calculator, and takes about 20 seconds.',
      button: 'Create free account',
    },
    relatedGuides: ['index-fund-investing-for-beginners', 'roth-ira-complete-guide', '401k-guide'],
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
    sections: [
      {
        heading: 'How this coast fire calculator works.',
        paragraphs: [
          'A coast fire calculator works backwards from retirement. First it finds your full FIRE target: annual spending divided by a safe withdrawal rate. At $50,000 a year and a 4% withdrawal rate, that target is $1,250,000. Then it discounts that target back to today using a real growth rate — your expected return minus inflation minus fund fees — over the number of years until you retire. The result is the balance that, left alone and untouched, grows into the full target on its own, with no further contributions from you.',
          'That discounted figure is your Coast FIRE number, and it falls fast as the horizon lengthens. With 35 years to go and 7% real growth, a $1,250,000 target needs only about $117,000 invested today. With 25 years, it needs about $230,000. With 15 years, about $453,000. The calculator plots your current balance against that line and shows a progress bar toward it, so you can see whether you have already crossed the threshold or roughly which year your current monthly contributions will carry you across it.',
        ],
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
        question: 'Why does this calculator adjust the Coast FIRE number for inflation?',
        answer:
          'Because you enter spending in today’s dollars. If the tool grew your balance at a nominal 10% but compared it to a target that ignores decades of rising prices, it would overstate how far along you are. Subtracting inflation and fees from the return keeps the whole calculation in today’s purchasing power.',
      },
      {
        question: 'What does the “Projected at Retirement” figure mean?',
        answer:
          'It is where your balance lands at your retirement age if you keep making the monthly contribution you entered, at the real growth rate. Compare it with the FIRE target: a projection above the target means you could ease off contributions or retire earlier; below it means you have not reached coast yet.',
      },
      {
        question: 'Should I count my home or emergency fund as invested money?',
        answer:
          'No. The Coast FIRE number assumes the balance is invested and compounding at your growth rate for decades. Home equity is not liquid and cash does not grow at market rates. Enter only retirement and brokerage accounts you intend to leave invested until retirement.',
      },
      {
        question: 'I have reached my coast number. Should I actually stop contributing?',
        answer:
          'Reaching the number means you could, not that you must. Many people keep contributing at a lower rate as a buffer against weaker returns or higher spending later. A common middle path is to keep capturing any employer match and redirect the rest of your savings toward nearer-term goals.',
      },
      {
        question: 'How often should I re-run the calculation?',
        answer:
          'Once or twice a year is enough. Markets move your balance daily, but the coast number itself only changes when your assumptions change. Save the scenario, then update the invested balance and age annually and see whether the crossover year has moved.',
      },
    ],
    cta: {
      headline: 'Keep your coast number.',
      sub: 'A free account saves this scenario so you can update the balance each year, and unlocks every other calculator on the site.',
      button: 'Create free account',
    },
    relatedGuides: ['coast-fire-explained', 'index-fund-investing-for-beginners'],
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
          'Two settings deserve attention beyond the debts themselves. The tax-deductible flag lowers a debt’s effective rate in the avalanche ordering, using the tax bracket you enter, which matters for some student loan interest and for mortgage interest if you itemize. The invest-return field sets the bar for the verdict at the bottom of the results: any debt with an after-tax APR above that number is a guaranteed return better than the market, and belongs ahead of extra investing. Anything below it is a closer call.',
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
        question: 'How does the calculator handle a debt once it is paid off?',
        answer:
          'The month a debt reaches zero, only the unused part of its minimum rolls into the extra pool. From the next month on, its full minimum is redirected to the next target. Total monthly outlay never rises above your budget; the payments just concentrate on fewer debts over time.',
      },
      {
        question: 'What is the hybrid plan and when would I use it?',
        answer:
          'The hybrid scores each debt on both interest rate and balance, weighted by the slider you set. It is for people who know the avalanche is cheaper but doubt they will stick with it. A middle setting usually clears one or two small balances early, then behaves like an avalanche.',
      },
      {
        question: 'Should I include my mortgage in the list?',
        answer:
          'Usually not. A mortgage’s rate is typically far below consumer debt and its balance would dominate the chart, hiding the differences that matter. Enter it only if you are specifically deciding whether to prepay it, and mark the interest deductible if you itemize.',
      },
      {
        question: 'What if my budget does not cover the minimum payments?',
        answer:
          'The tool warns you when the budget is below the sum of minimums, because no ordering strategy works at that point. The immediate fix is to raise the budget or negotiate a lower minimum with a lender; the calculator is only useful once every minimum is covered with something left over.',
      },
      {
        question: 'Why does the recommendation sometimes pick the snowball even though the avalanche is cheaper?',
        answer:
          'Because a small interest difference is not worth a plan you might quit. When the avalanche saves under about $500, the tool treats the two as equivalent on cost and favors the snowball for its earlier wins. Above that, it recommends the avalanche and tells you the dollar figure at stake.',
      },
    ],
    cta: {
      headline: 'Save your payoff plan.',
      sub: 'With a free account you can store this debt list, update balances each month, and watch the payoff date move closer.',
      button: 'Create free account',
    },
    relatedGuides: ['debt-avalanche-vs-snowball', 'emergency-fund-how-much'],
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
          'That $110,000 alone becomes about $237,000 after ten years at 8%. Meanwhile the house at 4% appreciation is worth about $740,000, but selling it costs about $44,000 in fees, and the buyer still owes most of the mortgage. Whether the buyer wins depends on how those pieces net out, and it is rarely obvious without running it. Rent climbing 3.5% a year — to about $3,800 by year ten — steadily tilts the answer toward buying the longer you stay, which is why the horizon slider matters as much as the price.',
        ],
      },
      {
        heading: 'Which sliders decide the answer.',
        paragraphs: [
          'Transaction costs are the quiet killer of short holds. Two percent to buy and six percent to sell means an eight percent round trip; on a $500,000 home that is $40,000 that has to be recovered through appreciation and rent savings before buying breaks even. This is why the break-even year, not the monthly payment, is the number to watch. Shorten the horizon to three or four years and the renter wins almost every scenario; stretch it past ten and the buyer usually does. The costs are the same, the time to absorb them is not.',
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
        question: 'Why does the calculator start the renter with the down payment?',
        answer:
          'Because that money exists either way. The buyer converts it into home equity; the renter keeps it and can invest it. Ignoring what the down payment would earn elsewhere is the most common way rent-vs-buy comparisons overstate the case for buying. The tool grows it at the alternative return you set.',
      },
      {
        question: 'Does the model include the mortgage interest deduction?',
        answer:
          'Not in the base comparison. Many households take the standard deduction and get no benefit from mortgage interest, and the benefit that does exist shrinks each year as interest falls. If you itemize and expect a meaningful deduction, treat the buy result as slightly conservative.',
      },
      {
        question: 'What does the break-even year mean?',
        answer:
          'It is the first year in which buying’s net worth exceeds renting’s and stays higher for the rest of the horizon. If the tool shows no break-even, renting wins at every year you selected. Extending the horizon or lowering the selling cost are the two changes most likely to produce one.',
      },
      {
        question: 'How should I set the time horizon?',
        answer:
          'Use the number of years you genuinely expect to stay in this specific home, not how long you plan to be a homeowner. Job changes, family growth and neighborhood shifts drive moves earlier than people expect. Run it at your honest guess and at three years shorter to see how sensitive the answer is.',
      },
      {
        question: 'Can I model a 15-year mortgage or an adjustable rate?',
        answer:
          'The comparison assumes a 30-year fixed loan, which is the most common case. For a 15-year loan, the monthly payment is higher but equity builds faster; you can approximate the effect by raising the rate slightly for a conservative view, but the tool does not change the amortization term directly.',
      },
    ],
    cta: {
      headline: 'Save both scenarios.',
      sub: 'A free account keeps this comparison so you can rerun it with real listings, and unlocks the rest of the calculators.',
      button: 'Create free account',
    },
    relatedGuides: ['rent-vs-buy-a-home', 'emergency-fund-how-much'],
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
    sections: [
      {
        heading: 'How much car can I afford under the 20/3/8 rule?',
        paragraphs: [
          'The honest answer to how much car can I afford is a payment question, not a sticker-price question. The 20/3/8 rule sets three limits: put at least 20% down, finance for no more than three years, and keep the monthly payment at or under 8% of your gross monthly income. This car affordability calculator holds the second and third limits fixed and solves for the price. Enter your income and the loan rate you expect, and it reports the most car that payment supports along with the loan amount, interest and total paid.',
          'On $150,000 a year, gross monthly income is $12,500 and 8% of that is $1,000. At a 4% APR over 36 months, $1,000 a month supports a loan of about $33,900. With 20% down, that loan buys a car priced around $42,300, with roughly $2,100 of total interest over the three years. On $60,000 a year, the same math gives a $400 payment, a $13,500 loan, and a price near $16,900. Neither figure is what a dealer would try to sell you, and that is the point of the rule.',
        ],
      },
      {
        heading: 'Why the three-year cap does most of the work.',
        paragraphs: [
          'Dealers sell payments, and stretching the term is how they make an expensive car look cheap. A $30,000 loan at 6% is about $913 a month over three years but only about $438 over seven. The seven-year version costs about $6,800 in interest instead of about $2,900, and for most of that period you owe more than the car is worth, because the balance falls slower than the value does. The lower payment is real; so is the extra $3,900 in interest and the years spent underwater.',
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
        question: 'Does the 8% limit cover insurance and fuel too?',
        answer:
          'In this calculator, no — the 8% is applied to the loan payment alone, which is the strict version of the rule. Some versions fold in all operating costs. If you use the tool’s number, budget insurance, fuel and maintenance separately, or mentally lower the payment ceiling to leave room for them.',
      },
      {
        question: 'What if I already have a car loan?',
        answer:
          'Enter the current monthly payment in the existing-payments field. The tool subtracts it from your 8% budget before sizing a new loan, so two cars together stay under the limit. If the existing payment already consumes the whole budget, the maximum price drops to zero — the rule is telling you to wait.',
      },
      {
        question: 'Can I use the calculator if I plan to pay cash?',
        answer:
          'Set the down payment slider to its maximum and the tool will size the price accordingly, but the rule was written for financed purchases. For a cash purchase the better test is whether the car is a small fraction of your liquid net worth and leaves your emergency fund untouched.',
      },
      {
        question: 'Should I put more than 20% down to afford a nicer car?',
        answer:
          'The calculator lets you see that a bigger down payment raises the allowed price, but the rule’s intent is the opposite: 20% is a floor that keeps you from being underwater, not a lever for buying more. Extra cash is usually better kept liquid or invested than sunk into a depreciating asset.',
      },
      {
        question: 'Does this work for a used car?',
        answer:
          'Yes, and it works better. Used-car loan rates are often somewhat higher, so enter the rate you have been quoted, but the price the rule allows buys far more car on the used market because the first owner absorbed the steepest depreciation. The 20/3/8 limits apply the same way.',
      },
    ],
    cta: {
      headline: 'Keep your car budget.',
      sub: 'A free account saves this number so you can check listings against it, and gives you every other calculator on the site.',
      button: 'Create free account',
    },
    relatedGuides: ['50-30-20-budget-rule', 'emergency-fund-how-much'],
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
          'Suppose $150,000 in net profit and a $60,000 salary, both under the Social Security wage base. As a sole proprietor, 15.3% of $138,525 (92.35% of profit) is about $21,200 in self-employment tax. As an S corp, 15.3% of the $60,000 salary is $9,180. The difference — about $12,000 — is the payroll tax avoided on the $90,000 that comes out as a distribution instead of wages. Nothing else changed: same business, same profit, same owner, a different label on two-thirds of the money.',
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
        question: 'Why does the calculator apply self-employment tax to 92.35% of profit?',
        answer:
          'Because that is how the tax is computed. A sole proprietor gets to exclude the employer-equivalent half of the tax from the base, which works out to multiplying net profit by 92.35% before applying the 15.3% rate. The S corp side has no such adjustment; payroll tax is figured on the full salary.',
      },
      {
        question: 'Does the calculator include income tax, or just payroll tax?',
        answer:
          'Payroll tax only. Federal and state income tax are owed on the full profit either way — salary and distributions both flow to your personal return — so they largely cancel out of the comparison. The exception is the qualified business income deduction, which the tool notes but does not model.',
      },
      {
        question: 'Why can the savings figure go negative?',
        answer:
          'If you enter a salary higher than your profit, the S corp pays payroll tax on more than the sole proprietor would owe on the whole business. The tool shows the negative figure rather than hiding it, because it means the structure costs more at that salary and you should either lower it or stay put.',
      },
      {
        question: 'How do I pick a reasonable salary to test?',
        answer:
          'Start from what your role pays as an employee in your area: job listings, salary surveys, and what you would pay a replacement. Then run the calculator at that figure and at a range around it. A salary far below the market number produces exciting savings that would not survive an examination.',
      },
      {
        question: 'Is an LLC required before electing S corp status?',
        answer:
          'An S corp is a tax election, not a business type. Both an LLC and a corporation can elect it by filing with the IRS. Most small owners form an LLC first and elect S corp treatment once profit is high enough that the savings clearly exceed the added payroll and filing costs.',
      },
    ],
    cta: {
      headline: 'Keep your salary split.',
      sub: 'A free account saves this scenario so you can compare salary levels with your accountant, and opens every other calculator.',
      button: 'Create free account',
    },
    relatedGuides: ['401k-guide'],
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
    sections: [
      {
        heading: 'How this capital gains tax calculator figures the bill.',
        paragraphs: [
          'A capital gains tax calculator has to stack income in the right order. Ordinary income — wages, business profit, interest, short-term gains — fills the ordinary brackets first. Long-term gains and qualified dividends then sit on top of that stack and are taxed at 0%, 15% or 20% depending on where the total lands. The calculator uses current-year thresholds for each step, so you never have to look them up, and it recomputes every layer from adjusted gross income down to the final bill each time you move the slider.',
          'That stacking is why the same $20,000 gain can cost nothing for one household and $3,000 for another with higher wages. It also produces the most useful number on the page: headroom, the amount of gain you can still realize before the next dollar is taxed at a higher rate. The 0% headroom is the slice worth harvesting in a low-income year, such as a gap between jobs or early retirement, because it resets your cost basis upward without a federal bill. The tool lets you set the slider to that exact figure.',
        ],
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
          'Above an income threshold, the 3.8% net investment income tax applies on top of the capital gains rate, turning the 15% bracket into 18.8% and the 20% bracket into 23.8%. On the same $20,000 gain that is another $760. The threshold is not indexed for inflation, so more households cross it each year. Modeling it, along with the qualified business income deduction and the ACA and Medicare premium cliffs, is part of the Pro tier of this tool, but the mechanism is worth knowing before any large sale.',
          'State tax is the other layer people forget. Most states tax capital gains as ordinary income with no preferential rate, so a gain that is federally tax-free in the 0% bracket can still owe state tax on the full amount. The calculator currently models Virginia in every total and shows it as its own line in the breakdown; if you live elsewhere, treat that line as a placeholder and substitute your own state’s rate. A handful of states have no income tax at all, and the difference on a large gain is not small.',
        ],
        bullets: [
          'Ordinary income fills the brackets first; long-term gains stack on top',
          'Long-term rate steps: 0%, then 15%, then 20%, by total taxable income',
          '3.8% NIIT above a fixed income threshold (Pro module)',
          'State tax, usually at ordinary rates, on the full gain',
        ],
      },
    ],
    faqs: [
      {
        question: 'What does “next-dollar marginal rate” mean on the results?',
        answer:
          'It is the tax rate that would apply to one more dollar of long-term gain beyond what you have already set on the slider. When it jumps — say from 0% to 15%, or when it turns orange — you have just crossed a bracket edge. Backing the slider off to that edge is how you find the most efficient sale size.',
      },
      {
        question: 'Where do qualified dividends fit in?',
        answer:
          'Qualified dividends are taxed at the same 0/15/20% rates as long-term gains and stack in the same place. The calculator asks for total ordinary dividends and then the portion that is qualified, so it can tax each piece correctly. Your brokerage’s year-end tax form splits them out for you.',
      },
      {
        question: 'How do I use the tool for tax-gain harvesting?',
        answer:
          'Enter your income for the year, then look at the “gains at 0% federal” headroom figure. Realizing exactly that much gain resets your cost basis higher at no federal cost. Click the headroom figure to set the slider there, and note that state tax may still apply.',
      },
      {
        question: 'Does it account for capital losses or carryforwards?',
        answer:
          'Not as a separate field. Net your losses against gains yourself and enter the result: a $30,000 gain with $10,000 of realized losses is a $20,000 gain on the slider. Remember that up to $3,000 of net loss per year can also offset ordinary income, which would lower the wages figure.',
      },
      {
        question: 'Why do I need to enter Social Security benefits?',
        answer:
          'Because the taxable share of Social Security depends on your other income, including capital gains. A large sale can make more of your benefit taxable, which raises the real cost of the gain. The calculator computes that interaction and shows the taxable portion in the full breakdown.',
      },
    ],
    cta: {
      headline: 'Plan the sale before you make it.',
      sub: 'A free account saves this scenario so you can revisit it before year-end, and unlocks every other calculator on the site.',
      button: 'Create free account',
    },
    relatedGuides: ['capital-gains-tax-on-stocks', 'index-fund-investing-for-beginners'],
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
          'Momentum is the other lens. The tool combines your monthly savings with the growth rate you set on your assets and expresses the result as a percentage of what you already have. Saving $800 a month on top of 5% growth on $200,000 of assets is about $19,600 a year, a momentum of roughly 10%. At that pace, the trajectory view shows the balance nearly doubling in about seven years. Momentum is the number you control most directly, because savings is the input you can change next month.',
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
        question: 'Why does the template ask for my home’s cost basis instead of its market value?',
        answer:
          'Market values are guesses and they swing. Cost basis plus improvements is a number you actually know, and it keeps a hot housing market from inflating your net worth on paper. If you prefer a market figure, enter it in the same field; just be consistent from one snapshot to the next.',
      },
      {
        question: 'What counts as a liquid asset here?',
        answer:
          'Cash, savings, brokerage accounts and crypto are marked liquid by default: money you could reach within days without penalty. Retirement accounts, HSAs, home equity and vehicles are illiquid. You can flip the setting on any asset if your situation differs, such as a brokerage account earmarked for a near-term purchase.',
      },
      {
        question: 'Why do liabilities ask for a rate and a term?',
        answer:
          'The tool estimates each debt’s monthly payment from its balance, rate and remaining term, then adds them up to see how many months of payments your liquid assets could cover. It also flags high-interest debts and short-term debts separately, since those are the ones that strain cash flow first.',
      },
      {
        question: 'What growth rate should I set for assets?',
        answer:
          'Use a blended figure for everything you own, not the stock market’s return. A household whose assets are mostly a house and retirement funds might use 4–5%; one that is mostly index funds might use 6–7%. The trajectory view is a direction-of-travel estimate, so err on the low side.',
      },
      {
        question: 'Can I track my net worth over time?',
        answer:
          'Yes. Save the snapshot to your free account, then come back and save a new one each quarter. Comparing saved scenarios side by side shows whether the total is rising because of savings, market growth, or debt paydown — and that is more useful than any single number.',
      },
    ],
    cta: {
      headline: 'Save this snapshot.',
      sub: 'A free account stores your net worth so you can add a new snapshot each quarter, and unlocks every other calculator on the site.',
      button: 'Create free account',
    },
    relatedGuides: ['emergency-fund-how-much', '401k-guide', 'roth-ira-complete-guide'],
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

export function getAllLandingSlugs(): { slug: string; updated: string }[] {
  return LANDING_PAGES.map((p) => ({ slug: p.slug, updated: p.updated }));
}

/** The tool content record backing a landing page (name, features, category). */
export function landingToolContent(page: LandingPage) {
  return CALCULATOR_CONTENT[page.tool];
}

/** `?ref=` value carried on every CTA for signup attribution. */
export function landingRef(slug: string): string {
  return `lp-${slug}`;
}
