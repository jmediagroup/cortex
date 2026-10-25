# Local UX and compliance audit, Money Guy Mutants

Environment: local Next.js dev server (localhost:3000), placeholder Supabase env, 2026-10-25. Desktop 1440x900, mobile 390x844. Full-page shots were taken after scrolling the whole page so entrance animations ran. Ignore the dev "N / 1 Issue" badge, it is dev-only (the "1 Issue" is a server-side "supabaseKey is required" error from the placeholder env).

## Summary

1. All 37 pages (21 site pages plus 16 tools) returned HTTP 200 on desktop and mobile. No page crashed. Only a collapsed dev console error from the missing Supabase key.
2. Tool pages are strong on SEO and honesty: unique title, 140-215 char meta description, correct canonical, 5-6 JSON-LD types, one H1, FAQ sections, and a "NOT ADVICE / not affiliated" block. Medium: that block sits at the very bottom of every tool page (1,200 to 9,900 px down), never above the fold.
3. The "educational, not advice" and "not affiliated" lines are above the fold only on /the-money-guy-show (under hero CTAs) and /signup. On the home page they are only in the footer. Severity Medium.
4. Pro upsell is heavy on Coast FIRE (and similar tools): about 4,000 px of blurred fake Pro panels, 3 "Upgrade" buttons, a sidebar upgrade box, and a free-account banner above the result. On mobile the first screen of Coast FIRE is a signup banner, the result starts below the fold. Severity High (UX), Medium (rule 9 spirit).
5. Pricing and tool tiers are inconsistent. /pricing lists Car Affordability as a Free tool, but the home grid badges it PRO and the tool page shows Upgrade prompts. Home says "13+ tools" and "Fifteen tools", the site has 16 tool routes. Severity High (trust).
6. Two tools are fully locked for free users (S-Corp Investment, What's Your Why). S-Corp page copy says "You just saw what a Solo 401(k)... does to the retirement number" while nothing was shown. Severity Medium.
7. Home hero shows an invented dashboard card ("NET WORTH . LIVE $248,912", "Coast FIRE at age 47") that reads like live data. Claims "0 dark patterns" and "Thousands of Mutants are building wealth" are unsubstantiated. Severity Medium.
8. Accessibility: no skip link anywhere, form inputs on Coast FIRE and Budget have no accessible name (12 each), Budget skips H2 to H4. Focus ring is visible (2px teal). Severity Medium.
9. Crawler and no-JS safety is good: all section text is in the HTML and nothing is hidden with JS off or with reduced motion. With JS on and no scroll, 28 home sections sit at opacity 0 until scrolled into view, which breaks naive screenshots. Severity Low.
10. Newsletter capture exists only on /thinking (daily outlook). No email capture on home, guides, tools or footer. /articles shows "Unable to load articles" locally (placeholder DB, may differ in production). Severity Low/Medium (missed capture).

## Screenshot observations

Good overall: consistent navy, teal and orange palette, one type family, clear card system, generous spacing, strong hero headline. Tool pages have a clean breadcrumb, H1, one-line promise, then result.

**Home desktop** (home-desktop.png). Nav: Tools, Watch, Guides, Thinking, Pricing, Articles, Sign in, Get started (orange). Hero: "Think clearly about life's biggest decisions." CTAs "EXPLORE THE TOOLS" (orange) and "START FREE" (outline). Stats strip "13+ interactive tools / 50+ states covered / 0 dark patterns". Mock dashboard card on right with floating chips. Zero tools above the fold (tools grid starts about 1,300 px down). No disclaimer above the fold. Sections: "Fifteen tools. One mental model." with a grid of 16 cards, each with FREE or PRO badge and orange "OPEN TOOL" link; "The goal isn't prediction" band with strike-through "Most advice is static" phrases (nice touch); pricing preview ($0 and $9/month, "Most popular" ribbon); navy "Built on principles, not dark patterns" panel; footer with disclaimer at the bottom. Tool cards: PRO cards (Retirement, Net Worth) have a blue highlight outline, the others do not, a little inconsistent. Some tiny gray text in the principles sub-cards (about 11 px) has low contrast on teal.

**Home mobile fold** (home-mobile-fold.png). Header: logo left, circular hamburger right. Eyebrow chip, headline wraps to 4 lines, subcopy, two stacked CTAs (the outline "START FREE" is only half-width, odd), stats row in 3 cols. The mock dashboard card peeks at the bottom. No tools, no disclaimer visible. The dev badge overlaps the stats (ignore). Mobile nav pattern on marketing pages is a hamburger (not opened in this audit).

**Home mobile full** (home-mobile.png, 390x9938). Tool cards stack single column, each about 250 px tall with a lot of empty space inside, so 16 tools take roughly 4,000 px. Medium: consider a 2-column compact grid or list.

**/apps mobile**. Different shell from marketing pages: logo left, orange "Sign in" button, breadcrumb, "Every Money Guy Mutants tool." and one-column cards with FREE (green pill) or PRO (gray pill). A bottom tab bar (Apps, Scenarios, Learn) is fixed. About 2 cards are visible above the fold. In full-page captures the tab bar appears mid-page, that is a capture artifact. There is no hamburger on tool/app pages, and no link to Pricing, Guides, Thinking from the app shell except a small footer (Articles, Pricing, Terms & Privacy). Medium: users in tools cannot reach the marketing nav.

**/pricing desktop and mobile**. Headline "Simple, honest pricing.", Monthly/Annual toggle, two cards (Free, Finance Pro "Most popular"), enterprise navy band with "CONTACT SALES". Clean and balanced, good contrast, CTAs clear. Mobile stacks well. No FAQ, no refund or cancel text, no "what you cannot do on Free" list, no disclaimer above the fold. Pro list is vague ("Advanced scenarios and comparisons").

**Coast FIRE desktop** (apps_coast-fire-desktop.png, 9,966 px tall). Left app sidebar (Apps, Scenarios, Learn) plus "UPGRADE: Unlock the full Pro suite" box pinned at the bottom-left. Order: breadcrumb, H1, teal "FREE ACCOUNT" banner (Create free account, View all tools), orange "Save Scenario", status card "BUILDING MOMENTUM" with Coast number $124,185, progress bar 80.5%, four KPI cards, "YOUR NUMBERS" form beside the projection chart, math explanation, formula box. Then a big teal "Coast FIRE Command Center" with orange "Upgrade to Money Guy Mutants Pro - $9/month", then roughly 3,800 px of blurred Pro panels (Coast Date Optimizer, Barista FIRE, Flexibility Score, Lifestyle Scenarios, Social Security, Work Optional Timeline) with a floating white "Unlock Pro Analysis" card, then another navy "Unlock Pro" band, "THE READ" callout, then long educational text, 8-question FAQ, 2 guide links, 3 related tool cards, and finally a "NOT ADVICE" block with "How we make money" link. The blurred panels do look intentionally locked (blur plus lock card), but they are very tall, the blurred text is unreadable, and the white "Unlock" card floats mid-blur. There is an empty white card to the right of the "What is Coast FIRE?" block (dead space, Low). The default result shows immediately with pre-filled inputs (30, 65, $100k, $1k/mo, 10% growth), so the user sees a number before entering anything. Medium: default 10% nominal growth is a strong assumption; it is shown only as an input and in the math box.

**Coast FIRE mobile fold**. Top: logo, orange Sign in. Breadcrumb, H1, subcopy, a large teal "FREE ACCOUNT" banner with 2 stacked buttons, then "Save Scenario". The result card begins at the bottom edge, covered by the fixed bottom tab bar. So a phone user sees a signup pitch before the tool or result. No disclaimer on the fold. High (UX).

**Budget mobile**. Teal "Unlock 7 More Financial Calculators" banner is the first thing (about 330 px) before the H1. Then inputs, "Tax Reality Layer" segmented control, Take-Home $5,920, "SYSTEM ANALYSIS" with Low Tension chip, then an EMPTY white PRO FEATURE card with a gold "Upgrade to Access" button (a third button color, gold, not used elsewhere; the card body is blank, looks unfinished or broken). "Budget Architecture" heading wraps awkwardly against the Monthly/Annualized toggle. Input values are right aligned mono, readable.

**S-Corp Investment desktop**. Fully locked: H1, free-account banner, then a centered lock card "Pro Feature ... UPGRADE TO PRO" in a large empty area (about 400 px of dead space above and below), then "THE READ" callout that says "You just saw what a Solo 401(k) plus a company contribution does" (false, nothing shown). Good: strong FAQ, guide links, related tools, and the disclaimer. Page is short (2,365 px).

**What's Your Why desktop**. Intro card, then a navy "Unlock Pro" panel with 3 bullets (AI-synthesized reflection, named themes, saved reflections). Clean. Eight questions are not previewed at all, so a free user cannot try the tool; the header says "Pro reflection". Only a "NOT ADVICE" line at the bottom. Medium: "AI-synthesized" is a notable data-handling claim, check the privacy text.

**The Money Guy Show desktop**. Purpose: fan tribute page. Hero "The Money Guy Show, from one financial mutant to another." with "SUBSCRIBE ON YOUTUBE" and "WATCH THE LATEST", and a small line directly under the buttons: "An independent fan project, not affiliated with, endorsed by, or sponsored by The Money Guy Show." This is the best disclosure placement on the site. YouTube embed grid fails locally ("We couldn't load the latest videos right now") due to the sandbox network, that is expected, production may show videos. Includes "The fine print, up front" FAQ. No show logos or show art, no host photos, only host names in text. Good design.

**Financial Mutants desktop**. Hero "Money Guy-style tools, built for financial mutants." Disclosure is in the FAQ and a gray note near the bottom, not above the fold. Tool grid of 6. Fine.

**Signup mobile**. Single clean form, logo, "GET STARTED FREE", "Join the Mutants.", fields First name (optional), Email, Password (with Show toggle and 2 live rules), orange "CREATE FREE ACCOUNT", terms link, "No credit card required", "ENCRYPTED . SUPABASE AUTH", and "independent, fan-made project, not affiliated..." line visible without scrolling. Very good. Placeholder text is all caps and light gray (low contrast, Low). The "Thousands of Mutants are building wealth" line is unverified.

**Disclosure desktop** ("How we make money."). Clear and plain: offers appear only after the result, max one per result, labeled "Sponsored", only from approved programs, never change the math, Pro members do not see them by default. Matches the repo rules. Low: the page promises "We only show offers from programs we have applied to and been approved by" which must stay true. No offers exist on any page today (0 sponsored links).

**Guide mobile** (Coast FIRE Explained). Hero band with the mascot logo repeated (no illustration), "Back to guides", category chip, H1, deck, byline "By Money Guy Mutants Research", date, 7 min read, tags. Readable 17 px body text, good line length. The byline date is clipped by the dev badge (ignore). Hamburger present. No inline tool CTA seen in the first 2,400 px (not checked further). Good.

## Tool table (16 tools, extracted at 1440x900)

Common to all 16: canonical is `https://moneyguymutants.com/apps/<slug>` (correct, production domain). JSON-LD types on 15 tools: Organization, WebSite, SoftwareApplication, BreadcrumbList, WebApplication, FAQPage. whats-your-why has only Organization, WebSite, SoftwareApplication. Meta descriptions exist on all (140 to 215 chars). Exactly one H1 each. "Not affiliated" text appears in the bottom disclaimer block of every tool (position noted below). No "not financial advice", "for informational" phrase anywhere, the wording is "Educational model . not personalized advice . projected outcomes are uncertain" under a "NOT ADVICE" label. Zero `a[rel*=sponsored]` on all 16. No Share, Email, Download or Export buttons on any tool. "Save Scenario" exists on 12 tools (needs login). "$9" appears on 10 tools. My "$90" regex hit "$90,000"-style numbers, so ignore it. Annual price $90 is only on /pricing.

Position code: footer@N means the bottom "NOT ADVICE" block at N px from the top, i.e. never above the fold. below fold@N is body text.

| Tool | Title | Canonical ok | JSON-LD | H1 | inputs/selects/ranges | not affiliated | educational | result changes | assumption text (120) | return claim |
|---|---|---|---|---|---|---|---|---|---|---|
| budget | Monthly Budget Calculator: Plan Every Dollar  | yes | Organization,WebSite,SoftwareApplication,BreadcrumbList,WebApplication,FAQPage | Monthly budget calculator | 12/0/0 | none | none | changed (8000->16007) | none | none |
| capital-gains-tax | 2026 Capital Gains Tax Calculator: 0% Bracket | yes | Organization,WebSite,SoftwareApplication,BreadcrumbList,WebApplication,FAQPage | Capital gains tax calculator (2026). | 9/0/1 | footer@5429 | below fold@3241 | changed (120000->240007) | Illustration using the calculator's default assumptions, not a forecast. Wages means the calculator's W-2 wages input, e | none |
| car-affordability | How Much Car Can I Afford? 20/3/8 Rule Calcul | yes | Organization,WebSite,SoftwareApplication,BreadcrumbList,WebApplication,FAQPage | How much car can I afford? | 3/0/1 | footer@5443 | footer@5415 | changed (150000->300007) | Assumes $8,468 in cash down (20%) plus a $33,871 loan over 3 years. | none |
| coast-fire | Coast FIRE Calculator: Find Your Coast Number | yes | Organization,WebSite,SoftwareApplication,BreadcrumbList,WebApplication,FAQPage | Coast FIRE calculator. | 12/0/0 | footer@9885 | footer@9856 | changed (30->67) | Advanced Assumptions | return of 6.82% |
| compound-interest | Compound Interest Calculator With Monthly Con | yes | Organization,WebSite,SoftwareApplication,BreadcrumbList,WebApplication,FAQPage | Compound interest calculator. | 5/1/0 | footer@7399 | footer@7370 | changed (25000->50007) | Projects a starting amount plus monthly or annual contributions in one index fund group at a fixed assumed average, with | 8% return |
| debt-paydown | Debt Snowball vs Avalanche Calculator: Debt-F | yes | Organization,WebSite,SoftwareApplication,BreadcrumbList,WebApplication,FAQPage | Debt snowball vs avalanche calculator. | 19/0/2 | footer@8598 | footer@8569 | changed (8000->16007) | none | 5.5% costs less than 7% market return |
| gambling-redirect | Gambling vs Investing Calculator: See the Opp | yes | Organization,WebSite,SoftwareApplication,BreadcrumbList,WebApplication,FAQPage | Gambling vs investing calculator. | 1/0/3 | footer@7565 | footer@7536 | changed (250->507) | Assuming compound interest and market growth | RETURN 10% THE REALITY CHECK Only 3-4% |
| geographic-arbitrage | Geographic Arbitrage Calculator: Compare Two  | yes | Organization,WebSite,SoftwareApplication,BreadcrumbList,WebApplication,FAQPage | Geographic arbitrage calculator. | 6/2/0 | footer@9835 | below fold@8722 | changed (150,000->300007) | Assumes leaving a hub forgoes a salary premium that ramps to ~7.5% of pay over 10 years (≈$45,000 over 20 years) | return you set (7% |
| index-fund-visualizer | Index Fund Calculator: Monthly Investing in V | yes | Organization,WebSite,SoftwareApplication,BreadcrumbList,WebApplication,FAQPage | Index fund calculator. | 1/0/3 | footer@7348 | below fold@1559 | no numeric input | Most people pick a fund by name. You just saw how much the assumed return , and a bumpy path , move where VOO, VTI, VT,  | 10.5% average return |
| net-worth | Net Worth Calculator: Assets, Debts and Liqui | yes | Organization,WebSite,SoftwareApplication,BreadcrumbList,WebApplication,FAQPage | Net worth calculator. | 0/0/2 | footer@6908 | footer@6880 | no numeric input | none | none |
| personality-quiz | Money Personality Quiz: Which of 6 Investor T | yes | Organization,WebSite,SoftwareApplication,BreadcrumbList,WebApplication,FAQPage | Money personality quiz. | 0/0/0 | footer@3187 | footer@3158 | no numeric input | Projects a starting amount plus monthly or annual contributions in one index fund group at a fixed assumed average, with | none |
| rent-vs-buy | Rent vs Buy Calculator: Break-Even Year and N | yes | Organization,WebSite,SoftwareApplication,BreadcrumbList,WebApplication,FAQPage | Rent vs buy calculator. | 2/0/6 | footer@8691 | footer@8663 | changed (6.5->20) | Housing markets fluctuate. Here's an illustrative outcome range assuming a ±25% purchase-timing swing: | RETURN 8% |
| retirement-strategy | Roth Conversion Calculator: Withdrawals, RMDs | yes | Organization,WebSite,SoftwareApplication,BreadcrumbList,WebApplication,FAQPage | Roth conversion and withdrawal calculato | 14/0/0 | footer@7036 | below fold@3929 | changed (62->131) | Assumed annual return | average return |
| s-corp-investment | S Corp Solo 401(k) Contribution Calculator | yes | Organization,WebSite,SoftwareApplication,BreadcrumbList,WebApplication,FAQPage | S corp solo 401(k) contribution calculat | 0/0/0 | footer@2284 | footer@2256 | no numeric input | none | none |
| s-corp-optimizer | S Corp Tax Savings Calculator: S Corp vs LLC | yes | Organization,WebSite,SoftwareApplication,BreadcrumbList,WebApplication,FAQPage | S corp tax savings calculator. | 2/0/0 | footer@4807 | footer@4779 | changed (150000->300007) | none | none |
| whats-your-why | What's Your Why , Find Your Real Money Motiva | yes | Organization,WebSite,SoftwareApplication | What's your why? | 0/0/0 | footer@1223 | none | no numeric input | none | none |

Return and assumption claims worth reviewing (visible text):
- index-fund-visualizer: "10.5% average return" is shown as an assumption near the chart (below fold at about 1,559 px). Medium: historical-style claim, check it carries "not a guarantee" next to it.
- gambling-redirect: "RETURN 10%" plus "THE REALITY CHECK, Only 3-4%..." Medium: fixed 10% assumed return is displayed as a default.
- rent-vs-buy: "RETURN 8%" slider default; the only disclaimer is in the footer block, but the page also has an "illustrative outcome" line (below the fold, 5,399 px).
- debt-paydown: "5.5% costs less than 7% market return" in the insight text.
- coast-fire: "real return of 6.82%" and defaults 10% growth, 3% inflation, 0.18% fees. FAQ text says "Returns are not guaranteed".
- compound-interest: "8% return" default.
- personality-quiz shows the same "Projects a starting amount..." text as Index Fund in a related-tools card, that is what the "assum" scan caught, not a real assumption.
- net-worth, personality-quiz, s-corp-investment, whats-your-why: no first numeric input found (quiz, or locked, or custom widgets), so "result changes" was not tested.
- All other tools: changing the first numeric input changed the main text (result updates live). Budget tool also changed.

Header nav (marketing pages): Tools | Watch | Guides | Thinking | Pricing | Articles | Sign in | Get started. Header nav (tool pages, app shell): Apps | Scenarios | Learn | Sign in | All tools. Footer (marketing): Product: All tools, The Money Guy Show, For Financial Mutants, Pricing, Roadmap, Changelog. Company: About, Guides, Thinking, Articles, Enterprise. Legal: Terms, Privacy, Disclosure, Security. Plus "All systems operational" and the independence disclaimer. Footer on tool pages: only "Articles | Pricing | Terms & Privacy" plus the NOT ADVICE block, no Disclosure link except "How we make money".

## Accessibility (/, /apps/coast-fire, /apps/budget, /pricing)

| Check | / | coast-fire | budget | pricing |
|---|---|---|---|---|
| Images without alt | 0 | 0 | 0 | 0 |
| Form controls without accessible name | 0 | 12 | 12 | 0 |
| H1 count | 1 | 1 | 1 | 1 |
| Skipped heading levels | none | none | H2 to H4 | none |
| Empty buttons | 0 | 0 | 0 | 0 |
| "here"/"learn more" links | 0 | 0 | 0 | 0 |
| Skip link | no | no | no | no |

- Coast FIRE and Budget inputs (age, investments, contributions, each budget line) have visible small labels but no `for`/`aria-label` association. Severity Medium (screen reader users hear only "edit text, 100000").
- No skip-to-content link on any page. Severity Medium (keyboard users tab through the whole header and sidebar). `<main>` and `lang="en"` are present.
- Focus is visible: after 3 Tabs on / the "Watch" nav link has a 2px solid teal (rgb 29,128,114) outline, rounded (home-tab3-desktop.png). Good. On the dark hero, the same teal may be low contrast, not tested.
- Small text: blurred Pro panels and the FOOTER disclaimer are about 11 to 12 px gray, low contrast. Severity Low.
- The "N" dev badge overlaps the sidebar upgrade box text on desktop, dev-only.

## Journey and pricing

**Clicks to a changed Coast FIRE result.** Home: click "EXPLORE THE TOOLS" (1, goes to /apps), click the Coast FIRE card (2). A result already shows at click 2 (pre-filled defaults, $124,185 coast number). To get a changed result: click or tap the Age field and type (3), so 2 clicks to a result and 3 interactions to a changed one. (Home nav "Tools" or the Coast FIRE link on /the-money-guy-show are 1 to 2 clicks too.) Good: very short path. Risk: the default result is not the user's, it is a sample shown as if it were theirs, with a "BUILDING MOMENTUM" status. Severity Low/Medium, label it "Example".

**What follows the result, in order (desktop, px from top):** status card and 4 KPI cards (600 to 1,160), inputs and chart (1,230), math box, "WHAT IS COAST FIRE?" navy box with formula, teal "Coast FIRE Command Center" with orange "Upgrade to Money Guy Mutants Pro - $9/month" (2,742), about 3,800 px of blurred Pro panels with a floating "Unlock Pro Analysis / Upgrade to Pro" card (4,629), navy "Unlock Pro / Upgrade to Pro" band (6,527), "THE READ" callout, About text, How it works, Coast number by age table, FAQ (8 items, 8,765), "Read the guide" (2 links), "Related Financial Tools" (3 cards), then "NOT ADVICE" and "How we make money". Order is: upsell first, education after, disclaimer last. A top banner for a free account and a sidebar "UPGRADE" box also exist. Severity High for pacing: the Pro pitch outweighs the content, and the first 2 CTAs (above the result) are signup, not education. There is no email/share/save-result CTA other than "Save Scenario" (login). No affiliate or sponsored offer is shown on any page.

**/pricing (exact).**
- Toggle: MONTHLY / ANNUAL.
- Plan "FREE": "For exploration and curiosity." $0 / forever. Features: Access to core calculators; Compound Interest Calculator; Car Affordability Calculator; Limited scenarios and projections; Ideal for learning; Community support. Button: START FREE.
- Plan "FINANCE PRO" (badge "MOST POPULAR"): "For people who want precision." Monthly: $9 / month. Annual: $90 / year with "Save $18/year". Features: Full access to all Money Guy Mutants tools; Advanced scenarios and comparisons; Deeper projections and strategy modeling; S-Corp tools and tax modeling; Ad-free experience; Priority support. Button: GET PRO.
- Enterprise band: "Building something bigger? Talk to us about team seats, custom integrations, or white-label deployments." Button CONTACT SALES.
- Issues: (a) Free list names only 2 tools, but Coast FIRE is FREE on /apps and home, and Car Affordability is badged PRO on home while pricing lists it as free. High. (b) "Ad-free experience" implies ads exist on Free, but none were seen; disclosure says only that Pro users "don't see offers". Medium. (c) "Community support" is unexplained. Low. (d) No cancellation or refund wording, no trial. Medium. (e) Annual savings is correct ($108 vs $90).

**/signup fields:** First name (optional), Email (required), Password (required, min 10 chars, letters plus numbers or symbols, Show toggle), a hidden honeypot field ("mgm_hp"). Checkbox: none; text "By creating an account you agree to our terms". Button "CREATE FREE ACCOUNT". /login: email and password. Not submitted.

**/enterprise.** Headline "Precision finance tools, built around your org." Four offers: White-label solutions, Custom integrations (API access), Advanced analytics, Dedicated support (named account manager). Claim: "Trusted by financial advisors, HR teams, and organizations that value clarity in decision-making." (unsubstantiated, High-ish compliance copy risk, Medium). Form "Let's talk": First name, Last name, Work email, Company name, Company size (select: 1-10, 11-50, 51-200, 201-500, 500+), Phone (optional), "How can we help?" textarea, button SUBMIT REQUEST, "We'll respond within 1 to 2 business days." and "YOUR INFORMATION IS SECURE". Not submitted. Several of these promises (API access, analytics dashboards, named account manager) read as shipped features; check against /roadmap.

**Newsletter or email capture.**
- /thinking: yes. Form label "DAILY OUTLOOK BY EMAIL", copy "Free. Every weekday morning. Unsubscribe in one click.", email input placeholder you@domain.com, button SUBSCRIBE, plus an off-screen honeypot "Company". The page header also says "Free to read, opt in for the email."
- /, /guides, /articles, tool pages, /pricing, footer: none (0 email inputs). The guides copy says "New guide every Sunday" but there is no way to subscribe. Medium (missed capture, and "weekly Sunday guide" promise with no notify path).
- Note the daily outlook promises "Every weekday morning", while the thinking list shows daily posts and 1 weekly. Check cadence is real.

## Content and compliance observations

**Counts and date range (local).**
- /thinking: 126 posts listed (125 daily, 1 weekly), 2026-04-24 to 2026-10-23, filtered by cadence. Source is markdown files in the repo, so this should match production. Newest post is 2 days old.
- /guides: 17 guide cards, 2026-07-02 to 2026-10-25 (repo has 19 files including `_topics.md`; the 2 difference is likely the topics file plus one not published or dated in future, not verified). Weekly cadence matches "New guide every Sunday". Newest guide is today.
- /articles: 0 items. Page shows "Unable to load articles. Please try again later. / Try again". This is from the placeholder database, production likely differs. Cannot assess depth.
- Home "latest articles" fetch also failed ("Failed to fetch latest articles" in console), expected locally.

**/the-money-guy-show.** Fan tribute: subscribe and watch links to YouTube, a "latest from the channel" feed (empty locally, falls back gracefully), links to 3 tools, and a "fine print" FAQ. Sentences that could read as affiliation or endorsement:
- "The show turned a generation of us into financial mutants. This is our thank-you."
- "For years, Brian Preston and Bo Hanson have made the boring, life-changing math of wealth-building feel urgent..." (names two hosts).
- "This page is the front door to the source material, go watch, go subscribe, then come back and run your own numbers."
- "Free calculators and decision engines inspired by the same ideas" and "Money Guy Mutants exists because the show changed how we think about money, and building free tools inspired by the Financial Order of Operations..."
- Page H1 uses the show's full name: "The Money Guy Show, from one financial mutant to another." and H2 "The latest from The Money Guy Show." Page `<title>` and nav label "Watch".
- Mitigations present: line under the CTAs "An independent fan project, not affiliated with, endorsed by, or sponsored by The Money Guy Show." (above the fold) and FAQ "Is this the official Money Guy Show page? No."
- No show logo, no show art, no host photos, no embedded video (thumbnails would link out). Brand name "MoneyGuy Mutants" with the same word "MoneyGuy" in the logo lockup is very close to the show's name. Severity High (trademark and confusion risk), Medium for naming "Brian Preston and Bo Hanson" and "Financial Order of Operations" (a named framework of the show) as product-organizing concepts ("Each tool maps to a step"). Recommend legal review; this is a product naming issue, not a code defect.
- Tool pages carry the "not affiliated with ... The Money Guy Show or Abound Wealth Management, LLC" line, which is good, but only at the very bottom.

**/financial-mutants.** SEO and tribute page: "Money Guy-style tools, built for financial mutants." Uses "Money Guy" as a style descriptor in the H1 and "Tools mapped to the Money Guy method". Says "Are you the official Money Guy Show? No." in FAQ (not above the fold). Claims "No fluff, no product pitches", which conflicts with the Pro upsells and a planned "sponsored offer" program. Medium. Also "Is it really free? Yes. Every calculator ... runs in your browser and is free to use without an account", yet S-Corp Investment and What's Your Why are fully Pro-locked and Retirement/Net Worth badge PRO. High (inaccurate claim).

**Other compliance notes.**
- Rule 9 (disclosure adjacent, nothing before result): no sponsored element exists today, so nothing violates. The Pro upsell banner appears before the result on mobile, which is not affiliate but is a pre-result promo. Medium.
- Rule 10 (advice hygiene): good "NOT ADVICE" block; missing near-result "illustrative, not a forecast" next to the 10% growth default and Index Fund "10.5% average return". Medium.
- Rule 8 (analytics PII): not testable here. Console showed only network errors.
- Disclosure page states offers appear "only after you have your result" and "Pro members don't see them by default"; code and copy must stay aligned.
- "0 dark patterns", "Thousands of Mutants", "Trusted by financial advisors, HR teams", "NET WORTH . LIVE" mock card: unsubstantiated or misleading marketing claims. Medium.
- Tool count inconsistency: "13+ interactive tools", "Fifteen tools", 16 routes. Low/Medium.

**Entrance animation behavior (per coordinator request).**
- With JS on, no scroll, 28 text blocks on / (e.g. "Fifteen tools. One mental model.", tool cards) have computed opacity 0 until they scroll into view. On /apps/coast-fire: 0.
- The text is in the DOM: `document.body.innerText` is 4.8k chars on / and the HTML text content is 60k chars. With `javaScriptEnabled: false`: 0 hidden blocks, all content visible (home-nojs-desktop.png). With `prefers-reduced-motion: reduce`: 0 hidden blocks. So crawlers, no-JS and reduced-motion users get full content. Impact is limited to unscrolled screenshots and slow or failed hydration after load (content could flash blank). Severity Low.

**Local-environment caveats (may differ in production):** /articles list and home latest-articles (DB), YouTube feed on /the-money-guy-show (network blocked), any logged-in state, Save Scenario, Stripe checkout (Get Pro, Upgrade), pricing links, and whether Pro users see the same upsell blocks. Sign in, signup, enterprise submit were not exercised. Dev-mode fonts and animation timing may differ slightly. The 1 Issue badge is dev only.

## Appendix: screenshot files and status

All files in /tmp/claude-0/-home-user-cortex/49527bf4-961b-5e52-956a-3c56b0e8cc6f/scratchpad/screens/ named `<slug>-desktop.png` and `<slug>-mobile.png` (slug = path with "/" replaced by "_", home = "home"). Mobile fold: home-mobile-fold.png, apps_coast-fire-mobile-fold.png. Extras: home-tab3-desktop.png, home-nojs-desktop.png, thinking_2026-04-24-earnings-week-recap-*.png. Crops used for review are in scratchpad/crops/. Raw extraction JSON: scratchpad/tools.json. Status: HTTP 200 for all 37 pages on both viewports, no Next.js error overlay on any page. The dev overlay present on / is the collapsed "supabaseKey is required" console error (placeholder env), not a render failure.
Pages: home(/), apps, calculators, articles, thinking, guides, financial-mutants, the-money-guy-show, about, pricing, enterprise, roadmap, changelog, security, disclosure, terms, login, signup, guides_2026-07-05-coast-fire-explained, calculators_how-much-car-can-i-afford, thinking_2026-04-24-earnings-week-recap, and apps_{budget, capital-gains-tax, car-affordability, coast-fire, compound-interest, debt-paydown, gambling-redirect, geographic-arbitrage, index-fund-visualizer, net-worth, personality-quiz, rent-vs-buy, retirement-strategy, s-corp-investment, s-corp-optimizer, whats-your-why}.
