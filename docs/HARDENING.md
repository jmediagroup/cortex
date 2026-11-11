# Product hardening (Nov 2026)

Eight protections, what each one does, and what Drew still has to switch on.
Everything ships **safe by default**: with no new env vars set, the site
behaves as before, except that it is stricter about bots and never shows raw
errors. The database migration is **applied** (Nov 5, 2026), so shared rate
limits, the failed-login log and the AI budget are live as soon as this code
deploys.

| # | Ask | What's in the code now | Needs Drew? |
|---|-----|------------------------|-------------|
| 1 | Rate-limit signup and login | Signup and the **new** `/api/auth/login` route use a rate limiter shared by every server (Postgres), with per-IP and per-email buckets | — (migration applied) |
| 2 | Rate-limit every AI endpoint | `/api/why`: 5 per 5 min per user, 20 a day per user, 30 an hour per IP. `/api/ai/insights`: 30 a minute per IP | — (migration applied) |
| 3 | Cap monthly AI spend | Every model call is costed and recorded in `ai_usage`. A call is refused if it could take the month past `AI_MONTHLY_BUDGET_USD` (default **$25**) | Set the budget, set a Console limit |
| 4 | Bot protection on forms | Honeypot + fill-time check on signup, login, enterprise and newsletter forms. Turnstile on signup, login and enterprise once keys are set | Turnstile keys (existing step) |
| 5 | Hide stack traces | User-facing API routes return plain copy + a reference code and log the detail. New `app/global-error.tsx`. A test fails if a route sends `error.message` again | — |
| 6 | Log every failed login | Every failed or blocked login → `public.auth_events` (reason + salted hashes, no raw email/IP) + Vercel log line. Alert on spikes | Set salt |
| 7 | Uptime alerts | `GET /api/health` → `ok` / `degraded` / `down` (503). Opt-in ops alert emails | Create the monitor (free) |
| 8 | Plan for the AI API going down | One quick retry → circuit breaker (stop calling for ≤2 min after 5 failures) → friendly "try again" copy; answers kept in the browser; kill switch; runbook below | — |

---

## Drew's checklist

None of these were done by code. Each is a few minutes.

### A. Apply the migration — ✅ done 2026-11-05

`supabase/migrations/20261105120000_security_hardening.sql` was applied to the
Money Guy Mutants production project (`pehteunyustvnxmxjcfk`) on Nov 5, 2026
at Drew's instruction. Before that it was tested on a local Postgres 16 (it
re-runs cleanly; counters, window reset and peek are correct).

Checked in production after applying:
- RLS is on for all 3 tables, with 0 policies. `anon` and `authenticated` have
  no table, view or function access; `service_role` has.
- `rate_limit_hit` allows 1 and then blocks (tested in a rolled-back
  transaction; no rows left behind).
- **Security advisors**: the only change is `rls_enabled_no_policy` going from
  7 to 10 (INFO). That is intentional: the three new tables are service-role
  only, the same setup as the `ad_*` tables. Every other count is unchanged.
- **Performance advisors**: the only new findings are `unused_index` (INFO) on
  the four indexes of the new, still-empty tables.

### B. Vercel env vars (names only, set values in the dashboard)

| Name | Set to | Why |
|------|--------|-----|
| `RATE_LIMIT_SALT` | a long random string (e.g. `openssl rand -hex 32`) | Without it, `auth_events` stores **no** hashes (only reason codes). `SIGNUP_IP_SALT` is used if this is missing. |
| `AI_MONTHLY_BUDGET_USD` | your monthly AI cap in dollars | Default 25. `0` turns AI off. |
| `AI_FEATURES_DISABLED` | `true` only in an emergency | Kill switch: AI screens show "paused, try later". |
| `OPS_ALERT_EMAIL` | `drew@jmediagroup.net` | Turns on ops alert emails (AI outage, 80%/100% budget, failed-login spike). Unset = log only. Only ever sends to this one address. |
| `SUPABASE_CAPTCHA_ENABLED` | `true` **only after** step C.3 | Tells our routes Supabase now checks the Turnstile token, so we don't spend it first (tokens are single-use). |
| `SUPABASE_AUTH_IP_FORWARDING` + `SUPABASE_SECRET_KEY` | `true` + an `sb_secret_…` key | Optional, see C.4. |

### C. Supabase + Cloudflare dashboard

