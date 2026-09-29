# Phase 5 — target queries per tool (draft for Drew's approval)

**Status:** Draft, 2026-09-29. Nothing here is published or live. The Phase 5 kickoff (`HANDOFF.md` §12) says: "Draft (don't publish) a list of target queries per tool for my approval first." No content gets written until Drew marks each tool approved, edited or dropped (checklist at the end).

**What this is based on:** repository reads only (`lib/calculator-content.ts`, `lib/landing-pages.ts`, `app/apps/*/layout.tsx` and `page.tsx`, `components/apps/*.tsx`, `content/guides/`, `lib/tools-registry.ts`, `app/sitemap.ts`, `app/robots.ts`, `docs/monetization/AUDIT.md`, `PILOT-TOOLS.md`) plus general knowledge of how these search results usually look. **This document contains no search volumes, rankings or click numbers, because none have been measured.** Wherever a number would go, it says "volume unknown; verify in Search Console/Keyword Planner."

**Traffic (last 30 days, tool page views):** coast-fire 71 · rent-vs-buy 12 · index-fund-visualizer 5 · budget 3 · compound-interest 3 · geographic-arbitrage 3 · every other tool ≤2 · `/calculators/*` 0 ever.

### Conventions
- **Intent types:** calculator/do · learn/explain · compare/decide.
- **Titles:** `app/layout.tsx` uses the template `%s | Money Guy Mutants`, which adds 20 characters. Every suggested page title is ≤40 characters, so the full `<title>` stays ≤60. The lengths shown are for the full rendered tag. Current titles run 69–88 characters rendered and get truncated in results.
- **Meta descriptions:** ≤155 characters. Current ones run 134–218, and 10 of 16 are over 155.
- **Copy rules applied:**
  - Plain, confident claims that the *free* tool actually delivers.
  - No "best", no "guaranteed", no return figures. Use "could", not "will". Keep the framing educational.
  - No Money Guy Show names, phrases or look in suggested copy.
  - Every page keeps the existing footer disclaimer: "Money Guy Mutants is an independent, fan-made project … not affiliated with, endorsed by, or sponsored by The Money Guy Show or Abound Wealth Management, LLC."
- **Free vs Pro:** a query is assigned to a page only if a signed-out visitor gets the answer without paying. Where the answer is Pro-only, that is called out.
- **Out of scope:** queries that use the show's name, the hosts' names, or its signature frameworks and catchphrases. The same goes for the existing `/the-money-guy-show` and `/financial-mutants` pages. Those are Drew's call, not part of this list.

---

## 0. Decisions needed before any content is written

### D-A. Who owns each head query (cannibalization)

Eight tools have two URLs chasing the same query. For car affordability, a guide targets it too, so three URLs compete. In each pair, both URLs point their canonical at themselves and embed the same calculator.

| Tool | `/apps/<tool>` title targets | `/calculators/<slug>` keyword | Guide in the same space |
|---|---|---|---|
| coast-fire | "Coast FIRE Calculator" | coast fire calculator | `2026-07-05-coast-fire-explained` (learn, fine) |
| rent-vs-buy | "Rent vs Buy Calculator" | rent vs buy calculator | `2026-07-26-rent-vs-buy-a-home` (learn, fine) |
| compound-interest | "Compound Interest Calculator" | compound interest calculator | none |
| debt-paydown | "Debt Payoff Calculator - Avalanche vs Snowball" | debt snowball calculator | `2026-07-02-debt-avalanche-vs-snowball` (compare, fine) |
| car-affordability | "Car Affordability Calculator" | how much car can i afford | **`2026-09-27-how-much-car-can-you-afford`: same query, 3 URLs** |
| s-corp-optimizer | "S-Corp Tax Calculator" | s corp tax savings calculator | none |
| capital-gains-tax | "Capital Gains Tax Calculator (2026)" | capital gains tax calculator | `2026-07-12-capital-gains-tax-on-stocks` (fine if it stays on rates and rules) |
| net-worth | "Net Worth Calculator" | net worth calculator | none |

**Recommendation: `/apps/<tool>` owns the calculator query, guides own the learn queries, and the `/calculators/*` pages get folded into `/apps`.**

- **Why `/apps` should own them.** It has everything the landing pages lack:
  - the traffic (71 of ~105 tool views)
  - a sitemap entry
  - links from the homepage grid, the `/apps` hub and the related-tool blocks
  - links from every guide (all guide links point to `/apps/...`)

  `HANDOFF.md` §11 also names `/apps/[tool]` as the per-tool landing page.
- **Why folding in is cheap.** The `/calculators/*` pages are orphans: not in the sitemap, not in the nav or footer, 0 views ever. Their copy is good, though: 3 long sections and 5 FAQs each. `lib/landing-pages.ts` also required their FAQs to differ from the `/apps` FAQs. **Moving that copy into `/apps/<tool>` gives 8 tools the 400–800-word explainer Phase 5 asks for, with 8 non-duplicate FAQs each, mostly without new writing.**
- **What to do with the old URLs.** Either:
  1. 301 each `/calculators/<slug>` to `/apps/<tool>` (simplest), or
  2. keep them for paid traffic and `?ref=lp-*` attribution, with `rel=canonical` pointing to `/apps/<tool>` and no sitemap entry.
- **Sequencing.** AUDIT §11 lists the missing sitemap entries as a bug. Don't fix it by adding the 8 URLs until this is decided: doing it now would show Google two copies of each page, both claiming to be canonical, for the same query.
- **Car affordability.** Retitle the guide toward the learn intent ("how much should I spend on a car", "20/4/10 rule"). `/apps/car-affordability` then owns "how much car can I afford".

### D-B. Keep the " | Money Guy Mutants" title suffix?
All suggested titles fit with it. The alternative is `title: { absolute: … }` on tool pages, which frees up 20 characters.

### D-C. Fix claims that don't match the free tool before targeting (accuracy, rule 10)
- **budget:** the title and content say "AI Budget Optimizer" and "AI-powered". The optimizer in `app/apps/budget/page.tsx` is rule-based (floors and rebalancing; no model calls). Drop "AI".
- **index-fund-visualizer:**
  - The meta says "See historical returns", and `CALCULATOR_CONTENT` lists "Historical performance visualization" and "Expense ratio impact analysis".
  - The tool actually projects with a fixed long-run average per fund plus a seeded random path.
  - Expense ratios are displayed, not modeled, and fund comparison is Pro-only.
