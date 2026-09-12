# Payment & signup flow audit — September 2026

This is the record of a top-to-bottom audit of account creation, login,
checkout, webhooks, cancellation and account deletion. It covers what was
found (in code **and** in the live Supabase / Vercel state), what was changed,
and — most importantly — the handful of things that can only be fixed in a
dashboard and therefore still need doing.

If you read only one section, read **"Do these now"**.

---

## Do these now (dashboard / config work the code can't do)

These were found by inspecting the live project, not just the repo. None of
them are fixed by merging this branch.

### 1. Stripe webhooks have never been processed

`public.webhook_events` — the table every successfully handled Stripe event is
written to — has **zero rows**. The only hits on `/api/webhooks` in the last
three days returned **400** (bad or missing signature). Either the webhook
endpoint isn't registered in Stripe, or `STRIPE_WEBHOOK_SECRET` on Vercel
doesn't match it.

The app survives this because `/api/verify-checkout` reconciles from Stripe
when someone returns from checkout, and (new in this branch) the account page
re-syncs on every visit. But **no webhook means no automatic downgrade** when
a card fails or a subscription ends — members keep Pro until they happen to
open `/account`.

Fix:
1. Stripe dashboard → Developers → Webhooks → add (or check) an endpoint for
   `https://<your-domain>/api/webhooks`.
2. Events to send: `checkout.session.completed`,
   `customer.subscription.created`, `customer.subscription.updated`,
   `customer.subscription.deleted`, `customer.subscription.paused`,
   `customer.subscription.resumed`, `invoice.paid`, `invoice.payment_failed`.
3. Copy the endpoint's **signing secret** (`whsec_…`) into Vercel as
   `STRIPE_WEBHOOK_SECRET` for Production, then redeploy.
4. Send a test event from the Stripe dashboard. Then confirm:
   `select * from webhook_events order by created_at desc limit 5;` shows it.

### 2. The signup-hardening migration was never applied

`SECURITY_SIGNUP_HARDENING.md` describes columns, triggers and views that
**do not exist** in production: no `users.email_normalized`, no
`users.email_verified_at`, no `normalize_email()` function, no
`on_auth_user_confirmed` trigger. The signup route copes (its alias lookup
fails, logs an error, and continues), so signups work — but:

- the "one account per inbox" check is silently dead,
- `signup_ip_hash` / `signup_flags` / `is_flagged` are never recorded,
- the admin "verified / unverified / flagged" counts can't work.

Right now **34 of 48** auth users have never confirmed their email.

Fix: run `supabase/migrations/harden_signup_abuse.sql` in the Supabase SQL
editor (it is idempotent). Then follow the cleanup runbook in
`SECURITY_SIGNUP_HARDENING.md` and, once alias clusters are empty, run
`enforce_email_normalized_unique.sql`.

### 3. Turn on CAPTCHA in Supabase

Still not enabled. Every server-side signup control in this repo is bypassable
by POSTing straight to the Supabase auth API with the public anon key. The
steps (Cloudflare Turnstile keys → env vars → Supabase Bot Protection) are in
`SECURITY_SIGNUP_HARDENING.md` under "Deploy steps". Do the env vars first, or
every auth call starts failing.

### 4. Configure the Stripe Customer Portal

The account page now has a **Manage billing & invoices** button. It opens
Stripe's hosted portal, which needs a one-time configuration: Stripe
dashboard → Settings → Billing → Customer portal → enable, allow "update
payment method", "cancel subscription" and "invoice history". Until that's
done the button returns an error from Stripe.

### 5. One inconsistent row

The single paying user in the database is stored as `tier = finance_pro`
with `subscription_status = canceled`. The old code could produce this; the
new reconciliation cannot. It self-corrects the next time that user opens
`/account`, or when any webhook for them arrives. If you want it fixed today,
open the Stripe dashboard, check whether that customer's subscription is
actually live, and either way the next `/api/subscription` call will write
whatever Stripe says.

---

## What was wrong in the code, and what changed

### Payments

