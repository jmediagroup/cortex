# External research for MoneyGuyMutants.com growth and compliance report

Date of research: 2026-10-25. Method: WebSearch only. Important limits:
- WebFetch was blocked in this environment (DNS failure for ftc.gov and developers.google.com), so I could not read primary pages in full. Search snippets of primary pages are cited where I saw them. Everything else is secondary.
- RDAP and WHOIS lookups were blocked by the proxy. All domain availability is "unverified".
- No affiliate program terms were confirmed from a program's own page except where noted (YNAB). Third-party directory figures conflict and are NOT to be used as facts.
- Nothing here is legal advice. A securities and trademark lawyer should review before launch.

## 1. Trademark landscape

### What I found
| Mark | Serial | Owner as shown | Status / classes | Source |
|---|---|---|---|---|
| THE MONEY GUY SHOW | 90145137, filed 2020-08-28 | 88xOver, LLC | Covers podcasts about personal finance, financial planning, investment (per snippet). Class and live status NOT confirmed. Verify in USPTO. | https://trademark.justia.com/owners/88xover-llc-4509866 |
| FINANCIAL ORDER OF OPERATIONS | 90211240, filed 2020-09-25 | 88xOver, LLC | Status and class not confirmed | same URL |
| MAKING A MILLIONAIRE | 99121337, filed 2025-04-04 | 88xOver, LLC | Status and class not confirmed | same URL |
| MONEY GUYS | 76691142 (2008) | Oxygen Financial (per search summary) | Abandoned 2009 for failure to respond. Not tied to the podcast. | https://trademark.justia.com/766/91/money-guys-76691142.html |

Entity naming is inconsistent. Brian Preston's disclaimer says he owns "88 Times Over, LLC", which publishes the podcast, and that advisory services come from Abound Wealth Management, LLC, a separate RIA (https://moneyguy.com/disclaimer/). The terms page names 88xOver, LLC (https://moneyguy.com/terms-of-use/). The mark owner on Justia is 88xOver, LLC.

### Not found
- No federal filing found for the plain phrase "MONEY GUY" by the podcast owners. Not proof of absence. Check tmsearch.uspto.gov directly.
- No filing found for "Financial Mutant", "Financial Mutants" or "Money Guy Mutants" (search: "Financial Mutant" trademark). Only unrelated MUTANT marks surfaced. Not proof of absence. Common-law rights are possible. The podcast audience is publicly known as "Financial Mutants", which I did not verify from a primary source in this session. Verify.
- Abound Wealth Management and Brian Preston as owner names: no marks surfaced.

### How others handled similar cases (limited)
- Ramsey Solutions sued a real estate YouTuber over a referral program, trade secrets and disparagement. This is not a trademark claim against a fan site. https://www.nashvillepost.com/business/finance/ramsey-solutions-sues-real-estate-youtuber/article_32991202-4241-586d-96d8-b753b1ca8d22.html
- Bogleheads: The Bogle Center holds the BOGLEHEADS service mark and won an arbitration over domains bogleheads.com and bogleheads.net registered by a financial advisor. https://boglecenter.net/protecting-the-trademark/ . Lesson: a brand name inside a domain, used by someone who sells advice, is the pattern that draws action.
- Goldman Sachs backed down against a critic blogger once a no-affiliation disclaimer was added. https://abajournal.com/news/article/goldman_sachs_backs_down_in_trademark_battle_with_blogger
- Mr. Money Mustache, ChooseFI: no public cease-and-desist examples found. Say "not found", not "none exist".
- One practitioner source says fan sites should say "unofficial" or "not affiliated" prominently. Commentary only. See https://theaudacitytopodcast.com/?p=6129

