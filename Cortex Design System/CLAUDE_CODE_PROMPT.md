# Cortex Website — Full Design Overhaul Prompt for Claude Code

> Paste this entire document into Claude Code inside the `jmediagroup/cortex` repo. It's self-contained and assumes Claude Code has filesystem access to both the repo and the `Cortex Design System` folder. If the design system folder is at a different path on your machine, update the path near the top of the "Source of truth" section before sending.

---

## 0. Role & mission

You are acting as a senior product designer + senior frontend engineer embedded in the Cortex repo (Next.js 16, React 19, Tailwind v4, Supabase auth, Stripe, Recharts, lucide-react — see `package.json`). Your mission is to execute a **comprehensive visual overhaul of the entire Cortex website** (marketing + authenticated app + all 13 finance tools) so that the shipped product matches the `Cortex Design System` folder I'm handing you — the **"Trust & Growth" dark palette** (Obsidian / Electric Emerald / Crimson Pulse / Frosted Slate / Silver Mist) with Inter Variable + JetBrains Mono, frosted-glass cards, emerald glow CTAs, emerald→info gradient headlines, radial aurora backgrounds, and subtle grid overlays.

In parallel, you will **generate a fully matched light-mode theme** derived from the same token system — warm off-white paper surfaces, a slightly deepened emerald for AA contrast, real shadows (not glows), and dialed-down ambient glows. The two themes must ship behind a user-controllable toggle and respect OS preference by default.

This is not a skin. It is a **token-driven re-theme of every surface**, with components refactored to consume the tokens, plus a handful of new signature components (Pulse card, Smart Amount input, Safe-to-Spend orbit, Sankey, Ghost chart) that the design system explicitly defines.

**Critical reconciliation note to honor:** the *current shipped* Cortex code uses slate neutrals + indigo/purple + Geist and is light-only. The design system folder replaces that. Where the old tokens appear in code (`slate-900`, `from-indigo-600`, `Geist`), migrate them to the new system. Do not silently keep old tokens around "just in case."

---

## 1. Source of truth (read these first, in order)

All paths below are inside `/Users/andrewjenkinson/Documents/Downloads/Cortex Design System/`:

1. `README.md` — brand context, content fundamentals, visual foundations, iconography, index.
2. `colors_and_type.css` — **the token bible**. Every color, type, radius, spacing, shadow, motion, and aurora variable you need is here, with both dark (`:root`) and light (`[data-theme="light"]`) overrides already defined. **Copy this file into the repo as-is** at `app/tokens.css` and import it before Tailwind in `app/globals.css`.
3. `SKILL.md` — how the design system is meant to be used.
4. `ui_kits/marketing/` — the reference landing page (`index.html` + `Nav.jsx`, `Hero.jsx`, `Blocks.jsx`, `Tools.jsx`, `Icons.jsx`). Use as source of truth for marketing IA, hero pattern, tool grid, pricing tiers, philosophy block, dark CTA island, footer.
5. `ui_kits/mobile/` — the authenticated app / dashboard reference. Use for the signature product components: `PulseCard.jsx`, `SmartAmount.jsx`, `SafeToSpend.jsx`, `Sankey.jsx`, `GhostChart.jsx`, `TransactionRow.jsx`, `Chrome.jsx`, `Icons.jsx`.
6. `preview/*.html` — atomic component previews (buttons, inputs, KPI, badges, nav, cards, chart, etc.) rendered as standalone HTML. Treat each as a visual spec for its component.
7. `assets/brain-icon.svg` — the real brand mark. Copy into `public/` and use for favicon + nav logo.

**Before writing any code,** read all of (1), (2), (3), (5), (6), and skim (7). State back to me in one paragraph what you believe the design direction is and what the biggest deltas from the current repo will be. Then proceed.

---

## 2. Non-negotiable design principles (from the README)

Encode these as rules in the code and reviews:

