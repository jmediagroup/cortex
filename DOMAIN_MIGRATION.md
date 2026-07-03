# Domain Migration — `cortex.vip` → `moneyguymutants.com`

Companion to `REBRAND_PLAN.md`. That doc covers the **cosmetic/naming** rebrand;
this one covers the **operational cutover** of the domain: environment variables,
webhooks, DNS, email deliverability, and the external service dashboards.

**Scope decision:** everything moves to `moneyguymutants.com` **except the CMS**,
which stays at `cms.cortex.vip` for now (WordPress host, image origin, GraphQL
endpoint all unchanged). Keep the `cms.cortex.vip` DNS zone and the
`next.config.ts` `images.remotePatterns` allowlist entry as-is.

**Owner:** drew@jmediagroup.net · **Operating entity:** J Media Group LLC
(legal strings stay "Cortex Technologies" — do not touch).

---

## 0. TL;DR cutover order

Do these in order — some steps depend on earlier ones (email senders can't flip
until Resend has verified the domain; the Stripe secret can't be set until the
new webhook endpoint exists).

1. **DNS** — point `moneyguymutants.com` (+ `www`) at Vercel; add the Resend
   email records (SPF/DKIM/DMARC). *(§4)*
2. **Vercel** — add both domains to the project, set primary, add/update env
   variables (especially `NEXT_PUBLIC_APP_URL`). *(§1, §3)*
3. **Supabase Auth** — add the new Site URL + redirect allowlist entries. *(§3)*
4. **Stripe** — create the new webhook endpoint, copy its signing secret into
   `STRIPE_WEBHOOK_SECRET`. *(§2, §3)*
5. **Resend** — once the domain shows "Verified", flip the email sender env
   vars. *(§2, §3)*
6. **WordPress** — repoint `CORTEX_REVALIDATE_URL` at the new domain. *(§2)*
7. **Redirects + SEO** — 301 `cortex.vip` → `moneyguymutants.com`; Search Console
   Change of Address. *(§5)*
8. **Verify** — run the smoke checklist. *(§6)*

Keep `cortex.vip` live and 301-redirecting for **at least 90 days** (SEO + old
inbound links + any cached Stripe/Supabase redirect URLs).

---

## 1. Environment variables

The **canonical/SEO host is already hardcoded** to `https://moneyguymutants.com`
(`lib/seo-metadata.ts`, `app/layout.tsx`, `app/sitemap.ts`, `app/robots.ts`), so
metadata, OG, sitemap, and robots already point at the new domain. The runtime
gap is `NEXT_PUBLIC_APP_URL` and the email/webhook config below.

Set these in **Vercel → Project → Settings → Environment Variables** for
**Production** (and Preview where it makes sense).

### Must change

| Variable | Old / current | New value | Used by |
|---|---|---|---|
| `NEXT_PUBLIC_APP_URL` | `https://cortex.vip` | `https://moneyguymutants.com` | Stripe checkout success/cancel/return URLs (`lib/stripe/server.ts`), outlook email links + confirm/unsubscribe routes |
| `STRIPE_WEBHOOK_SECRET` | current `whsec_…` | **new** `whsec_…` from the new endpoint | `app/api/webhooks/route.ts` (§2) |
| `NEXT_PUBLIC_GOOGLE_VERIFICATION` | cortex.vip token | new token for the moneyguymutants.com Search Console property | `lib/seo-metadata.ts` |

### Email senders — flip **after** Resend verifies the domain (§2, §4)

Code now reads all of these from env with safe `@cortex.vip` fallbacks, so the
app keeps working pre-cutover and you flip it by setting the vars:

| Variable | Fallback (pre-cutover) | New value | Used by |
|---|---|---|---|
| `ENTERPRISE_FROM_EMAIL` *(new)* | `Money Guy Mutants <notifications@cortex.vip>` | `Money Guy Mutants <notifications@moneyguymutants.com>` | `lib/email.ts` |
| `SALES_NOTIFICATION_EMAIL` | `sales@cortex.vip` | `sales@moneyguymutants.com` (recipient inbox) | `lib/email.ts` |
| `OUTLOOK_FROM_EMAIL` | `Money Guy Mutants Outlook <outlook@cortex.vip>` | `…<outlook@moneyguymutants.com>` | `lib/outlook/email.ts` |
| `OUTLOOK_UNSUBSCRIBE_EMAIL` *(new)* | `unsubscribe@cortex.vip` | `unsubscribe@moneyguymutants.com` | `lib/outlook/email.ts` (List-Unsubscribe header) |
| `OUTLOOK_REPLY_TO` *(optional)* | unset | e.g. `hello@moneyguymutants.com` | `lib/outlook/email.ts` |

