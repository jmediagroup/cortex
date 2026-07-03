# Money Guy Mutants Rebrand — Plan & Status

Migrating from **Cortex** (dark emerald/obsidian, `cortex.vip`) to the **Money Guy
Mutants** design system (light navy‑and‑sky, `moneyguymutants.com`).

**Prime directive:** cosmetic + naming only. Never touch calculation math, state,
hooks, props, event handlers, data fetching, API routes, or feature behavior.
Keep the **legal entity "Cortex Technologies"** (the operating entity is actually
"J Media Group LLC" — leave all legal strings alone).

Branch: `claude/mgm-rebrand-design-system-b11cys` · PR: **#79**.

---

## The design system (source of truth)

Uploaded kit lives in the repo history of this session; the canonical spec is the
**Money Guy Mutants Design System** package (readme.md, `tokens/`, `components/`,
`ui_kits/`). Key rules:

- **Colors** — navy `#054C7D` is the ink (body, headings, icon strokes, dark
  bands), sky `#4EC9F5` is the interactive accent (links, outlines, tag pills),
  orange `#F26531` is the single "act now" CTA color (used sparingly), teal‑green
  `#1D8072` = positive/growth, red `#CD2026` = negative, mint `#8FD9CE` +
  yellow `#FEBF14` = supporting. White / off‑white `#F7F3F3` surfaces.
- **Type** — one geometric sans (**Hanken Grotesk**). Headings bold‑700‑navy,
  tight leading. Labels/buttons/eyebrows UPPERCASE + wide tracking.
- **Shape** — radii 4px (buttons/inputs/images), 8px (cards), pill (chips), 50%
  (icon badges). Flat rest; soft **warm** hover‑lift shadow. No glassmorphism,
  no neon glow, no aurora gradients.
- **Layout** — generous whitespace, left‑aligned content, section‑icon badges
  beside H2s, 3‑up card grids, full‑bleed **navy duotone** hero/section bands.
- **Voice** — confident, in‑group, slightly cheeky; audience are **"Mutants."**
  No emoji in UI.

All of this is already wired into `app/tokens.css` (CSS variables) and exposed as
Tailwind utilities in `app/globals.css` (`bg-navy`, `text-sky`, `bg-orange`,
`text-teal-green`, …). **Restyle by using these tokens/utilities**, never by
reintroducing hardcoded legacy hex.

### Reusable primitives (`components/`)
- `brand/MutantMark`, `brand/Wordmark` — mascot + MONEYGUY/MUTANTS lockup.
- `ui/Button` — primary (orange) / secondary ghost (navy·orange·white) / tertiary
  (yellow); uppercase, 2px tracking, 4px radius.
- `ui/Card`, `ui/Tag`, `ui/SectionBadge` (+ `SectionHeader`) — MGM card, pill,
  section‑icon header.
- Global CSS helpers in `globals.css`: `.mgm-btn*`, `.mgm-input`, `.mgm-range`
  (slider skin), `.mgm-band` (navy section band).

---

## Status

- ✅ **Phase 0 — Token foundation** (commit `4c1b153`). Remap tokens.css to MGM,
  light‑only (dark mode + toggle retired), Inter → Hanken.
- ✅ **Phase 1 — Brand identity, primitives & domain** (commit `78c4485`).
  Mascot + wordmark in all chrome, orange Button primitive, favicon/OG rebuilt,
  `cortex.vip → moneyguymutants.com` sweep, Cortex → Money Guy Mutants name sweep
  (legal preserved), `@cortextools` removed.
- 🔄 **Full overhaul in progress** — restyling every surface to MGM and removing
  all remaining legacy Cortex design elements (see phases below). Being executed
  now via per‑surface passes.

---

## Remaining phases (per‑surface detail)

Each phase is cosmetic. "Remove legacy" = replace any hardcoded obsidian/neon/
crimson/indigo/slate hex, glassmorphism, aurora, and neon glows with MGM
tokens/patterns; tighten radii to 4/8/pill; make primary CTAs orange; add
section‑icon badges + uppercase tracked eyebrows; apply the cheeky Mutants voice
to headings/CTAs (keep numeric/functional copy meaning‑preserving).