- **Voice**: clear, serious, intellectually self-respecting. No hype, no finance-bro energy, no emoji. Casing: sentence-case headlines ending in a period; `UPPERCASE TRACKED` eyebrows; Title Case buttons; Title Case card titles.
- **Person**: "you." "We" only when talking about Cortex the company.
- **Tone pattern**: `setup → pivot → land`. Preserve existing copy that uses it; don't rewrite for rewrite's sake.
- **Typography**:
  - Geist → **replaced** by Inter Variable (300–900) for display/body, JetBrains Mono for numeric/IBAN/meta.
  - Weights: 400, 500, 600, 700, **900**. Lean on weight for emphasis, not italic or caps.
  - Tracking: `-0.03em` on hero/display, `0.14em` on eyebrow caps.
  - Numeric UI uses `font-mono` with `font-variant-numeric: tabular-nums`.
- **Color**:
  - Brand accent = Electric Emerald `#00F0A0` (dark) / deepened `#00A674` (light, for AA).
  - Negative/debt = Crimson Pulse `#FF3B30`.
  - Neutrals = Obsidian scale (dark) / warm off-white (light, `#F7F7F3` canvas, `#FAFAF7` page).
  - Signature gradient on display text: `linear-gradient(135deg, var(--emerald-500), #5AC8FA)` — used on hero keyword and section-headline keyword.
- **Surfaces**:
  - Dark: obsidian canvas + frosted-glass cards (`bg-glass` / `bg-glass-strong` + `backdrop-filter: blur(20px) saturate(180%)`) + emerald inner hairline (`--shadow-inset-top`).
  - Light: warm paper + flat white cards + **real drop shadows**, glows heavily dialed down. No glass-on-white haze.
- **Backgrounds**: radial "aurora" ellipses (emerald on top, info at bottom-right, faint crimson heat) + 56px grid mask behind hero/CTA. Always `pointer-events: none`, always masked to the center.
- **CTA button (primary)**:
  - Dark: solid emerald fill, `color: var(--text-inverse)` (obsidian), **dual box-shadow** → `0 0 0 1px var(--cta-glow-ring), 0 0 32px var(--cta-glow-soft)`, intensifies on hover.
  - Light: same emerald (deepened), shadow ring dialed down per token file.
- **Radii**: 6/10/14/20/24/32/40 + `full`. Cards are `--radius-xl` (24). Buttons/pills are `--radius-full`.
- **Motion**: `cubic-bezier(0.16, 1, 0.3, 1)` (expo-out) default; `cubic-bezier(0.34, 1.56, 0.64, 1)` soft-spring for CTAs; durations 120/200/320/520ms. No bounces or confetti. Stagger children at 60ms. Float blobs 6s ease-in-out.
- **Focus**: `outline: 2px solid var(--emerald-500); outline-offset: 2px;` — visible, brand-colored, across both themes.
- **Icons**: `lucide-react` only, 1.5–2px stroke, `currentColor`, 14–22px. No custom icon font. No emoji (one defensive strike-through use is allowed in the "Not advice / Not a course / Not a spreadsheet farm" trio).

---

## 3. Scope — every surface of the site

The overhaul must touch, at minimum, these surfaces. For each one, re-theme every component, replace old tokens, and conform to the patterns above. Do not stop at the homepage.

### 3.1 Marketing site (public, unauthenticated)
- `app/layout.tsx` — swap Geist for Inter Variable + JetBrains Mono via `next/font/google`. Inject `data-theme` attribute on `<html>` from server via cookie + OS preference. Add `ThemeProvider` client component.
- `app/page.tsx` (landing) — nav, hero, tool grid, philosophy (`setup → pivot → land`), pricing, principles dark CTA island, footer. Match `ui_kits/marketing/index.html` 1:1 in structure, then tighten copy to what ships today where ours is better.
- `app/pricing/*` — migrate to the dark/light tiered glass cards in `Blocks.jsx > Pricing`. Featured tier gets emerald halo + "Most popular" pill.
- `app/articles/*`, `app/thinking/*`, `app/about/*`, `app/changelog/*`, `app/roadmap/*` — apply type scale, max-widths, eyebrow pattern, dark-aware prose styles. If any of these don't exist yet, scaffold them with placeholder copy in the right style.
- Legal pages (`terms`, `privacy`, `security`) — same prose treatment.
- `app/not-found.tsx`, `app/error.tsx` — re-themed, short, sharp, with a single emerald CTA back home.
- Global: footer (`Footer.jsx` pattern), sticky blurred nav (`Nav.jsx` pattern) with theme toggle, scroll-state background intensification.

