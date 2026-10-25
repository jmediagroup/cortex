# Money Guy Mutants: growth, usefulness and monetization report

**Date:** October 25, 2026. **Prepared for:** Drew Jenkinson, J Media Group. **Status:** proposal only. No code was changed, nothing was committed, nothing was signed up for, nothing was spent.

**How this was produced.** The repo at commit `ec685e5` was read end to end. The live production HTML was read through Vercel (deployment `dpl_CUtHZ...`, commit `ec685e5`, the same code). The sandbox network policy blocks direct requests to moneyguymutants.com, so the screenshots in this report come from a local build of the same commit, running with placeholder database keys. Anything that needs the database (the article list, sign-in, saved scenarios) looks empty in those screenshots and is marked as such. Desk research ran through web search only, so every external fact is cited and marked verified or unverified. A one-page summary is in `EXECUTIVE-SUMMARY.md` next to this file.

**Three things this report does not do.** It does not give legal conclusions (the naming section lays out risk and options, and recommends a trademark attorney). It does not quote commission rates, APRs or program terms as facts; where a source states one it is cited with the URL and date. It does not recommend anything that would not help the user with zero commission.

---

## 0. The short version

1. **Trust first, and the site is leaking trust in five visible places today.** The Pro upsell lists features that do not exist (Monte Carlo on Coast FIRE, a fund-basket builder, defined-benefit modeling). The Debt Paydown tool calls debt payoff a "guaranteed return" and "guaranteed profit" five times. Pricing metadata and the pricing share image still advertise an "Elite $29/month" plan that does not exist (the real plan is $9/month). The footer on every page says "© 2026 Cortex Technologies" while the terms say J Media Group LLC. The daily "Thinking" posts name specific tickers with entry timing, under a "for personal use" line, and are emailed. All five are a few hours of work. Fix them before any growth or monetization spend.
2. **Traffic is near zero, so distribution comes before monetization.** Clean page views fell from about 2,300 in July to 167 in August and 273 in September, right after the move from cortex.vip. Nobody can tell yet whether rankings are recovering because Search Console is not verified and Vercel Web Analytics is not enabled. A monetization layer on 270 views a month earns nothing. The first 30 days are about measurement and search recovery.
3. **The brand name is the single largest risk, and this is the cheapest moment there will ever be to change it.** THE MONEY GUY SHOW is a filed USPTO mark (serial 90145137, owner shown as 88xOver, LLC; status unverified). The site's name, its /the-money-guy-show page, its meta keywords ("money guy show tools", "financial order of operations", "brian preston bo hanson") and its "financial mutants" positioning all reference that brand. Three outreach attempts got no reply. With traffic at its low point, a neutral rebrand costs almost nothing in lost search equity. Options and a recommendation are in section 1.9. Get an attorney's view either way.
4. **The product is better than its wrapper.** The tax engine is current for tax year 2026, sourced, and covered by 25 known-answer tests. Coast FIRE exposes every assumption as an editable input. The offers engine already enforces approved-only, placeholder-blocked, after-the-result, disclosed, `rel="sponsored"` rendering with a kill switch. Those are real moats for a trust brand. The wrapper (16 tools in one long list, three competing prompts on every tool page, a disclaimer buried under the FAQ, a signup band above the result) hides them.
5. **Monetization order:** (a) honest freemium with a Pro tier that only promises what exists, (b) a weekly long-term-thinking email that replaces the daily ticker digest, (c) disclosed affiliate offers after the result on the three pilot tools, once Drew has approved programs, (d) advisor or CPA referrals only after counsel review, (e) everything else later.

---

## 1. Audit

Severity scale: **High** = trust, legal or revenue damage now. **Medium** = hurts conversion or clarity. **Low** = polish.

### 1.1 Navigation and information architecture

| What | Where | Why it matters | Severity |
|---|---|---|---|
| Header nav has six items: Tools, Watch, Guides, Thinking, Pricing, Articles. "Watch" goes to the Money Guy Show tribute page. | `components/marketing/Nav.tsx:10-15` | A trust brand should not give a third party's show a top-level nav slot. "Articles" and "Guides" are the same job for a visitor. "Thinking" means nothing to a new visitor. | Medium |
| Three content sections (Articles, Guides, Thinking) with three RSS feeds. Articles are a find-and-replace import of 23 Cortex-era WordPress posts. | `supabase/migrations/import_wordpress_articles.sql:10-20`, `app/articles`, `app/guides`, `app/thinking` | Splits thin content three ways. Guides are the strongest asset (17 evergreen explainers since July). | Medium |
| The tools hub lists all 16 tools in one column on mobile with FREE and PRO badges that disagree with the pricing page (Car Affordability is PRO on the hub and a Free feature on pricing). | `lib/tools-registry.ts`, `app/pricing/page.tsx:30-45`, `components/dashboard/AppLibrary.tsx` | Visitors cannot tell what is free. Four separate tool lists in code drift apart. | Medium |
| Signed-in app shell has a three-item bottom tab bar: Apps, Scenarios, Learn. Public pages use a different header. Tool pages use the app shell even for guests. | `components/app/AppMobileTabBar.tsx`, `app/apps/layout.tsx` | Two navigation systems for the same visitor. A guest on a tool page sees "Scenarios", which needs an account. | Low |
| No search, no "start here" path. The hero's primary button goes to the tool grid. | `app/page.tsx` | 16 tools is too many to scan; the site needs a guided entry (three jobs, three tools). | Medium |
| The signed-in app shell used on /apps and every tool page has no hamburger and no link to Pricing, Guides or Thinking. The tool footer links only Articles, Pricing and Terms. | `components/app/AppShell*.tsx` | A guest who lands on a tool from search has no way to the rest of the site except the logo. | Medium |
| Tool counts disagree: the home page says "13+ tools" in one place and "Fifteen tools" in another; there are 16 tool routes. | `app/page.tsx` | Small, but it is the kind of thing a careful reader notices first. | Low |

### 1.2 Every page type