| # | Problem | Impact | Fix |
|---|---|---|---|
| P1 | Webhook handlers applied the event payload directly. Stripe doesn't guarantee ordering or single delivery. | A stale `subscription.updated` for an old subscription could downgrade a member who had since re-subscribed. | Every billing event now triggers a full re-sync from Stripe (`lib/stripe/reconcile.ts`), which looks at *all* the customer's subscriptions and picks the best one. Order-independent and idempotent by construction. |
| P2 | Webhook idempotency was check-then-insert (not atomic). | Two concurrent deliveries could both run. | The event id is inserted *before* processing (atomic claim on the primary key); a failed handler releases the claim so Stripe's retry works. |
| P3 | Nothing stopped a user with a live subscription from starting another checkout. | Double-click, second tab, or a stale "free" tier in the DB (webhook not yet landed) → **two subscriptions, double billing**. | `/api/create-checkout-session` checks Stripe (not the cached tier) and returns 409 `already_subscribed`. |
| P4 | A new Stripe customer was created on every checkout attempt and only saved once the webhook arrived. | Abandon checkout three times → three Stripe customers for one person. | The customer id is persisted immediately after creation. A stored customer that was deleted in Stripe is detected and replaced. |
| P5 | `subscription.deleted` left the old `stripe_subscription_id` on the row. Cancel and delete-account then called Stripe on a *canceled* subscription. | **Anyone whose subscription had ended could not delete their account** (502) and got a 500 from "Cancel subscription". | Both routes now resolve the live subscription via Stripe; terminal subscriptions are skipped, not errored. |
| P6 | Replaying an old success URL (`/dashboard?success=true&session_id=…`, e.g. from a bookmark) reconciled from that *old* session's subscription. | Could downgrade a member with a newer active subscription. | `verify-checkout` now goes through the same full re-sync, so an old session can't override newer state. |
| P7 | Account deletion deleted the `users` row *before* the auth user. | A failure between the two left a working login with no profile. It also left the Stripe customer (email, card) behind. | Order flipped (auth first; `public.users` cascades). All non-terminal subscriptions on the customer are canceled and the Stripe customer is deleted best-effort. |
| P8 | `create-portal-session` had ad-hoc auth, no rate limit, no UI. | The only way to update a card or resume a cancellation was to email support. | Hardened, and wired to a **Manage billing & invoices** button on `/account`. |
| P9 | `verify-checkout` / `create-checkout-session` did a plain `UPDATE`/404 when the `users` row was missing. The signup trigger swallows errors by design, so a missing row is possible. | A paying user with no row got no tier. | Rows are upserted (`ensureUserRow`); reconciliation upserts too. |
| P10 | `NEXT_PUBLIC_APP_URL` used raw for Stripe redirect URLs. | An unset var produced `undefined/dashboard` and Stripe rejected the session. | Uses the shared `siteUrl()` helper with its production fallback. |
| P11 | Missing `STRIPE_WEBHOOK_SECRET` made `constructEvent` throw → 400. | Stripe treats 4xx as "don't retry"; a misconfiguration silently dropped events. | Returns 500 so Stripe retries and the failure shows in the Stripe dashboard. |
| P12 | Error responses echoed raw Stripe / internal messages to the browser. | Leaks internals. | Generic messages; details go to the server log. |

New endpoint: `GET /api/subscription` returns live billing state (status,
renewal / cancellation date, amount) and re-syncs the row as a side effect.
The account page uses it, so any drift between the DB and Stripe heals the
moment a member looks at their account.

### Signup / login

| # | Problem | Fix |
|---|---|---|
| S1 | Reset-password accepted **6-character** passwords while signup required 10 with a letter/number mix. | One shared policy (`lib/password-policy.ts`) used by the signup route, the signup form and the reset screen. |
| S2 | The form-timing anti-bot check was skipped entirely if the client simply omitted `formStartedAt`. | Missing/invalid timing now gets the same silent decoy response as a too-fast submit. |
| S3 | `Authorization` header parsing was `replace('Bearer ', '')` — case-sensitive and whitespace-fragile. | RFC 6750-style parsing (case-insensitive scheme, tolerant of spacing). |
| S4 | Unset legacy price-id env vars produced a literal `"undefined"` key in the price → tier map. | Skipped. |

Things checked and found **already solid** (no change): the server-side signup
chokepoint with honeypot / rate limits / Turnstile / email hygiene; the PKCE
`/auth/callback` exchange; open-redirect protection on `next` / `redirect`;
server-side route protection in middleware; the RLS fix that stops a signed-in
user from PATCHing their own `tier` (verified live: `authenticated` has no
UPDATE on `tier` or the Stripe columns); checkout ownership check on
`verify-checkout`; the `past_due` dunning grace.

---

## Verification

- `npm test` — 13 unit tests over the pure decision logic (subscription
  selection, tier mapping, password policy). Run with Node's built-in runner;
  no new dependencies.
- `npx tsc --noEmit` — clean.
- `npx eslint` on every changed file — clean (the repo has ~200 pre-existing
  lint errors elsewhere; none were added).

Not verified here: an end-to-end Stripe test-mode checkout. That needs the
webhook endpoint from step 1 above to exist first.

---

## Known limits that remain

- **Rate limiting is in-memory** per serverless instance. It raises the cost
  of abuse; it doesn't cap it. Turnstile (step 3) is the real control.
- **Reconciliation costs one Stripe `subscriptions.list` call** per webhook /
  account-page load. Trivial at current scale; if it ever matters, cache by
  customer id for a few seconds.
- **`payment_method_types: ['card']`** is still pinned in checkout. Removing it
  lets Stripe offer Link / Apple Pay / Google Pay per your dashboard settings,
  which usually improves conversion. Left as-is because it's a business
  choice.
- The Supabase security advisor flags several `SECURITY DEFINER` functions
  callable by `anon` (`is_admin`, `accept_client_invite`, …). They belong to
  the separate client-portal schema that shares this project and were
  deliberately left out of scope here, as the earlier migration notes.
