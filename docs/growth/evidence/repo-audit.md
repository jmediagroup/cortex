# Repo audit: Money Guy Mutants (cortex), read-only

Audited at HEAD ec685e5 (2026-10-25). Baseline audit was commit 1990226 (2026-09-29). Nothing was modified, committed or pushed. `npm ci` was run to install deps (node_modules is gitignored). The `AGENTS.md` file that Next generated during the lint run was deleted, so `git status` is clean. No secrets or env values were read. Env var names only.

This extends `docs/monetization/AUDIT.md`. It does not repeat it. Where AUDIT.md still holds, that is said in one line.

---

## 1. Tool accuracy and assumptions

### 1.1 Tax figures: which year

- The shared engine `lib/tax/taxEngine2026.ts` is dated tax year 2026 and cites Rev. Proc. 2025-32 (header, lines 1-25). Brackets, standard deduction, LTCG breakpoints, NIIT, QBI, senior deduction all live in `C` (line 88). Single std deduction is 16,100 (line 95). It has 25 known-answer tests, run by `npm test` through `tests/tax-engine.test.mjs`.
- One input is a year behind on purpose: ACA poverty line `fpl1: 15650` is the 2025 HHS guideline "used for 2026 coverage" (line 111). That matches ACA rules. Fine, but it is labeled only in a code comment.
- Social Security wage base 184,500 is correct for 2026 (`SCorpOptimizer.tsx:40`, `GeographicArbitrageCalculator.tsx:271`).
- 2026 retirement limits in `SCorpInvestmentOptimizer.tsx:66-73`: 401(k) 24,500, super catch-up 11,250, catch-up 8,000, IRA 7,500 (+1,100 catch-up), HSA 4,400 (+1,000), 415(c) 72,000 (line 87). IRA phase-outs 81k to 91k and Roth 153k to 168k (lines 57-58, 411-418). These match 2026 figures as best I can tell. I could not browse to confirm.
- I found no 2024 or 2025 brackets, stale wage base or old contribution limits in code. The tax math is the strongest part of the repo.
- Only the capital-gains tool and the engine are unit tested. No other tool's math has a test (S-Corp, geo, retirement, coast, rent vs buy, debt, car).

### 1.2 One row per tool

| Tool (file) | Default inputs | Hard-coded assumptions (value, where) | Shown to user? | Severity |
|---|---|---|---|---|
| Compound Interest (`CompoundInterest.tsx`) | 25,000 start, 500/mo, 8% return, 30 yrs, age 30, monthly compounding (:25-32) | Free math uses only inputs. Pro panel hard-codes a 5-year delay and a +20% contribution scenario (:101, :133). Nominal dollars. | Rate is an input. "Not adjusted for inflation" note at :472. Pro scenario sizes shown in the panel. | Low |
| Coast FIRE (`CoastFIRE.tsx`) | Age 30 to 65, 50,000 spend, 100,000 invested, 1,000/mo, 10% growth, 3% inflation, 4% withdrawal, 0.18% fees (:27-38) | Real growth = growth minus inflation minus fees (:55). Pro: barista incomes 15k/30k/40k, 15% spending cut, growth minus 2 stress, inflation plus 2 (:236-291). SS default 2,000/mo at 67. | All core assumptions are editable inputs (Advanced Assumptions, :647). Pro stress sizes are hidden. | Medium: 10% nominal default is aggressive |
| Index Fund Visualizer (`IndexFundVisualizer.tsx`) | 10,000 start, 1,000/mo, 25 yrs, S&P 500 (:101-105) | Fixed CAGR 10.5 / 10.2 / 8.5 / 13.5 and volatility 15 / 16 / 14.5 / 22 (:44-80). Expense ratios shown but never deducted. Nominal, no inflation. 3% risk-free in Sharpe (:239). Drawdown = 2.5 x volatility (:240). | Return shown as "CAGR" per fund and in the footnote "Historical averages are not indicative..." (:566). Not editable. Fees not deducted is not disclosed in the tool. | Medium. Drew confirmed the rates on 2026-10-18 (DECISIONS.md). Copy still says "gold standard" (:47) and "proven track record" (:727) |
| Budget (`app/apps/budget/page.tsx`) | 8,000 gross/mo, 15 categories (:22-41) | Flat tax drag 22% / 26% / 32% by mode (:43-47). Auto-optimizer targets 15% emergency, 12% investing, 8% sinking (:373-375). | Tax mode is a visible selector. Optimizer targets hidden. | Low |
| Rent vs Buy (`RentVsBuyEngine.tsx`) | 500,000 home, 20% down, 6.5% rate, 2,800 rent, 10 yrs (:27-31) | 4% appreciation, 3.5% rent inflation, 8% stock return, 1.5% maintenance, 1.2% property tax, 2% buy cost, 6% sell cost (:34-40) are inputs. Hidden: 30-year fixed term (:67), 0.5% insurance (:110, shown only in Pro panel :662), no PMI, no mortgage interest deduction, no tax on renter portfolio. | Inputs visible. Hidden items listed here. Footer says SALT and mortgage interest deduction "vary" (:798). | Medium-High: no PMI on <20% down; investment returns untaxed favors renting |
| Car Affordability (`CarAffordability.tsx`) | 150,000 income, 4.0% rate, 0 existing, 20% down (:26-31) | 20/3/8 rule: 8% of gross income, 36-month term (:42-52). | Rate editable. 36 months and 8% stated in the copy. Excludes insurance, tax, fees. | Medium: 4.0% default is likely below current auto loan rates (verify) |
| Retirement Strategy (`RetirementStrategyEngine.tsx`) | Age 62 to 65 to 95, 85,000 spend, 3% inflation, 6.5% return, 350k taxable / 1.5M traditional / 200k Roth, SS 35,000 at 67 (:95-111) | Single-filer 2026 brackets and std deduction from engine, indexed for inflation (:37-48). RMD table 73+ with 75 for born 1960+ (:155-158). Ignores 65+ extra deduction and senior deduction (AUDIT row 33). No wages. | Footnote at :390 says single filer, no wages. | Medium |
| Net Worth (`NetWorthEngine.tsx`) | Empty assets and liabilities, 0 savings, 5% growth (:225-228) | Momentum bands 5% and 15% (:350-352). Liquidity cut-offs 5% and 10% (:461). Loan presets (e.g. personal loan 10%, :51). | Growth is an input. Bands are hidden. | Low |
| S-Corp Optimizer (`SCorpOptimizer.tsx`) | 150,000 profit, 60,000 salary (:23-24) | SS base 184,500, 12.4% / 2.9% / 0.9% above 200k, SE base 92.35% (:40-58). "Reasonable salary" flag at 40% of profit or under 10,000 (:71-72). | Notes say payroll tax only, TY2026 (:175). The 40% line is a rule of thumb and the copy says no statutory floor (:66-70). | Low-Medium. No state tax, no S-corp costs, no income tax effect |
| S-Corp Investment (`SCorpInvestmentOptimizer.tsx`) | 60,000 salary, age 35, 25% tax rate, 1,000 + 500 + 625 + 366/mo, 7% growth, 3% inflation off (:29-41) | 2026 limits above. Employer 25% of pay (:77). Single filer only (:623). | Notes at :273 and :623. Tax rate is an input. | Low. Locked behind Pro anyway |
| Debt Paydown (`DebtPaydownOptimizer.tsx`) | Three debts (24.99%, 5.5%, 9.5%), 1,200 budget, 5,000 income, 7% invest, 25% tax (:64-77) | 15% capital gains haircut on investing (:59, :246). Refi, DTI 36 / 43 cut-offs (:1046). | Invest rate and tax rate are inputs. 15% haircut shown in one Pro sentence (:762). | High for copy (guaranteed wording), Low for math |
| Geographic Arbitrage (`GeographicArbitrageCalculator.tsx`) | SF to Austin, 150,000, 100% pay, 7% return, 20 yrs (:292-297) | Federal 2026 single brackets plus FICA via engine (:322-327). State tax = one effective rate per city (:44-110). Daily costs = 1,500 x COL index per month (:337). Pro mobility premium 7.5% over a 10-year ramp (:392-398). | Footnote explains the federal and state method (:666). The 1,500 base and 7.5% premium are hidden. No local tax outside NYC and DC. | Medium |
| Capital Gains (`CapitalGainsTaxTool.tsx`) | Single, 120,000 wages, 40,000 LTCG, 3,000 dividends (:173-181) | Engine constants. Virginia is the only state modeled (:385). | Footnote lists simplifications (:414). A national audience sees a Virginia row with no state picker. | Medium |
| Gambling Redirect (`GamblingRedirect.tsx`) | 250/mo, 30 yrs, 10% market return (:37-41) | 8% house edge x 10 churn = 80% expected loss share (:25-27). "Addiction multiplier" 3.5 (:94). 4% rule (:116). "3-4% of bettors profitable" and "7-9% hold" with no source (:318, :322). | Churn and multiplier are labeled illustrative in code comments only. | Medium-High: invented 3.5x multiplier and unsourced stats |
| Personality Quiz | No numbers. Six archetypes (`lib/personality-quiz-data.ts`) | Scoring points per answer | n/a | Low |
| What's Your Why (`WhatsYourWhy.tsx`, `lib/why/synthesis.ts`) | 8 text answers | Free text goes to the Anthropic API (`synthesis.ts:18`). Per answer cap 1,500 chars (`app/api/why/route.ts:17`). Pro only. | Terms and privacy page does not mention AI processing (see 2.4). | Medium (privacy copy) |

