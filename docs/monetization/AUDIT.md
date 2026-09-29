# Phase 0 audit — what the code and data actually do today

**Written:** Sep 29, 2026 · **Scope:** handoff task 0.1 (read-only audit) · **Sources:** this repo at commit `1990226` plus read-only queries against the Money Guy Mutants Supabase project (`pehteunyustvnxmxjcfk`).

Where the repo and `HANDOFF.md` disagree, the repo wins (standing rule 13). Every disagreement is listed in [§12 Discrepancies](#12-discrepancies-with-handoffmd).

---

## 0. The short version (plain English)

1. **No tool makes anyone log in before they see an answer.** Every calculator works for anonymous visitors, and the numbers update live as you type. There is no "Calculate" button. So the offer, report and unlock moments the plan depends on can already be reached. Two tools are fully locked for free users (S-Corp Investment Optimizer and What's Your Why). The rest show a free result plus a blurred "Pro" section.
2. **Traffic collapsed in August.** Page views ran 1,000–2,300 a month from April to July. They fell to 167 in August and 273 in September. The drop starts a few weeks after the switch from `cortex.vip` to `moneyguymutants.com` (early July). That timing matches search rankings not carrying over, though it could also be a launch spike wearing off. Checking this in Google Search Console is the first Phase 5 lead.
3. **Banner ads are live in production today.** They show to every visitor who isn't Pro, above the calculator, before any result. They link to what look like **personal refer-a-friend links** (Rakuten, Chase, Capital One, Discover, SoFi, Cash App and others). This already conflicts with the D1 default ("monetization OFF in production") and with standing rule 9. **Pausing the campaigns in the admin does not stop them.** When the database has no active campaign, the code falls back to a hard-coded copy of the same links. Only a code change can turn them off. **This is Drew's call; Phase 0 does not change it.**
4. **Nothing records a finished calculation today.** A `calculation_completed` event name exists but nothing fires it: there are 0 rows. Phase 0 adds `tool_calculation_completed`.
5. **The donation popup is gone.** Its last event was Jan 20, 2026, and no code fires it now. It can't compete with the result page.
6. **There is no cookie/consent banner**, while Google Analytics 4 (`G-0PQ1RZVNTS`) loads on every page. This is worth a decision before affiliate tracking goes live.
7. **Paid users can't upgrade themselves by accident or on purpose.** Column-level grants stop users from writing their own `tier`. The only Stripe-driven downgrade path is `reconcileUserSubscription` in `lib/stripe/reconcile.ts:108`, which Phase 2 must teach about lifetime buyers.

---

## 1. Tool registry

Several overlapping lists exist, and none of them is the single source of truth:

| List | File | Count | Used for |
|---|---|---|---|
| `TOOL_IDS` | `lib/ads/types.ts:41` | 16 | Ad targeting and validation. **Used as the Phase 0 tool list.** |
| `TOOL_COMPONENTS` | `components/app/ToolIsland.tsx:35` | 13 | Calculators rendered through `<ToolIsland>` (tool pages + `/calculators/*` landing pages) |
| `DEFAULT_TOOLS` | `lib/tools-registry.ts:18` | 16 | Homepage grid and `/apps` hub (FREE/PRO badges) |
| `APPS` | `components/dashboard/AppLibrary.tsx:40` | 16 | Dashboard library (`tier: 'free' \| 'pro'`) |
| `CALCULATOR_CONTENT` | `lib/calculator-content.ts:30` | 14 | SEO explainer, FAQ, JSON-LD, sitemap |

**All 16 tools** and how each one renders:

| Tool id | Page | Renders through | Result shape | Free-user gating |
|---|---|---|---|---|
| `index-fund-visualizer` | `app/apps/index-fund-visualizer/page.tsx` | `ToolIsland` | live (`useMemo`) | "Fund Comparison Analysis" blurred (`ProGatedPreview`) |
| `coast-fire` | `app/apps/coast-fire/page.tsx` | `ToolIsland` | live | "Advanced Analytics" blurred |
| `budget` | `app/apps/budget/page.tsx` (whole page is `'use client'`) | its own page | live | Auto-Optimize behind upgrade modal |
| `compound-interest` | … | `ToolIsland` | live | "Life Impact Analysis" blurred |
| `rent-vs-buy` | … | `ToolIsland` | live | "Lifecycle Housing Strategy" blurred |
| `car-affordability` | … | `ToolIsland` | live | none (upsell card only) |
| `retirement-strategy` | … | `ToolIsland` | live | Auto-Optimize checkbox disabled |
| `net-worth` | … | `ToolIsland` | live | "Momentum Intelligence" blurred |
| `s-corp-investment` | … | `ToolIsland` | — | **Entire tool replaced by a lock screen** (`SCorpInvestmentOptimizer.tsx:229`) |
| `debt-paydown` | … | `ToolIsland` | live | "Opportunity Cost Rebalancer" blurred |
| `geographic-arbitrage` | … | `ToolIsland` | live | "Multi-City" blurred |
| `s-corp-optimizer` | … | `ToolIsland` | live | none (upsell card only) |
| `gambling-redirect` | … | `ToolIsland` | live | "Advanced Analysis" blurred |
| `capital-gains-tax` | … | `ToolIsland` | live | NIIT/QBI/ACA/IRMAA toggles locked |
| `personality-quiz` | `app/apps/personality-quiz/page.tsx` | its own page | quiz → result screen | none |
| `whats-your-why` | `app/apps/whats-your-why/page.tsx` | its own page | 8 questions → AI reflection (`/api/why`, Pro only) | **Entire tool locked** (`WhatsYourWhy.tsx:103`) |

- **No tool requires login to see a result.** `useToolPageData` (`lib/useToolPageData.ts`) only reads the session to set `isPro`. The proxy protects only `/dashboard`, `/account`, `/onboarding` and `/admin` (`proxy.ts`).
- **"Live" means results are already on screen at page load, using default inputs.** So "a result is displayed" can't mean "the page loaded". Phase 0 defines a completion as **the visitor changed an input, and the recomputed result stayed on screen for 1.5 seconds**. Details are in `lib/tool-funnel.ts`.
- `components/apps/RothOptimizer.tsx` exists but **is not mounted on any page**.
- Eight search landing pages under `/calculators/<slug>` (`lib/landing-pages.ts`) embed the same calculators through `ToolIsland`.

## 2. Pricing and paywall — what `finance_pro` unlocks

- There are two tiers: `free` and `finance_pro` (`lib/access-control.ts:8`). Every gate reduces to `tier === 'finance_pro'`.
- **Pro unlocks:**
  - the blurred "advanced" panels listed in §1
  - the two fully locked tools
  - Budget Auto-Optimize and Retirement Auto-Optimize
  - the Capital Gains toggles
  - unlimited saved scenarios. Free users get **1 per tool**, enforced server-side in `app/api/scenarios/route.ts:89-107`.
  - the AI reflection (`app/api/why/route.ts:54`)
  - **no ads**. `shouldShowAds` is in `lib/access-control.ts:123` and is applied in `AdProvider`/`AdSlot`.
- **Prices are hard-coded strings:**
  - `app/pricing/page.tsx:52-55` has $9/mo and $90/yr.
  - The same figures are repeated in the dashboard, the account page, `PricingPreview`, the pricing OG image, the budget page and six "Upgrade to Pro — $9/month" buttons.
  - The price helpers in `lib/access-control.ts` are never imported.
- Badges are inconsistent across the lists. `DEFAULT_TOOLS` tags car-affordability, rent-vs-buy, debt-paydown and others as `PRO`. `AppLibrary` marks every tool except `whats-your-why` as `free`. The pricing page lists Car Affordability as a free feature.
- **Users cannot write their own `tier`.** Production column grants give `authenticated` UPDATE only on `birth_date, first_name, gender, has_completed_onboarding, last_name, onboarding_answers, updated_at` (verified in `information_schema.column_privileges`).

## 3. Stripe checkout and webhook

**Checkout (`app/api/create-checkout-session/route.ts`, `lib/stripe/server.ts`)**
- The session is created in `mode: 'subscription'`. There is no trial, no Stripe Tax and promo codes are allowed.
- `success_url` is `/dashboard?success=true&session_id=…`. `cancel_url` is `/pricing?canceled=true`, and nothing reads the `canceled` parameter.
- **Login is required.** The route authenticates with a Bearer token. A guest who picks Pro goes to `/signup?plan=finance_pro&billing=monthly`. That leads to email verification, then `/dashboard`, where a "Continue to checkout" card has to be clicked (`app/dashboard/page.tsx:132-176`). That is four steps between intent and payment.
- The client picks the price. Every allowed price maps to `finance_pro` (`lib/stripe/tier.ts:20-29`). Price env var names:
  - `NEXT_PUBLIC_STRIPE_FINANCE_PRO_MONTHLY_PRICE_ID`
  - `NEXT_PUBLIC_STRIPE_FINANCE_PRO_ANNUAL_PRICE_ID`
  - legacy: `NEXT_PUBLIC_STRIPE_ELITE_MONTHLY_PRICE_ID`, `NEXT_PUBLIC_STRIPE_ELITE_ANNUAL_PRICE_ID`, `NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID`
- The customer is linked by `client_reference_id`, `metadata.userId` and `subscription_data.metadata.userId`. The customer ID is saved before payment.
- Other routes:
  - `verify-checkout` re-syncs after the redirect.
  - `create-portal-session` opens the Stripe billing portal.
  - `cancel-subscription` sets `cancel_at_period_end`.
  - `GET /api/subscription` re-syncs on every account-page load.

**Webhook (`app/api/webhooks/route.ts`)**
- Handles `checkout.session.completed`, `customer.subscription.{created,updated,deleted,paused,resumed}`, `invoice.paid` and `invoice.payment_failed`. Every one of them triggers the **same full re-sync** (`reconcileUserSubscription`).
- **Idempotency is insert-first into `webhook_events`:** a duplicate key returns 200, and a processing error deletes the claim so Stripe retries. `processed_at` is never written; the row's existence is the only marker.
- **The only Stripe-driven downgrade** is `lib/stripe/reconcile.ts:108`. It sets `tier = 'free'` unless the best subscription is `active`, `trialing` or `past_due` with a known price.
  - It runs on every billing webhook, on `verify-checkout`, `cancel-subscription`, `GET /api/subscription`, and on `create-checkout-session` for users who already have Stripe IDs.
  - **Phase 2 trap:** a lifetime buyer with no subscription would be downgraded the next time any of these runs, not only on `customer.subscription.deleted`. The fix belongs inside `reconcileUserSubscription`.
- An admin can also set `tier` directly: `app/api/admin/users/[id]/route.ts:66-89`.
- The `subscriptions`, `subscription_items`, `payments` and `invoices` tables are **never used by code**. All billing state lives in `users.stripe_customer_id`, `stripe_subscription_id` and `subscription_status`, and live reads from Stripe.

**Analytics side-effect to know about:** the client-side `subscription_upgrade` event fires when the checkout session is **created**, before payment (`app/pricing/page.tsx:132`, `app/dashboard/page.tsx:151`). The webhook fires the real one server-side, with a `server-…` session id. The single `subscription_upgrade` row in production is a client-side (checkout-started) event. **No server-confirmed upgrade has ever been recorded.**

## 4. Ad system

**Tables** (`supabase/migrations/20260920120000_create_ads_tables.sql`):
- `ad_advertisers`, `ad_placements`, `ad_campaigns`, `ad_creatives`, `ad_events`, plus the view `ad_stats_daily`.
- RLS is on with **no policies** (service role only). The advisor reports this as INFO, and it is intentional.

**Serving:**
- `<InlineAd context={toolId}>` (in `ToolIsland` and the budget page) → `<AdSlot placement="tool-inline-top">`.
- `AdSlot` calls `GET /api/ads?placement&tool` (`app/api/ads/route.ts`). That is public and CDN-cached for 5 minutes, served from `lib/ads/public.ts`, filtered by `lib/ads/select.ts` (status `active`, date window, `tool_ids` / `exclude_tool_ids`). Tier filtering (`hide_for_tiers`) happens in the browser.
- The slot picks a weighted random campaign and rotates every `rotation_interval_ms`.

**Fallback:**
- If the DB returns nothing or the request fails, `lib/ads/fallback.ts` builds ads from the hard-coded `components/monetization/affiliates.ts` and `ad-copy.ts`. These carry the same 11 referral URLs.
- **So there is no way to switch ads off from the admin.** There is also no env kill switch.

**Tracking:**
- Impressions fire when the ad is at least 50% visible for 1 second. Clicks fire `onClick`, sent via `sendBeacon` to `POST /api/ads/events`, which is rate-limited in memory.
- The schema **already allows `click`** (`check (event_type in ('impression','click'))`), and the route accepts it. The 0 clicks in production means nobody clicked 53 impressions; click tracking itself exists.
- Fallback ads (no campaign id) are acknowledged but not stored.
- `AdSlot` also sends a GA4 `affiliate_click` event.

**Rendering:**
- `IABAd` renders `<a target="_blank" rel="noopener noreferrer sponsored">`, labelled "Sponsored"/"Ad".
- There is no affiliate disclosure sentence and no `/disclosure` page.
- The slot sits **above** the calculator, so it shows before any result.

**Placements and inventory in production:**
- `tool-inline-top`, `tool-below-results`, `tool-sidebar`. Only `tool-inline-top` is used in code.
- 11 advertisers and 11 `active` campaigns, all on `tool-inline-top`, with 132 creatives.
- Advertiser URLs are refer-a-friend or personal links, not affiliate-network tracking links: `rakuten.com/r/<code>`, `referyourchasecard.com/…`, `refer.discover.com/…`, `i.capitalone.com/…`, `cash.app/app/…`, `sofi.com/invite/…`, `refer-nordvpn.com/…`, WeWard, Ibotta and an Amazon product link.
- Card-issuer and app referral programs often restrict public or commercial posting. **Drew should check each program's current terms** before relying on them (not verified here — standing rule 6).
- Admin UI: `/admin/ads`, advertiser and campaign editors (`components/admin/*Editor.tsx`), API under `app/api/admin/ads/*`.

## 5. Email / Resend

**Senders:**
- `lib/email.ts` sends new-signup and enterprise-lead notifications to the owner.
- `lib/outlook/email.ts` sends the newsletter confirmation and the daily/weekly digest.
- `lib/outlook/runDigest.ts` sends sequentially and is triggered by Vercel cron (`vercel.json`), authorized with `CRON_SECRET`.
- Supabase auth emails use the templates in `emails/*.html`.

**Env var names:** `RESEND_API_KEY`, `ENTERPRISE_FROM_EMAIL`, `SALES_NOTIFICATION_EMAIL`, `OUTLOOK_FROM_EMAIL`, `OUTLOOK_REPLY_TO`, `OUTLOOK_UNSUBSCRIBE_EMAIL`, `NEXT_PUBLIC_APP_URL`.

**Newsletter double opt-in:**
- Subscribe: `app/api/outlook/subscribe/route.ts`. It has an in-memory IP rate limit (5 per 5 minutes) and a honeypot, and does not reveal whether an address is on the list.
- Confirm: `GET /api/outlook/confirm?token=`. It changes state on GET, and the token never expires.
- The digest goes only to confirmed, not-unsubscribed rows.
- Unsubscribe: GET shows a confirm page; POST unsubscribes (RFC 8058 one-click).
- The digest carries `List-Unsubscribe` and `List-Unsubscribe-Post` headers and a visible unsubscribe link.

**Gaps for Phase 3:**
- **No physical mailing address in any footer** (CAN-SPAM).
- The confirmation email has no unsubscribe link.
- The rate limiter is per serverless instance, in memory (`lib/rate-limit.ts`).
- `sendEnterpriseLeadNotification` puts form fields into HTML without escaping (`lib/email.ts:52-83`).

## 6. Cookie/consent banner

**None exists.**
- Google Analytics 4 (`G-0PQ1RZVNTS`) loads unconditionally in `app/layout.tsx:186-197`, alongside the first-party `<Analytics />` and `<WebVitals />`.
- The Terms page mentions cookies (`app/terms/page.tsx:143,162`).
- The first-party `events` pipeline uses `sessionStorage` only, with no cookies.
- Worth a decision before affiliate networks add their own tracking.

## 7. Donation popup

**Removed.**
- The three `donation_popup_*` event names survive only in the `EventType` union (`lib/analytics.ts`).
- No component or call fires them.
- Production has 53 rows (32 shown, 3 clicked, 18 dismissed), and the last is from **Jan 20, 2026**.

## 8. Admin area and gating

- `/admin/*`:
  - The proxy (`proxy.ts`, `lib/supabase/middleware.ts`) redirects signed-out visitors to `/login`.
  - `app/admin/layout.tsx` then checks `isAdmin(email)` in the browser against `NEXT_PUBLIC_ADMIN_EMAILS` and redirects non-admins to `/dashboard`.
- Every `/api/admin/*` route re-checks server-side: `authenticateRequest` (Bearer token) followed by `isAdmin`, else **403**.
- Existing sections: Overview, Content, Ads, Users, Analytics, Subscriptions. Phase 0 adds **Monetization**, reusing both layers.

## 9. Analytics pipeline (what Phase 0 builds on)

**How events are stored:**
- `lib/analytics.ts` queues events in the browser and sends them as **one PostgREST insert straight to `public.events`**, on page hide or when the batch fills.
- No Vercel server hop, so no IP address is ever seen. Bot and owner filtering therefore has to use the user agent, the user id, a per-browser flag and the host.
- Columns: `user_id`, `session_id` (sessionStorage), `event_type`, `event_data` jsonb, `page_url` (full URL including query string), `user_agent`.
- RLS: anyone can insert rows with `user_id` = self or NULL; users read their own; the service role reads all.
- `page_view` fires on every route change (`components/Analytics.tsx`). Web Vitals are recorded too.
- Retention: a daily cron deletes events older than 365 days (`20260925120000_events_retention.sql`).

**Production facts (Sep 29, 2026):**
- 24,958 events; 3,165 sessions; 9 distinct signed-in users ever emitted events.
- 1,385 events (402 sessions) have bot-like user agents.
- 195 page views came from `localhost` or `*.vercel.app` (dev and preview).
- 47 page views carried UTM parameters.
- **No referrer is stored anywhere**, so acquisition source is unknown today.
- No `page_url` contains an `@`.

**PII check of existing payloads:**
- `user_signup` sends `{plan, source}`. `enterprise_form_submitted` sends `{company_size}`. `error_occurred` sends error text.
- No existing `trackEvent` call sends email, birth date or dollar inputs. `tests/event-payload-pii.test.mjs` now enforces this.

## 10. Security advisor baseline (production, before Phase 0)

- **INFO** — RLS enabled with no policies on 7 tables: the `ad_*` tables and `outlook_*`. Intentional, service role only.
- **WARN** — 15 functions with a mutable `search_path`.
- **WARN** — `citext` extension installed in `public`.
- **WARN** — 11 `SECURITY DEFINER` functions executable by `anon`/`authenticated`. Several are leftovers from another app's template: `accept_client_invite`, `find_pending_invite`, `notify_on_ticket_reply`, `get_user_outstanding_balance`, and `is_admin()`, which reads a `profiles` table.
  - `get_user_event_summary(target_user_id)` returns any user's event counts to anyone who knows that user's id.
  - `find_pending_invite(lookup_email)` returns names and a Stripe customer id for a pending invite matching any email.
  - These are pre-existing and out of Phase 0 scope. They're queued as a separate cleanup task.

Phase 0 adds one table and two views. Advisors were re-run after the migration — see the PR.

## 11. SEO facts relevant to Phase 5

- **`/calculators/*` landing pages are left out of the sitemap.** `landingEntries` is built at `app/sitemap.ts:42` but never returned at `:187`. Production shows **0** page views on `/calculators/*` ever.
- 14 tools have explainer, FAQ and JSON-LD (`lib/calculator-content.ts`). `personality-quiz` and `whats-your-why` have none.
- The budget page is a whole-page client component. Its SEO block is still rendered as HTML, but the page is heavier than the others.
- Canonicals are hard-coded to `https://moneyguymutants.com/...`. `www` and `cortex.vip` redirects are configured in Vercel, not in code (`DOMAIN_MIGRATION.md`).
- `lib/seo-metadata.ts` is dead code (never imported) and still says "Cortex Technologies".
- Traffic timeline (page views, bots and non-prod hosts removed): Apr 1,041 · May 1,780 · Jun 1,950 · Jul 2,316 · **Aug 167 · Sep 273**.
  - Weekly: the week of Jul 6 had 1,256 views, all on the new domain. It decayed to about 60/week by Jul 27.
  - `cortex.vip` page views stop after the week of Jun 29.

## 12. Discrepancies with HANDOFF.md

| # | Handoff says | Repo / production says | What Phase 0 did |
|---|---|---|---|
| 1 | Branch `monetization/phase-0-measure` | This session is required to use `claude/money-guy-monetization-npoo9b` | Used the required branch |
| 2 | "Apply migrations to a Supabase branch" | Supabase branching is billed per hour, and rule 5 says no spend. No branch exists. | Migration is committed to the repo but **not applied anywhere**. Its SELECT bodies were checked read-only against production. Applying it is Drew's step (see the PR checklist). |
| 3 | `ad_events`: "only `impression` exists today; add `click`" | `click` is already allowed by the CHECK constraint and accepted by `/api/ads/events` | Nothing to add for `click`; Phase 1 only needs `outbound` |
| 4 | "Ad system exists but click tracking does not" | Click tracking exists; 0 clicks on 53 impressions | Noted |
| 5 | "A donation popup already exists" | Removed; no code fires it; last event Jan 20, 2026 | Nothing to reconcile with result screens |
| 6 | "No calculation completed event today" | A `calculation_completed` type and helper exist but are never called (0 rows) | Added the contract name `tool_calculation_completed`; left the old name alone |
| 7 | Tools include "Roth" | `RothOptimizer.tsx` is not mounted anywhere; Roth logic lives in `retirement-strategy` | Retirement pilot = `retirement-strategy` |
| 8 | Advertisers are "placeholder advertisers" | Real personal refer-a-friend links, **live in production** on every free/guest tool view | Flagged for D1; **not changed** in Phase 0 |
| 9 | `ad_advertisers` examples include "Rocket Money, SoFi" | Confirmed; the full list is in §4 | — |
| 10 | "596 `/login` and 366 `/signup` views" | 832 `/login` and 581 `/signup` page views all-time (19 `/login` in the last 30 days) | Numbers refreshed in the baseline |
| 11 | Tool demand (all-time) `index-fund-visualizer` 347 | 390 views / 358 sessions (bots included, as the handoff counted) | Baseline doc uses fresh numbers |
| 12 | Gate B: "index-fund, coast-fire, budget dominate" | Over the **last 30 days** `coast-fire` alone had 73 of 136 tool page views (54%); index-fund 7, budget 3 | Pilot proposal updated (see `PILOT-TOOLS.md`) |
| 13 | `webhook_events` for idempotency | Correct, but `processed_at` is never written | Noted for Phase 2 |
| 14 | "Admin gate?" | Two layers: browser layout check plus server 403 on every admin API | Reused for `/admin/monetization` |
| 15 | Owner exclusion via "IP hashes" | Events go browser → Supabase directly; no server ever sees the IP | Exclusion uses admin user ids (env), a per-browser "internal" flag, bot user agents and non-production hosts |
| 16 | Lint must be green | `npm run lint` already reports 186 errors / 78 warnings on `main` | New and changed files lint clean; pre-existing errors untouched |