### Review — may want to update, not strictly required

| Variable | Note |
|---|---|
| `NEXT_PUBLIC_ADMIN_EMAILS` | If any admin addresses are `@cortex.vip`, move them to `@moneyguymutants.com` / `@jmediagroup.net`. |

### No change (values are domain-independent)

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`,
`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, all `NEXT_PUBLIC_STRIPE_*_PRICE_ID`,
`RESEND_API_KEY`, `CRON_SECRET`, `REVALIDATION_SECRET`,
`NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL` *(stays `cms.cortex.vip`)*.

> GA measurement id `G-0PQ1RZVNTS` is hardcoded in `app/layout.tsx` and is
> **not** domain-scoped — it keeps working. Just update the GA4 data-stream URL
> in the Google Analytics dashboard (§5).

---

## 2. Webhooks & external callbacks

| # | Webhook | Direction | Action |
|---|---|---|---|
| 1 | **Stripe** `…/api/webhooks` | Stripe → app | In the Stripe dashboard, add a new endpoint `https://moneyguymutants.com/api/webhooks` subscribed to the same events as today (checkout/subscription lifecycle). Copy its **signing secret** into `STRIPE_WEBHOOK_SECRET`. Keep the old cortex.vip endpoint enabled until DNS/redirects have propagated, then delete it. Checkout **success/cancel/return** URLs come from `NEXT_PUBLIC_APP_URL` — no separate change. |
| 2 | **WordPress → revalidate** `…/api/revalidate` | CMS → app | In `wp-config.php`, set `define('CORTEX_REVALIDATE_URL', 'https://moneyguymutants.com/api/revalidate')`. Secret (`CORTEX_REVALIDATE_SECRET`) must equal the app's `REVALIDATION_SECRET` — unchanged. (Plugin default in `wordpress/mu-plugins/cortex-vercel-deploy.php` still falls back to `cortex.vip`; the wp-config constant overrides it.) |
| 3 | **Vercel Deploy Hook** (optional) | CMS → Vercel | If `CORTEX_VERCEL_DEPLOY_HOOK` is set in `wp-config.php`, it targets a Vercel project deploy hook — the project is unchanged, so no edit needed unless you rotate the hook. |
| 4 | **Vercel Cron** `/api/outlook/email/daily`, `/weekly` | Vercel → app | Defined in `vercel.json` with **relative paths**, so no URL change. Runs against whatever domain the project serves. Protected by `CRON_SECRET`. |
| 5 | **Supabase Auth callbacks** | Supabase → app | Not a code webhook — handled via the Auth redirect allowlist (§3). |

---

## 3. External service dashboards

### Vercel
- [ ] Add `moneyguymutants.com` **and** `www.moneyguymutants.com` to the project domains.
- [ ] Set `moneyguymutants.com` as the **primary/production** domain (redirect `www` → apex or vice-versa, your call — keep it consistent with the hardcoded canonical, which is apex).
- [ ] Set the env vars from §1 (Production; mirror the safe ones to Preview).
- [ ] Keep `cortex.vip` attached to the same project with a **301 redirect** to `moneyguymutants.com` (§5).
- [ ] Redeploy so the new `NEXT_PUBLIC_APP_URL` is baked into the client bundle.