### 3.2 Auth flows
- Sign in / Sign up / Magic link / Reset password / Email confirmation — re-skin the Supabase UI (we use `@supabase/auth-helpers-nextjs` — check `package.json`). Frosted-glass auth card centered on a mini aurora, emerald primary button, mono for OTP fields, crimson inline error, emerald success. Keep flows identical; only re-skin.

### 3.3 Authenticated app shell
- `app/(app)/layout.tsx` (or equivalent) — side nav, top bar, user menu, theme toggle, logout. Match the dashboard UI kit vibe: obsidian canvas, frosted sidebar with emerald accent on active route, grid bg behind main content.
- `components/dashboard/DashboardHome.tsx` — rebuild around Pulse cards + KPI strip + Ghost chart + Transaction list. Use `ui_kits/mobile/PulseCard.jsx`, `GhostChart.jsx`, `TransactionRow.jsx` as direct references; port to React 19 + TypeScript + Tailwind v4 utility classes that read the new tokens.
- Empty states, loading skeletons (shimmer), error boundaries — all re-themed.

### 3.4 The 13 finance tools
Each tool page in `app/tools/*` (or current equivalent):

1. Compound Interest Calculator
2. Net Worth Engine
3. Retirement Strategy
4. Coast FIRE
5. Rent vs Buy Reality Engine
6. Geographic Arbitrage
7. Debt Paydown
8. S-Corp Optimizer
9. Gambling Redirect
10. Car Affordability
11. Index Fund Visualizer
12. Budget System
13. *(13th tool — check the repo and include it; README lists ~13)*

For each tool:
- **Header**: eyebrow (`FINANCE · <CATEGORY>`), sentence-case title ending in period, one-sentence sub in `--text-secondary`.
- **Inputs panel**: left column on desktop, collapsible sheet on mobile. Use the `SmartAmount` pattern where a number input is the star — emerald glow on positive scenarios (Save), crimson glow on negative (Debt), neutral otherwise. Sliders use emerald track + mono value display. Selects, toggles, and segmented controls all re-themed.
- **Output panel**: right column. A `balance-hero` display number at the top (32–44px, `--weight-semi`, `tabular-nums`, `letter-spacing: -0.035em`). Below it, a Ghost chart (historical solid + dotted projection), then a KPI strip (3 mono values), then a Sankey flow where the tool has income → categories → outcomes (Budget System, Net Worth, Rent vs Buy, Retirement all qualify).
- **Narration line**: each tool ends with a single "setup → pivot → land" sentence that reframes the result in context. E.g. *"Most people see the monthly payment. You just saw the 30-year opportunity cost."*
- **Disclaimer footer**: small eyebrow "NOT ADVICE" + one-liner.

### 3.5 Dashboard widgets to port/create
Port into `components/ui/` and use them in the tools and dashboard:
- `PulseCard` — frosted account card, sparkline, long-press expansion.
- `SmartAmount` — adaptive input (emerald/crimson/neutral glow).
- `SafeToSpend` — orbit ring around a daily budget value.
- `Sankey` — left-to-right cash-flow map, tokenized colors (`--sankey-needs`, `--sankey-wants`, `--sankey-investments`, `--sankey-income`).
- `GhostChart` — Recharts line with solid historical + dashed projection.
- `TransactionRow` — list row with icon chip, title, mono amount, delta.
- `KPICard`, `Badge`, `ProgressBar`, `ChartCard`, `FilterPills` — refactor existing to read tokens, align radii + paddings to spec.