> **Incident, Nov 8–11 2026: nobody could log in.** Supabase CAPTCHA (C.3)
> was switched on, but the production build had no
> `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, so the widget never rendered and no token
> was ever sent. Supabase rejected every sign-in and password reset
> (`captcha_failed: no captcha_token found`); there were zero successful
> logins in the 24 hours before the fix. `NEXT_PUBLIC_*` values are compiled
> into the browser bundle **at build time**. Adding the key in Vercel does
> nothing until you **redeploy**. The code now detects this: the routes log
> `CAPTCHA misconfigured`, send an ops alert, and show "temporarily
> unavailable" instead of a "refresh and try again" loop, and `/api/health`
> reports `auth_captcha: "misconfigured"` (when `SUPABASE_CAPTCHA_ENABLED` or
> `TURNSTILE_SECRET_KEY` is set without the site key).

1. **Turnstile** keys (`NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`).
   This is the existing step in `SECURITY_SIGNUP_HARDENING.md`. Login and the
   enterprise form pick them up automatically. Set them for the **Production**
   environment, then **redeploy**, and confirm the widget appears on `/login`
   **before** doing step 3.
2. **Anthropic Console → Limits → spend limit**. This is the hard backstop. Our
   cap is an estimate and only works once the migration is applied. Set the
   Console limit a little above `AI_MONTHLY_BUDGET_USD`.
3. **Supabase → Authentication → Bot and Abuse Protection → CAPTCHA (Turnstile)**.
   This is the only thing that stops a bot calling Supabase Auth directly with
   the public anon key, which skips our routes. **Then** set
   `SUPABASE_CAPTCHA_ENABLED=true` in Vercel and redeploy. Do it in that order:
   with the flag on and Supabase CAPTCHA off, nobody checks the token.
4. *(Optional, later)* **Authentication → Rate Limits → IP Address Forwarding**.
   Login and signup now run on our server, so Supabase sees Vercel's IP. Its
   per-IP sign-in limit (about 1,800/hour) is therefore shared by everyone.
   That is fine at today's volume, and our own per-IP limits run first. To
   have Supabase limit on the real visitor IP, enable forwarding, create a
   **secret** API key (`sb_secret_…`), and set `SUPABASE_SECRET_KEY` and
   `SUPABASE_AUTH_IP_FORWARDING=true`.

### D. Uptime monitor (free, about 5 minutes)

Use any free external monitor. [UptimeRobot](https://uptimerobot.com) (free,
5-minute checks) and [Better Stack](https://betterstack.com/uptime) both work.
Signing up is Drew's step (rule 5).

1. **Monitor 1, "site down"**: HTTP(S) check of
   `https://moneyguymutants.com/api/health`, every 5 min. Alert when the status
   is not 2xx. It returns **503 only when the database is unreachable**.
2. **Monitor 2, "homepage"**: HTTP(S) check of `https://moneyguymutants.com/`.
   It catches a broken deploy or DNS problem even if the API is fine.
3. *(Optional)* **Monitor 3, "AI degraded"**: keyword check on `/api/health`
   for `"status":"ok"`. It fires when AI is off, failing or out of budget.
4. Alert contact: `drew@jmediagroup.net` (plus the phone app, if you like).

Why not a GitHub Action: a schedule frequent enough to count as uptime
monitoring would use most of the free Actions minutes on a private repo. Once
those run out, the daily-outlook and weekly-guide workflows stop too.

---

## How each piece works

### Shared rate limiting: `lib/rate-limit-shared.ts`

`checkSharedRateLimit(key, config)` calls the `rate_limit_hit` SQL function,
which does one atomic upsert per hit. The counter is therefore the same
whichever serverless instance answers. Keys are SHA-256 hashed before they
leave the app. If the database is slow (over 1.5s) or the function is
missing, it falls back to the old in-memory limiter and logs it once per
instance. `cost: 0` reads the counter without adding a hit; the circuit
breaker uses this.

| Bucket | Limit |
|--------|-------|
| Signup per IP | 2/min, 5/hour |
| Signup per normalized email | 3/hour |
| Login per IP | 5/min, 30/15 min |
| Login per normalized email (from any IP) | 10/15 min |
| `/api/why` per user | 5/5 min, 20/day |
| `/api/why` per IP | 30/hour |
| `/api/ai/insights` per IP | 30/min |
| Newsletter / enterprise per IP | unchanged (5/5 min, 10/min) |

### Login: `app/api/auth/login/route.ts`