`RothOptimizer.tsx` (523 lines) is still not mounted anywhere (AUDIT row 7 holds).

### 1.3 Math bugs and stale figures

- No arithmetic bug found in the free paths I read. Compounding, annuity and amortization formulas are right. `CompoundInterest.tsx:52-62` correctly converts nominal to effective rate. `CoastFIRE.tsx` uses real growth consistently.
- Rent vs Buy (`RentVsBuyEngine.tsx:60-139`): no PMI. The down payment slider can go under 20%, so buy cost is understated. Renter and buyer portfolios grow untaxed at 8% (:119-120), which tilts toward renting.
- Rent vs Buy: the buy side nets 6% selling cost every year from year 0 (:73), so early-year "buy" numbers are shown net of a sale that has not happened. Expected for a "if you sold today" convention, but not labeled.
- Debt Paydown: the invest-versus-paydown gap uses a baseline of zero for the paydown path (`:281-282`). Paydown path invests nothing after debt is gone, so the comparison is only valid at the payoff month. The copy then extends it to "age 65" (:764).
- Car: the formula silently caps down payment at 80% (`CarAffordability.tsx:60`). Fine.
- Geo: state tax is the whole-income effective rate, not a bracket calculation. Disclosed.

### 1.4 Copy that implies guarantees or advice (Debt Paydown is the worst)

- `DebtPaydownOptimizer.tsx:644` "is a 'guaranteed return' better than the market". High.
- `:764` "creates a guaranteed return better than the market. Clear your ... aggressively". High (directive and guarantee).
- `:863` "aggressive paydown guaranteed to outperform the market". High.
- `:939` "Every extra dollar here is guaranteed profit." High.
- `:1021` "aggressive paydown is your guaranteed best return". High.
- `:762` "Don't sacrifice 30+ years of market returns to rush debt payoff." Medium (directive).
- `IndexFundVisualizer.tsx:47` "The gold standard", `:727` "a proven track record make it a solid core holding" under a heading "MUTANT Recommendation" (:715). Medium-High. Rule 10 says no advice. The heading reads as a recommendation.
- `CompoundInterest.tsx:337` "proven withdrawal rates". Low.
- `CoastFIRE.tsx:698` "will grow to your FIRE number ... even if you never contribute another cent". Medium (definition, but stated as fact, depends on the growth input).
- `lib/calculator-content.ts:876` "long-term market returns historically exceed 8%" with no source. Low.
- AUDIT row 32 already lists the reworded items. The Debt Paydown "guaranteed" hits are NOT in that list and are still live.

### 1.5 Pro upsell copy promises features the code does not have

`components/monetization/ProGatedPreview.tsx:6-21` and `ProUpsellCard.tsx:6-21` (same map twice) list benefits per tool. Checked against the tool files:

| Tool | Promised | In code? |
|---|---|---|
| coast-fire | "Monte Carlo retirement simulations", "Variable contribution modeling" | No Monte Carlo in `CoastFIRE.tsx` (0 hits) |
| index-fund-visualizer | "Custom fund basket builder", "Dividend reinvestment modeling", "Factor exposure analysis" | No basket or dividend code (0 hits). Pro panel is a Monte Carlo risk range |
| s-corp-investment | "Defined benefit plan modeling" | 0 hits |
| compound-interest | "Tax-advantaged account modeling", "Multi-account comparison" | 0 hits |
| gambling-redirect | "Behavioral cost calculator" | 0 hits (closest is the 3.5x multiplier) |
| s-corp-optimizer | "Multi-year salary strategy", "Benefits and deduction planning" | 0 hits |
| car-affordability | "Share results with a link" as a Pro perk | Sharing has no tier check (`app/api/scenarios/[id]/share/route.ts:7-47`). Free signed-in users can share. Also says "every Cortex calculator" (:9) |

Severity: High for a paid product. These are claims shown at the point of purchase. This also conflicts with Phase 5 claim hygiene (AUDIT row 25).

---

## 2. Disclaimers and compliance in code

### 2.1 "Not affiliated with The Money Guy Show / Abound Wealth" line

Exact sentence lives in these places:
- `components/marketing/Footer.tsx:128-134` (mounted by `MarketingShell`). MarketingShell pages: home, pricing, about, changelog, disclosure, enterprise, financial-mutants, the-money-guy-show, roadmap, security, terms, not-found. `app/articles/layout.tsx`, `app/guides/layout.tsx`, `app/thinking/layout.tsx` also mount the footer.
- `components/app/ToolLayout.tsx:157-164` (footer of every tool page that uses ToolLayout, 16 of 17 tool pages, plus the quiz result page).
- `components/landing/LandingShell.tsx:102-103` (/calculators/[slug]).
- `components/auth/AuthShell.tsx:78` (login, signup, reset).
- `app/disclosure/page.tsx:82`, `app/financial-mutants/page.tsx:108,407`, `app/the-money-guy-show/page.tsx:127,221,556`, `app/llms.txt/route.ts:115`.
- NOT on: `/apps/budget` (does not use ToolLayout, `app/apps/budget/layout.tsx:39` has its own footer with only a copyright), `/apps` hub, `/dashboard`, `/account`, emails, the daily digest email, OG images.

### 2.2 Educational disclaimer near results