### 3.6 Email templates
If `emails/*` (React Email) exists, re-theme every transactional template: magic link, welcome, receipt, subscription changes, password reset. Dark by default, with a light-mode fallback variant for clients that prefer-color-scheme light.

### 3.7 Meta / OG / favicon
- Replace favicon with `assets/brain-icon.svg` (both a `.svg` and a generated 32/180/512 PNG).
- Update `app/opengraph-image.tsx` (or create) — obsidian background, grid overlay, emerald keyword, wordmark bottom-left, tool screenshot or abstract Sankey bottom-right. Light-mode variant optional.
- Update `app/icon.tsx`, `app/apple-icon.tsx`, manifest colors (`theme_color` = `#0A0E14` dark, `#FAFAF7` light).

---

## 4. Light-mode generation — detailed spec

The token file already defines the light theme. Your job is to make sure **every component that looks right in dark also looks right in light**, and to invent the few rules the token file doesn't dictate.

### 4.1 How theming works
- `[data-theme="light"]` on `<html>` flips every CSS var. Default (no attribute, or `data-theme="dark"`) is dark.
- `prefers-color-scheme: light` sets the initial attribute on first visit if the user hasn't set one; after that, the persisted choice wins (localStorage key `cortex-theme`, matching `Nav.jsx`).
- The toggle lives in the top nav (see `Nav.jsx > ThemeToggle`). Same motion and glow in both modes.
- SSR: read the cookie/`data-theme` on the server to avoid a flash-of-wrong-theme. Next.js 16 + React 19 + server components — use `cookies()` in a root server component to stamp the attribute on `<html>`, and a small client script in `<head>` as a belt-and-suspenders anti-flash for users with JS.

### 4.2 Light-mode surface rules (invent where tokens leave it open)
- **Page background**: `--bg-canvas` = `#F7F7F3` (warm off-white, slightly papery). Avoid pure white; we want warmth.
- **Cards**: solid `#FFFFFF`, 1px `--border-default` border, `--shadow-card` real drop shadow (not glow). On hover → `--shadow-card-hover` + 2px lift.
- **Glass in light**: nearly opaque (`rgba(255,255,255,0.88)`) over a subtle blur. Don't attempt heavy frosted glass on white — it looks muddy. If a glass card sits over a light section, switch to the solid variant.
- **Aurora in light**: present but `<=12%` opacity, mostly emerald only. Kill the crimson heat and most of the info glow from light hero. Grid lines at `rgba(10,14,20,0.04)`.
- **CTA (primary) in light**: deepened emerald `#00A674` (or `#00C285`) to pass WCAG AA on both `#FFFFFF` card and `#F7F7F3` canvas. Ring + soft glow remain, but halved in alpha.
- **Links in prose**: `--emerald-700` in light, `--emerald-400` in dark, underline on hover only, `text-underline-offset: 3px`.
- **Code / inline mono**: light gets `#F2F2EE` background, dark gets `--obsidian-700`. Monospace stays JetBrains Mono.
- **Crimson in light**: keep `#FF3B30` for deltas but reduce the glow; negative chips use `--crimson-tint` bg + `--crimson-border`, not a glow. Never use a red shadow on light.
- **Dark CTA island stays dark in BOTH themes** — it's a "feature island." Use the hard-coded fixed colors already shown in `Blocks.jsx > PrinciplesCTA` (obsidian card bg, fixed white text, fixed mist). Do not token-swap this section.
- **Images / OG / screenshots**: generate both a dark and a light variant where they appear in-product. For OG, default to dark.