### Nominative fair use, plain language
The Ninth Circuit test (New Kids on the Block) asks three things:
1. Is the thing hard to identify without using the mark?
2. Did you use only as much of the mark as needed (no logos, no stylized text)?
3. Did you avoid suggesting sponsorship or endorsement by the owner?
Circuits differ on how the test works. The Second and Third Circuits treat it differently from the Ninth. Sources: ABA Landslide https://www.americanbar.org/groups/intellectual_property_law/resources/landslide/archive/nominative-trademark-use-affirmative-or-negative-defense-infringement/ and Dorsey https://www.dorsey.com/newsresources/blogs/tmca/2016/06/nominative-fair-use-of-a-trademark-the-second-circuit-weighs-in . I did not find an INTA explainer. Nominative use is about referring to the owner's product. Using a similar name as your own brand ("Money Guy Mutants") is a different question from referring to the podcast. No conclusion given here.

## 2. Disclosure and regulation

### FTC Endorsement Guides (16 CFR Part 255, revised June 2023)
- "Clear and conspicuous" is defined as difficult to miss and easily understandable by ordinary consumers (Section 255.0(f)). Secondary: https://perkinscoie.com/en/news-insights/ftc-finalizes-updated-guidance-for-influencer-and-consumer-review-programs.html . Press release: https://www.ftc.gov/news-events/news/press-releases/2023/06/federal-trade-commission-announces-updated-advertising-guides-combat-deceptive-reviews-endorsements
- FTC FAQ (search snippet of ftc.gov page): "paid link" right next to an affiliate link should be an adequate disclosure. Plain "affiliate link" and "buy now" may not be enough. "Commissionable link" is probably not clear. The closer the disclosure is to the recommendation, the better. Disclose both in the video and in the description for video. Do not hide a disclosure behind a hyperlink labeled "disclosure". https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking
- Affiliate links are a material connection that needs disclosure (new example in the 2023 Guides): https://www.ftc.gov/system/files/ftc_gov/pdf/P204500%20Guides%20Concerning%20Endors%20and%20Testimonials.pdf
- Platform disclosure tools may not be enough on their own (secondary, Perkins Coie above).
- Mobile and email: I did not retrieve FTC text specific to mobile or email. The general rule is that the disclosure must be hard to miss on the device used. Verify in the FTC FAQ before writing a spec.

### FTC Consumer Reviews and Testimonials Rule (final Aug 14, 2024; effective Oct 21, 2024)
- Bans fake or false reviews, buying reviews conditioned on sentiment, undisclosed insider reviews, company-controlled review sites posing as independent, review suppression, and fake social indicators. Civil penalties apply for knowing violations. FTC materials in Dec 2025 cite up to $53,088 per violation.
- https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials
- Q&A: https://www.ftc.gov/business-guidance/resources/consumer-reviews-testimonials-rule-questions-answers
- Relevance: do not publish invented user testimonials or fake "users saved $X" claims.

### SEC Marketing Rule (Advisers Act Rule 206(4)-1) and what it means for a non-advisor site
- The rule binds registered investment advisers, not a content site. It matters because a site that is paid by an RIA per lead or per client is a "promoter" under the adviser's rules. The adviser must clearly and prominently disclose, or reasonably believe the promoter will disclose, client status, the compensation terms, and material conflicts. A written agreement is required if the promoter is paid more than $1,000 in 12 months (per Smarsh summary). https://www.smarsh.com/regulations/sec-marketing-rule-206-4-1
- SEC Division of Examinations Risk Alert, Dec 16, 2025: most common deficiency was missing disclosures, or disclosures placed away from the endorsement or in hyperlinks. Secondary: https://iqeq.com/us/insights/the-secs-latest-marketing-rule-risk-alert-key-takeaways-for-advisers/
- Practical read: any referral to an RIA for pay needs an adjacent, plain disclosure plus a written agreement with the adviser. The adviser carries most of the legal burden, and will likely require the site to use approved language. Verify with counsel. Primary SEC text was not retrieved.
- Per-lead or percentage-of-assets pay can raise broker-dealer or investment adviser registration questions for the site. I did not find a primary source on that in this session. Flag for counsel.