- Standard component: `ToolLayout` default `disclaimer` "Educational model, not personalized advice, projected outcomes are uncertain" (`ToolLayout.tsx:40`), rendered in the page footer (:142-148), labeled "NOT ADVICE".
- Position problem: the `footer` prop (SEO text, FAQ, related tools) renders BEFORE this disclaimer (:136 then :138-165). So the disclaimer sits below a long FAQ, often a screen or more under the result. It is not adjacent to the result.
- Inside tools: only `IndexFundVisualizer.tsx:566` and `RentVsBuyEngine.tsx:798` carry an in-tool educational line. `ResultOffer` has its own ("Educational content, not financial advice", `lib/offers/eligibility.ts:~170`).
- Budget page has no disclaimer at all: not ToolLayout, no in-tool line (grep for "advice" in `app/apps/budget/page.tsx` returns nothing).
- Dashboard and account: none.
- Severity: Medium. A shared `ResultDisclaimer` directly under each result would fix this once.

### 2.3 /disclosure page (`app/disclosure/page.tsx`)

- Marked `LEGAL_REVIEW_REQUIRED` and `robots: noindex` (:5-16). Placeholder copy awaiting Drew.
- Claims: offers appear only after a result, at most one, always labeled "Sponsored", only from approved programs, never change a calculation, Pro hidden by default (:56-62). Education not advice, no guarantee (:67-71). Independence from the Show and Abound (:82-84).
- All five claims match the code in `lib/offers/eligibility.ts` and `ResultOffer.tsx`. One gap: "By default Pro members don't see them" is true only for campaigns whose `hide_for_tiers` includes `finance_pro` (a data setting), not enforced in code.
- Linked from the footer (`Footer.tsx:33`), `ToolLayout.tsx:161`, `ResultOffer.tsx:66`. Not in the sitemap.

### 2.4 Terms page (`app/terms/page.tsx`)

- "Last updated January 16, 2026" (:70). It predates the July domain move, the banner ads, Stripe billing in current form, offers and the AI feature.
- It is a generic J Media Group LLC template: IP owned by J Media Group "or its content creators" (:98), "as is" (:116), no professional advice (:122), "We do not sell your personal data" (:157), cookies "to enhance user experience" (:164), affiliate line speaks of "websites within the J Media Group LLC ecosystem" (:173), and an irrelevant "Directory & local listings" clause (:176-179).
- Missing: subscription billing, refunds and cancellation terms, Stripe/Supabase/Resend/Google Analytics/Anthropic as processors, retention, deletion rights, minors beyond "18+", no mention of the AI feature sending reflections to a third party, no mention of GA4 (AUDIT section 6: no consent banner).
- Contact: `support@jmediagroup.net`. Org JSON-LD uses `hello@moneyguymutants.com` (`app/layout.tsx:134`). Two addresses.
- Severity: High before affiliate links go live.

### 2.5 Brand and name uses

- "The Money Guy Show": `app/the-money-guy-show/page.tsx` (tribute hub with show description, YouTube feed, thumbnails from `i.ytimg.com`, `lib/youtube.ts:104-105`, `LatestVideos limit={6}` at :383), `app/financial-mutants/page.tsx`, `app/page.tsx:11-13` (home title and description name the Show), `app/layout.tsx:29` (keywords: money guy, moneyguy, money guy show, money guy show tools, financial order of operations), `app/llms.txt/route.ts`, `app/sitemap.ts`, plus the footers above.
- Host names "Brian Preston" and "Bo Hanson": `app/the-money-guy-show/page.tsx:31` (a meta keyword "brian preston bo hanson") and `:241` (body copy). Only that one file.
- "Financial Order of Operations": `app/layout.tsx:29`, `app/page.tsx:21`, `app/financial-mutants/page.tsx` (:13,22,23,36,65,82,94,115,137,245), `app/the-money-guy-show/page.tsx` (:22,32,42,112,135,148,254), `app/llms.txt/route.ts:136`. Used as a metadata keyword and as "run the numbers behind the FOO". "FOO" appears in `financial-mutants/page.tsx:94` and the show page :102.
- "Army of Dollars": 0 hits.
- "20/3/8": used as the Car tool's rule in 8 files (`CarAffordability.tsx`, `calculator-content.ts:610-614`, `landing-pages.ts`, guide `2026-09-27-how-much-car-can-you-afford.md`, OG image). It is the Show's rule of thumb. No attribution line in tool copy.
- "Mutant": 800+ hits. It is the product name and mascot (`components/brand/MutantMark.tsx`, `public/mutant-mark.svg`). "Financial mutants" is also the Show's audience term. The metadata on `financial-mutants/page.tsx:13` targets "financial mutants and fans of the Money Guy Show".
- Colors: `app/tokens.css:35-54` navy #054C7D, sky #4EC9F5, orange #F26531, yellow #FEBF14, teal #1D8072. I could not verify these against the Show's branding. Flag for Drew/counsel only.
- No Show logos or show art are stored in `public/`. Video thumbnails are hot-linked from YouTube on one page.
- Severity: High. The brand leans on a third party's name in metadata and page titles ("The Money Guy Show: Watch, Subscribe & Run the Numbers"), which is nominative use at best, and it is the thing Drew's D1 decision accepted on 2026-09-29. Counsel review (Gate G-C) is still open.

### 2.6 Other term greps

- "Cortex Technologies" (legacy entity name, still user-facing): `components/marketing/Footer.tsx:117` (every marketing page copyright), `app/apps/budget/layout.tsx:39`, `app/account/page.tsx:606` ("Cortex Financial Technology"), `lib/seo-metadata.ts:26-28` (dead file). Terms and JSON-LD say J Media Group LLC. Three different legal names. Severity: Medium-High.
- "Cortex" other: `components/monetization/ProGatedPreview.tsx:9`, `ProUpsellCard.tsx:9` ("every Cortex calculator", user-facing), code comments, `scripts/test-resend*.{sh,js}` (from "Cortex <noreply@cortex.vip>"), `wordpress/mu-plugins/cortex-vercel-deploy.php`, whole `Cortex Design System/` folder.
- "cortex.vip": `lib/tool-funnel.ts:113` (own-host list, fine), migrations and scripts, `wordpress/` plugin default revalidate URL (:24,51). No live user-facing link.
- "M1": 0 hits as a word in app, components, lib, content. No M1 Finance reference anywhere. The only brokerage name hit is in `lib/personality-quiz-data.ts` (neutral).
- "affiliate": offers engine, admin, `components/monetization/affiliates.ts` (11 personal referral URLs still in the repo, used by the fallback), robots (`/go/` disallowed, `app/robots.ts:~58`), terms, disclosure. All handled except the hard-coded fallback list.
- "Elite": `app/apps/budget/page.tsx:867` ("Finance Pro or Elite tier"), `:904-905` ("Elite (Best Value) $29"), `app/pricing/opengraph-image.tsx:90-91` ("Elite $29/mo" in the pricing share image), `components/dashboard/AppLibrary.tsx:398` ("Upgrade to Elite - All Sectors"), legacy price ids in `lib/stripe/tier.ts:24`, `lib/validation.ts:46`.
- "$29": also `app/pricing/layout.tsx:6` meta description "Plans from $0 to $29/month". This is indexed copy and it is false (only $9 and $90 exist).
- "$9": `app/pricing/page.tsx:52`, `app/account/page.tsx:470`, `app/dashboard/page.tsx:332`, `PricingPreview.tsx:36`, six tool upgrade buttons (`DebtPaydown:724`, `CompoundInterest:350`, `CoastFIRE:865`, `RentVsBuy:559`, `IndexFund:609`, `Gambling:450`).
- "$90": `app/pricing/page.tsx:53`, `app/dashboard/page.tsx:332`. "$89": no lifetime price in code (no lifetime unlock exists).