### 4.3 Accessibility budget (both modes)
- Body text ≥ 4.5:1 against its surface. Headings ≥ 3:1 large-text minimum.
- Emerald on white must use the deepened `#00A674` for small text and for any interactive text. Decorative emerald can stay `#00F0A0`.
- Focus outline visible on every interactive element. No `outline: none` without a replacement.
- Reduced motion: wrap every transform/opacity transition > 200ms in `@media (prefers-reduced-motion: no-preference)`. Disable the floating aurora blob animation and stagger under reduced motion.
- Touch target ≥ 44px. `.touch-feedback:active { transform: scale(0.97); }` under `(hover: none) and (pointer: coarse)`.

### 4.4 Specific component deltas by theme
Produce a short table in your PR description covering these:
Buttons (primary/secondary/ghost/icon), Input + SmartAmount, Select, Toggle, Slider, Card (default/glass/featured), KPI, Badge, ProgressBar, TransactionRow, Nav (unscrolled + scrolled), Footer, Modal/Sheet, Toast, Tooltip, Tabs, Table, Empty state, Skeleton, ChartCard (Recharts theming for both modes), PulseCard, SafeToSpend, Sankey, GhostChart.
For each, state: bg, border, text, shadow, hover, active, focus, disabled — in each theme. You can keep this concise (one line per state) but it must exist.

---

## 5. Implementation plan — do it in this order

**Phase 1 — Foundation (one PR)**
1. Copy `Cortex Design System/colors_and_type.css` → `app/tokens.css`. Import it at the top of `app/globals.css` *before* Tailwind's `@import "tailwindcss"`.
2. Extend Tailwind v4 theme via `@theme` in `globals.css` to expose the new tokens as Tailwind utilities (`bg-card`, `text-primary`, `border-default`, `shadow-card`, `rounded-xl`, `font-sans`, `font-mono`, `emerald-500`, etc.). Replace all `slate-*` / `indigo-*` / `purple-*` utilities across the repo with the new token-backed utilities. Use codemod-style find/replace per file, not a bulk regex on the whole repo (too risky).
3. Swap fonts in `app/layout.tsx` to Inter Variable + JetBrains Mono via `next/font/google`. Remove Geist imports.
4. Implement `ThemeProvider` (client) + SSR cookie stamp + `<Nav>` theme toggle behavior matching `Nav.jsx`.
5. Replace favicon + app icons with `brain-icon.svg` derivatives.
6. Ship. This PR should visually look "changed but not finished" everywhere — that's expected.

**Phase 2 — Marketing (one PR)**
1. Rebuild `app/page.tsx` to match `ui_kits/marketing/index.html`. Port `Nav`, `Hero`, `Tools`, `Philosophy`, `Pricing`, `PrinciplesCTA`, `Footer` as real React components into `components/marketing/*`. They should read tokens, not inline styles; convert the inline styles from the kit to Tailwind utility classes + a small amount of CSS in component `.module.css` where blur/mask/aurora patterns need it.
2. Re-theme pricing page, thinking, articles, changelog, roadmap, about, legal, 404, 500.
3. Regenerate OG image + manifest colors.

**Phase 3 — Auth + app shell (one PR)**
1. Re-skin auth UI (Supabase helpers). Verify email, magic link, reset flows visually match.
2. Rebuild `(app)/layout.tsx`: side nav, top bar, user menu, theme toggle, command palette if present.
3. Rebuild `DashboardHome.tsx` around Pulse cards + KPI strip + Ghost chart + Transaction list.