| Page | Works? | Notes | Severity |
|---|---|---|---|
| Home | Yes | Clear hero, strong mock result card. Unsupported claims: "0 dark patterns" (stated as a stat), "Thousands of Mutants", and a mock card labelled "NET WORTH, LIVE $248,912" that is not live. Sections below the hero fade in on scroll and are blank until scrolled (once-only "enter" animation). Footer carries the not-affiliated line. Title has an em dash and renders the brand twice. | Medium (title), Low |
| /apps | Yes | 16 cards, one column on mobile, each with a two-line description and FREE/PRO badge. "NOT ADVICE" disclaimer at the very bottom. | Medium |
| /calculators and /calculators/[slug] | Yes | 11 search landing pages that embed the same calculators, canonical to /apps/<tool>, hub is noindex. Correctly out of the sitemap since Oct 18. robots.txt still lists them as allowed, which is harmless. | Low |
| /articles | Depends on DB | 23 or more imported posts from July 2026. Rebranded by string replacement, which is visible in slugs like "money-guy-mutants-blueprint-your-6-month-roadmap". | Medium |
| /guides | Yes | 17 file-based guides, July 2 to Oct 25, linked to tools. The best content on the site. Weekly cadence with gaps. | Good |
| /thinking | Yes | 125 daily market posts since April 24, one weekly post ever (April 26) while a Sunday cron still runs. Posts name tickers, theses and timing. Newsletter form lives only here. | High (compliance, see 1.8) |
| /financial-mutants | Yes | Explains the "financial mutant" idea and the Financial Order of Operations. Positions the site as "for financial mutants and fans of the Money Guy Show". Says "Every calculator ... is free to use without an account" and "No product pitches", while two tools are fully Pro-locked and every tool page carries upgrade prompts. | High (naming, see 1.9) |
| /the-money-guy-show | Yes | Titled "The Money Guy Show: Watch, Subscribe & Run the Numbers". Hot-links six YouTube thumbnails, has a meta keyword "brian preston bo hanson", JSON-LD `about: TVSeries`. Carries the not-affiliated line three times. | High (naming) |
| /about | Yes | Marketing shell, footer disclaimer. | Low |
| /pricing | Yes | Two plans, $0 and $9/month or $90/year. Copy says "No countdowns, no dark patterns", yet the Pro card wears a "Most popular" badge while the production database shows one `finance_pro` user and zero active subscriptions. The indexed meta description says "Plans from $0 to $29/month" and the share image shows "Elite $29/mo". | High |
| /enterprise | Yes | "Team seats, custom integrations, white-label deployments" lead form. Four leads ever. Says "Trusted by financial advisors, HR teams..." and promises API access and a named account manager, none of which exist. Owner notification email interpolates form input into HTML without escaping. | Medium |
| /roadmap, /changelog, /security | Yes | Fine. Sitemap dates for all static pages are frozen at 2026-04-07. | Low |
| /disclosure | Yes | Placeholder marked `LEGAL_REVIEW_REQUIRED`, noindex, not in sitemap. Its five claims match the code. | Medium (needs Drew's approval before any offer goes live) |
| /terms | Yes | "Last updated January 16, 2026". Generic J Media Group template: no billing or refund terms, no Stripe, Supabase, Resend, GA4 or Anthropic as processors, an irrelevant "Directory & local listings" clause, contact support@jmediagroup.net while JSON-LD says hello@moneyguymutants.com. "Privacy" in the footer links to the same page. | High |
| /login, /signup | Yes | Clean forms, Turnstile, honeypot. Signup for Pro is four steps from intent to payment (signup, verify email, dashboard, "Continue to checkout"). | Medium |

### 1.3 Every tool: does it work, is it accurate, are assumptions shown

All 16 tools render a result for anonymous visitors at page load from default inputs, with no calculate button. Results update live. The tax math is the strongest part of the codebase: `lib/tax/taxEngine2026.ts` is tax year 2026 (cites Rev. Proc. 2025-32), and 2026 limits in code match the published figures (401(k) 24,500, IRA 7,500, HSA 4,400, wage base 184,500, standard deduction 16,100). No arithmetic bug was found in the free paths. Only the capital gains tool and the engine are unit tested.

| Tool | Works | Accuracy notes | Assumptions shown? | Severity |
|---|---|---|---|---|
| Compound Interest | Yes | Correct nominal-to-effective conversion. Nominal dollars, noted. | Rate is an input, inflation note present. | Low |
| Coast FIRE | Yes | Real growth = growth minus inflation minus fees, consistent. 10% nominal default growth is aggressive. Copy says the number "will grow to your FIRE number" as fact. | Yes, every core assumption is an editable "Advanced Assumptions" input. Pro stress sizes are hidden. | Medium |
| Index Fund Visualizer | Yes | Fixed CAGRs 10.5 / 10.2 / 8.5 / 13.5 (Drew confirmed Oct 18). Expense ratios are shown but never deducted, which is not disclosed. Heading "MUTANT Recommendation" and copy "gold standard", "proven track record". | Partly. Rates visible, not editable. | Medium-High (recommendation wording breaks the no-advice rule) |
| Budget | Yes | Flat tax drag by mode. Whole page is its own client component outside the shared layout: no disclaimer, no funnel events, no offer slot, old "Elite $29" modal copy, its own "Cortex Technologies" footer. On mobile an "Unlock 7 More Financial Calculators" banner comes before the H1, and an empty white PRO FEATURE card with a gold button (a color used nowhere else) looks broken. | Tax mode visible, optimizer targets hidden. | Medium |
| Rent vs Buy | Yes | Hidden: 30-year term, 0.5% insurance, no PMI below 20% down, renter portfolio grows untaxed, buy side nets 6% selling cost from year 0 without saying so. Leans toward renting. | Main inputs yes, the hidden list no. | Medium-High |
| Car Affordability | Yes | 20/3/8 rule (the Show's rule of thumb, unattributed). 4.0% default rate is likely below market (unverified). | Rate editable, rule explained. | Medium |
| Retirement Strategy | Yes | Single filer only, ignores the 65+ extra deduction. RMD ages correct. | Footnote. | Medium |
| Net Worth | Yes | Momentum and liquidity bands hidden. | Growth is an input. | Low |
| S-Corp Optimizer | Yes | Payroll tax only, correct 2026 base and rates. No state tax, no S-corp running costs. 40% "reasonable salary" line labeled a rule of thumb. | Notes yes. | Low-Medium |
| S-Corp Investment | Locked | Entire tool replaced by a lock screen for free users. 2026 limits correct. The "THE READ" callout below the lock says "You just saw what a Solo 401(k)... does" when nothing was shown. | n/a | Medium (a fully locked tool with 1 view in 30 days earns nothing and teaches nothing) |
| Debt Paydown | Yes | Math fine. Copy: "guaranteed return", "guaranteed profit", "guaranteed best return", "clear your ... aggressively" (`DebtPaydownOptimizer.tsx:644, 764, 863, 939, 1021`). The invest-vs-paydown comparison is only valid at the payoff month but the copy extends it to age 65. | Rates are inputs. | High |
| Geographic Arbitrage | Yes | State tax as one effective rate per city, hidden 1,500/month base cost, hidden 7.5% "mobility premium". Needs annual table maintenance for 50 states. | Partly. | Medium |
| Capital Gains Tax | Yes | Engine-backed, tested. Virginia is the only state modeled, shown to a national audience with no picker. | Footnote lists simplifications. | Medium |
| Gambling Redirect | Yes | Invented 3.5x "addiction multiplier", unsourced "3-4% of bettors profitable" and "7-9% hold" statistics. Helpline shown (fixed Oct 18). | No. | Medium-High |
| Personality Quiz | Yes | No numbers. Six archetypes, share image. The one tool built for sharing. | n/a | Low |
| What's Your Why | Locked | Pro only, 9 views all time, sends free-text answers to the Anthropic API. Terms do not mention AI processing. | n/a | Medium (privacy copy) |

`RothOptimizer.tsx` (523 lines) exists and is mounted nowhere.

### 1.4 Content depth and freshness

| Type | Count | Range | Verdict |
|---|---|---|---|
| Guides (file-based) | 17 | Jul 2 to Oct 25, 2026 | Strong. Evergreen, tool-linked, current (2027 limits guide, year-end tax moves). Weekly cadence with four gaps. |
| Daily outlook ("Thinking") | 125 | Apr 24 to Oct 23, 2026 | High effort, high risk, low fit. Market-timing commentary with named tickers on a site whose voice is "long-term thinking". See 1.8. |
| Weekly outlook | 1 | Apr 26, 2026 | Dead. The Sunday cron has had nothing to send for six months. |
| Articles (database) | 23+ | Imported Jul 4, 2026 | Cortex-era posts with the brand name swapped in. Some are good (sequence of returns, RMDs, the S-corp salary trap). Fold the best into Guides and retire the rest. |
| Tool explainers and FAQs | 14 | Updated Oct 18 | Good, but the FAQ pushes the disclaimer off the screen. |

### 1.5 Current monetization

| Surface | State today | Notes |
|---|---|---|
| Finance Pro, $9/month or $90/year (annual saves $18) | Live | 48 registered users, 1 `finance_pro`, 0 active subscriptions, no webhook-confirmed upgrade ever recorded. `PAYMENT_AND_SIGNUP_AUDIT.md` says `webhook_events` had 0 rows. Drew should confirm in the Stripe dashboard that the webhook endpoint exists and returns 2xx. |
| What Pro unlocks | Live | Blurred "advanced" panels on 10 tools, two fully locked tools, auto-optimizers, capital gains toggles, unlimited saved scenarios (free: 1 per tool), AI reflection, no ads. |
| What Pro promises | Live | Features that do not exist (see 0.1). "Priority support" and "Community support" have no visible channel. "Full access to all Money Guy Mutants tools" is true. |
| Banner ads (personal refer-a-friend links) | Off | Kill switch `NEXT_PUBLIC_BANNER_ADS_ENABLED` defaults off since Sep 29. The 11 referral URLs are still in `components/monetization/affiliates.ts`. Delete them. |
| Post-result offers engine | Built, off | `NEXT_PUBLIC_OFFERS_ENABLED` defaults off. Two draft placeholders that cannot render. Honors every standing rule. |
| Lifetime unlock, "email me my report", advisor intake | Not built | Phases 2 to 4 of the handoff. |
| Newsletter | Live, tiny | Double opt-in, one confirmed subscriber at baseline. Form only on /thinking. No postal address in the emails (CAN-SPAM). |
| Enterprise | Live | Lead form, 4 leads ever. |
| Donation popup | Gone | Removed, last event Jan 20. |

### 1.6 SEO basics

| What | Finding | Severity |
|---|---|---|
| Titles | Home: "Money Guy Mutants [em dash] Tools for Long-Term Thinking \| Money Guy Mutants" (em dash, brand twice). Pricing: "Pricing - Money Guy Mutants Financial Tools \| Money Guy Mutants" (brand twice). Em dashes in 8 page titles and the RSS link titles. Tool pages are clean (absolute titles, no suffix, since Oct 18). | Medium |
| "Two title tags" from the curl pass | Not a duplicate. The second and third `<title>` in the HTML are accessibility titles inside the inline SVG logo (`components/brand/MutantMark.tsx:35`). Nothing to fix. | None |
| Meta description | Default is about 190 characters (over the usual cut-off). Home description says "for financial mutants and fans of the Money Guy Show" and contains an em dash. Three different descriptions on the home page (meta, og, twitter). | Low |
| Keywords meta | Lists "money guy", "moneyguy", "money guy show", "money guy show tools", "financial order of operations", "financial mutant". Ignored by Google, but it documents intent to rank on another brand's name. | High (naming) |
| Canonicals | Correct on tools and landing pages. | Good |
| Sitemap | About 190 URLs. Tools, guides, articles, outlook posts, quiz archetypes. Static pages carry a frozen lastmod of 2026-04-07. /disclosure and /apps/personality-quiz absent. No sitemap index needed. | Low |
| robots.txt | Allow-list style, blocks /api, /account, /dashboard, /admin, /login, /signup, /go/. Explicitly allows 18 AI crawlers including training bots (GPTBot, CCBot, Bytespider, Google-Extended). A deliberate choice; Drew should confirm he wants training use permitted. | Low (decision) |
| Structured data | Organization, WebSite with SearchAction, SoftwareApplication site-wide. Per tool: BreadcrumbList, WebApplication, FAQPage. Articles and guides: Article/BlogPosting. Thinking: AnalysisNewsArticle. Show page: CollectionPage about a TVSeries. FAQ rich results have been limited by Google since Aug 2023 and reportedly stopped in May 2026, so the FAQ markup earns no visual result. Never add aggregateRating. | Low |
| Duplicate routes | /calculators/* duplicates resolved by canonical. /articles vs /guides overlap in topic. | Low |
| Internal links | Tool pages link to related tools and a guide. Guides link to tools. Home links to tools only. No link from a result to a guide in the result area. | Medium |
| Search Console and Bing | Verification env vars exist and are empty. Nothing is verified. The August traffic collapse cannot be diagnosed without it. | High |
| Vercel Web Analytics | Not enabled (the API returns "Web Analytics not found"). GA4 loads with no consent gate and sends page views only. | Medium |
| Deployment URL headers | The *.vercel.app deployment URL answers with `x-robots-tag: noindex`. That is Vercel's default for deployment URLs and is expected. Drew should confirm the custom domain does not carry it: `curl -sI https://moneyguymutants.com/ \| grep -i robots` should print nothing. | Check |

### 1.7 Mobile UX, accessibility and speed

**Mobile UX (from the local screenshots at 390px).**

- Home: the hero fills the first screen with headline, subhead, two buttons and three stats ("13+ tools", "50+ states", "0 dark patterns"). It reads well. The mock result card is cut off at the fold, which is a fair tease.
- Coast FIRE: the first screen shows the breadcrumb, the title, a two-sentence intro, then a full-width navy "FREE ACCOUNT: See the rest of the decumulation picture" band with "Create free account" and "View all tools", then a "Save Scenario" button, and only then the top of "COAST FIRE STATUS", which the bottom tab bar covers. A guest sees two prompts before any result. The default result ($124,185 coast number from preset inputs) is not labelled as an example.
- Coast FIRE desktop: the page is about 10,000px tall. Roughly 60% of that height is blurred Pro panels (Command Center, Flexibility Score, Barista FIRE, Coast Rate Optimizer, Lifecycle Scenarios, Social Security, Work-Optional Timeline) stacked under the free result, then an "Unlock Pro" card, then the explainer, FAQ, related tools, and finally the disclaimer.
- /apps on mobile: 16 cards, one per screen height. The disclaimer is the last thing on the page.
- Pricing on mobile: clean and calm. The best page on the site.
- Sections below the hero animate in once on scroll (28 text blocks on the home page sit at opacity 0 until viewed). The text is in the HTML, nothing is hidden with JavaScript off, and nothing is hidden under reduced motion, so crawlers and no-script visitors get everything. The effect is limited to unscrolled captures and a possible blank flash on slow hydration. Severity Low.

**Accessibility basics.** Keyboard work on the dashboard cards and slider contrast were fixed in October (PRs 132 and 133). Focus is visible (2px teal outline) and no image lacks alt text. Remaining: no skip link on any page; Coast FIRE and Budget each have 12 inputs with no accessible name (no label, aria-label or aria-labelledby); Budget skips from H2 to H4. Every tool page has exactly one H1. Fixing the unlabeled inputs is a one-day job and matters for screen readers and for browser autofill.

**Speed.** Lighthouse and PageSpeed Insights could not be run from this environment. The earlier curl pass measured about 0.25s with a Vercel cache hit, fonts are preloaded with `next/font`, and there is no third-party script except GA4, Stripe and Turnstile. Drew can get Core Web Vitals in one click at https://pagespeed.web.dev/?url=https://moneyguymutants.com/apps/coast-fire (mobile tab). The first-party web-vitals pipeline already records CLS, LCP, INP, FCP and TTFB to the `events` table, so the baseline can also be read from `/admin/monetization` once the view is added.

### 1.8 Compliance pass

| Item | Finding | Severity |
|---|---|---|
| Not-affiliated statement | Present on marketing footer, tool layout footer, landing pages, auth pages, disclosure, show page, financial-mutants page, llms.txt. Missing on /apps/budget, /apps hub, dashboard, account, all emails, OG images. | Medium |
| Educational disclaimer | Shared "NOT ADVICE" block renders below the explainer and FAQ, a screen or more under the result. Only Index Fund and Rent vs Buy carry an in-tool line. Budget has none. | Medium-High |
| Guaranteed-return language | Debt Paydown, five occurrences. Index Fund: "gold standard", "proven track record", heading "MUTANT Recommendation". Compound Interest: "proven withdrawal rates". Coast FIRE: "will grow to" stated as fact. | High |
| Advice language | Debt Paydown gives directives ("Clear your ... aggressively", "Don't sacrifice 30+ years"). Index Fund recommends a holding. | High |
| Pro feature claims at the point of purchase | Seven tools list features the code does not have. "Share results with a link" is listed as Pro but has no tier check. | High |
| False price claim | "Plans from $0 to $29/month" in the indexed pricing meta description, "Elite $29/mo" in the pricing share image, Elite copy in the Budget upgrade modal and the dashboard library. | High, one hour to fix |
| "Most popular" badge | On the Pro plan with no data behind it. The pricing copy promises "no dark patterns". | Medium |
| Other unsupported claims | "0 dark patterns" as a hero stat, "Thousands of Mutants", "Trusted by financial advisors, HR teams" (enterprise), "No product pitches" (financial-mutants), "Ad-free experience" as a Pro perk while no ads show, "Priority support" with no channel. Each is either unprovable today or untrue. | Medium |
| Affiliate links | None live. Offers engine requires adjacent disclosure and `rel="sponsored noopener noreferrer"`. The default disclosure text is "Sponsored. We may earn a commission ... Educational content, not financial advice." FTC guidance says "paid link" style wording right beside the link is adequate and the bare word "affiliate" may not be; the engine's default already does this. | Good |
| Daily outlook posts | 125 public, indexed, emailed posts that name securities with thesis, valuation and "why now", under the line "Research and idea generation for personal use. Not investment advice." No site-level disclaimer on /thinking. AI-assisted, bylined "Money Guy Mutants Research". This is the highest legal exposure on the site and it is off-voice for a long-term-thinking brand. | High |
| Terms and privacy | Out of date and generic (1.2). GA4 with no consent gate. AI processing of "What's Your Why" answers not disclosed. | High before offers go live |
| Email | No physical postal address in any footer (CAN-SPAM requires one in commercial email). Confirmation email has no unsubscribe link. Confirm token never expires and changes state on GET. | Medium |
| Shared scenarios | A share link exposes the saved dollar inputs through a public JSON route with no "this becomes public" warning and no unshare control. | Medium |
| Legal entity | "Cortex Technologies" (footer, budget footer), "Cortex Financial Technology" (account page), "J Media Group LLC" (terms, JSON-LD). Affiliate networks and Stripe will ask for one name. | Medium-High |
| Testimonials and ratings | None published. Keep it that way unless they are real and disclosed (FTC 2024 rule on fake reviews, civil penalties cited up to $53,088 per violation). | Good |

### 1.9 Naming and trademark risk (not legal advice)

**What the public record shows (verified only as far as the cited source).** Justia lists THE MONEY GUY SHOW, serial 90145137, filed 2020-08-28, owner shown as 88xOver, LLC, for podcasts about personal finance (https://trademark.justia.com/owners/88xover-llc-4509866). The same owner has FINANCIAL ORDER OF OPERATIONS (90211240) and MAKING A MILLIONAIRE (99121337). Status and classes were not confirmed; an attorney should pull the live USPTO record. No filing was found for "Financial Mutant(s)" or "Money Guy Mutants", which is not clearance; common-law rights can exist without a filing.

**How the site uses their brand today.**

- The site name and domain contain "Money Guy".
- A page titled "The Money Guy Show: Watch, Subscribe & Run the Numbers" with six hot-linked show thumbnails and JSON-LD describing the show as a TV series.
- Meta keywords: "money guy show tools", "financial order of operations", "brian preston bo hanson" (the hosts' names).
- A /financial-mutants page that positions the site "for financial mutants and fans of the Money Guy Show".
- The 20/3/8 car rule used in eight files without attribution.
- No logos, show art or host likenesses were found in the repo. Colors could not be compared.

**Why this matters, in plain language.** Nominative fair use lets you name a product to refer to it, if you use only as much of the mark as needed and do not suggest sponsorship. Using a similar name as your own brand is a different question. Public examples: the Bogle Center won a domain arbitration over bogleheads.com against a financial advisor who registered it; Goldman Sachs dropped a dispute with a critic blog once a clear no-affiliation line was added (sources in appendix B). The pattern that draws action is "their name in your domain, plus you sell something". Monetizing under this name moves the site into that pattern. The Sep 29 decision (D1) accepted the risk; Gate G-C (counsel review) is still open.

**A cease-and-desist scenario.** The likely sequence is a letter demanding the domain, the page and the keywords, with a short deadline. Options at that point are to comply (lose the name, redirect for as long as the domain is kept, lose any rankings earned under it) or to argue, which costs more than the site earns. The cost of that scenario grows with every dollar of SEO and brand equity invested in the current name.

**Options.**

| Option | What it is | Cost now | Risk after |
|---|---|---|---|
| A. Keep the name, strip the lean | Remove host names and "financial order of operations" from keywords. Retitle /the-money-guy-show to something like "Why we built this" or remove it. Keep one plain not-affiliated line everywhere. Attribute 20/3/8. Rename /financial-mutants to "Who this is for". | Hours | Reduced but not removed. The name itself still references their mark. |
| B. Neutral rebrand, keep the domain as a redirect | Pick a neutral name now (section 8 lists criteria and candidates, all unverified). Launch on the new domain, 301 the old one. Current traffic is about 270 views a month, so almost nothing is lost. | One to two weeks of design and dev, plus a domain | Low. The old domain can later be released. |
| C. Full rebrand and release the old domain | Same as B, then let the old domain go after a year. | Same as B | Lowest. |

**Recommendation.** Do A this week regardless. Get a trademark attorney's view within 30 days on the name and on the /financial-mutants positioning. Plan for B: the site has never been cheaper to rename, the tools are the asset, and a neutral name fits a Buffett and Munger voice better than a fan-site name does. Do not spend on paid growth, affiliate applications or partnerships under the current name until the attorney has answered.

---

## 2. Users and jobs to be done

Evidence: all-time and last-30-day tool views (baseline Sep 29), the guide topics that were written, the enterprise leads, and the shape of the tools. The numbers are tiny, so treat the ranking as directional.

| # | User | Job they hire the site for | Tools and content they use | What "done" looks like to them | Revenue lane |
|---|---|---|---|---|---|
| 1 | **The on-track checker.** 28 to 45, saves steadily, wants an honest read, not a sales pitch. The largest group by recent traffic (Coast FIRE is two-thirds of tool views). | "Show me if I am on track for retirement, honestly, and what one change would do." | Coast FIRE, Compound Interest, Retirement Strategy, Net Worth. Guides: Coast FIRE explained, 4% rule, Social Security claiming, 401(k), Roth IRA. | A number, a date, the assumptions behind it, and a way to keep it and come back next year. | Saved scenarios and annual re-check (Pro), low-cost brokerage offer after the result (affiliate), weekly email. |
| 2 | **The big-purchase household.** 25 to 40, about to sign for a house or a car. | "Should I rent or buy, and can I afford this car, without being sold to?" | Rent vs Buy, Car Affordability, Budget, Debt Paydown. Guides: rent vs buy, how much car, 50/30/20, emergency fund. | A clear verdict with the hidden costs named, and a plan they can share with a partner. | Shareable result card (growth), mortgage or HYSA offer after the result (affiliate, disclosed), Pro for multi-scenario comparison. |
| 3 | **The solo business owner.** S-corp or thinking about it, files Schedule C today. | "How much would an S-corp save me, what salary is defensible, and where do the savings go?" | S-Corp Optimizer, S-Corp Investment, Capital Gains. Articles: reasonable salary trap, S-corp secret, employer-or-employee. | A salary and distribution split, a retirement contribution plan, and a worksheet to take to a CPA. | Pro (this is the one job where depth is worth paying for), CPA referral later, payroll or bookkeeping offer (disclosed). |
| 4 | **The one-time seller.** Selling stock, a fund or RSUs this year. | "How much tax will I owe if I sell this, and does timing change it?" | Capital Gains Tax tool, year-end tax moves guide, capital gains guide. | A dollar figure by bracket, NIIT and state, and the two levers (hold period, income year). | Pro unlock for NIIT, ACA, IRMAA, QBI toggles; tax software offer in season (disclosed). |
| 5 | **The long-term thinker.** Reads Buffett and Munger, wants a place that thinks the way they do. | "Teach me to think long term, and give me a calm weekly read." | Thinking (if it changes), guides, personality quiz, index fund visualizer. | A weekly email worth opening, a reading list, tools that show their assumptions. | Weekly email (owned audience, later sponsors), book links (disclosed), community later. |

Two users the site currently courts but should not: the daily market-watcher (the daily outlook serves them, off-voice and high risk) and the gambler (the Gambling Redirect tool is well-meant; keep it as a free public-service page, fix its invented statistics, and never monetize it).

---

## 3. Useful tools and content that create trust

Principle: every tool should answer the job in the first screen, show its assumptions in the second, and offer one next step in the third. Proposals ranked by trust value per hour of work.

### 3.1 Build

| Proposal | What it is | Why it builds trust | Effort |
|---|---|---|---|
| **Shared result card** | One component every tool uses for its headline answer: the number, one sentence of plain English, a "based on" line listing the three assumptions that matter most, and the educational line underneath. Sticky on mobile. | Today each tool builds its own stat block, so nothing can be placed consistently after the result. This is the foundation for save, learn, share and the disclosed offer. | 2 to 3 days |
| **"Show your assumptions" drawer** | Under the result card, a collapsible list of every assumption in effect, editable where it is an input, labeled "fixed in this version" where it is not (Rent vs Buy's 30-year term, 0.5% insurance, no PMI; Index Fund's undeducted expense ratios; Gambling's multiplier). | Hidden assumptions are the main accuracy finding. Showing them is cheaper than fixing all of them and more honest than hiding them. | 2 days plus per-tool copy |
| **Plain-language "what this means" panel** | Three sentences per tool, generated from the result state, no jargon, no directives. Replaces the "Verdict" and "Recommendation" blocks. | Removes the advice and guarantee language in one move. | 1 day plus copy |
| **Saved scenarios dashboard, done properly** | The API and the 1-per-tool free limit exist. Add "scenario_saved" tracking, a "what changed since last time" diff, and an annual re-check reminder email (opt-in). | Turns a one-time calculator into a thing people come back to. Pro's clearest value. | 3 to 4 days |
| **Annual check-up flow** | A guided five-step page each November: contribution limits for next year, year-end tax moves, open enrollment, RMDs if 73+, rebalancing check. The four guides exist; the flow strings them to the tools. | Seasonal reason to return, the easiest email to write, and it is exactly the long-term voice. | 3 days |
| **Shareable result cards** | Extend the quiz's share-image route to Coast FIRE ("Coast FIRE at 47"), Rent vs Buy ("Renting wins by $X over 10 years in my case") and Car Affordability. Rounded numbers only, no inputs. | The only free growth channel that fits the brand. The quiz proves the pipe works. | 2 days |
| **Reading and thinking library** | Replace the daily outlook with a curated, evergreen "Long-Term Thinking" library: Buffett letters by theme, Munger's mental models, Bogle, Housel, with a 150-word note on each in Drew's voice, and a weekly email that sends one. Book links disclosed. | On-voice, low risk, compounding content, and it is the credibility the prompt describes. | 1 day to set up, 1 hour a week |
| **Tax Desk sub-brand** | Group Capital Gains, S-Corp Optimizer and S-Corp Investment under one page and one name, with a state picker on capital gains. | The three tools share the engine and the user (jobs 3 and 4). Deepest Pro value. | 3 to 5 days |

### 3.2 Fix

- Remove the five "guaranteed" lines and the directives in Debt Paydown; reword Index Fund's recommendation heading and "gold standard" copy; soften Coast FIRE's "will grow to".
- Make the Pro benefit list per tool match what the tool does. Delete the seven false items. Promise less and deliver all of it.
- Add PMI below 20% down and label the 30-year term in Rent vs Buy. Add a state picker (or remove the Virginia row) in Capital Gains. Source or remove the gambling statistics and the 3.5x multiplier.
- Move the educational line to directly under the result on every tool, including Budget.
- Unlock S-Corp Investment's basic view for free; keep the optimizer behind Pro. A fully locked tool with one view a month earns nothing and teaches nothing.

### 3.3 Prune or merge

| Tool | Views (all-time / last 30 days, Sep 29) | Proposal |
|---|---|---|
| What's Your Why | 9 / 0 | Retire or make free. Pro-only AI text processing with no privacy disclosure is risk with no demand. |
| S-Corp Optimizer + S-Corp Investment | 168 + 185 / 0 + 1 | Merge into Tax Desk with one input set. |
| Geographic Arbitrage | 170 / 3 | Keep only if Drew wants to maintain 50 state tax tables every January. Otherwise retire and keep the article. |
| Gambling Redirect | 157 / 1 | Keep as a free public-service page. Fix the numbers. Never monetize. |
| Articles section | n/a | Fold the eight best into Guides, 301 the rest to the closest guide, retire the section and one RSS feed. |
| Daily outlook | 125 posts | Stop. Replace with the weekly library email. Keep the archive noindex or delete it (see open questions). |
| Roth Optimizer | Not mounted | Either ship it inside Retirement Strategy or delete the file. |

---

## 4. Monetization map

Rule applied to every row: if the placement would not help the user with zero commission, it is cut. Nothing appears before the user has their result. Every surface has its own kill switch, off by default.

| Lane | User need it serves | Where in the journey | Effort | Revenue (honest view) | Trust and compliance risk | Now or later |
|---|---|---|---|---|---|---|
| **Freemium SaaS (Finance Pro, $9/month, $90/year)** | Jobs 1, 3, 4: keep scenarios, compare them, go deeper on tax. | After the result: "Save this scenario" (free, one per tool) then "Compare scenarios and unlock the tax layer" (Pro). | Medium: honest benefit lists, shared result card, scenario diff. | Small at current traffic. One subscriber per 100 completed Pro-relevant results would be a good month. | Low once the false promises are removed and terms carry refund language. | **NOW** (fix), grow later |
| Free forever | Everyone | Every calculator's full basic result, assumptions, saving one scenario per tool, every guide, the weekly email. | None | Trust | None | NOW |
| Genuinely worth paying for | Jobs 1, 3, 4 | Unlimited saved scenarios and comparisons, annual re-check with diff, Tax Desk depth (NIIT, ACA, IRMAA, QBI, state), S-corp salary and contribution planner, exports (PDF or CSV of a scenario), multi-year plans. | Medium-High | The only recurring revenue line the site controls. | Low | NOW define, 60 days build |
| Lifetime unlock (handoff Phase 2, about $89) | Users who hate subscriptions | Pricing page as a third option. | Medium | A test, not a forecast. | Needs terms ("lifetime of the product"), refund rule, Stripe webhook confirmed working. | LATER (after webhooks are verified) |
| **Affiliates and referrals** | Jobs 1, 2, 4, 5: "where do I open the account", "where do I file", "where do I park cash", "what should I read". | One card, after the result, on the three pilot tools (Coast FIRE, Rent vs Buy, Index Fund), labeled "Sponsored" with "paid link" wording beside the button. | Low: the engine exists. Drew's work is applying to programs and supplying approved URLs. | Small until traffic recovers. Brokerage and tax software programs pay per funded account or per filing; figures are not published and must not be quoted. | Medium. FTC disclosure adjacent to the link (done by the engine). Program terms often restrict content sites and bar paid search. Nothing live under the current brand name until the attorney has answered. | NOW prepare, live after name decision and program approval |
| Candidate programs that pass the "would recommend anyway" test | | | | | | |
| Low-cost brokerages: Fidelity, Schwab, Vanguard (Vanguard has no public program, unverified), Interactive Brokers for advanced users. Robo: Betterment or Wealthfront for hands-off users, with the fee layering named honestly. Avoid Robinhood and Webull (incentives push trading). | Job 1 | After Coast FIRE and Index Fund results | | | | |
| Tax software: FreeTaxUSA first (low price, basic support), TurboTax only for complex returns (price creep named honestly). | Job 4 | After Capital Gains result, Jan to Apr | | | | |
| High-yield savings: Ally or Marcus (rates change, never quote an APY). | Job 2 | After Rent vs Buy (down payment parking) and emergency fund guide | | | | |
| Budgeting: YNAB (the one program whose own page publishes a flat per-trial payout, retrieved Oct 25), Monarch, Tiller. | Job 2 | After Budget result | | | | |
| Books: Bookshop.org or Amazon Associates for the library. Amazon requires its exact "earn from qualifying purchases" statement. | Job 5 | Library and weekly email | | | | |
| **Newsletter** | Job 5, and a return path for jobs 1 and 2 | Capture after a result ("Email me this result and one idea a week") and on guides. Weekly, long-term thinking, one tool, one guide, one reading. | Low-Medium: Resend and double opt-in exist. Needs a postal address, a template, and the "email my result" flow (handoff Phase 3). | Sponsor slots pay by CPM; published platform ranges are wide (beehiiv cites $10 to $75 general, higher for niche B2B). At a small list this is pocket change. The value is the return visits and the Pro conversions. | Low if the daily ticker content stops. CAN-SPAM address required. | NOW (weekly), sponsors LATER (5,000+ subscribers) |
| **Enterprise, advisor or CPA white-label** | A CPA or advisor who wants the Tax Desk under their name | /enterprise | High | Unknown. Four leads in nine months. | Medium-High: an advisor relationship with pay triggers SEC Marketing Rule promoter disclosures and a written agreement; FINRA rules bind broker-dealers who would review the content. | LATER, after counsel and after a named partner asks |
| Advisor referral (handoff Phase 4) | Job 1 users with real complexity | After Retirement Strategy | Medium | Per-lead networks (SmartAsset style) are pay-to-play and conflict with the voice. Zoe Financial or NAPFA or XYPN directory links without pay fit better. | High (see above) | LATER, gated |
| Courses, templates, workbooks | Job 3 and 4 | Tax Desk | Medium | Small, one-off | Low | LATER (a $29 "S-corp owner's annual worksheet" is the one candidate) |
| Community or members area | Job 5 | n/a | High | Low | Moderation burden | NOT NOW |
| Display ads, newsletter sponsors, API, bank or lender licensing, forex or CFD affiliates | | | | | | DO NOT BUILD (handoff section 15 stands) |

**What stays free forever (proposed, for Drew to confirm in section 8):** the full basic result of every calculator, every assumption visible, one saved scenario per tool, every guide, the weekly email, the library, the quiz.

---

## 5. UI and UX improvements

Taste brief: Apple-clean, mobile-first, visual, fast, few words, obvious next step. The pricing page already has this feel; the tool pages do not.

### 5.1 Prioritized changes

| # | Change | Why | Effort |
|---|---|---|---|
| 1 | **Result first.** Move the guest signup band from above the tool to after the result. On mobile, pin a compact result card at the top while inputs are edited. | A guest currently sees two prompts before any number. | 1 day |
| 2 | **One next step at a time.** After the result show exactly one secondary card, chosen by priority: save (free), learn (the matching guide), or the disclosed offer. Pro appears as one honest card at the bottom, not seven blurred panels. | Three competing prompts stack today (signup band, Pro panels, Unlock Pro card, offer). | 2 days plus the shared result card |
| 3 | **Collapse the blurred Pro panels** into one "What Pro adds here" card with three true bullets and a 10-second preview image. | The blurred wall makes the page 10,000px tall and reads as a paywall. | 1 day |
| 4 | **Disclaimer next to the result.** One quiet line under the result card: "Educational model, not advice. Assumptions below." | Buried under the FAQ today. | Hours |
| 5 | **Navigation to four items:** Tools, Guides, Library (or Thinking renamed), Pricing. Sign in on the right. Drop "Watch" and "Articles" from the header. | Six items, two of which serve the third-party brand or duplicate Guides. | Hours |
| 6 | **Tools hub by job, not by list.** Three groups with a one-line question each ("Am I on track?", "Can I afford this?", "What will I owe?") and the tools under them. Free and Pro badges driven by one registry. | 16 equal cards is a wall. Four registries drift. | 1 to 2 days |
| 7 | **Hero with a single verb.** Keep "Think clearly about life's biggest decisions." Make the primary button "Check if I'm on track" (goes to Coast FIRE) and the secondary "See all tools". | The primary action should be the top job, not a grid. | Hours |
| 8 | **Polite email capture** after a result: "Email me this result" (consent checkbox for the weekly email, unchecked). Also at the end of every guide. Never a popup. | The form exists only on /thinking. | 1 day plus the Phase 3 flow |
| 9 | **Once-only fade-in animations** should respect `prefers-reduced-motion` and must never leave content invisible if the observer does not fire. Render visible by default and animate from visible. | Blank sections in captures; risk for crawlers and failing scripts. | Hours |
| 10 | **Footer:** one legal name, one not-affiliated line, Privacy as its own page, a postal address once email goes out. | Three legal names today. | Hours plus legal copy |

### 5.2 Wireframes for the top three screens

**A. Home (mobile)**

```
+------------------------------------+
| [mark] MONEYGUY MUTANTS     [menu] |
+------------------------------------+
|                                    |
|  Think clearly about               |
|  life's biggest decisions.         |
|                                    |
|  Free calculators that show their  |
|  assumptions. No advice, no ads    |
|  before your result.               |
|                                    |
|  [ Check if I'm on track  -> ]     |
|  [ See all tools ]                 |
|                                    |
|  +------------------------------+  |
|  | Coast FIRE at 47             |  |
|  | $1,250,000 target            |  |
|  | based on 7% real growth      |  |
|  +------------------------------+  |
+------------------------------------+
|  Three questions, three tools      |
|  o Am I on track?    Coast FIRE    |
|  o Can I afford it?  Rent vs Buy   |
|  o What will I owe?  Capital Gains |
+------------------------------------+
|  This week's guide  ->             |
|  One idea a week by email [join]   |
+------------------------------------+
|  Independent. Not affiliated with  |
|  any show or advisor. Educational. |
|  (c) 2026 J Media Group LLC        |
+------------------------------------+
```

**B. Tool page, Coast FIRE (mobile)**

```
+------------------------------------+
| < Tools        Coast FIRE   [save] |
+------------------------------------+
|  RESULT (pinned while editing)     |
|  You could coast at 47.            |
|  $1,250,000 by 65 at 7% real.      |
|  Educational model, not advice.    |
|  Assumptions v                     |
+------------------------------------+
|  Your numbers                      |
|  Age [30]  Retire at [65]          |
|  Invested [$100,000]               |
|  Monthly [$1,000]                  |
|  Growth [10%] Inflation [3%]       |
|  Fees [0.18%] Withdrawal [4%]      |
+------------------------------------+
|  Assumptions in effect             |
|  - real growth = 10 - 3 - 0.18     |
|  - no taxes on withdrawals (fixed) |
|  - no Social Security (toggle)     |
+------------------------------------+
|  What this means                   |
|  Three plain sentences. No verbs   |
|  like "should".                    |
+------------------------------------+
|  NEXT STEP (one card)              |
|  Save this scenario and compare    |
|  it next year.  [Save free]        |
+------------------------------------+
|  Read: Coast FIRE explained  ->    |
+------------------------------------+
|  Sponsored (paid link)             |
|  Where to hold index funds at low  |
|  cost. We may earn a commission.   |
|  [Open an account ->]  How we earn |
+------------------------------------+
|  What Pro adds here                |
|  - compare up to 5 scenarios       |
|  - stress test: growth -2, infl +2 |
|  - Social Security and barista     |
|  $9/mo or $90/yr   [See Pro]       |
+------------------------------------+
|  Explainer, FAQ, related tools     |
+------------------------------------+
```

**C. Pricing (mobile)**, keep the current layout and change the copy:

```
+------------------------------------+
|  Simple, honest pricing.           |
|  Every calculator is free. Pro is  |
|  for people who keep and compare.  |
|        [Monthly] [Annual]          |
+------------------------------------+
|  FREE  $0 forever                  |
|  - every calculator, full result   |
|  - every assumption visible        |
|  - 1 saved scenario per tool       |
|  - every guide and the weekly email|
|  [Start free]                      |
+------------------------------------+
|  PRO  $9 / month                   |
|  - unlimited scenarios, compare    |
|  - annual re-check with changes    |
|  - Tax Desk depth: NIIT, ACA,      |
|    IRMAA, QBI, state               |
|  - export a scenario (PDF/CSV)     |
|  - no sponsored cards              |
|  [Get Pro]  Cancel any time.       |
+------------------------------------+
|  (no "most popular" badge until    |
|   it is true)                      |
+------------------------------------+
```

---

## 6. Roadmap with KPIs

Owner types: content, design, dev, legal check, Drew (only Drew can do it). Effort: S under a day, M one to three days, L a week.

### Quick wins (this week)

| Item | Owner | Effort | Expected impact | KPI |
|---|---|---|---|---|
| Remove "Elite $29" from pricing meta, share image, budget modal, dashboard | dev | S | Removes a false public price | Zero "$29" in build |
| Replace "Cortex Technologies" and "Cortex Financial Technology" with J Media Group LLC (or the name Drew chooses) | dev + Drew | S | One legal identity | Zero "Cortex" user-facing |
| Delete the five "guaranteed" lines and the directives in Debt Paydown; reword Index Fund recommendation | content + dev | S | Removes the clearest rule-10 breaches | Zero "guaranteed" in tool copy |
| Rewrite the Pro benefit lists to match the code | content + dev | S | Honest point of purchase | List matches code review |
| Remove the "Most popular" badge and the unsupported claims ("Thousands of Mutants", "Trusted by financial advisors", "No product pitches", "0 dark patterns" as a stat) | content + dev | S | Keeps the "no dark patterns" promise true | Zero unprovable claims |
| Label every input on Coast FIRE and Budget; add a skip link | dev | S | Accessibility baseline | 0 unlabeled inputs |
| Strip host names and "financial order of operations" from keywords; retitle the show page | dev + Drew | S | Option A of 1.9 | Keyword audit |
| Fix em dashes and doubled brand in titles; shorten default description; unfreeze sitemap dates | dev | S | Cleaner SERP snippets | Titles under 60 chars |
| Verify Search Console and Bing; enable Vercel Web Analytics | Drew | S | Diagnoses the August collapse | Verified, data flowing |
| Add `scenario_saved` and `newsletter_signup` events; split `checkout_started` and `checkout_completed` | dev | S | Funnel becomes measurable | Events present in `events` |
| Confirm the Stripe webhook endpoint exists and returns 2xx | Drew | S | Unblocks every billing metric | `webhook_events` rows appear |
| Add an ESLint ignore for `Cortex Design System/` and record a lint baseline | dev | S | Rule 14 can be met | Lint errors from 192 toward 0 |
| Pause the daily outlook email until counsel has looked at it; add a site-level disclaimer on /thinking | Drew + legal check | S | Caps the largest legal exposure | Decision logged |

### 30 days

| Item | Owner | Effort | Expected impact | KPI |
|---|---|---|---|---|
| Trademark attorney consultation on the name, the show page and /financial-mutants | Drew + legal | S (for Drew) | The go or no-go for everything else | Written opinion received |
| Shared result card, assumptions drawer, disclaimer under result, result-first layout on the three pilot tools | design + dev | L | Tool completion rate up, page length down | Completion rate per tool (baseline from `/admin/monetization`) |
| Collapse blurred Pro panels into one honest card | dev | M | Shorter pages, fewer bounces | Time on page, exits after result |
| Nav to four items, tools hub by job, one tool registry | design + dev | M | Clearer entry | Click-through from home to a tool |
| Terms and privacy rewrite (billing, refunds, processors, GA4, AI, cookies), Privacy as its own page, postal address | legal check + Drew | M | Prerequisite for offers and email | Pages published, dated |
| Approve the /disclosure copy, remove noindex | Drew | S | Prerequisite for offers | Published |
| Weekly "Long-Term Thinking" email replaces the daily outlook; library page with 20 entries | content + Drew | M | On-voice owned audience | Confirmed subscribers, click rate |
| "Email me this result" after the result on pilot tools (handoff Phase 3) | dev | M | Owned audience from the tools | Results emailed per 100 completions |
| Shareable result cards for Coast FIRE and Rent vs Buy | dev | M | Only on-brand growth loop | Shares per 100 completions, referral sessions |
| Guides: merge the best eight articles, 301 the rest | content | M | Concentrates authority | Indexed pages, organic sessions to guides |

### 60 days

| Item | Owner | Effort | Expected impact | KPI |
|---|---|---|---|---|
| Rebrand decision executed if the attorney advises it (name, domain, redirects, OG images, footer) | Drew + design + dev | L | Removes the largest risk | Redirect coverage 100%, rankings tracked weekly |
| Tax Desk: merge the S-corp tools, add a state picker to capital gains, free basic view for S-Corp Investment | dev | L | Pro's clearest value | Pro conversions from Tax Desk |
| Saved scenarios with diff and annual re-check email | dev | L | Return visits | Returning visitors, scenarios per user |
| Apply to two program categories (brokerage, tax software) and one HYSA; supply approved URLs to the offers admin | Drew | M | Lights up the pilot | Programs approved |
| Flip `NEXT_PUBLIC_OFFERS_ENABLED` on for the three pilot tools only | Drew | S | First affiliate revenue | Offer impressions, clicks, click-through rate, confirmed payouts |
| Rent vs Buy PMI, Gambling statistics sourced, Car default rate reviewed | dev + content | M | Accuracy | Assumptions list reviewed |

### 90 days

| Item | Owner | Effort | Expected impact | KPI |
|---|---|---|---|---|
| Annual check-up flow (November) | content + dev | L | Seasonal return reason | Flow completions, email opens |
| Lifetime unlock test (handoff Phase 2) once webhooks are proven | dev + Drew | M | Pricing test | Lifetime purchases, monthly churn |
| Exports (PDF or CSV of a scenario) for Pro | dev | M | Pro value | Exports per Pro user |
| Prune: What's Your Why, Geographic Arbitrage decision, Roth Optimizer decision | Drew | S | Less to maintain | Tool count |
| Review scorecard and decide on advisor or CPA referral pilot with counsel | Drew + legal | S | Gate G-C | Decision logged |

### KPIs to baseline now

| KPI | Source today | Baseline |
|---|---|---|
| Organic sessions | Search Console (not verified), GA4 (page views only) | Unknown. Clean page views: 273 in September. |
| Indexed pages | Search Console | Unknown. Sitemap lists about 190. |
| Tool completions and completion rate | `v_tool_funnel` in `/admin/monetization` | Recording since Sep 29; fill the baseline table in `BASELINE-2026-09-29.md`. |
| Email signups and conversion rate | `outlook_subscribers` (no event) | 1 confirmed. |
| Free-to-paid conversion | `users.tier`, webhook events | 1 of 48 (no confirmed webhook). |
| Churn | Stripe | Unknown. |
| Affiliate click-through and revenue | `offer_impression`, `offer_click`, `offer_conversions` | 0 (off). |
| Returning visitors | GA4 or Vercel Web Analytics | Unknown. |
| Core Web Vitals | `events` web_vital_* rows, PageSpeed Insights | Recorded, not yet summarized. |

---

## 7. Analytics and SEO setup plan

### 7.1 Events (first-party `events` table, mirrored to GA4 as custom events with the same names)

Rule 8 applies: tool_id, buckets and booleans only. No income, balances, debts, birth dates, emails.

| Wanted | Today | Change |
|---|---|---|
| tool_started | `tool_viewed` fires on mount | Add `tool_started` on first input change (one per session per tool). |
| tool_completed | `tool_calculation_completed` (input changed, result held 1.5s) | Keep. Add it to Budget by moving Budget into `ToolIsland`. Populate `input_bucket` (for example age band, horizon band). |
| scenario_saved | Missing | Fire from `SaveScenarioButton` after a 2xx, payload `{tool_id, tier}`. |
| scenario_shared | Missing | Fire on share, payload `{tool_id}`. |
| signup | `user_signup` client-side | Add a server-side confirmation from `/api/auth/signup` success. |
| upgrade_started | `subscription_upgrade` (client, misnamed) | Rename to `checkout_started` (already defined, never fired). |
| upgrade_completed | `subscription_upgrade` (webhook) | Rename to `checkout_completed` from the webhook only. Retire the double-named event. |
| affiliate_click | `offer_click` (server, `/go`) | Keep. Mirror to GA4 as `affiliate_click` with `{tool_id, offer_slug}` so GA4 and first-party agree. |
| newsletter_signup | Missing | Fire `newsletter_signup_requested` on POST and `newsletter_confirmed` on confirm. |
| result_emailed | `report_email_*` defined, never fired | Wire when Phase 3 ships. |
| web vitals | Recorded | Add a `v_web_vitals_p75` view to the scorecard. |

GA4: add consent mode default (analytics denied until a decision) if Drew wants a banner; otherwise document the no-banner decision in DECISIONS.md with counsel's view. Send the events above with `gtag('event', ...)` from the same `trackEvent` call so there is one code path.

### 7.2 Search Console and Bing

1. Set `NEXT_PUBLIC_GOOGLE_VERIFICATION` and `NEXT_PUBLIC_BING_VERIFICATION` in Vercel (the layout already renders the meta tags). Add the domain property in Search Console (DNS) as well, so the old cortex.vip redirects can be inspected.
2. Submit `sitemap.xml`. Check Coverage for the July domain move: Google says a medium site takes weeks to settle after a move, and practitioners report months; keep every cortex.vip 301 for at least a year.
3. Export the top 50 queries and pages weekly into the scorecard.

### 7.3 Sitemap and route fixes

- Use the real file or commit date for static pages instead of 2026-04-07.
- Add `/apps/personality-quiz` and, once approved, `/disclosure`.
- Keep /calculators/* out of the sitemap and canonical to /apps/*. Remove the `/calculators` allow lines from robots when the hub stays noindex (cosmetic).
- Retire /articles into /guides with 301s.
- Decide the daily outlook archive: noindex, or delete and 301 to /thinking.

### 7.4 Structured data

- Keep WebApplication on tools, Article on guides, Organization and WebSite site-wide. Fill `sameAs` on Organization once social profiles exist.
- FAQPage: keep or drop; no rich result either way. Do not add `aggregateRating` or reviews unless real and disclosed.
- Remove the `TVSeries` about-entity on the show page as part of option A.

### 7.5 Title and meta cleanup

- Template: tool pages already use absolute titles. Give the home page an absolute title with no em dash: "Money Guy Mutants: Free Financial Calculators That Show Their Assumptions" (or the new name). Pricing: "Pricing" through the template once, not twice.
- Default description under 155 characters, no em dash, no third-party brand.
- One description per page (align meta, og and twitter).

---

## 8. Open questions for Drew

Decisions needed before building. Defaults are given so nothing blocks.

| # | Question | Default if no answer |
|---|---|---|
| 1 | **Brand name.** Keep "Money Guy Mutants" with option A, or plan the neutral rebrand (B or C)? Will you book the trademark consultation this month? | Do A now. No paid growth or affiliate applications until the attorney answers. |
| 2 | **Legal entity on the site.** J Media Group LLC everywhere? | Yes. |
| 3 | **Tax tool brand.** Sub-brand under the site ("Tax Desk") or a standalone name? The research agent's candidates, all with unverified domain availability and only broad collision searches: Plainbasis, Longbasis, Stillbasis, Taxmargin, Ledgerline, Harvestline, Steadfast Basis, Quiet Ledger (crowded by crypto tax firms), Cost Basis Co (descriptive, weak mark), Basis (crowded). Two more in Drew's voice to check: "Carryforward" and "Keep More Tax Desk". | Sub-brand "Tax Desk" under the site until it earns traffic. Standalone names need a full clearance search. |
| 4 | **Neutral site names to put in front of the attorney** (unverified, for discussion only): "Long Thinking", "Margin Tools", "Compounder", "Clear Decisions", "Steadfast Money". | Discuss at the consultation. |
| 5 | **Daily outlook.** Stop it, convert to weekly without tickers, or keep with counsel's blessing? What happens to the 125-post archive? | Pause the email now. Convert to the weekly library email. Noindex the archive. |
| 6 | **What stays free forever.** The list in section 4. | That list. |
| 7 | **Affiliates acceptable.** From the table in section 4: brokerages (which ones), tax software, HYSA, budgeting apps, books. Any you would not recommend to a friend? | Fidelity or Schwab, FreeTaxUSA, Ally or Marcus, YNAB, Bookshop.org. No Robinhood, no Webull, no per-lead advisor networks. |
| 8 | **AI crawlers.** Keep allowing training bots in robots.txt? | Keep for search-style bots, block training-only bots. |
| 9 | **Consent banner.** Add one for GA4, or document a no-banner decision with counsel? | Ask counsel at the same consultation. |
| 10 | **Pricing.** Keep $9 and $90, add lifetime later, or change? Remove "Most popular"? | Keep prices, remove the badge, add lifetime after webhooks are proven. |
| 11 | **Physical mailing address** for email footers. | A registered private mailbox or the LLC's registered address. |
| 12 | **Stripe webhook.** Can you confirm in the Stripe dashboard that the endpoint is registered and the last deliveries are 2xx? | Treat billing metrics as unreliable until confirmed. |
| 13 | **Prune list.** Retire What's Your Why? Keep Geographic Arbitrage? Ship or delete Roth Optimizer? | Retire, retire, delete. |
| 14 | **Commit this report?** May I commit `docs/growth/` to a branch and open a PR, with no other changes? | Not without your OK. |

---

## Appendix A: evidence

### A1. Where the facts come from

- Repo audit of commit `ec685e5` with file and line references: `docs/growth/evidence/repo-audit.md`.
- Live HTML read through Vercel for the production deployment of the same commit: home page, sitemap.xml, robots.txt.
- Local build screenshots at 1440x900 and 390x844 for every page type and all 16 tools (78 files in the session scratchpad). A curated set of 12 is in `docs/growth/screenshots/`.
- Desk research with URLs: `docs/growth/evidence/external-research.md`.
- Production numbers are from `docs/monetization/BASELINE-2026-09-29.md` and `AUDIT.md` (Sep 29 read-only queries). They were not re-queried for this report.

### A2. Checks run on the repo (Oct 25)

| Check | Result |
|---|---|
| `npm test` | Pass, 161 of 161 |
| `npx tsc --noEmit` | Pass |
| `npm run lint` | Fail, 192 errors and 75 warnings (37 from the stale `Cortex Design System/` folder) |

### A3. Screenshot observations and accessibility pass

Full write-up with the 16-tool metadata table, per-page status codes and the accessibility counts: `docs/growth/evidence/local-ux-audit.md`. All 37 pages (21 site pages and 16 tools) returned 200 on desktop and mobile. Every tool has a unique title, a 140 to 215 character description, a correct canonical and one H1. No tool has a Share, Email, Download or Export button; "Save Scenario" exists on 12 and needs login. Reviewed by eye for this report: home (desktop, mobile, mobile fold), tools hub (mobile), Coast FIRE (desktop, mobile, mobile fold), pricing (mobile); the agent additionally reviewed Budget, S-Corp Investment, What's Your Why, the show page, financial-mutants, signup, disclosure and a guide.

## Appendix B: sources cited in the naming and compliance sections

- Justia trademark owner page for 88xOver, LLC: https://trademark.justia.com/owners/88xover-llc-4509866
- Money Guy disclaimer (entity naming): https://moneyguy.com/disclaimer/ and https://moneyguy.com/terms-of-use/
- Bogle Center on protecting the Bogleheads mark: https://boglecenter.net/protecting-the-trademark/
- ABA Journal on the Goldman Sachs blogger dispute: https://abajournal.com/news/article/goldman_sachs_backs_down_in_trademark_battle_with_blogger
- Nominative fair use explainers: ABA Landslide and Dorsey (links in the research file)
- FTC Endorsement Guides FAQ: https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking
- FTC 2023 Guides press release: https://www.ftc.gov/news-events/news/press-releases/2023/06/federal-trade-commission-announces-updated-advertising-guides-combat-deceptive-reviews-endorsements
- FTC Consumer Reviews and Testimonials Rule: https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials
- CAN-SPAM compliance guide: https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business
- SEC Marketing Rule summary (secondary): https://www.smarsh.com/regulations/sec-marketing-rule-206-4-1
- Google site move guidance: https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes
- Google FAQ rich result change (Aug 2023): https://developers.google.com/search/blog/2023/08/howto-faq-changes
- YNAB affiliate program page (the one program with published figures, retrieved 2026-10-25): https://www.ynab.com/partners/affiliate-program
- beehiiv on sponsorship CPMs: https://www.beehiiv.com/blog/newsletter-sponsorship-cost

Research was done through web search snippets only; primary pages could not be fetched from this environment. Treat every external figure as "verify before use".