### 2.7 Daily outlook posts (new compliance finding)

- `content/outlook/daily/*.md` (125 files) carries specific stock "ideas" with tickers, thesis, valuation, "why now" and entry timing (example `2026-06-16-calm-before-warsh-fomc-day-1-spcx-options.md:58-68`: "AVGO becomes more interesting into H2", "Existing holders: understand the mechanical bid peaks...").
- Each file opens with "Research and idea generation for personal use. Not investment advice." (`2026-10-23-...md:~12`) on a public, indexed, emailed page. "For personal use" is inconsistent with publishing and emailing it.
- The `/thinking` index and detail pages add no site-level disclaimer; they rely on the per-file markdown (`app/thinking/page.tsx`, `app/thinking/[slug]/page.tsx`). Recent posts say "No setup qualifies today", but older ones name securities.
- The posts are AI-assisted and have a "Money Guy Mutants Research" byline (`app/thinking/[slug]/page.tsx:195`).
- Severity: High. Publishing and emailing individual security ideas is the highest legal exposure on the site. Needs counsel before the daily email grows.

---

## 3. SEO implementation

### 3.1 Metadata

- `app/layout.tsx:21-30`: `title.default` "Money Guy Mutants - Financial Decision Tools & Budget Planning Software" (hyphen, no em dash, 70 characters, borderline long). `template` "%s | Money Guy Mutants". Description ~190 characters (:30), over the usual 155-160 cut-off.
- Duplicate `<title>` risk: none. `app/layout.tsx` `<head>` has no manual `<title>` (lines 187-224). The only `<title>` elements in code are inside the SVG mark (`components/brand/MutantMark.tsx:35`).
- Em dash (U+2014) IS present in page titles that go through the template: `app/page.tsx:11` (home: renders as "Money Guy Mutants [em dash] Tools for Long-Term Thinking | Money Guy Mutants", brand twice), `app/articles/page.tsx:21`, `app/guides/page.tsx:9`, `app/thinking/page.tsx:13`, `app/calculators/page.tsx:9`, `app/the-money-guy-show/page.tsx:20`, `app/enterprise/layout.tsx:4`, `app/apps/whats-your-why/layout.tsx:4`. Also em dashes in the RSS link titles (`app/layout.tsx:208,214`).
- Pricing: "Pricing - Money Guy Mutants Financial Tools | Money Guy Mutants" (`app/pricing/layout.tsx:4`), brand twice.
- Tool pages use `title: { absolute }` through `toolMetadata()` (`lib/calculator-content.ts:1644-1657`), so no suffix and canonical `https://moneyguymutants.com/apps/<slug>`.
- Home tagline "Tools for Long-Term Thinking" is the old Cortex tagline.

### 3.2 Sitemap, robots, feeds, AI files

- `app/sitemap.ts`: static routes use a frozen `lastModified` of 2026-04-07 (:63), tool pages 2026-10-18 (:65). Includes articles (from CMS), 125 outlook, 17 guides, 14 tool pages (from `CALCULATOR_CONTENT`), `/apps/whats-your-why`, six quiz archetype result pages. Landing pages `/calculators/*` are not included (resolved per AUDIT row 23). `/apps/personality-quiz` itself is not included. `/disclosure` is noindex and absent.
- Guides get priority 0.85 and tools 0.9 but home is 1.0. Priority and changefreq are ignored by Google; harmless.
- `app/robots.ts`: wildcard rule uses an allow-list of `PUBLIC_PATHS` (:3-32) plus a deny-list (:34-44). Everything not listed (for example `/s/`, `/disclosure`, `/api/`) is only blocked if in the deny-list. `/go/` is blocked (:43). `/s/` is not blocked in robots but the page sets `noindex` (`app/s/[token]/page.tsx`). 18 AI crawlers are named and allowed (:48-67), including training bots (GPTBot, CCBot, Bytespider, Google-Extended). That is a deliberate choice; flag it for Drew since it also permits training use.
- No `public/robots.txt`. `public/ai.txt` exists.
- RSS: `/articles/rss.xml`, `/guides/rss.xml`, `/thinking/rss.xml` (route handlers). Layout advertises articles and thinking feeds only, not guides (`app/layout.tsx:205-218`).
- `llms.txt` and `llms-full.txt` routes exist (`app/llms.txt/route.ts`, `app/llms-full.txt/route.ts`). `llms.txt` states the educational disclosure (:115).
- OG images: dynamic `opengraph-image.tsx` for site, pricing, 17 tool pages, quiz results (+ twitter image), articles, guides and thinking posts (24 files). `/api/personality-quiz/share-image` makes a portrait 1080x1350 or landscape 1200x630 card (`route.tsx`, edge).

### 3.3 JSON-LD

- Site-wide in `app/layout.tsx:104-171`: Organization (legalName J Media Group LLC, no `sameAs`), WebSite with SearchAction to `/articles?q=`, SoftwareApplication (free offer).
- Each `/apps/<tool>/layout.tsx` (14 of them plus quiz and others): BreadcrumbList, WebApplication, FAQPage via `generateCalculatorJsonLd` (`lib/calculator-content.ts:1662-1729`). FAQPage rich results are limited by Google to a few site types, so the FAQ markup has little SERP value.
- `/calculators/[slug]`: WebPage, BreadcrumbList, FAQ, ItemList (`app/calculators/[slug]/page.tsx:60+`).
- Articles and guides: Article or BlogPosting. Thinking: AnalysisNewsArticle. Landing pages: HowTo. `/the-money-guy-show`: CollectionPage with `about: TVSeries` pointing at the Show (`page.tsx:152-155`). `/apps`, `/articles`, `/guides`, `/thinking`: CollectionPage/ItemList.
- `SearchAction` target `/articles?q=` is valid: `app/articles/page.tsx:55` reads `q`.

### 3.4 Canonical handling

- `/apps/<tool>`: self-canonical, indexable, in sitemap.
- `/calculators/<slug>`: canonical points to `/apps/<tool>` (`app/calculators/[slug]/page.tsx:34`), `robots: index, follow` (:48) while the canonical points elsewhere. `/calculators` hub is `noindex, follow` (AUDIT row 23). `robots.ts` still allows `/calculators` and `/calculators/`.
- Static canonicals all hard-coded to `https://moneyguymutants.com` (`next.config.ts` and Vercel handle www and the old domain).

### 3.5 Content inventory (as of 2026-10-25)

| Type | Count | Range | Source | Freshness |
|---|---|---|---|---|
| Daily outlook | 125 files | 2026-04-24 to 2026-10-23 | `content/outlook/daily/*.md` (committed by the daily routine) | Mon to Fri cadence, gaps in October on the 7th, 14th, 16th, 20th. Last post 2 days old |
| Weekly outlook | 1 file | 2026-04-26 only | `content/outlook/weekly/` | Stale since April. Sunday cron `0 11 * * 0` (`vercel.json:9`) has nothing to send |
| Guides | 17 files | 2026-07-02 to 2026-10-25 | `content/guides/*.md`, registry `_topics.md` | Weekly goal, gaps in early Aug, early Sep, early Oct. Four were added 2026-10-18 |
| Articles | at least 23 | imported 2026-07-04 | Supabase `cms_content` (type article) via `lib/cms/articles.ts:139-142`, 1 hour cache. Imported from old WordPress then rebranded by find-and-replace (`supabase/migrations/import_wordpress_articles.sql:10-20`) | I did not query the DB. Current count unknown. Content is Cortex-era and name-swapped |
| Tool explainers | 14 | updated 2026-10-18 | `lib/calculator-content.ts` (1,729 lines) | Fresh |
| Landing pages | 11 slugs | | `lib/landing-pages.ts` | Out of sitemap |