### Phase 2 — Marketing
`components/marketing/*` (Hero, ToolGrid, Philosophy, PricingPreview,
PrinciplesCTA, Placeholder, MarketingShell), `app/page.tsx`, `app/pricing/*`,
`app/enterprise/*`, `app/about/*`, `app/security/*`, `app/terms/*`,
`app/changelog/*`, `app/roadmap/*`. Hero → navy duotone band (drop aurora/grid).
Pricing tiers → MGM cards, featured tier navy/sky, orange CTAs. Full voice.

### Phase 3 — Auth + onboarding
`components/auth/AuthShell`, `app/login`, `app/signup`, `app/reset-password`,
`app/onboarding`. MGM split‑screen: navy duotone brand panel + clean white form.
MGM inputs (`.mgm-input`), orange submit buttons, voice pass.

### Phase 4 — App shell + dashboard
`components/app/*`, `components/dashboard/*`, `components/navigation/*`,
`app/dashboard/*`, `app/account`, `app/admin/*`. Sidebar/tab‑bar, KPI cards,
wealth gauge (ScoreGauge look), settings. Drop force‑dark `data-theme="dark"`
subtrees; render light. Orange CTAs, navy bands for emphasis.

### Phase 5 — Calculators (13+)
`components/apps/*` + `app/apps/*/page.tsx`. Restyle form controls (inputs,
sliders → navy thumb, segmented toggles → pill), result/KPI cards, the big
`rounded-[2.5rem]/[3rem]` result islands → navy/teal bands at 8–12px radius.
Rename "CORTEX INSIGHT" → an MGM label (e.g. **"MUTANT INSIGHT"**) and Budget
"Cortex Mode/Engine" → an MGM feature name. Personality quiz + share cards.
**Do not alter any calculation or field semantics.**

### Phase 6 — Content + email
`app/articles/*`, `app/guides/*`, `app/thinking/*` chrome (NOT dated article/
outlook bodies), `components/home/LatestArticles`, `emails/*`, `lib/email.ts`,
`lib/outlook/email.ts`. Blog/article MGM patterns (navy duotone hero, author/
share rail). Email templates → table‑based MGM (navy header, orange CTA) — see
infra note about sender addresses.

### Phase 7 — OG images, /design, cleanup
All `app/**/opengraph-image.tsx` + `twitter-image.tsx` + `lib/*og*` → MGM navy
card + mascot (reuse `lib/brand-og-card`). `app/design/page.tsx` living style
guide → MGM tokens. Delete dead theme files (`ThemeProvider`, `ThemeScript`,
`ThemeToggle`), leftover boilerplate SVGs (`next.svg`, `vercel.svg`, `globe.svg`,
etc.), stale comments. Final grep for legacy hex + `Cortex`/`cortex.vip`. WCAG
contrast + focus‑ring audit.

---

## Infra follow‑ups (NOT code — for the domain move)
**See `DOMAIN_MIGRATION.md`** for the full cutover runbook (env vars, webhooks,
DNS, email deliverability, external dashboards, redirects, rollback). Summary:
- Set `NEXT_PUBLIC_APP_URL=https://moneyguymutants.com` in prod.
- DNS + SPF/DKIM for `@moneyguymutants.com`; **then** flip the email sender env
  vars. Senders are now env‑configurable (`ENTERPRISE_FROM_EMAIL`,
  `OUTLOOK_FROM_EMAIL`, `OUTLOOK_UNSUBSCRIBE_EMAIL`, `SALES_NOTIFICATION_EMAIL`)
  with safe `@cortex.vip` fallbacks so nothing breaks pre‑cutover.
- New Stripe webhook endpoint on the new domain → new `STRIPE_WEBHOOK_SECRET`.
- Repoint the WordPress `CORTEX_REVALIDATE_URL` at the new domain.
- `cms.cortex.vip` **stays** (WordPress + image origin); keep the
  `next.config.ts` `images.remotePatterns` allowlist entry.

## How to continue in a new session
Read this file + `app/tokens.css` + `app/globals.css`, then pick a phase, restyle
its files using MGM tokens/primitives, run `npx tsc --noEmit` + `npm run build`,
screenshot with Playwright (`/opt/pw-browsers/chromium-1194/...`), commit to the
branch, and PR #79 updates automatically.