### FINRA Rule 2210 (broker-dealers)
- Applies to FINRA member firms, not to a content site. Matters because brokerages that pay the site will have their own review of any site content that is their "communication". Testimonials about advice or performance need prominent disclosures (may not represent others' experience, no guarantee, paid if over $100). Projections of performance are restricted today, with amendments proposed in 2026 and not confirmed adopted. https://www.innreg.com/resources/finra-rules/2210-communications-with-the-public and https://www.finra.org/rules-guidance/notices/17-06
- Rule 2040 (payments to unregistered persons): search returned nothing. Not summarized.

### CAN-SPAM
- Commercial email must include a valid physical postal address (street address, registered PO box, or registered private mailbox). Penalty cited at up to $53,088 per email on the FTC page. Applies to all commercial email. https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business
- The 10 business day opt-out window was not confirmed from the snippets. Verify on that page.

### CCPA / CPRA applicability (brief)
- Secondary sources: a for-profit business doing business in California meeting any one of: gross annual revenue above $26.625 million (adjusted Jan 2025), buys/sells/shares personal information of 100,000+ California consumers or households, or earns 50%+ of revenue from selling or sharing personal information. https://www.truevault.com/learn/what-businesses-must-comply-with-ccpa and https://www.fisherphillips.com/en/news-insights/does-ccpa-apply-to-your-business.html
- Some sources say ad-tech "sharing" counts toward the 100,000 figure. A small site is probably under the thresholds today but it is a moving target if ad pixels are added. Official CPPA page not retrieved.
- GA4 consent: no primary source retrieved. Treat as "decide with counsel". Note CLAUDE.md rule 8 (no PII in analytics) already helps.

## 3. Affiliate program candidates

Read this first. The only figure confirmed from a program's own page in this session is YNAB. All others come from third-party directories whose numbers conflict. I list them as "not published / verify" and mention the network only where a source named it. Do not use any rate in code or copy (CLAUDE.md rule 6). No sign-ups were done.

"Recommend anyway?" is my editorial test for a Buffett/Munger style owner: would a value investor point a friend to this with no commission?

| Candidate | Program / network (public evidence) | Commission | Restrictions seen | Recommend anyway? | Honest weaknesses |
|---|---|---|---|---|---|
| Fidelity | Directory claims a lead-gen program with 30 day cookie. Own page not found. Network unverified. https://uppromote.com/affiliate-directory/fidelity/ | not published / verify | Directory says educational content expected (unverified) | Yes. Low cost, broad index funds | Dense interface, many upsell products, support quality varies |
| Schwab | Not searched. | not published / verify | unknown | Yes | Cash sweep drag historically, upsell of managed products |
| Vanguard | Not searched. Typically no public affiliate program (unverified). | not published / verify | unknown | Yes | Dated app, thinner features |
| M1 Finance | Blog claims program exists. https://www.creator-hero.com/fr/blog/m1-finance-affiliate-program-in-depth-review-pros-and-cons | not published / verify (blog figure conflicts, not used) | unknown | Maybe. Fine for set-and-forget | Trading windows, limited order control, tax-lot tools modest |
| Robinhood | Blog says Impact. https://www.creator-hero.com/de/blog/robinhood-affiliate-program-affiliate-program-in-depth-review-pros-and-cons | not published / verify | US-focused per blog | Cautious. Product is fine, incentives push trading | Gamification, past outages and settlement controversies |
| Public | Blog only. Network unverified | not published / verify | unknown | Maybe | Social features, payment for order flow history |
| Webull | Directory lists Impact. Unverified | not published / verify | unknown | Cautious | Trading-oriented, options-heavy marketing |
| SoFi Invest | No program details found | not published / verify | unknown | Maybe | Cross-sell pressure |
| Betterment | No terms found. https://uppromote.com/affiliate-directory/betterment/ | not published / verify | unknown | Maybe for hands-off users | Advisory fee on top of fund costs |
| Wealthfront | Directory says invite or network based. https://uppromote.com/affiliate-directory/wealthfront/ | not published / verify | unknown | Maybe | Same fee layering as above |
| Interactive Brokers | Not searched | not published / verify | unknown | Yes for advanced users | Complex platform |
| TurboTax | Directory says CJ. https://uppromote.com/affiliate-programs/turbotax/ | not published / verify (directories conflict) | unknown | Conditional. Good for complex returns | Price creep, upsell flow, Free File history. Weak recommend for simple returns |
| H&R Block | Directory says Impact or CJ. https://uppromote.com/blog/tax-preparation-affiliate-programs | not published / verify | unknown | Maybe | Add-on fees |
| TaxAct | Directory says CJ or ShareASale | not published / verify | unknown | Maybe | Less polished |
| FreeTaxUSA | Reportedly Impact, needs finance or tax site, manual approval (secondary) | not published / verify (sources conflict) | Content site required (secondary) | Yes. Low price | Basic support, fewer guided features |
| TaxSlayer | Not searched | not published / verify | unknown | Maybe | Not searched |
| Ally | Directory: cost-per-action, US only. https://uppromote.com/affiliate-directory/ally/ | not published / verify | Directory says explicit content barred | Yes for savings | Rates change, no branches |
| Marcus | Nothing found | not published / verify | unknown | Yes for savings | Rate chasing, limited product set |
| SoFi cash, Wealthfront Cash, Raisin, CIT | Not searched or nothing found | not published / verify | unknown | Case by case | Promo APR teasers must never be quoted |
| YNAB | Own page: Impact, flat payout per free trial signup, higher at volume. Page text via search: $6 per trial, $8 after 100, $10 beyond 200, monthly reset. Retrieved 2026-10-25. https://www.ynab.com/partners/affiliate-program | Published (see left). Quote with URL and date only | Applicants contacted only if accepted | Yes. Method is sound | Paid subscription, steep learning curve, manual entry style |
| Monarch Money | No public page. Job post implies negotiated terms. https://www.workingnomads.com/jobs/affiliate-partner-manager-monarch-money | not published / verify | unknown | Yes | Subscription cost, account link reliability |
| Copilot Money | Nothing found | not published / verify | unknown | Maybe | Apple-only focus (verify) |
| Empower Personal Dashboard | Not searched. Note Empower sells advisory services via the free tool | not published / verify | unknown | Dashboard yes, advisor upsell no | Sales calls follow signup |
| Tiller, Rocket Money | Not searched | not published / verify | unknown | Tiller yes. Rocket Money cautious | Rocket Money bill-negotiation fee and upsells |
| Amazon Associates | Program exists. Operating Agreement requires a statement that you earn from qualifying purchases, shown clearly and conspicuously. Secondary sources give "As an Amazon Associate I earn from qualifying purchases". Read the live agreement for exact text. https://amalinkspro.com/?p=42364 and https://usercentrics.com/us/guides/terms-of-service/amazon-affiliate-disclosure/ | Category rates not retrieved. Verify in Associates Central | Amazon wording does not replace FTC link-level disclosure (secondary) | Yes for books | Fine print on links in email and offline use |
| Bookshop.org | Program exists. Secondary sources report 10 percent to affiliates, with 10 percent to indie stores. Cookie length conflicts (48 hours vs 30 days). https://uk.bookshop.org/info/embed/about-us and https://uppromote.com/affiliate-directory/bookshop/ | Reported 10 percent, secondary, verify | unknown | Yes | Smaller catalog, slower shipping |
| Collective | Nothing found | not published / verify | unknown | Maybe for S-corp owners | Monthly fee, scope limited |
| Gusto | Accountant partner program exists with tiers and rev share. Terms dated, tier names conflict. https://support.gusto.com/article/178283329081125/gusto-partner-program | not published / verify | Program aimed at accountants | Yes for payroll | Price rises, not needed for solo S-corp at tiny scale |
| QuickBooks, Bench alternatives | Not found in this search | not published / verify | unknown | QuickBooks maybe | Subscription creep |
| SmartAsset / SmartAdvisor | Pays by lead, share of advisor fees, or subscription. Referral fees are paid by advisors. https://smartasset.com/important-disclosures | Not published | Regulated referral posture, disclosed | Not recommended. Pay-to-play matching conflicts with a value-investor voice | Incentive is lead volume, not fit |
| Zoe Financial | Advisors pay: flat annual fee for five years or a slice of AUM revenue. Amounts not disclosed. Selective, fee-only, CFP or CFA required (secondary). https://www.moneycrashers.com/zoe-financial-review/ | Publisher pay not found | Client minimums reported, figures conflict | Maybe, best of the matching group | Not a fiduciary comparison tool, minimums |
| Wealthramp, NAPFA, XY Planning Network, Harness | Nothing retrieved on publisher payment | not published / verify | unknown | NAPFA and XYPN directories are non-pay listings: link without commission if allowed | Directory is not vetting of fit |
| Facet | Flat fee planning ($1,800 to $6,000 per year per one secondary source) | Publisher pay not found | unknown | Maybe | Single secondary source, may be dated |

Notes:
- Any RIA referral for pay triggers the Rule 206(4)-1 promoter disclosures above. Treat it as the last monetization step, not the first.
- None of these should be named in code until Drew supplies approved values. This table is a research map, not an offer list.

## 4. Brand names for tax tools

None of these domains were verified. RDAP and WHOIS are blocked here, and search returned no registration records. All ".com available?" cells are "unverified". Collision checks were two broad searches only. Run USPTO and registrar checks before use.

| Name | Idea | .com | Collision notes |
|---|---|---|---|
| Basis | Cost basis, the core concept | unverified, very likely taken | Many companies use Basis. Do not use alone |
| Stillbasis | Calm, basis | unverified | No hits in my search |
| Plainbasis | Plain language | unverified | No hits in my search |
| Longbasis | Long-term holding | unverified | No hits in my search |
| Taxmargin | Margin of safety, tax | unverified | No hits in my search |
| Quiet Ledger | Calm record keeping | unverified | No company found in one search. Ledger-named crypto tax firms exist (CoinLedger, ZenLedger), which crowds the space |
| Ledgerline | Clean line items | unverified | Not found in one search. Ledger crowding applies |
| Steadfast Basis | Value-investor temperament | unverified | No hit. Long to type |
| Cost Basis Co | Descriptive | unverified | Descriptive names are weak marks. Netbasis and BESTBASIS exist: https://trademarks.justia.com/owners/advantyx-software-llc-972029 |
| Harvestline | Gain harvesting | unverified | Not searched |

Recommendation: prefer a sub-brand under the site (for example "Tax Desk") to avoid trademark clearance cost until the tools earn traffic. Standalone names need a full clearance search.

## 5. Newsletter benchmarks

- Open rates are inflated by Apple Mail Privacy Protection. Prefer click rate.
- Mailchimp via ClickMinded: business and finance average 31.35 percent opens vs 35.63 percent all industries. https://www.clickminded.com/newsletter-open-rate/
- MailerLite 2025, via a beehiiv post: finance and business 43.26 percent opens. https://inboxempire.beehiiv.com/p/newsletter-benchmarks
- GlueLetter Q1 2025, nearly 500 newsletters: median 49.3 percent open, 7.65 percent click. News-heavy sample. https://glueletter.com/?p=787
- Beehiiv platform averages (38.69 or 41.24 percent) come from roundups. Check beehiiv's own report before citing.
- Sponsor CPM: beehiiv says typical newsletter CPMs run $10 to $75, B2B niches often $50 to $100+, consumer $15 to $35. https://www.beehiiv.com/blog/newsletter-sponsorship-cost . Dupple (secondary) lists finance direct at $80 to $180 and programmatic at $30 to $65: https://dupple.com/blog/advertising-in-newsletters . A Paved-attributed median of $32 and B2B/finance $85 to $115 appears in a secondary article, not Paved: https://voxbooster.com/blog/newsletter-sponsorship-statistics-2026/ . Paved and Swapstack own pages: not retrieved, so "not published / verify".
- Clean disclosure examples: Motley Fool disclosure policy (ads and sponsored content mean the company paid) https://www.fool.com/legal/fool-disclosure-policy/ ; BetterInvesting Sponsorship and Advertising Policy (Sept 2023). No Buffett/Munger-style newsletter example confirmed. Not found for Of Dollars And Data, Humble Dollar or Collab Fund.
- At a small list size, CPM math gives very small dollars. Sponsor rate is not a plan.

## 6. SEO context

- Google "How to move a site": ranking fluctuations are expected while Google recrawls and reindexes. A medium-sized site can take a few weeks for most pages to move, larger sites longer. https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes (snippet via search)
- Practitioner coverage says full processing can take months, and Google has advised keeping 301 redirects at least a year (secondary): https://searchengineland.com/url-changes-is-not-so-simple-for-google-search-378648 and https://www.searchenginejournal.com/google-crawling-indexing-recovery-timing-ranges/. Treat as unverified against Google primary text.
- FAQ rich results: Aug 8, 2023 Google limited them to well-known, authoritative government and health sites. Markup need not be removed. https://developers.google.com/search/blog/2023/08/howto-faq-changes . Secondary reports say FAQ rich results stopped appearing May 7, 2026, with Search Console reporting dropped after: https://www.techwyse.com/news/ai-search/google-faq-rich-results-deprecated-2026 and https://www.searchenginejournal.com/google-drops-faq-rich-results/574429/ . Verify against Google docs. FAQPage remains valid schema.org vocabulary, but do not expect a visual result.
- SoftwareApplication: Google page https://developers.google.com/search/docs/appearance/structured-data/software-app . Its example uses name, operatingSystem, applicationCategory, aggregateRating and offers. Property table not read. Google rich results for this type are built around apps with ratings or reviews. Do not fabricate ratings (see FTC rule).
- Article: Google page https://developers.google.com/search/docs/appearance/structured-data/article says no required properties, recommends headline, image, datePublished, dateModified, author.
- WebApplication is a schema.org subtype of SoftwareApplication. I did not retrieve Google guidance specific to it.

## What this means for the report
1. The podcast name THE MONEY GUY SHOW appears as an application owned by 88xOver, LLC (serial 90145137). Status and class are unverified. Have counsel pull the live USPTO record.
2. No filing found for "Financial Mutant(s)" or "Money Guy Mutants", but absence in search is not clearance. Common-law rights are possible. The brand name "Money Guy Mutants" is the single biggest legal risk in this report.
3. Public precedent (Bogleheads domain arbitration, Goldman disclaimer case) suggests brand-in-domain plus selling advice draws action, and a clear no-affiliation line lowers friction. Consider a rename to a neutral name before any monetization.
4. Use the name of the podcast only to refer to it, no logos, no implied endorsement. This is the nominative-use pattern, not a legal conclusion.
5. Affiliate disclosure: place "paid link" style wording right next to each link, not in a footer or behind a link. Skip the bare words "affiliate link". Source: FTC FAQ.
6. Never publish invented testimonials or ratings. The 2024 FTC rule carries civil penalties (cited up to $53,088 per violation).
7. RIA referral for pay is the high-regulatory-risk item (SEC Rule 206(4)-1 promoter disclosures, written agreements, SEC exam focus on disclosure placement). Defer it, and get counsel first.
8. The affiliate table has almost no confirmed figures. Only YNAB's public page was seen stating rates. Drew must read each program's terms himself. Keep placeholders in code.
9. Email: a physical postal address is required in every commercial email. Pick a registered mailbox before the first send.
10. Domain move and SEO: plan for weeks of rank fluctuation, possibly months, keep 301s for at least a year. FAQ schema will not give a visual result. Article and SoftwareApplication markup are optional, and never fake ratings.