---

## 4. Monetization and growth plumbing

### 4.1 Offers engine (new since Sep 29)

- Files: `lib/offers/eligibility.ts` (pure rules), `lib/offers/server.ts`, `lib/offers/conversions.ts`, `app/api/offers/route.ts` (public, cached 300 s), `app/go/[ref]/route.ts` (the only exit to an affiliate link), `components/offers/ResultOffer.tsx`, admin `app/admin/offers` and `app/api/admin/offers/route.ts`. Migrations `20260929140000_offers_engine.sql`, `20260929140100_seed_offer_placeholders.sql`.
- Status values: advertiser `program_status` in draft, applied, approved, paused, rejected (`20260929140000...sql:22-23`). Campaign `status` must be `active` and inside its date window (`eligibility.ts:83-89`).
- An offer is blocked unless ALL hold (`offerBlockers`, :64-104): kill switch on; placement is `tool-post-result`; advertiser exists, is `approved` and `is_active`; no `<<PASTE` in advertiser name or disclosure; campaign `active` and live by date; `tracking_url` set, not a placeholder, http(s); an active `offer_card` creative with no placeholder in headline, body or CTA. `/go/` re-checks on fresh data and sends the visitor back to the tool on any failure (`go/[ref]/route.ts:46-70`).
- Disclosure: default text "Sponsored. We may earn a commission ... Educational content, not financial advice." (`eligibility.ts:~170`) rendered beside the CTA with a "How we make money" link. Link uses `rel="sponsored noopener noreferrer"` (`ResultOffer.tsx:~57`).
- "After the result": revealed only after `tool_calculation_completed` and only when the slot is off-screen or has scrolled out of view (`ResultOffer.tsx:~135-150`). Good design.
- Sub-id: tool id plus an 8-hex FNV hash of the session. No PII.
- Seed: two draft placeholders, cannot render. 3 old banner advertisers paused, the rest draft.
- Verdict: the engine honors standing rules 6, 7, 8, 9. No issue found.

### 4.2 Kill switches and every NEXT_PUBLIC_* name (from code)

| Name | Default | Where |
|---|---|---|
| `NEXT_PUBLIC_OFFERS_ENABLED` | OFF unless exactly "true" | `lib/offers/eligibility.ts:~19`, `ResultOffer.tsx` |
| `NEXT_PUBLIC_BANNER_ADS_ENABLED` | OFF unless exactly "true" | `lib/ads/flags.ts` |
| `NEXT_PUBLIC_ADMIN_EMAILS` | empty | `lib/admin.ts` (browser admin gate) |
| `NEXT_PUBLIC_APP_URL` | none | `lib/site-url.ts`, email and outlook routes |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | n/a | supabase clients, analytics |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | n/a | `lib/stripe/client.ts` |
| `NEXT_PUBLIC_STRIPE_FINANCE_PRO_MONTHLY_PRICE_ID`, `..._ANNUAL_PRICE_ID` | falls back to the literal string `price_PLACEHOLDER` (`app/pricing/page.tsx:60-61`) | pricing, dashboard, `lib/stripe/tier.ts` |
| `NEXT_PUBLIC_STRIPE_ELITE_MONTHLY_PRICE_ID`, `..._ELITE_ANNUAL_PRICE_ID`, `..._PRO_MONTHLY_PRICE_ID` | legacy | `lib/stripe/tier.ts`, `lib/validation.ts` |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | n/a | signup captcha, CSP in `next.config.ts` |
| `NEXT_PUBLIC_GOOGLE_VERIFICATION`, `NEXT_PUBLIC_BING_VERIFICATION` | empty | `app/layout.tsx` |

Not flagged (and no kill switch): the Pro paywall, the enterprise form, the newsletter, GA4. GA4 has no flag and no consent gate (`app/layout.tsx:187-199`).

Open risk for the kill switches: both are inlined at build time, so a change needs a redeploy (documented in the code). The admin "Offers" page reads the same flag in the browser (`app/admin/offers/page.tsx`).

### 4.3 Things that do NOT exist

- Lifetime unlock: none. No `mode: 'payment'`, no lifetime price, no `lifetime` handling in `lib/stripe/reconcile.ts`. (Phase 2 not started.)
- "Email me my report": none. `report_email_*` events are defined in `lib/tool-funnel.ts:19-20` but nothing fires them. (Phase 3 not started.)
- Advisor referral: none. `advisor_intake_*` events defined and unused. `/enterprise` is an advisor/employer lead form only.
- Consent banner: none.

### 4.4 Saved scenarios and sharing

- `POST /api/scenarios` (`app/api/scenarios/route.ts`): login required; free tier max 1 per tool, 403 `FREE_LIMIT_REACHED` (:89-107); non-atomic count then insert (comment at :94-97); inputs max 20 KB (:17); tool name 120 chars; key result 500 chars. Pro unlimited.
- Share: `POST /api/scenarios/[id]/share` sets `is_public` and returns `/s/<token>` (UUID token from `crypto.randomUUID()`, :119). No tier check, so free users can share, which contradicts the "Share results with a link" Pro perk in the upsell copy.
- `/s/[token]` page: `robots noindex`, title "<Tool> Scenario - Money Guy Mutants" (em dash in code, `app/s/[token]/page.tsx:~43`), shows `key_result` in the meta description. A shared link exposes the saved dollar inputs through `/api/scenarios/shared/[token]`. There is no confirmation screen telling the user that the numbers become public, and no unshare button (I did not see one in `SaveScenarioButton.tsx`).
- Analytics page_url stores `?scenario=` tokens (AUDIT section 9). Unchanged.
- Personality quiz share image: edge route, portrait or landscape, no user data in the image (`app/api/personality-quiz/share-image/route.tsx`).

### 4.5 Newsletter and enterprise

- Newsletter form (`app/thinking/_components/OutlookSubscribeForm.tsx`) is mounted only on `/thinking` (:175) and `/thinking/[slug]` (:286). Not on the home page, tool pages, guides, articles, dashboard or footer. Only one confirmed subscriber at baseline.
- Subscribe route: double opt-in, honeypot, in-memory limit (5 per 5 minutes, `lib/rate-limit.ts:151`). Gaps from AUDIT section 5 (no postal address, confirm on GET, no unsubscribe in the confirmation) were not re-verified one by one, but nothing in the changed-file list touches them.
- Enterprise lead form: `app/api/enterprise-lead/route.ts` (limit 10 per minute per IP). Still open: owner notification email interpolates `firstName`, `lastName`, `email`, `companyName` into HTML without escaping (`lib/email.ts:52-66`) while the signup alert in the same file does escape (`:195-197`). Same issue AUDIT flagged. Severity Medium.

### 4.6 Pricing page and signup flow

