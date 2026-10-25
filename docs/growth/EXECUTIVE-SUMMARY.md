# Executive summary: Money Guy Mutants growth and monetization

October 25, 2026. Proposal only. Nothing was changed, committed or purchased. Full report: `GROWTH-AUDIT-2026-10-25.md`.

## The situation in four lines

- The tools are good. The tax engine is current for 2026 and tested. Coast FIRE shows every assumption. The offers engine already enforces every standing rule.
- The wrapper leaks trust. False Pro promises, "guaranteed return" copy, a ghost "$29 Elite" plan in public metadata, "Cortex Technologies" in the footer, and a daily email that names stock tickers.
- Traffic is near zero (273 clean page views in September, down from 2,316 in July) and nobody can see why, because Search Console is not verified.
- The name references a filed trademark (THE MONEY GUY SHOW, serial 90145137). Monetizing under it raises the stakes. Traffic is at its lowest point, so a rename has never been cheaper.

## What to do, in order

1. **This week, fix the five trust leaks** (about a day of work): remove Elite $29 everywhere, one legal name, delete "guaranteed" and the advice directives, make the Pro benefit lists true, pause the daily ticker email.
2. **This week, measure:** verify Search Console and Bing, enable Vercel Web Analytics, confirm the Stripe webhook works, add the missing `scenario_saved` and `newsletter_signup` events.
3. **Within 30 days, decide the name** with a trademark attorney. Meanwhile strip the host names and "financial order of operations" from the metadata and retitle the show page.
4. **Within 30 days, make every tool "result first":** one shared result card, assumptions drawer, disclaimer under the result, one next step at a time, one honest Pro card instead of seven blurred panels. Nav to four items.
5. **Within 60 days, light the three monetization lanes that fit:** honest Pro (saved scenarios, comparisons, Tax Desk depth), a weekly long-term-thinking email that replaces the daily outlook, and disclosed post-result offers on Coast FIRE, Rent vs Buy and Index Fund once Drew has approved programs and the name question is answered.
6. **Later, only with counsel:** advisor or CPA referrals, white-label, lifetime unlock after webhooks are proven. Never: display ads, forex, per-lead advisor networks.

## Numbers to watch

| KPI | Today | 90-day target (directional) |
|---|---|---|
| Clean page views per month | 273 (Sep) | Back above 1,500 |
| Tool completion rate | Recording since Sep 29, not yet summarized | Baseline, then +20% on the three pilot tools |
| Confirmed email subscribers | 1 | 300 |
| Results emailed per 100 completions | n/a | 10 |
| Paying subscribers (webhook-confirmed) | 0 confirmed | 10 |
| Offer click-through (pilot tools) | Off | Baseline only |

## Decisions needed from Drew

Name (keep, fortify, or rename), legal entity on the site, the daily outlook's future, what stays free forever, which affiliates pass the friend test, the tax tool brand, and whether this report may be committed to the repo. The full list with defaults is section 8 of the report.

## What could not be verified from here

The sandbox blocks moneyguymutants.com, so screenshots come from a local build of the same commit (database-backed lists look empty). Lighthouse could not run. Production database numbers are from the Sep 29 baseline. External facts come from search snippets and are cited as verified or unverified.