- **car-affordability:**
  - The layout and `CALCULATOR_CONTENT` promise depreciation, opportunity cost and total cost of ownership. `CarAffordability.tsx` models none of these; it sizes a price from income, APR, down payment and 36 months.
  - The "8%" is defined two ways. The tool (`CarAffordability.tsx:53`) and the landing page apply it to the payment alone. The `/apps` FAQ and the car guide say it covers total vehicle costs.
- **coast-fire:** the meta advertises Barista FIRE analysis, which is Pro.
- **capital-gains-tax:**
  - The meta advertises QBI, ACA-cliff and IRMAA modeling. Those modules are Pro (NIIT is always in the total).
  - State tax is Virginia-only, and the meta doesn't say so.

### D-D. Tools that lock the whole result
`s-corp-investment` replaces the whole tool with a lock screen, and `whats-your-why` locks the whole tool. Ranking either would send searchers to a paywall. **Recommendation:** no SEO work on either until it shows a free result, even a partial one.

---

## 1. Pilot tools

### 1.1 Coast FIRE: `/apps/coast-fire` (71 views / 30 days)

**What a signed-out visitor gets:**
- the Coast FIRE number, adjusted for inflation and fees
- the FIRE target and a progress %
- "Coast FIRE in ~N years at current pace"
- the projected balance at retirement, and a growth chart

**Pro only:** coast-date optimizer, Barista FIRE paths, flexibility score, Lean/Fat FIRE scenarios, Social Security integration.

| Query | Intent | Owner |
|---|---|---|
| **coast fire calculator** (primary) | calculator/do | `/apps/coast-fire` |
| how much do I need to coast fire | calculator/do | `/apps/coast-fire` |
| coast fire number by age ("coast fire at 30", "coast fire at 35") | learn → calculator | `/apps/coast-fire` (new by-age section) |
| coast fire calculator with inflation | calculator/do | `/apps/coast-fire` |
| when can I stop saving for retirement | learn/decide | `/apps/coast-fire` |
| coast fire vs barista fire | compare | guide `/guides/2026-07-05-coast-fire-explained` (Barista modeling is Pro in the tool) |
| what is coast fire | learn | guide (the `/apps` FAQ answers it briefly; fine) |

**Cannibalization:** `/calculators/coast-fire-calculator` has the same keyword and H1. Fold it into `/apps/coast-fire` (D-A).

| | Current | Suggested |
|---|---|---|
| Title | Coast FIRE Calculator - Calculate Your Financial Freedom Point (82) | Coast FIRE Calculator: Find Your Number (59) |
| Meta | 212 chars, mentions Barista FIRE (Pro) | Enter your age, retirement spending and what you've invested. See your inflation-adjusted Coast FIRE number, your progress, and the years left to reach it. (155) |
| H1 | Coast FIRE calculator. | keep |

**Content gaps**
1. **Coast FIRE number by age.**
   - Add a short table at ages 25, 30, 35, 40 and 45 for one stated spending level.
   - Compute it with the tool's own formula and defaults, and label it an illustration.
   - The guide has worked examples at 30 and 40; the tool page has none.
2. **How the number is calculated.**
   - FIRE target = spending ÷ withdrawal rate.
   - Coast number = target ÷ (1 + real rate)^years.
   - Real rate = growth − inflation − fees.

   The tool's "The Formula" and "The Math Behind Your Result" panels sit in a browser-only (`ssr:false`) component, so crawlers can't see them. The landing page's "How this coast fire calculator works" section already covers this; move it.
3. **FAQs to add:**
   - "What counts toward the invested balance?" Retirement and brokerage accounts count; home equity and emergency cash don't. This is already a landing FAQ; move it.
   - "Does it include Social Security?" The free calculation doesn't. Pro lowers the target once benefits start.
4. **What if markets drop after I stop contributing?** Explain the idea of keeping a margin of safety. The landing section "The assumptions that move your coast number most" partly covers this.

**Difficulty:**
- It's a niche FIRE-community term, so less crowded than "retirement calculator". Expect established FIRE-blog calculators and Reddit threads in the results.
- The "by age" and "how much do I need" long-tails are the most reachable.
- This is the only page with momentum, so protect it and don't change the URL.

Volume unknown; verify in Search Console/Keyword Planner.

### 1.2 Rent vs Buy: `/apps/rent-vs-buy` (12 views / 30 days)

**What a signed-out visitor gets:**
- a verdict ("Buy/Rent wins by $X in net worth") and the break-even year
- a year-by-year net-worth chart for both paths
- sliders for appreciation, rent growth, investment return, maintenance, property tax, and buying/selling costs

**Pro only:** lifecycle strategy, hidden-drag and mobility-premium panels, market-timing scenarios.

**Built-in assumptions:** a 30-year fixed loan and insurance at 0.5% of home value. There are no PMI or HOA inputs.

| Query | Intent | Owner |
|---|---|---|
| **rent vs buy calculator** (primary) | calculator/do | `/apps/rent-vs-buy` |
| should I rent or buy a house calculator | compare/decide | `/apps/rent-vs-buy` |
| rent vs buy break even calculator / how many years to break even buying a house | calculator/do | `/apps/rent-vs-buy` |
| rent and invest the difference calculator | calculator/do | `/apps/rent-vs-buy` |
| price to rent ratio | learn | guide `/guides/2026-07-26-rent-vs-buy-a-home` (or `/apps` if a readout is added) |
| is it better to rent or buy right now / 5% rule rent vs buy | learn/decide | guide |

**Cannibalization:** `/calculators/rent-vs-buy-calculator` has the same keyword; fold it in (D-A). The guide is fine as long as its title stays a framework/learn piece.

| | Current | Suggested |
|---|---|---|
| Title | Rent vs Buy Calculator - Home Ownership Cost Comparison (75) | Rent vs Buy Calculator: Break-Even Year (59) |
| Meta | 142 chars | Compare buying a home with renting and investing the difference. See net worth for each path, the year buying pulls ahead, and which inputs flip it. (148) |
| H1 | Rent vs buy reality engine. | Rent vs buy calculator. (keep "reality engine" in the subhead) |