- `app/pricing/page.tsx:30-74`: two plans. Free ("Compound Interest Calculator", "Car Affordability Calculator", "Limited scenarios and projections", "Community support") and Finance Pro $9/mo or $90/yr ("Save $18/year", "Full access to all Money Guy Mutants tools", "S-Corp tools and tax modeling", "Priority support", "Ad-free experience"). Copy at :177: "No countdowns, no dark patterns."
- Pricing issues: "Priority support" and "Community support" are claims with no visible channel in code. The Free list names only 2 tools while most calculators are free in basic form. Pro features overstate (1.5). The OG image and meta description still advertise an Elite $29 plan (2.6).
- Signup: `/signup` posts to `/api/auth/signup` with Turnstile token, honeypot and form-start time (`app/signup/page.tsx:232-250`). If Supabase email confirmation is off, the user is signed in at once and redirected; otherwise a "check your email" screen. `plan=finance_pro` still sends the user to `/dashboard` to click "Continue to checkout" (AUDIT section 3, unchanged: `app/dashboard/page.tsx:132-176`).
- Stripe: AUDIT section 3 still holds. `git diff 1990226..HEAD` shows no change under `app/api/create-checkout-session`, `app/api/webhooks`, `lib/stripe`, `app/api/verify-checkout` or `app/pricing` beyond one line. Still subscription mode only, login required, 4 steps from intent to payment.
- Event naming collision still present: the browser fires `subscription_upgrade` when the checkout session is created (`app/pricing/page.tsx:132`, `app/dashboard/page.tsx:151`) and the webhook fires the same name when the tier changes (`app/api/webhooks/route.ts:184`). The funnel names `checkout_started` and `checkout_completed` are defined but never fired.
- `PAYMENT_AND_SIGNUP_AUDIT.md` item 1 (Stripe webhooks never processed, 0 `webhook_events` rows) is the largest unknown. I cannot see production state. Drew should confirm that webhooks are registered and 2xx.

### 4.7 Changes since 1990226 (git log, 33 non-outlook commits)

Offers engine and `/go` redirect, admin offers/monetization/ads pages, scorecard views, ToolFunnel and tool-funnel events, banner kill switch, Phase 5 SEO (landing pages canonicalized, 1,374 added lines to `calculator-content.ts`, `tests/seo-content.test.mjs`), Q4 guides, gambling helpline fix, admin rebuild as iOS-style app, responsive and a11y polish, auth form states, Next.js bump to 16.4.3. No checkout, webhook or lifetime change.

---

## 5. Analytics

### 5.1 EventType union (`lib/analytics.ts:19-74`)

Funnel (13, via `FUNNEL_EVENTS` in `lib/tool-funnel.ts:14-28`): tool_viewed, tool_calculation_completed, result_exit_intent, offer_impression, offer_click, report_email_requested, report_email_sent, unlock_cta_viewed, unlock_cta_clicked, checkout_started, checkout_completed, advisor_intake_started, advisor_intake_submitted.
User: user_signup, user_login, user_logout, password_reset_requested, password_reset_completed, resend_verification_requested, subscription_upgrade, subscription_cancel, subscription_success_view.
App: app_opened, calculation_completed, result_downloaded, app_session_start, app_session_end.
Engagement: page_view, dashboard_visit, pricing_page_view, account_page_view, enterprise_page_view, enterprise_form_submitted.
Landing: landing_page_view, landing_cta_click.
Onboarding: onboarding_started, onboarding_step_completed, onboarding_completed, onboarding_skipped.
Donation (dead): donation_popup_shown, donation_popup_clicked, donation_popup_dismissed.
Errors: error_occurred, api_error.
Vitals: web_vital_cls, _fid, _lcp, _fcp, _ttfb, _inp.

### 5.2 What actually fires (grep of `trackEvent`, `trackServerEvent`, `trackPageView`, `gtag`)

- Fires: page_view (`components/Analytics.tsx:18`), tool_viewed (`ToolFunnel.tsx:67`), tool_calculation_completed (`:51`), result_exit_intent (`:78`), offer_impression (`ResultOffer.tsx:166`), offer_click (server, `app/go/[ref]/route.ts:91`), user_signup (`signup/page.tsx:264`), user_login (`login/page.tsx:162`), password_reset_requested/completed, resend_verification_requested, subscription_upgrade (client twice, server once), subscription_cancel (server `webhooks/route.ts:191`), subscription_success_view (`dashboard/page.tsx:108`), dashboard_visit, pricing_page_view, enterprise_page_view, enterprise_form_submitted, onboarding_*, app_opened (`AppLibrary.tsx:277,323`), landing_page_view, landing_cta_click, error_occurred, web vitals (cls, lcp, fcp, ttfb, inp via `components/WebVitals.tsx`).
- Never fired: calculation_completed (old name, 0 rows), result_downloaded, app_session_start, app_session_end, account_page_view (not found in grep), user_logout (not found), api_error (not found), web_vital_fid (web-vitals v5 has no FID), the three donation events, report_email_*, unlock_cta_*, checkout_started, checkout_completed, advisor_intake_*.
- `input_bucket` is an allowed key on `tool_calculation_completed` (`tool-funnel.ts:35`) but no caller sets it.
- `trackToolVisit` (`lib/useRecentTools.ts`) is local recents, not analytics.

### 5.3 GA4

- `G-0PQ1RZVNTS` loads on every page, unconditionally, with only `gtag('config')` (`app/layout.tsx:187-199`). No custom gtag events, no consent mode. The one custom call is `affiliate_click` in `components/monetization/AdSlot.tsx:310`, and that surface is off (banner flag), so GA4 currently receives page views only.
- Web vitals go to the first-party `events` table, not GA4.
- Tool funnel definition: `lib/tool-funnel.ts` (185 lines). Completion = input changed and result held on screen for `COMPLETION_SETTLE_MS`, or `markCompleted()` for the quiz and Why. Bots and own hosts filtered (`OWN_HOSTS` at :113). Payload keys are whitelisted per event (:33-47) and PII-sanitized (`toSafeSlug`, :66-76). `tests/event-payload-pii.test.mjs` enforces it.
- Scorecard views (migration `20260929120000_monetization_scorecard.sql`): `v_scorecard_events`, `v_site_traffic`, `v_tool_funnel`, `v_revenue_by_line` (recreated in the offers migration at :136). Admin page `app/admin/monetization/page.tsx`, API `app/api/admin/monetization/route.ts`, row types in `lib/monetization/scorecard.ts`.

### 5.4 Wanted-event map

| Wanted | Exists? | Notes |
|---|---|---|
| tool_started | Partial | `tool_viewed` fires on mount (`ToolFunnel.tsx:67`). There is no "user changed an input" start event. |
| tool_completed | Yes, different name | `tool_calculation_completed` (`ToolFunnel.tsx:51`) |
| scenario_saved | MISSING | `SaveScenarioButton.tsx` and `app/api/scenarios/route.ts` fire nothing |
| signup | Yes | `user_signup` (`signup/page.tsx:264`), client-side only; if the API fails after the call there is no server confirmation |
| upgrade_started | Partial | `subscription_upgrade` from browser at session creation; `checkout_started` defined but never fired |
| upgrade_completed | Partial | `subscription_upgrade` from webhook (`webhooks/route.ts:184`); same name as the started event. `checkout_completed` defined but never fired. Zero confirmed in production per baseline |
| affiliate_click | Yes, two forms | `offer_click` (server, `/go`) in first-party events; GA4 `affiliate_click` only from the banner path (off). |
| newsletter_signup | MISSING | `app/api/outlook/subscribe/route.ts` and the form fire no event. Only the DB row exists |