**Phase 4 — Tools sweep (one PR per 3–4 tools)**
1. Define a shared `ToolLayout` component (header, inputs panel, output panel, narration, disclaimer). Every tool extends it.
2. Port `SmartAmount`, `SafeToSpend`, `Sankey`, `GhostChart`, `PulseCard`, `TransactionRow` from `ui_kits/mobile` to `components/ui/` as TS + Tailwind. Replace the current Recharts chart cards with themed versions that set `--chart-*` vars explicitly (Recharts won't auto-inherit CSS vars — pass hex from JS that reads `getComputedStyle(document.documentElement).getPropertyValue('--chart-emerald')` at mount, and re-read on theme change).
3. Migrate each of the 13 tools to `ToolLayout`. Tighten copy where it drifts from the voice rules.

**Phase 5 — Polish + QA (one PR)**
1. Reduced-motion pass, focus-visible pass, keyboard nav pass.
2. Accessibility contrast audit (axe-core in CI or manual using the `design:accessibility-review` pattern). Fix anything below AA.
3. Visual regression screenshots of every route in both themes. Include in PR description.
4. Update `README.md` with theme usage + the existence of `app/tokens.css`.

---

## 6. Working rules while you code

- **No token drift.** If you need a color that isn't in `tokens.css`, open a design discussion in the PR rather than inlining a hex. Extend the token file if we genuinely need a new token.
- **No regression to slate/indigo/purple anywhere.** Grep for `slate-`, `indigo-`, `purple-`, `from-indigo`, `Geist`, `gray-` before declaring done.
- **Commits** are small, scoped, and tell the story. Conventional Commits (`feat(theme): …`, `refactor(ui): …`, `chore(fonts): …`).
- **Types first.** Every new component exports a TS prop type and default props. No `any`. No `@ts-ignore`.
- **Don't rename public URLs.** Marketing routes (`/pricing`, `/articles/...`) and app routes (`/tools/compound-interest`) keep their slugs. SEO must not regress.
- **Don't change analytics.** If we fire events, preserve names and payloads.
- **Don't touch Stripe price IDs, Supabase schema, or any server-only config.** If a visual change forces a schema change, stop and ask.
- **Copy changes are in-scope when** existing copy violates the voice rules (e.g. Title-Case headline, exclamation, emoji drift). Out of scope when it's just taste.
- **Every PR has**: before/after screenshots in both themes, a short design-delta note, and an "accessibility checks" section confirming contrast + focus + reduced motion + keyboard.

---

## 7. Questions to resolve with the user before Phase 2

Ask me (DJ) these before starting Phase 2, in a short bulleted list — don't assume:

1. Any routes I'm forgetting (check the repo's `app/` tree and list everything you re-themed vs. skipped).
2. Articles / thinking — do we have real content, or do you need placeholder copy?
3. Emails — do we use React Email today, or Postmark/Resend templates elsewhere?
4. 13th tool — confirm the exact list and slugs.
5. Do we ship a light-mode OG image, or dark-only?
6. Should the dashboard default to dark regardless of marketing theme? (My instinct: yes — the dashboard is a product surface where the brief always intended dark. Confirm.)

---

## 8. Definition of done

- Every route (marketing + auth + app + tools + legal + errors) renders correctly in **both** dark and light, with no leftover slate/indigo/purple/Geist references.
- Theme toggle in nav flips the site with no flash, persists, respects OS on first visit.
- All signature components (Pulse, SmartAmount, SafeToSpend, Sankey, GhostChart) exist in `components/ui/` with TS types and Storybook-equivalent preview routes in dev.
- Lighthouse a11y ≥ 95 on homepage and one representative tool page, in both themes.
- axe-core or manual contrast audit: zero AA failures on text, buttons, inputs.
- README updated to explain tokens + theming.
- PR descriptions contain the per-component theme delta table from §4.4 and before/after screenshots.

---

## 9. Start here

1. Confirm you can read `/Users/andrewjenkinson/Documents/Downloads/Cortex Design System/` (README, `colors_and_type.css`, both UI kits). List what you found.
2. Run the "Source of truth" read-order from §1.
3. Reply with:
   (a) One-paragraph summary of the design direction in your own words.
   (b) The concrete list of deltas you expect from the current repo (fonts, colors, surfaces, removed utilities, new components).
   (c) Any early questions.
4. Wait for my go-ahead, then open Phase 1 PR.

Do not start Phase 2+ without my review of Phase 1.
