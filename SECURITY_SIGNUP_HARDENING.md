# Signup abuse hardening

## What was happening

The admin user list was filling with accounts that looked like this:

| Email | Name | Tier |
| --- | --- | --- |
| `b.i.la.l.man.so.or@gmail.com` | `rxRwdQrbolvPisvN` | FREE |
| `s.t.ac.wel2.5@gmail.com` | `OOJblXMOXaStDsNXmgzj` | FREE |
| `cl.e.m.en.c.i.a.mu.n.oz@gmail.com` | `hSqYxJmnRPUADnLBCrKgYL` | FREE |

Two tells. The names are random strings — automated form fills. The addresses
are **Gmail alias farms**: Google ignores dots and anything after a `+` in the
local part, so `b.i.la.l.man.so.or@gmail.com`, `bi.lal.mansoor@gmail.com` and
`bilalmansoor+7@gmail.com` are all the *same inbox*, delivered to the same
person, while looking like three separate customers to us.

Four things in the codebase made this easy:

1. **Signup ran entirely in the browser.** `app/signup/page.tsx` called
   `supabase.auth.signUp()` directly with the public anon key. There was no
   server-side step in the flow, so there was nowhere to put a rate limit, a
   CAPTCHA check, or an email policy.
2. **No address canonicalisation.** Every alias looked like a brand-new person
   to both the app and the database.
3. **No record of verification.** The `handle_new_user` trigger writes the
   `public.users` row on `INSERT` into `auth.users` — which happens at signup,
   *before* the confirmation link is clicked. A bot that never opened the email
   still appeared as a fully-fledged `FREE` user, indistinguishable from a real
   one.
4. **No bot friction at all.** No CAPTCHA, no honeypot, no timing check, and a
   6-character minimum password.

There is a second cost beyond a messy user table: every one of those signups
sent a verification email to an address the attacker chose. That is our domain
being used as an email relay, and it puts the sending reputation at risk.

## What changed

### New code

| File | Purpose |
| --- | --- |
| `lib/email-hygiene.ts` | `normalizeEmail()` (canonical comparison key), disposable-domain blocklist, lookalike-domain detection, machine-generated-name heuristic, `assessSignup()` verdict |
| `lib/turnstile.ts` | Server-side Cloudflare Turnstile verification; inert until configured |
| `components/auth/TurnstileWidget.tsx` | Client widget; renders nothing until a site key is set |
| `app/api/auth/signup/route.ts` | The server-side signup chokepoint |
| `supabase/migrations/harden_signup_abuse.sql` | Schema, triggers, reporting views, purge helper |
| `supabase/migrations/enforce_email_normalized_unique.sql` | One-account-per-inbox index (run **after** cleanup) |

### Signup now goes through `/api/auth/signup`

Layers applied, cheapest first:

1. **Honeypot + timing** — a hidden `website` field, plus a rejection of any
   form submitted in under 2.5s. Both return a *fake success* so bots can't
   tell they were caught and tune around the rules.
2. **Rate limits** — 2/min and 5/hour per IP, and 3/hour per *normalized*
   email, so an alias farm shares one bucket instead of getting a fresh
   allowance per alias.
3. **Turnstile verification** (when configured).
4. **Email policy** — disposable domains and provider lookalikes are blocked;
   alias addresses and random-looking names are flagged, not blocked.
5. **Alias-collision check** — an address whose canonical form already has an
   account is rejected.
6. **Password strength** — raised from 6 to 10 characters, and all-digit or
   all-letter passwords are rejected.

The route calls `supabase.auth.signUp` with a **cookie-backed** client, so the
PKCE verifier still lands in the user's browser and `/auth/callback` keeps
working unchanged.

### Database

- `users.email_normalized` — a `GENERATED ALWAYS` column. Because Postgres
  computes it, it cannot drift, and it applies **even to accounts created by
  posting directly at the Supabase API**.
- `users.email_verified_at` — kept in sync with `auth.users.email_confirmed_at`
  by a new trigger, and backfilled. This is what finally separates real users
  from bots.