---

## 6. Design system and UX code

- Marketing shell: `components/marketing/Nav.tsx` links Tools (`/#tools`), Watch (`/the-money-guy-show`), Guides, Thinking, Pricing, Articles (:10-15). Note "Watch" points to the Show tribute page. Footer groups: product, company (About, Guides, Thinking, Articles, Enterprise), legal (Terms, Privacy both to `/terms`, Disclosure, Security) (`Footer.tsx:20-37`).
- App shell: `components/app/AppShell*.tsx`, side nav and mobile tab bar with three items: Apps (`/dashboard`), Scenarios (`/dashboard/scenarios`), Learn (`/articles`) (`AppSideNav.tsx:18-24`, `AppMobileTabBar.tsx:16-22`). Tool pages under `/apps/*` use this shell (`app/apps/layout.tsx`). Public marketing pages use the marketing Nav. `components/layout/` holds only `DashboardLayout`, `PageHeader`, `SectionHeader`. User menu in `components/navigation/UserMenu.tsx`.
- Tokens: `app/tokens.css` is the source. Light-only; every `data-theme` resolves to one palette (:30-33). Fonts: Hanken Grotesk and JetBrains Mono via `next/font` (`app/layout.tsx:7-19`). Variable names keep the old emerald/obsidian/crimson scale remapped to navy/teal/red (:11-25). CTA is orange, but the comment says CTA fills and positive deltas both resolve to `--emerald-500` today.
- Design doc: `Cortex Design System/` folder exists and is STALE. It describes Cortex, Geist fonts, dark emerald (`README.md:1-35`, `SKILL.md:3`). It contains JSX that is linted (37 of the 192 lint errors). The live reference is `app/design/page.tsx` plus `app/tokens.css`. There is no Money Guy Mutants design-system doc in the repo.
- Reusable result and gating components: `components/monetization/ProGatedPreview.tsx` (blurred children plus overlay), `ProUpsellCard.tsx` (below-tool card), `components/ui` (KPICard, Breadcrumb, Tooltip, NumberInput, CalculatorSkeleton), `components/seo/CalculatorSEOContent`, `RelatedTools`. There is NO shared "ResultCard" or "ResultSummary" component. Each tool builds its own headline stat block, so a shared next-step slot cannot be placed per tool.
- What blocks "result first, then next step":
  - Guests see `ToolUpsellCta` (a navy signup band) above the tool (`ToolIsland.tsx:89`) before any result. It is a sign-up prompt, not an ad, but it is the first thing on the page.
  - Calculators render a result at page load from defaults, so "after the result" cannot mean "after load". The funnel works around it with the 1.5 s completion rule. The offer card is placed after the whole tool island, below long Pro panels and blurred previews (`ToolIsland.tsx` mounts `ResultOffer` after `<Tool />`), so it can sit far below the headline number.
  - In-tool Pro upsell cards sit between the free result and the offer (`ProUpsellCard` at the bottom of each tool). Two paid prompts and one sponsor prompt can stack.
  - Disclaimer is below the SEO block (see 2.2).
  - Budget is a whole-page client component outside `ToolLayout` and `ToolIsland`. It has its own InlineAd and no `ResultOffer` or `ToolFunnel`. So no funnel events or offer surface exist for budget, the first tool in the nav.

---

## 7. Tests, lint, typecheck (run 2026-10-25)

- `npm test`: PASS. 161 of 161 pass, 0 fail (1.5 s). Covers tax engine, offers, funnel, scorecard, PII payloads, ads, tier mapping, SEO content and more.
- `npx tsc --noEmit`: PASS. Exit 0, no errors.
- `npm run lint`: FAIL. 267 problems, 192 errors, 75 warnings. Baseline in AUDIT row 17 was 186 errors / 78 warnings, so errors grew by 6. Breakdown of errors by rule: no-explicit-any 73, react/no-unescaped-entities 45, react/jsx-no-undef 34, React Compiler "setState synchronously in an effect" 20, prefer-const 11, others 9. 37 of the 192 errors come from `Cortex Design System/**/*.jsx`, which `eslint.config.mjs:10-16` does not ignore. Worst app files: `components/apps/NetWorthEngine.tsx` (13), `DebtPaydownOptimizer.tsx` (12), `lib/supabase/client.ts` (9), `RentVsBuyEngine.tsx` (8), `GamblingRedirect.tsx` (7), `app/api/admin/users/[id]/route.ts` (7).
- CLAUDE.md rule 14 says lint must pass before a PR is ready. It cannot today. Ignoring the design-system folder would cut it to 155 errors.

---

## 8. Stale docs (root `*.md`)

| File | Problem |
|---|---|
| `README.md` | Titled "Cortex"; describes Cortex (:1-3) |
| `QUICK-START.md` | Teaches a 3-tier setup with Elite $29 / $290 (:19-21, :49); no Elite exists; points at `supabase-tier-migration.sql` |
| `MULTI-SECTOR-IMPLEMENTATION.md` | 37 Elite/$29 hits; multi-sector tiers (Finance, Real Estate, etc.) that the code no longer has (`lib/access-control.ts` has free and finance_pro) |
| `DEPLOYMENT_SUCCESS.md` | 14 Cortex, 12 cortex.vip; deployment record for the old domain |
| `DEPLOYMENT_CHECKLIST.md` | Mentions Elite and Cortex; mixed |
| `SEO_ACTION_PLAN.md`, `SEO_IMPLEMENTATION_COMPLETE.md` | cortex.vip era (19 and 30 Cortex hits). `SEO.md:3-4` already says they are superseded. They should be deleted or moved to an archive folder |
| `SEO.md` | Current (2026-10-18). Good. Still names cortex.vip once |
| `REBRAND_PLAN.md` | Historic. Says keep legal entity "Cortex Technologies" (:7-8) and states the operating entity is J Media Group LLC. That decision is why the footer still says Cortex |
| `DOMAIN_MIGRATION.md` | Operational and mostly accurate; 28 Cortex hits by design. `cms.cortex.vip` image allowlist note should be re-checked since `import_wordpress_articles.sql:21-23` says the last image was removed |
| `RECENT_FIXES.md`, `APPS_RESTORED.md`, `ALL_APPS_RESTORED.md`, `IMPLEMENTATION-SUMMARY.md`, `ANALYTICS_IMPLEMENTATION.md`, `ANALYTICS_SETUP_STEPS.md`, `ACCOUNT_MANAGEMENT.md` | Cortex-era change logs and setup notes, last touched Sep 11; no unique current value. Analytics docs predate the first-party `events` pipeline and the funnel |
| `PAYMENT_AND_SIGNUP_AUDIT.md` | Valuable and probably still open (webhooks never processed). Needs a status check against Stripe, not a delete |
| `SECURITY_SIGNUP_HARDENING.md` | Current (mentions Turnstile and signup route) |
| `ADS.md` | Current (updated 2026-09-29 with the kill switch). Says banners show to guests and free users; correct when the flag is on |
| `CMS.md` | Mostly current. Says Guides and Thinking "follow in later phases" but both are file-based, not CMS |
| root `*.sql` (`database-migration.sql`, `supabase-*.sql`) | Pre-migrations-folder scripts. Not safe to run; contain old tier enum |
| `Cortex Design System/` | See section 6 |
| `docs/monetization/AUDIT.md` | Written at 1990226. Section 4 (ads) and 11 (SEO) partly overtaken. Rows 23 to 37 already patched in |