### Stripe
- [ ] New webhook endpoint (§2 #1) → copy signing secret to `STRIPE_WEBHOOK_SECRET`.
- [ ] Update **Branding** (business name/URL/logo) + the **customer portal** and checkout domain settings to Money Guy Mutants.
- [ ] Confirm the Price IDs in the env vars are unchanged (they are product-scoped, not domain-scoped).

### Supabase (Auth → URL Configuration)
- [ ] **Site URL** → `https://moneyguymutants.com`.
- [ ] **Redirect URLs** allowlist → add `https://moneyguymutants.com/**` (and `https://www.moneyguymutants.com/**` if used). Keep the `cortex.vip` entries during the transition, remove them after cutover.
- [ ] Update the Supabase **Auth email templates** branding (confirm signup / reset password / magic link) to Money Guy Mutants + the new domain links. (App-owned emails are handled in code — §2 of `REBRAND_PLAN.md` Phase 6.)

### Resend (email deliverability)
- [ ] Add domain `moneyguymutants.com`; publish the **SPF, DKIM, DMARC** records it generates (§4).
- [ ] Wait for **Verified** status.
- [ ] Only then flip the email sender env vars (§1) and redeploy.
- [ ] Send a test enterprise-lead + outlook-confirmation email and confirm SPF/DKIM `pass` in the raw headers.

### Google Search Console + Analytics
- [ ] Add + verify the `moneyguymutants.com` property (verification token → `NEXT_PUBLIC_GOOGLE_VERIFICATION`, or DNS TXT).
- [ ] Submit a **Change of Address** from `cortex.vip` → `moneyguymutants.com`.
- [ ] Resubmit the sitemap `https://moneyguymutants.com/sitemap.xml`.
- [ ] GA4: update the **Data Stream** default URL to the new domain (measurement id `G-0PQ1RZVNTS` stays).

### Domain registrar / DNS
- [ ] See §4.

---

## 4. DNS records

### `moneyguymutants.com` (points at Vercel)
| Type | Name | Value |
|---|---|---|
| A | `@` (apex) | `76.76.21.21` *(or an ALIAS/ANAME → `cname.vercel-dns.com` if the registrar supports it)* |
| CNAME | `www` | `cname.vercel-dns.com` |

> Use the exact values Vercel shows in **Project → Domains** when you add the
> domain — it will tell you A vs. CNAME based on your registrar.

### `moneyguymutants.com` email (Resend — use the exact records from the Resend dashboard)
| Type | Name | Value (example — copy real values from Resend) |
|---|---|---|
| TXT | `@` or `send` | `v=spf1 include:amazonses.com ~all` (Resend uses SES; take the string Resend shows) |
| CNAME | `resend._domainkey` (×3 DKIM) | the DKIM CNAMEs Resend generates |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:dmarc@moneyguymutants.com` (start at `p=none`, tighten later) |

### `cms.cortex.vip` — **leave unchanged**
CMS/WordPress + image origin stay here. Do not remove this zone or the
`next.config.ts` allowlist entry.

### `cortex.vip` — keep during transition
Keep it resolving (pointed at the Vercel project) so the 301 redirect works.
Don't delete for ≥90 days.

---

## 5. Redirects & SEO preservation

- [ ] **301 `cortex.vip` → `moneyguymutants.com`** (all paths, preserve path + query). Easiest: keep `cortex.vip` on the Vercel project and add a redirect rule, or a `redirects()` entry in `next.config.ts` gated on the incoming host.
- [ ] Confirm `app/sitemap.ts`, `app/robots.ts`, `public/ai.txt`, and any `llms.txt` all reference `moneyguymutants.com` (ai.txt is fixed in this branch).
- [ ] Search Console **Change of Address** (§3) — this is the signal Google uses to transfer ranking.
- [ ] Update any off-site references you control (social bios, GitHub, email signatures, Stripe/Supabase branding).
- [ ] RSS `<author>` emails now use `noreply@moneyguymutants.com` (fixed in this branch).

---

## 6. Post-cutover smoke test

- [ ] `https://moneyguymutants.com` loads; `https://cortex.vip/<anything>` 301s to it.
- [ ] Stripe **checkout** completes and returns to `…/dashboard?success=true`; the **webhook** upgrades the tier (check Stripe dashboard "Webhook attempts" = 200).
- [ ] Sign-up / password-reset **auth email** links land on the new domain and complete.
- [ ] Enterprise-lead form → sales notification email arrives, **from** the new domain, SPF/DKIM pass.
- [ ] Outlook subscribe → confirmation email; confirm + unsubscribe links work.
- [ ] Publish/update a WordPress post → `/api/revalidate` fires (200) and the change shows on the site.
- [ ] CMS images still load (they're served from `cms.cortex.vip`).
- [ ] GA realtime shows traffic on the new domain.

---

## 7. Rollback

Nothing here is destructive if you keep both domains attached:

- Email senders / `STRIPE_WEBHOOK_SECRET` / `NEXT_PUBLIC_APP_URL` are env vars —
  revert the value and redeploy.
- Keep the **old Stripe webhook endpoint** and the **cortex.vip Supabase redirect
  URLs** enabled until you've confirmed the new ones for a few days, so a revert
  is just "point env vars back."
- The old Resend `@cortex.vip` sender stays verified, so email keeps working on
  either config.