**Content gaps**
1. **Worked example with the default numbers.** The landing page has a full one ($500k home, 20% down, 6.5%, $2,800 rent). Move it.
2. **Why the renter starts with the down payment.** This is the "invest the difference" logic. It's a landing FAQ; move it.
3. **How long you need to stay for buying to win.**
   - The landing page has a section on transaction costs and break-even.
   - Add a price-to-rent readout (price ÷ annual rent), or at least link the guide's section on it. The `/apps` FAQ explains the ratio, but the tool doesn't compute it.
4. **FAQ: what's included and what isn't.** Cover PMI, HOA, the mortgage interest deduction (the landing FAQ already covers this one) and 15-year/ARM loans.

**Difficulty:**
- The head term is hard. Long-standing reference calculators hold it (the New York Times one is well known), along with big publishers and real-estate portals.
- Go after the break-even and invest-the-difference long-tails.
- This will be a mortgage-offer page in Phase 1, so expect stricter scrutiny as a money topic. Don't quote rates.

Volume unknown; verify in Search Console/Keyword Planner.

### 1.3 Index Fund Visualizer: `/apps/index-fund-visualizer` (5 views / 30 days; #1 all-time)

**What a signed-out visitor gets:**
- One fund group at a time: S&P 500 (VOO/IVV), total US (VTI), total world (VT) or growth (QQQM/VUG).
- Inputs: starting amount, a monthly or annual contribution, and the number of years.
- Output: a smooth projection at a fixed long-run average for that fund, a seeded random "volatile" path next to it, the final value and the gains.

**Pro only:** head-to-head comparison, Sharpe ratio and drawdown, Monte Carlo.

**It is not a historical backtest.**