- `users.signup_ip_hash`, `signup_flags`, `is_flagged` — abuse signals recorded
  at signup. The IP is a salted SHA-256, never the raw address.
- Views `user_alias_clusters` and `signup_abuse_summary` for the admin panel.
- `purge_unverified_users()` — **dry-run by default**, skips anyone with Stripe
  records.

### Admin panel

`/admin/users` now shows verified / unverified / stale / flagged counts, a
per-row **Status** column, a banner when accounts share an inbox, and a filter
for verified / unverified / flagged.

## Deploy steps

### 1. Apply the migration

Run `supabase/migrations/harden_signup_abuse.sql` in the Supabase SQL editor.
Safe to run more than once.

### 2. Turn on CAPTCHA protection in Supabase — this is the important one

Everything above protects signups that come through our own UI. **A bot does
not have to use our UI.** `NEXT_PUBLIC_SUPABASE_ANON_KEY` is public by design,
so anyone can `POST` straight to
`https://<project>.supabase.co/auth/v1/signup` and skip every check in this
repo. The rate limiter, the honeypot, and the email policy are all bypassed by
a single `curl`.

The only control that covers that path is Supabase's own:

1. Create a Turnstile widget at
   [Cloudflare dashboard → Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile).
2. Set the env vars:
   ```
   NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAA...   # public, used by the widget
   TURNSTILE_SECRET_KEY=0x4AAA...             # server-only
   SIGNUP_IP_SALT=<a long random string>      # enables signup_ip_hash
   ```
3. In Supabase: **Authentication → Settings → Bot and Abuse Protection** →
   enable CAPTCHA protection, provider **Turnstile**, and paste the secret key.

Once step 3 is done, Supabase rejects any auth request without a valid token,
whether it comes from our form or from `curl`. The signup, login, resend, and
password-reset calls in this repo all pass a token already, so enabling it will
not break the app — but do steps 1–2 **before** step 3, or every auth request
will start failing.

### 3. Also worth enabling in the Supabase dashboard

- **Leaked Password Protection** (Authentication → Providers → Email) — still
  not on; it was flagged in `fix_security_issues.sql` and never actioned.
- **Auth rate limits** (Authentication → Rate Limits) — lower the per-hour
  signup and email-send caps.

## Cleanup runbook

Preview first — an unverified account is not automatically a bot. A real
person who never got around to clicking the link looks identical.

```sql
-- 1. The headline numbers
select * from signup_abuse_summary;

-- 2. Which inboxes are running alias farms
select * from user_alias_clusters order by account_count desc limit 25;

-- 3. Preview what would be deleted (never-verified, free, no Stripe records)
select * from purge_unverified_users('7 days');

-- 4. Delete for real
select * from purge_unverified_users('7 days', true);

-- 5. Once user_alias_clusters is empty, enforce one account per inbox
--    by running supabase/migrations/enforce_email_normalized_unique.sql
```

## Known limits

- **The rate limiter is in-memory** (`lib/rate-limit.ts`), so on Vercel each
  serverless instance keeps its own counters and they reset on cold start. It
  raises the cost of an attack; it does not cap it. Turnstile is what actually
  holds the line. If we want real distributed limits, Upstash Redis is the
  usual next step.
- **The disposable-domain list is static.** New throwaway providers appear
  constantly. It catches the high-volume ones; it will never be complete.
- **The name heuristic is deliberately conservative.** It caught 13 of the 14
  bot names from the incident with no false positives against a list of real
  names including `Krzysztof`, `Anastasiya` and `Jean-Luc`. It only ever
  *flags* — it never blocks a signup on its own — because a person with an
  unusual name must not be locked out.
- **`normalizeEmail` is a comparison key, never a delivery address.** Mail must
  always go to `users.email`, the address the person actually typed. The SQL
  and TypeScript implementations must be kept in sync.
- **`/api/resend-verification` appears to be dead code.** Nothing in the app
  calls it — both pages call `supabase.auth.resend()` directly. It is an
  unauthenticated endpoint that sends mail using the service-role key. It has
  been hardened to match the signup route, but if it is genuinely unused it
  should just be deleted.
