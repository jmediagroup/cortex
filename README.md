# Cortex

A decision-support platform built by J Media Group LLC — tools for thinking clearly about life's biggest decisions, starting with personal finance.

Built with Next.js 16, React 19, Tailwind v4, Supabase, Stripe, Recharts, and lucide-react.

## Getting started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

### Environment

The app expects these environment variables in local dev and production:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_FINANCE_PRO_MONTHLY_PRICE_ID
NEXT_PUBLIC_STRIPE_FINANCE_PRO_ANNUAL_PRICE_ID
RESEND_API_KEY
```

## Design system

Cortex ships on the **"Trust & Growth"** design system — an obsidian-canvas dark-first palette with a matching warm-paper light mode. The single source of truth lives in:

- `app/tokens.css` — verbatim copy of the Cortex Design System's `colors_and_type.css`. Contains every color, type scale, radius, shadow, motion easing, and aurora-glow variable. Dark values under `:root, [data-theme="dark"]`; light overrides under `[data-theme="light"]`.
- `app/globals.css` — imports `tokens.css`, then Tailwind, then an `@theme` block that exposes the tokens as utilities (`bg-card`, `text-primary`, `border-default`, `shadow-card`, `emerald-500`, `crimson-500`, `mist-400`, `obsidian-900`, `font-sans`, `font-mono`, `rounded-xl`, etc.).

### Theming

- `<html data-theme>` controls the active theme. `dark` is the default; `light` is an override.
- First visit with no preference → resolves from `prefers-color-scheme` before first paint via the inline script in `components/theme/ThemeScript.tsx`.
- User toggle persists to both `localStorage['cortex-theme']` and a `cortex-theme` cookie (SSR reads the cookie in `app/layout.tsx` to stamp `<html data-theme>` and avoid a flash).
- `components/theme/ThemeProvider.tsx` is the client-side provider. `components/theme/ThemeToggle.tsx` is the moon/sun pill used in the marketing nav.
- **Force-dark surfaces** — the authenticated dashboard (`/dashboard/*`) and tools (`/apps/*`) wrap their content in `<div data-theme="dark">` via `components/app/AppShell.tsx` so they stay obsidian regardless of the marketing toggle. The tokens apply because `:root, [data-theme="dark"]` match both root and any nested dark subtree.

### Typography

- **Inter Variable** (300–900) for body + display; **JetBrains Mono** for numeric / monospace. Both loaded via `next/font/google` in `app/layout.tsx`.
- Use `font-sans` / `font-mono` Tailwind utilities — the `@theme` block resolves them through `var(--font-inter)` / `var(--font-jetbrains)`.
- Weight hierarchy: 400 body, 500 medium, 600 eyebrow + balance-hero, 700 headlines, 900 reserved for explicit emphasis only (e.g. strong-weight emphasis inside a paragraph).
- Casing rules: sentence-case headlines ending in a period, `UPPERCASE TRACKED` eyebrow caps, Title Case buttons.

### Signature component primitives

| Component | Location | Ported from |
|---|---|---|
| `PulseCard` | `components/ui/PulseCard.tsx` | `ui_kits/mobile/PulseCard.jsx` |
| `Sparkline` | `components/ui/Sparkline.tsx` | embedded in `PulseCard.jsx` |
| `GhostChart` | `components/ui/GhostChart.tsx` | `ui_kits/mobile/GhostChart.jsx` |
| `TransactionRow` | `components/ui/TransactionRow.tsx` | `ui_kits/mobile/TransactionRow.jsx` |
| `SmartAmount` | `components/ui/SmartAmount.tsx` | `ui_kits/mobile/SmartAmount.jsx` |
| `SafeToSpend` | `components/ui/SafeToSpend.tsx` | `ui_kits/mobile/SafeToSpend.jsx` |
| `Sankey` | `components/ui/Sankey.tsx` | `ui_kits/mobile/Sankey.jsx` |

### Shells

| Shell | Used by | Behavior |
|---|---|---|
| `components/marketing/MarketingShell.tsx` | `/`, `/pricing`, `/articles/*`, `/terms`, `/enterprise`, placeholder routes, `not-found`, `error` | Marketing `Nav` + `Footer`; honors the theme toggle. |
| `components/app/AppShell.tsx` | `/dashboard/*`, `/apps/*` | Force-dark side nav + top bar + mobile tab bar; loads Supabase session + tier via `AppShellClient`. |
| `components/auth/AuthShell.tsx` | `/login`, `/signup`, `/reset-password` | Centered frosted-glass card over aurora + grid. Force-dark. |
| `components/app/ToolLayout.tsx` | every `/apps/*` tool page | Header (eyebrow + sentence-case title + sub), optional `ToolUpsellCta`, body, setup→pivot→land narration, NOT ADVICE disclaimer. |

### Charts

Recharts does not inherit CSS variables, so chart strokes/fills need literal hex values. Use `lib/useChartColors.ts` inside any chart component that needs to respond to theme flips — it reads the current token values from `:root` via `getComputedStyle` and re-reads on `data-theme` mutations via `MutationObserver`. Since `/apps/*` runs force-dark, hardcoded dark-mode hex values (`#00F0A0` emerald, `#5AC8FA` info, `#FF3B30` crimson, `#BF5AF2` purple, `#FFB800` warning, `#FF66C4` pink, mist neutrals) are used throughout the tool components today; the hook is available for any surface we later want to be theme-responsive.

### Developer preview

`/design` (noindex) renders every token bucket — swatches, type scale, radii, shadows, buttons, SmartAmount input, delta chips — in whichever theme is active. Toggle at top-right to verify light mode.

### Motion + a11y

- Easings: `--ease-out-expo` (0.16, 1, 0.3, 1) default, `--ease-spring-soft` for CTA press, `--ease-out-quart` for background color swaps.
- Durations: 120ms fast, 200ms base, 320ms slow, 520ms "vault".
- `@media (prefers-reduced-motion: reduce)` neutralizes every animation + transition globally in `globals.css` — plus named classes explicitly reset.
- `:focus-visible` safety net in `globals.css` paints an emerald outline on every interactive element that doesn't roll its own focus state. Opt out with `.focus-ring-none`.

## Architecture

- `app/` — Next.js App Router routes. Top-level: marketing pages. `app/dashboard/*` and `app/apps/*` are authenticated behind the force-dark `AppShell`. `app/api/*` are server-only routes (Stripe webhooks, Supabase user record creation, scenario persistence).
- `components/` — grouped by surface: `marketing/`, `app/`, `auth/`, `ui/`, `dashboard/`, `apps/`, `ai/`, `monetization/`, `charts/`, `seo/`, `theme/`.
- `lib/` — pure utilities + hooks (`useChartColors`, `useToolPageData`, `useScenarios`, `useRecentTools`, `validation`, `access-control`, Supabase client factories, WordPress article client, calculator content).
- `supabase/`, `emails/`, `wordpress/` — environment-specific assets.

## Scripts

```bash
npm run dev        # Turbopack dev server
npm run build      # Production build
npm run start      # Run the production build
npm run lint       # ESLint
npx tsc --noEmit   # Typecheck
```

## License

Proprietary — © Cortex Technologies.