The login form now posts to our server instead of calling Supabase from the
browser. The order of checks is: honeypot → rate limits → Turnstile →
`signInWithPassword` (cookie client, the same as signup). The browser client
reads the session cookie the route sets. Forgot-password and "resend
verification" still run in the browser. Supabase's own email rate limits and
CAPTCHA (C.3) cover them.

### Failed-login log: `public.auth_events`

```sql
-- Last 7 days, by reason
select * from public.auth_failed_login_daily where day > now() - interval '7 days' order by day desc;

-- Accounts being hammered (credential stuffing looks like many IPs, one email_hash)
select email_hash, count(*) attempts, count(distinct ip_hash) ips
from public.auth_events where created_at > now() - interval '1 day'
group by 1 order by 2 desc limit 20;
```

Reasons: `invalid_credentials`, `email_not_confirmed`, `captcha_failed`,
`rate_limited_ip`, `rate_limited_email`, `rate_limited_upstream`, `honeypot`,
`user_banned`, `server_error`, `other`. Rows are deleted after 90 days by the
existing daily cron. More than 100 failures in an hour sends one ops alert.

### AI spend cap: `lib/ai/guard.ts`, `lib/ai/policy.ts`

Before each call: kill switch → circuit breaker → rate limits → budget. The
budget check reserves the worst case for this call (expected input plus the
full output allowance), so the call that would cross the cap is the one that
gets refused. After the call, actual tokens × the published price are written
to `ai_usage`, including responses that came back unusable, because those are
billed too. Prices come from Anthropic's published rates (Sonnet 5: $2 / $10
per million input/output tokens). An unknown model is charged at the top
tier, so the cap can only trip early.

Ops alerts go out once at 80% and once at 100% of the month. A reflection
costs roughly $0.02, so the default $25 is about 1,000+ a month.

### Errors: `lib/api-errors.ts`

`internalErrorResponse(context, err)` logs `[context] ref=a1b2c3d4 <detail + stack>`
and returns `{ error: "<plain sentence>", ref: "a1b2c3d4" }`. A support email
that quotes the ref can be matched to the log line. `tests/hardening.test.mjs`
fails if a non-admin route sends `error.message`, `String(err)` or a stack to
the client. Admin routes still show database messages, because only Drew sees
them.

---

## When the AI API is down (runbook)

**What users see automatically.** First the call is retried once, about 1.5s
later. If it still fails they get: *"Our AI service is having trouble right
now. Your answers are saved on this device, so you can try again in a few
minutes."* Their answers stay in that browser (`localStorage`) until a
reflection succeeds. After 5 provider failures in 2 minutes the circuit
opens: we stop calling Anthropic for up to 2 minutes, users get the same
message instantly, and their rate limits aren't used up. It closes by itself.
`/api/health` shows `"ai":"failing"`.

**What Drew gets.** One email (if `OPS_ALERT_EMAIL` is set): *"AI provider
failing — whats-your-why paused"*, at most once every 3 hours.

**What to do.**
1. Check https://status.anthropic.com. If it's their incident, nothing to do:
   the circuit retries every 2 minutes on its own.
2. If it's not their incident, check Vercel logs for `[why/synthesis] upstream returned <status>`:
   - `401`/`403`: the API key was revoked or changed. Fix `ANTHROPIC_API_KEY` in Vercel.
   - `429`: we're over our Anthropic rate or spend limit. Check the Console.
   - `400`: a request-shape problem (for example a model retired). It needs a code fix.
3. For a long outage, or to stop spend immediately, set
   `AI_FEATURES_DISABLED=true` in Vercel and redeploy. Every AI screen shows
   "paused, please try again later", and nothing else on the site is affected.
   Unset it to turn AI back on.
4. Budget hit (`"ai_budget":"exhausted"` in `/api/health`): raise
   `AI_MONTHLY_BUDGET_USD` and redeploy, or wait for the 1st of the month (UTC).

---

## Known limits

- **Direct Supabase Auth calls** (a bot using the public anon key against
  `supabase.co/auth/v1/...`) skip our routes, so they aren't in `auth_events`
  and aren't rate-limited by us. Supabase CAPTCHA (C.3) and Supabase's own
  rate limits are the control there. Supabase's Auth logs record those attempts.
- **The AI budget is an estimate** from token counts × list price. The
  Anthropic Console bill is the source of truth and its spend limit (C.2) is
  the hard stop.
- Two simultaneous calls can both pass the budget check right at the edge.
  The worst case is one extra call (~$0.02) over the cap.