| Query | Intent | Owner |
|---|---|---|
| **index fund calculator** (primary) | calculator/do | `/apps/index-fund-visualizer` |
| how much will I have if I invest $500 a month in the S&P 500 | calculator/do | `/apps/index-fund-visualizer` |
| VOO calculator / VTI calculator (monthly investing) | calculator/do | `/apps/index-fund-visualizer` |
| what a market crash does to an index fund / index fund volatility | learn | `/apps/index-fund-visualizer` (the volatile path) |
| S&P 500 vs total world index fund / VOO vs VTI vs VT | compare | a free explainer section on `/apps`, or a new guide (the tool's side-by-side is Pro) |
| how to start investing in index funds | learn | guide `/guides/2026-08-23-index-fund-investing-for-beginners` |

**Don't target:** "S&P 500 historical return calculator" or queries for returns between two dates. Those searchers want a real backtest, which this tool doesn't do.

**Cannibalization:**
- There's no landing page for this tool.
- There is a soft overlap with compound-interest on "invest $X a month". The rule: compound-interest owns the generic phrasing, and index-fund owns anything that names a fund, a ticker or "S&P 500".
- Remove "compound growth calculator" from this layout's keywords. It is also listed for coast-fire and compound-interest.

| | Current | Suggested |
|---|---|---|
| Title | Index Fund Growth Visualizer - ETF Investment Simulator (75) | Index Fund Calculator: VOO, VTI and VT (58) |
| Meta | 197 chars, says "historical returns" | Project a lump sum plus monthly investing in an S&P 500, total market, world or growth index fund, with a bumpy simulated path next to the smooth average. (154) |
| H1 | Index fund growth visualizer. | Index fund calculator. (keep "growth visualizer" in the subhead) |

Tickers are used only to identify the funds and imply no endorsement by the fund companies. Add a line saying so if needed.

**Content gaps**
1. **How the projection works.** Needed for rule 10 anyway. Cover:
   - which average return each fund uses and where it comes from (the code comment says 10–20-year rolling averages)
   - what the volatile path is
   - why neither one is a forecast
2. **VOO vs VTI vs VT vs QQQM in plain words.** A free text comparison answers the compare intent without the Pro tool.
3. **"$X a month for Y years" examples.** A small table from the tool's own assumptions, labeled as illustrative.
4. **Expense ratios.** The `/apps` FAQ talks about fee drag, but the tool doesn't model it. Either add an expense-ratio toggle or reword the FAQ and the features list.

**Difficulty:**
- "S&P 500 calculator" is held by established backtest calculators and big publishers. Long-tail queries that pair a ticker with a monthly amount are more reachable.
- It was #1 all-time but got only 5 views in the last 30 days. That suggests rankings it held on cortex.vip didn't carry over. The old property's queries report is the first thing to check (see §4).

Volume unknown; verify in Search Console/Keyword Planner.

---

## 2. Other tools

### 2.1 Budget: `/apps/budget` (3 views)

**What a signed-out visitor gets:**
- gross monthly income turned into a take-home estimate (via a tax mode)
- dollars allocated across the Fixed Commitments, Flexible Living and Future Commitments categories
- the unallocated remainder, a flexibility index and a budget-tension score

**Pro only:** Auto-Optimize.

| Query | Intent | Owner |
|---|---|---|
| **monthly budget calculator** (primary) | calculator/do | `/apps/budget` |
| budget calculator based on income | calculator/do | `/apps/budget` |
| household budget calculator | calculator/do | `/apps/budget` |
| zero based budget calculator | calculator/do | `/apps/budget` (the tool shows unallocated dollars) |
| how much should I spend on each budget category | learn | `/apps/budget` (new section) |
| 50/30/20 budget calculator / 50/30/20 rule | calculator / learn | guide `/guides/2026-09-20-50-30-20-budget-rule` owns the rule. `/apps` only if a 50/30/20 readout is added; the current FAQ implies a comparison the tool doesn't show. |

| | Current | Suggested |
|---|---|---|
| Title | Free Household Budget Calculator & AI Budget Optimizer (74) | Monthly Budget Calculator by Category (57) |
| Meta | 218 chars, "AI-powered" | Start from gross income, estimate take-home, and give every dollar a category. See what is left unallocated and how much of your pay goes to fixed costs. (153) |
| H1 | **"Money Guy Mutants"** (the site name; `app/apps/budget/page.tsx:536`) | Monthly budget calculator. |

**Content gaps**
1. Spending guidelines per category (housing, transport, food, savings), with cited sources and no invented percentages.
2. How the take-home estimate works, and its limits.
3. 50/30/20 vs zero-based budgeting, linking the guide.
4. What "budget tension" and "flexibility index" mean (partly covered in the FAQ).

**Difficulty:**
- Big publishers and budgeting apps own the head term, so go long-tail only. Low priority at 3 views.
- It's also a heavy page that renders entirely in the browser (AUDIT §11).

Volume unknown; verify in Search Console/Keyword Planner.

### 2.2 Compound Interest: `/apps/compound-interest` (3 views)

**What a signed-out visitor gets:** principal, monthly contribution, rate, years and compounding frequency, producing the future value, a contributions-vs-interest split and a chart. **Pro only:** the Life Impact Analyzer (delay cost, withdrawal preview, milestones).

| Query | Intent | Owner |
|---|---|---|
| **compound interest calculator with monthly contributions** (primary) | calculator/do | `/apps/compound-interest` |
| compound interest calculator | calculator/do | `/apps/compound-interest` (head term; see difficulty) |
| monthly compound interest calculator | calculator/do | `/apps/compound-interest` |
| how much will I have if I invest $X a month (no fund named) | calculator/do | `/apps/compound-interest` |
| how long to double my money / rule of 72 | learn/calc | `/apps/compound-interest` (the FAQ exists; add a one-line readout) |
| cost of waiting to invest | learn | a text section on `/apps` (the delay-cost tool is Pro), or a future guide |

**Cannibalization:**
- `/calculators/compound-interest-calculator` has the same keyword; fold it in.
- The generic-vs-ticker rule with index-fund (§1.3) applies.

| | Current | Suggested |
|---|---|---|
| Title | Compound Interest Calculator - Free Investment Growth Tool (78) | Monthly Compound Interest Calculator (56) |
| Meta | 192 chars | See what a starting balance plus monthly contributions could grow to at a rate you choose, split into what you put in and what compounding added. (145) |

**Content gaps** (all four already exist on the landing page; move them):
1. What return rate to use (landing section).
2. Nominal vs inflation-adjusted results (landing FAQ).
3. Why time beats rate, with a worked example (landing section).
4. Simple vs compound interest, and daily vs monthly compounding (landing FAQs).

**Difficulty:** very hard at the head. The SEC's investor.gov calculator, large calculator sites and big publishers hold it. Long-tail only. Volume unknown; verify in Search Console/Keyword Planner.

### 2.3 Car Affordability: `/apps/car-affordability` (≤2 views)

**What a signed-out visitor gets:**
- **Inputs:** gross income, APR, down payment % and any existing car payments.
- **Outputs:** the maximum price, the payment, the loan amount, the interest and the total paid.
- **How the payment is set:** 8% of gross monthly income minus existing car payments, over 36 months.
- **What it leaves out:** depreciation, insurance and operating costs. The tool itself says the price excludes them.

| Query | Intent | Owner |
|---|---|---|
| **how much car can I afford** (primary, calculator phrasing) | calculator/do | `/apps/car-affordability` |
| car affordability calculator | calculator/do | `/apps/car-affordability` |
| 20/3/8 rule calculator | calculator/do | `/apps/car-affordability` |
| how much car can I afford on a $60k / $100k salary | calculator/do | `/apps/car-affordability` (by-salary table) |
| 20/4/10 rule | learn | guide `/guides/2026-09-27-how-much-car-can-you-afford` |
| how much should I spend on a car / total cost of owning a car | learn | guide |

**Cannibalization:** three URLs chase one query (D-A).
- Fold the landing page into `/apps`.
- Retitle the guide toward "how much should you spend on a car", the 20/4/10 rule and total cost of ownership.
- Settle the 8% definition first (D-C).

| | Current | Suggested |
|---|---|---|
| Title | Car Affordability Calculator - 20/3/8 Rule Auto Loan Tool (77) | How Much Car Can I Afford? 20/3/8 Rule (58) |
| Meta | 138 chars, claims depreciation and total cost of ownership | Enter your gross income and loan rate. The 20/3/8 rule sizes your maximum car price: 20% down, a 3-year loan, and a payment under 8% of gross income. (149) |
| H1 | Car affordability calculator. | How much car can I afford? |

**Content gaps**
1. A by-salary table computed by the tool at one stated APR.
2. 20/3/8 vs 20/4/10. The guide covers it; summarize it and link.
3. What the price excludes: tax, title, insurance, fuel.
4. New vs used (landing FAQ).

**Difficulty:** auto-industry sites, big publishers and lenders hold it. The salary-specific long-tails are more reachable. Volume unknown; verify in Search Console/Keyword Planner.

### 2.4 Retirement Strategy: `/apps/retirement-strategy` (≤2 views)

**What a signed-out visitor gets:**
- drawdown across traditional, Roth and taxable accounts
- RMDs (starting at 73 or 75 depending on birth year)
- a year-by-year Roth conversion plan up to a target tax bracket
- a sequence-risk stress test (a crash in years 1–3)
- portfolio longevity, lifetime taxes and estate value

**Pro only:** Auto-Optimize.

| Query | Intent | Owner |
|---|---|---|
| **roth conversion calculator** (primary) | calculator/do | `/apps/retirement-strategy` |
| how much should I convert to Roth each year | decide | `/apps/retirement-strategy` |
| roth conversion fill the tax bracket | learn/calc | `/apps/retirement-strategy` |
| retirement withdrawal strategy calculator / which account to withdraw from first | decide | `/apps/retirement-strategy` |
| sequence of returns risk calculator | calculator/do | `/apps/retirement-strategy` |
| roth IRA rules / backdoor roth | learn | guide `/guides/2026-09-13-roth-ira-complete-guide` |

**Don't target:**
- "RMD calculator": people want this year's RMD for one account, while this tool projects RMDs inside a whole plan.
- The generic "retirement calculator" and "retirement planning calculator": a different intent, and dominated.

| | Current | Suggested |
|---|---|---|
| Title | Retirement Planning Calculator - Withdrawal Strategy Optimizer (82) | Roth Conversion & Withdrawal Calculator (59) |
| Meta | 171 chars | Model retirement withdrawals across 401(k), IRA, Roth and taxable accounts, with RMDs and year-by-year Roth conversions, and see total lifetime taxes. (150) |
| H1 | Retirement strategy engine. | Roth conversion and withdrawal calculator. |

**Content gaps**
1. How bracket-filling conversions work, with a worked example.
2. The usual withdrawal order, and when to break it.
3. How conversions interact with Medicare IRMAA and the ACA subsidy (link capital-gains-tax).
4. What the sequence-risk stress test assumes.

**Difficulty:**
- Brokerages and planning-software vendors publish Roth conversion calculators, and it's a sensitive money topic. Moderate to hard; the "fill the bracket" phrasing is more reachable.
- `components/apps/RothOptimizer.tsx` exists but isn't mounted on any page. If it ships later, split the Roth queries again.

Volume unknown; verify in Search Console/Keyword Planner.

### 2.5 Net Worth: `/apps/net-worth` (≤2 views)

**What a signed-out visitor gets:**
- templates for assets and liabilities, and the net worth total
- a liquid vs illiquid split and a liquidity index
- how many months of debt payments are covered
- momentum and a 10-year trajectory

**Pro only:** Momentum Intelligence.

| Query | Intent | Owner |
|---|---|---|
| **net worth calculator** (primary) | calculator/do | `/apps/net-worth` |
| how to calculate net worth | learn | `/apps/net-worth` |
| liquid net worth calculator | calculator/do | `/apps/net-worth` |
| free net worth tracker | do | `/apps/net-worth` (saved snapshots) |
| should I include my home in net worth | learn | `/apps/net-worth` (landing FAQ) |
| net worth by age | learn/compare | a section on `/apps`; low priority, dominated |

**Cannibalization:** `/calculators/net-worth-calculator` has the same keyword; fold it in.

| | Current | Suggested |
|---|---|---|
| Title | Net Worth Calculator & Wealth Tracker - Free Financial Tool (79) | Net Worth Calculator and Liquidity Check (60) |
| Meta | 193 chars | Add your accounts, home, car and debts to get your net worth, how much of it is liquid, how many months of payments it covers, and a 10-year trajectory. (152) |
| H1 | Net worth engine. | Net worth calculator. |

**Content gaps**
1. A worked example (landing section).
2. Liquid net worth: what counts.
3. Valuing the home at cost basis vs market value (landing FAQ).
4. The "net worth by age" section. The current `/apps` FAQ says "median net worth in the U.S. is about $193,000" with no source or date. Cite it or cut it before this page is promoted.

**Difficulty:** big publishers and wealth-tracking apps hold the head. "Liquid net worth calculator" is a more reachable niche. Volume unknown; verify in Search Console/Keyword Planner.

### 2.6 S-Corp Investment: `/apps/s-corp-investment` (≤2 views)

**What a signed-out visitor gets: a lock screen** (`SCorpInvestmentOptimizer.tsx:229`).

**Pro only (all of it):** W-2 salary drives the employee 401(k) (Roth or traditional), employer profit sharing (up to 25% of W-2), IRA, HSA, brokerage and tax savings.

| Query | Intent | Owner |
|---|---|---|
| **s corp solo 401k contribution calculator** (primary) | calculator/do | `/apps/s-corp-investment` |
| how much can an s corp owner contribute to a 401k | learn | `/apps/s-corp-investment` |
| s corp profit sharing calculator | calculator/do | `/apps/s-corp-investment` |
| what salary do I need to max out a solo 401k (s corp) | calculator/do | `/apps/s-corp-investment` |
| solo 401k vs SEP IRA for an s corp | compare | `/apps` FAQ (already exists) |

**Overlap:** s-corp-optimizer owns the salary and payroll-tax queries; this page owns the retirement-contribution ones.

| | Current | Suggested |
|---|---|---|
| Title | S-Corp Retirement Contribution Calculator - 401k Optimizer (78) | S Corp Solo 401k Contribution Calculator (60) |
| Meta | 150 chars | S corp owners: enter your W-2 salary and age to see how much can go into a solo 401(k) as employee deferrals plus employer profit sharing this year. (148). **Only true once a free result exists (D-D).** |
| H1 | S-Corp investment optimizer. | S corp solo 401(k) contribution calculator. |

**Content gaps**
1. Employee vs employer contributions, explained.
2. The salary needed to max out the plan.
3. Roth vs traditional deferrals.
4. Contribution limits shown as dated 2026 figures, pulled from the tool's constants rather than retyped by hand.

**Difficulty:** niche. Brokerages and CPA blogs publish these calculators, and the page can only rank usefully if it answers without a paywall. **Recommendation: defer.** Volume unknown; verify in Search Console/Keyword Planner.

### 2.7 S-Corp Optimizer: `/apps/s-corp-optimizer` (≤2 views)

**What a signed-out visitor gets:** net profit and a proposed reasonable salary, compared two ways: self-employment tax as a sole proprietor or LLC vs payroll tax as an S corp. It shows the estimated savings, the distribution amount and a flag if the salary looks too low to count as reasonable. Nothing is gated.

| Query | Intent | Owner |
|---|---|---|
| **s corp tax savings calculator** (primary) | calculator/do | `/apps/s-corp-optimizer` |
| s corp vs llc tax calculator | compare | `/apps/s-corp-optimizer` |
| how much does an s corp save on self employment tax | learn | `/apps/s-corp-optimizer` |
| is an s corp worth it / at what income does an s corp make sense | decide | `/apps/s-corp-optimizer` |
| s corp reasonable salary | learn | a section on `/apps`. The tool takes a salary and flags risk; it doesn't compute one, so copy must not promise a number. |
| s corp salary vs distribution | learn | `/apps/s-corp-optimizer` |

**Cannibalization:** `/calculators/s-corp-tax-savings-calculator` has the same keyword; fold it in.

| | Current | Suggested |
|---|---|---|
| Title | S-Corp Tax Calculator - Self-Employment Tax Savings Tool (76) | S Corp vs LLC Tax Savings Calculator (56) |
| Meta | 155 chars | Enter net profit and a reasonable salary to compare self-employment tax as an LLC with payroll tax as an S corp, and see the distribution that avoids it. (153) |
| H1 | S-Corp optimizer. | S corp tax savings calculator. |

**Content gaps** (all four already exist on the landing page; move them):
1. A worked example (landing section).
2. The costs the headline number leaves out: payroll service, a separate tax return, state fees, and a smaller QBI deduction (landing section).
3. How to pick a reasonable salary to test (landing FAQ).
4. "Is an LLC required?" (landing FAQ).

**Difficulty:** competitive, because formation companies, payroll providers and CPA firms target it for lead generation. The long-tails are reachable, and the commercial value is high. Volume unknown; verify in Search Console/Keyword Planner.

### 2.8 Debt Paydown: `/apps/debt-paydown` (≤2 views)

**What a signed-out visitor gets:**
- a list of debts plus a monthly budget, compared as snowball, avalanche and hybrid plans by months to payoff and total interest
- a balance chart and a verdict
- a pay-down-or-invest check, with tax-deductible flags

**Pro only:** the Opportunity Cost Rebalancer.

| Query | Intent | Owner |
|---|---|---|
| **debt snowball calculator** (primary) | calculator/do | `/apps/debt-paydown` |
| debt avalanche calculator | calculator/do | `/apps/debt-paydown` |
| snowball vs avalanche calculator | compare | `/apps/debt-paydown` |
| debt payoff calculator | calculator/do | `/apps/debt-paydown` |
| credit card payoff calculator for multiple cards | calculator/do | `/apps/debt-paydown` |
| pay off debt or invest calculator | decide | `/apps/debt-paydown` |
| debt avalanche vs snowball, which is better | learn/compare | guide `/guides/2026-07-02-debt-avalanche-vs-snowball` |

**Cannibalization:** fold `/calculators/debt-snowball-calculator` in. This is the one pair where a split could work: `/apps` on "debt payoff calculator", and the landing page on "debt snowball calculator". At this domain's current authority, one strong page is the safer bet.

| | Current | Suggested |
|---|---|---|
| Title | Debt Payoff Calculator - Avalanche vs Snowball Method (73) | Debt Snowball vs Avalanche Calculator (57) |
| Meta | 151 chars | List your debts and a monthly budget. Compare snowball, avalanche and a hybrid plan by debt-free date and total interest, side by side. Free, no signup. (152) |
| H1 | Debt paydown optimizer. | Debt snowball vs avalanche calculator. |

**Content gaps** (all four already exist on the landing page; move them):
1. How the payment rolls over once a debt is paid off (landing FAQ).
2. The hybrid plan (landing section and FAQ).
3. Whether to include the mortgage (landing FAQ).
4. The pay-down-or-invest verdict, explained (landing section).

**Difficulty:** hard at the head. Well-known debt-payoff brands, big publishers and dedicated payoff apps own it. Go long-tail. Volume unknown; verify in Search Console/Keyword Planner.

### 2.9 Geographic Arbitrage: `/apps/geographic-arbitrage` (3 views)

**What a signed-out visitor gets:**
- **Inputs:** current and target city (58 cities, mostly state capitals plus a few large metros), income, and an income adjustment.
- **Outputs:** federal tax, an **approximate effective** state tax, a cost-of-living index, the monthly difference, and a compounded trajectory.

**Pro only:** Multi-City (top-5 destinations).

| Query | Intent | Owner |
|---|---|---|
| **geographic arbitrage calculator** (primary) | calculator/do | `/apps/geographic-arbitrage` |
| cost of living comparison calculator with taxes | calculator/do | `/apps/geographic-arbitrage` |
| how much will I save moving to a state with no income tax | decide | `/apps/geographic-arbitrage` |
| moving from [city] to [city] cost of living (only city pairs the tool covers) | compare | `/apps/geographic-arbitrage` |
| salary needed to keep the same lifestyle in another city | calculator/do | `/apps/geographic-arbitrage` |
| what is geographic arbitrage | learn | a section on `/apps` (no guide exists) |

**Don't target:** "state income tax calculator", which is in the current keywords. The tool uses one approximate rate per city, not tax brackets.

| | Current | Suggested |
|---|---|---|
| Title | Geographic Arbitrage Calculator - Cost of Living Comparison (79) | Geographic Arbitrage Calculator (51) |
| Meta | 134 chars, says "all 50 states" (the comparison is by city) | Compare take-home pay, state income tax and cost of living between two U.S. cities, and see what the monthly difference could grow to if invested. (146) |

**Content gaps**
1. **Methodology:** which cities are included, what the tax rate and cost-of-living index represent, the sources, and an as-of date.
2. Property and sales tax aren't in the number. States without an income tax often charge more through those; the FAQ touches on this.
3. Remote-pay adjustments and the career-mobility trade-off.
4. A list of covered cities rendered as page HTML, so the city-pair long-tail can be indexed.

**Difficulty:** "cost of living calculator" is dominated by big publishers and salary/cost-of-living data sites. "Geographic arbitrage" is FIRE jargon with likely low volume and low competition, so this page could plausibly own it. Volume unknown; verify in Search Console/Keyword Planner.

### 2.10 Gambling Redirect: `/apps/gambling-redirect` (≤2 views)

**What a signed-out visitor gets:** a monthly betting budget, a time horizon and an assumed market return, showing what that money could grow to if invested. **Pro only:** total amount wagered, expected loss to the house edge, and the recovery roadmap.

| Query | Intent | Owner |
|---|---|---|
| **gambling vs investing calculator** (primary) | calculator/do | `/apps/gambling-redirect` |
| what if I invested instead of gambling | calculator/do | `/apps/gambling-redirect` |
| sports betting vs investing | compare | `/apps/gambling-redirect` |
| how much does gambling cost me per year | calculator/do | `/apps/gambling-redirect` |
| lottery tickets vs investing | compare | `/apps/gambling-redirect` (works as a monthly-spend input) |

**Don't target; remove these from the keywords:**
- "gambling calculator" and "sports betting calculator": people searching these want odds or payout tools. That's the wrong audience.
- "betting to investing calculator": it can pull in the same bettor searches.
- "gambling recovery": clinical language the tool can't back up.

| | Current | Suggested |
|---|---|---|
| Title | Gambling Spend Redirect Calculator - See Your Money's True Potential (88) | Gambling vs Investing: Opportunity Cost (59) |
| Meta | 188 chars | Enter what you spend on betting each month and see what the same money could grow to if it were invested instead, over the time horizon you pick. (145) |
| H1 | Gambling spend redirect. | Gambling vs investing calculator. |

**Content gaps**
1. How the projection works and what return it assumes (with no guarantees).
2. The house edge in plain language. The FAQ exists; the tool's house-edge math is Pro.
3. A short, non-judgmental "if betting feels out of control" section, linking the national problem-gambling helpline. Drew should verify the current number and URL before publishing.
4. Entertainment budget vs habit (the FAQ exists).

**Difficulty:**
- Low competition, but probably low volume. It's a sensitive topic, so write carefully.
- The conservative default would be no ads or offers on this page. That's for Drew to decide, not assumed here.

Volume unknown; verify in Search Console/Keyword Planner.

### 2.11 Capital Gains Tax: `/apps/capital-gains-tax` (≤2 views)

**What a signed-out visitor gets:**
- 2026 federal tax on a long-term gain, stacked on top of other income
- the effective rate and the rate on the next dollar
- **the room left in the 0% bracket**, with a "set slider here" button
- a full breakdown, with NIIT in the total and Virginia state tax

**Pro only:** NIIT headroom, QBI, and the ACA-cliff and IRMAA modules.

| Query | Intent | Owner |
|---|---|---|
| **capital gains tax calculator 2026** (primary) | calculator/do | `/apps/capital-gains-tax` |
| how much stock can I sell at 0% capital gains | calculator/do | `/apps/capital-gains-tax` |
| 0% capital gains bracket calculator / tax gain harvesting calculator | calculator/do | `/apps/capital-gains-tax` |
| how long-term gains are taxed on top of income (stacking) | learn | `/apps/capital-gains-tax` (landing section) |
| virginia capital gains tax calculator | calculator/do | `/apps/capital-gains-tax` (a real fit, since the tool is Virginia-specific) |
| capital gains tax rates 2026 / short vs long term | learn | guide `/guides/2026-07-12-capital-gains-tax-on-stocks` |

**Cannibalization:**
- `/calculators/capital-gains-tax-calculator` has the same keyword; fold it in.
- The guide keeps rates, rules and the wash-sale rule, and must not be titled "calculator".

| | Current | Suggested |
|---|---|---|
| Title | Capital Gains Tax Calculator (2026) - 0%, 15%, 20% Brackets (79) | 2026 Capital Gains Tax Calculator (53). The year needs updating each January. |
| Meta | 217 chars, lists Pro modules | Enter your income and a planned stock sale. See federal tax on the gain, your next-dollar rate, and the room left in the 0% bracket. Adds Virginia tax. (151) |
| H1 | Capital-gains tax efficiency. | Capital gains tax calculator (2026). |

**Content gaps**
1. A worked example of the 0% headroom: how much gain fits at a given income and filing status, computed by the engine.
2. **"I don't live in Virginia":** how to read the state line. The landing page mentions this; make it prominent.
3. Tax gain harvesting, step by step (landing FAQ).
4. Short vs long term (landing section; link the guide).

**Difficulty:**
- Big publishers, tax-prep brands and brokerages hold the head term. The 0% bracket, gain-harvesting and Virginia long-tails are more reachable.
- Gain-harvesting questions tend to come up toward year-end. That's a general pattern, not something measured here.

Volume unknown; verify in Search Console/Keyword Planner.

### 2.12 Personality Quiz: `/apps/personality-quiz` (≤2 views)

**What a signed-out visitor gets:** 10 questions leading to one of six archetypes (Accumulator, Optimizer, Fortress Builder, Tactician, Visionary, Steward), with shareable result pages at `/apps/personality-quiz/r/<id>`. The page has no FAQ and no JSON-LD (AUDIT §11).

| Query | Intent | Owner |
|---|---|---|
| **money personality quiz** (primary) | do | `/apps/personality-quiz` |
| financial personality quiz | do | `/apps/personality-quiz` |
| investor personality quiz / what type of investor am I | do | `/apps/personality-quiz` |
| investing style quiz | do | `/apps/personality-quiz` |

**Don't target:** "risk tolerance quiz", which is in the current keywords. The quiz isn't a formal risk questionnaire, and brokerages own that intent.

| | Current | Suggested |
|---|---|---|
| Title | Financial Personality Quiz — What Kind of Investor Are You? (79) | Money Personality Quiz: 6 Investor Types (60) |
| Meta | 207 chars | Ten quick questions map how you think about money to one of six investor types, from the patient Accumulator to the Visionary. Free, no email needed. (149) |

**Content gaps**
1. The six types, rendered on the page itself, each linking to its result page.
2. How the scoring works.
3. "Is this a risk tolerance test?" (No.)
4. An FAQ with FAQPage JSON-LD.

Separately, result-page titles repeat the brand: "… — Money Guy Mutants Financial Personality Quiz | Money Guy Mutants". Drop one of the two.

**Difficulty:** many media, bank and psychology sites run quizzes like this. Sharing will likely matter more than search. Volume unknown; verify in Search Console/Keyword Planner.

### 2.13 What's Your Why: `/apps/whats-your-why` (≤2 views)

**What a signed-out visitor gets: a locked tool** (`WhatsYourWhy.tsx:103`). The AI reflection is Pro-only (`/api/why`).

| Query | Intent | Owner |
|---|---|---|
| **find your financial why** (primary) | learn/do | `/apps/whats-your-why` |
| money motivation questions | learn | `/apps/whats-your-why` |
| money mindset reflection questions | learn | `/apps/whats-your-why` |
| financial goals worksheet | do | only if a free, non-AI version of the eight questions exists |

| | Current | Suggested |
|---|---|---|
| Title | What's Your Why — Find Your Real Money Motivation (69) | Find Your Financial Why: 8 Questions (56) |
| Meta | 215 chars | Eight reflective questions about what drives your money decisions, fears and goals. Pro members get a written reflection on their answers. (138) |

**Content gaps**
1. Show the eight questions for free; the reflection stays Pro.
2. Why knowing your "why" matters before making a budget.
3. An FAQ with JSON-LD (there is none today).

**Difficulty:** probably low volume, and the phrase is generic motivational language, so results will be mostly non-finance. **Recommendation: defer** (D-D). Volume unknown; verify in Search Console/Keyword Planner.

---

## 3. Cross-cutting fixes found while researching

These aren't content, but each one weakens the queries above:

1. **"Related guides" never renders on `/calculators/*`.**
   - `lib/landing-pages.ts` lists `relatedGuides: ['coast-fire-explained', …]`.
   - But guide slugs are the full filename including the date (`2026-07-05-coast-fire-explained`, `lib/guides/content.ts:37`).
   - So the filter at `app/calculators/[slug]/page.tsx:143` matches nothing.

   This goes away if the pages are folded in. If they stay, fix the slugs.
2. **`/apps/<tool>` pages don't link to their guide.** Guides link to the tools, but not back. Add a "Read the guide" link under each explainer.
3. **H1s that don't contain the query:** budget (the site name), rent-vs-buy, index-fund-visualizer, retirement-strategy, net-worth, s-corp-investment, s-corp-optimizer, debt-paydown, gambling-redirect, capital-gains-tax. Suggested H1s are above.
4. **Method text only renders in the browser.** The formula and "how it works" panels are inside the browser-only (`ssr:false`) component. Put a short version in the page's HTML as part of the explainer.
5. **Keywords meta lists include off-intent terms** (listed per tool above). Google ignores this tag, but the lists read as documentation of intent, so clean them up to match this doc.
6. **FAQ rich results.** Google limited FAQ rich results to well-known government and health sites in 2023. Keep FAQPage JSON-LD for structure, but don't expect FAQ snippets in results.
7. **Old brand name in guides.** "Cortex's" appears in `2026-07-26-rent-vs-buy-a-home.md` and `2026-09-27-how-much-car-can-you-afford.md`.
8. **cortex.vip redirects.** `DOMAIN_MIGRATION.md` says to keep the 301s for at least 90 days. The move was in early July, so that window closes about now. Recommendation: keep them running indefinitely. The domain renewal is Drew's call.

### Discrepancies to log in `docs/monetization/AUDIT.md` (rule 13)
- The `relatedGuides` slug mismatch (§3, item 1).
- The claim mismatches in D-C: budget "AI"; index-fund "historical" returns and expense-ratio modeling; car depreciation and total cost of ownership; Pro features advertised in the coast-fire and capital-gains metas.
- The 20/3/8 "8%" conflict: the tool and landing page apply it to the payment only; the `/apps` FAQ and the guide say it covers total vehicle costs.
- The `/apps/budget` H1 is the site name.
- The AUDIT §11 sitemap item: note that the fix should follow the ownership decision (D-A).

---

## 4. How to validate (Drew, before approving)

1. **Search Console, moneyguymutants.com** (Domain property).
   - Open Performance → Search results → Queries. Filter by page (e.g. contains `/apps/coast-fire`) over the last 3 months.
   - Queries that get impressions at an average position of roughly 5–20 are the fastest wins.
   - Add any that are missing from this doc. Drop ours that still haven't appeared after a few months.
2. **Search Console, cortex.vip** (if the property still exists).
   - Run the same report for Apr–Jul 2026. It shows what each tool ranked for before the domain move, especially index-fund-visualizer (#1 all-time).
   - Confirm the Change of Address request shows as complete.
3. **URL Inspection** on every `/apps/*` and `/calculators/*` URL. Check whether each is indexed and which URL Google picked as canonical. That confirms whether the duplication in D-A is actually hurting.
4. **Google autocomplete.** Signed out, in a private window, type each primary query, then the query followed by each letter a–z. Record the suggestions and the date.
5. **People Also Ask.** Record the questions shown for each primary query. Where they differ from the content gaps above, prefer theirs.
6. **Results-page check.** Note what kinds of pages hold the top 10 (big-publisher calculators, forums, guides). If all ten are large publishers, go long-tail as noted per tool.
7. **Keyword Planner.** It needs a Google Ads account, and setup may ask for billing. That's Drew's step (rule 5), and it only gives volume ranges. Bing Webmaster Tools' keyword research is a free alternative once Bing is verified.
8. **After changes ship,** note the date and compare 28-day windows. Expect weeks to months before anything moves.

---

## 5. Recommendation: the first five queries

Start with **"coast fire calculator"** and **"how much do I need to coast fire" / "coast fire number by age"**, both on `/apps/coast-fire`. It's the only page with real momentum (71 of about 105 tool views), the term is niche, and one consolidated page can hold both the head term and the long-tail. Folding in `/calculators/coast-fire-calculator` removes a duplicate at the same time. Third is **"rent vs buy break even calculator"** on `/apps/rent-vs-buy`. Long-standing calculators hold the head term, but break-even and invest-the-difference are exactly what this tool shows, and it's pilot #2. Fourth is **"how much stock can I sell at 0% capital gains"** on `/apps/capital-gains-tax`. It's the tool's most distinctive free feature, and gain-harvesting questions tend to come up toward year-end, with October–December next. The copy must say plainly that state tax covers Virginia only. Fifth is **"how much will I have if I invest $X a month in the S&P 500" (VOO)** on `/apps/index-fund-visualizer`. It's pilot #3 and a clean fit for a brokerage offer, but only after the "historical returns" wording is fixed, so the page doesn't promise a backtest it doesn't run. All five depend on settling D-A (one owner per query) and D-C (claims match the free tool) first.

---

## 6. Approval checklist

Mark each one: approve / approve with edits / drop.

- [ ] D-A: `/apps/<tool>` owns the calculator queries; fold in `/calculators/*` (301, or canonical + no sitemap entry)
- [ ] D-B: keep the " | Money Guy Mutants" title suffix
- [ ] D-C: fix the listed claim mismatches before any new copy
- [ ] D-D: defer s-corp-investment and whats-your-why until they show a free result
- [ ] coast-fire · [ ] rent-vs-buy · [ ] index-fund-visualizer
- [ ] budget · [ ] compound-interest · [ ] car-affordability · [ ] retirement-strategy · [ ] net-worth
- [ ] s-corp-investment · [ ] s-corp-optimizer · [ ] debt-paydown · [ ] geographic-arbitrage
- [ ] gambling-redirect · [ ] capital-gains-tax · [ ] personality-quiz · [ ] whats-your-why
- [ ] First five queries (section 5)