---

## Top 15 findings (by severity)

1. **Most of the Pro upsell promises features the code does not have.**
   Where: `components/monetization/ProGatedPreview.tsx:6-21`, `ProUpsellCard.tsx:6-21`, `app/pricing/page.tsx:51-64`.
   Why: Monte Carlo (Coast FIRE), custom fund basket and dividend reinvestment (Index Fund), defined benefit modeling (S-Corp Investment), multi-account and tax-advantaged modeling (Compound), behavioral cost calculator, multi-year salary strategy are listed at the point of purchase and are not in the tools. Consumer-protection and refund risk, and it undercuts any lifetime offer.
   Severity: High.

2. **Debt Paydown copy calls debt payoff a "guaranteed" return and tells users to act.**
   Where: `components/apps/DebtPaydownOptimizer.tsx:644, 764, 863, 939, 1021`.
   Why: Breaks standing rule 10. These five lines were not covered by the Phase 5 claim fixes.
   Severity: High.

3. **Daily outlook publishes and emails specific stock ideas.**
   Where: `content/outlook/daily/*.md` (e.g. `2026-06-16-...md:58-68`), header line "for personal use", `app/thinking/[slug]/page.tsx`, `vercel.json:5-6` (daily email cron).
   Why: Named tickers, thesis, "why now" and entry guidance on a public, indexed, emailed product with no site-level disclaimer. Highest legal exposure on the site. Needs counsel.
   Severity: High.

4. **The brand and SEO lean on The Money Guy Show's name, hosts, framework and fan term.**
   Where: `app/layout.tsx:29` (keywords), `app/page.tsx:11-21`, `app/the-money-guy-show/page.tsx:20-42,241` (title, "brian preston bo hanson" keyword, thumbnails), `app/financial-mutants/page.tsx`, 20/3/8 in 8 files.
   Why: Nominative use claims get weaker with host-name keywords, show-titled pages, and "Financial Order of Operations" as a target keyword. D1 accepted the risk on 2026-09-29 but counsel review (Gate G-C) is still open.
   Severity: High.

5. **Terms and privacy page is out of date and generic.**
   Where: `app/terms/page.tsx:70` (Jan 16, 2026), `:98`, `:157-164`, `:173-179`.
   Why: No billing or refund terms, no processors, no GA4 or AI disclosure, no consent banner (`app/layout.tsx:187-199`), irrelevant directory clause. Needed before affiliate links go live.
   Severity: High.

6. **Pricing surfaces still advertise a non-existent Elite $29 plan.**
   Where: `app/pricing/layout.tsx:6` (indexed meta description), `app/pricing/opengraph-image.tsx:90-91` (share image), `app/apps/budget/page.tsx:867,904-905`, `components/dashboard/AppLibrary.tsx:398`.
   Why: Public false price claim, shows when the pricing link is shared. Quick fix.
   Severity: High (low effort).

7. **Legal entity name is wrong or inconsistent on public pages.**
   Where: `components/marketing/Footer.tsx:117` and `app/apps/budget/layout.tsx:39` ("Cortex Technologies"), `app/account/page.tsx:606` ("Cortex Financial Technology"), `app/layout.tsx:118` and `app/terms/page.tsx:98` (J Media Group LLC).
   Why: Three names for the same operator. Trust, tax and affiliate-network application mismatch.
   Severity: Medium-High.

8. **Stripe webhook health is unverified and may never have worked.**
   Where: `PAYMENT_AND_SIGNUP_AUDIT.md` item 1, `app/api/webhooks/route.ts`, baseline "no webhook-confirmed upgrade ever recorded".
   Why: Without webhooks, failed or ended subscriptions are not downgraded. Also blocks any reliable `upgrade_completed` metric and any lifetime unlock.
   Severity: High (needs Drew to check Stripe).

9. **Analytics cannot yet measure the funnel the plan needs.**
   Where: `lib/analytics.ts:19-74`, `lib/tool-funnel.ts:14-28`.
   Why: scenario_saved and newsletter_signup do not exist. `subscription_upgrade` is used for both "checkout started" (browser, `pricing/page.tsx:132`, `dashboard/page.tsx:151`) and "upgrade done" (`webhooks/route.ts:184`). `checkout_started`/`checkout_completed`/`unlock_cta_*`/`report_email_*` are defined and never fired. Budget has no funnel at all.
   Severity: Medium-High.

10. **Educational disclaimer is not next to results, and missing on Budget.**
    Where: `components/app/ToolLayout.tsx:40,136-148` (below the FAQ), `app/apps/budget/page.tsx` (none), `/dashboard`, `/account`.
    Why: Rule 9/10 intent is a clear adjacent disclosure. Only two tools have an in-tool line.
    Severity: Medium-High.

11. **Rent vs Buy and Gambling use hidden or invented assumptions.**
    Where: `RentVsBuyEngine.tsx:67,110,119-120` (30-year term, 0.5% insurance, no PMI, untaxed renter returns), `GamblingRedirect.tsx:94,318,322` (3.5x "addiction multiplier", unsourced 3-4% and 7-9% stats).
    Why: Results lean in one direction and the user cannot see why.
    Severity: Medium.

12. **Enterprise lead email interpolates unescaped form input into HTML.**
    Where: `lib/email.ts:52-66` (versus escaped signup alert `:195-197`), `app/api/enterprise-lead/route.ts`.
    Why: HTML injection into the owner's inbox. Already flagged in AUDIT section 5, still open.
    Severity: Medium.

13. **Lint is red and rule 14 requires green.**
    Where: `npm run lint` 192 errors / 75 warnings (baseline 186 / 78); `eslint.config.mjs:10-16` does not ignore `Cortex Design System/` (37 of the errors).
    Why: Blocks marking any PR ready. Cheapest fix is an ignore entry plus a lint baseline.
    Severity: Medium.

14. **Sharing publishes dollar inputs with no warning, and the Pro copy says sharing is Pro.**
    Where: `app/api/scenarios/[id]/share/route.ts:7-47`, `app/s/[token]/page.tsx:~43`, `components/monetization/ProUpsellCard.tsx:9`.
    Why: Users may not realize income and balances become reachable at `/api/scenarios/shared/<token>`. No unshare control found. Rule 8 spirit.
    Severity: Medium.

15. **Content and SEO hygiene gaps.**
    Where: weekly outlook has 1 post since April (`content/outlook/weekly/`, cron `vercel.json:9`); articles are name-swapped Cortex imports (`supabase/migrations/import_wordpress_articles.sql:10-20`); em dash and doubled-brand titles (`app/page.tsx:11`, `app/pricing/layout.tsx:4`); static sitemap dates frozen at 2026-04-07 (`app/sitemap.ts:63`); 70+ character default title and 190-character description (`app/layout.tsx:21-30`); `robots.ts` allows `/calculators/` while the hub is noindex; tools with no `ToolLayout`/`ToolIsland` (Budget) lack the offer slot.
    Why: Traffic fell to 167 and 273 views in Aug/Sep (AUDIT); these are the cheap on-site fixes that sit next to the Search Console check Phase 5 already lists.
    Severity: Medium-Low.

### Open questions I could not answer from the repo
- Current Supabase article count and whether Stripe webhooks are registered and returning 2xx.
- Whether the 2026 retirement and tax figures exactly match the IRS notices (they look right; I did not browse).
- Whether the show's color palette or the "Financial Mutants" phrase is protected. Counsel question.
