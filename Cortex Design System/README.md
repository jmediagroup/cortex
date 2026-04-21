# Cortex Design System

> Tools for Long-Term Thinking — a decision-support platform that makes invisible financial consequences visible.

## About Cortex

**Cortex** (cortex.vip) is a decision-support platform built by Cortex Technologies. The product positions itself as "a cognitive assistant—a place where logic, time, and consequence meet." The first suite, **Cortex Finance**, focuses on personal and small-business finance: interactive calculators and engines that let users see outcomes before they live them.

Core surfaces represented in the codebase:
1. **Marketing site** — landing page, pricing, articles, SEO-heavy
2. **Web app / dashboard** — auth-gated, app library of ~13 interactive finance tools, personalized onboarding
3. **Individual finance apps** — Compound Interest, Net Worth Engine, Retirement Strategy, Coast FIRE, Rent vs Buy, Geographic Arbitrage, Debt Paydown, S-Corp Optimizer, Gambling Redirect, Car Affordability, Index Fund Visualizer, Budget System

Product stance from the landing page:
- *"Most tools give answers. Cortex gives context."*
- *"Most platforms optimize for engagement. Cortex optimizes for clarity."*
- *"The goal isn't prediction. The goal is better judgment."*

## Source

Built from [jmediagroup/cortex](https://github.com/jmediagroup/cortex) — Next.js 16 + React 19, Tailwind v4, Supabase auth, Stripe, Recharts, lucide-react. Branch: `main`.

Key files studied:
- `app/globals.css` — full token definitions (all copied into `colors_and_type.css`)
- `app/layout.tsx` — Geist Sans + Geist Mono via `next/font`
- `app/page.tsx` — marketing landing page, sets visual tone
- `components/ui/*` — KPICard, Badge, ProgressBar, TransactionItem, CreditCardWidget, ChartCard, FilterPills
- `components/dashboard/DashboardHome.tsx` — authenticated shell reference

**Important reconciliation note:** The project brief shipped with aspirational brand-concept language ("Pulse cards," "Sankey cash-flow," "Vault transition," "Electric Emerald / Crimson Pulse," frosted-glass at 20%). The *shipped* codebase is softer and more restrained — light theme, slate neutrals, indigo/purple accent, subtle shadows, no glassmorphism, Geist instead of Inter. **This design system documents what the code actually ships**, not the aspirational concept. Flag this with the user if they'd like the aspirational direction built instead.

---

## CONTENT FUNDAMENTALS

### Voice
Clear, serious, intellectually self-respecting. Reads like a sharp editor who thinks the reader is smart. No hype, no finance-bro energy, no emoji-per-sentence.

### Tone pattern: **setup → pivot → land**
Landing copy repeatedly uses a three-beat structure that contrasts status quo with Cortex:
- *"Most advice is static."* → *"Cortex is interactive, scenario-based, and personal."*
- *"Life decisions don't fail because people are careless."* → *"They fail because the math is invisible…"* → *"Cortex builds interactive models that let you see outcomes before you live them."*

### Casing
- **Headlines**: Sentence case (`"Think clearly about life's biggest decisions."`) — never Title Case. Ends with a period for gravity.
- **Eyebrows / micro-labels**: `UPPERCASE TRACKED` in `text-xs font-bold tracking-widest` (examples: `DECISION-SUPPORT PLATFORM`, `AVAILABLE NOW`, `MOST POPULAR`).
- **Button copy**: Title Case, short, verb-first (`Get Started`, `Start Free`, `Explore the Tools`, `Try for Free`).
- **Card titles**: Title Case product-noun phrases (`Compound Interest Calculator`, `Net Worth Engine`, `Rent vs Buy Reality Engine`).

### Person
**You** (second person). Never "I" or "we" addressing the reader. Cortex speaks as "we" only when talking about the company itself in bios (`"We design for the part of your brain that plans…"`).

### Weights & emphasis
Weight does the emphasis, not italics or caps. Inline emphasis is achieved with `font-bold` or `font-black` on `text-slate-900` inside a `font-medium text-slate-500` paragraph. Example: *"Cortex builds interactive models that let you **see outcomes before you live them.**"*

### Emoji
**Rare.** Used only 3× on the entire landing page as subtle sector markers (`📋 🎓 📊`) inside a "Not advice / Not a course / Not a spreadsheet farm" trio. They are struck through (line-through, muted) — emoji is always in the *rejected* column, never in the confident column. **Do not add emoji to new Cortex copy unless strictly mirroring this pattern.**

### Product-surface language
Dashboard/app copy is neutral and informational. Examples: *"Revenue / Total Savings / Savings Rate"*, *"Compared to ($84,364 last month)"*, *"Built for smarter financial decisions."* Tabular data, percentage chips, no exclamations.

### Disclaimers / trust
- *"Not advice. Not a course. Not a spreadsheet farm."*
- *"Built on principles, not dark patterns."*
- *"No urgency traps. No pretending life is simple."*

### Examples to copy-paste
- Hero: `"Think clearly about life's biggest decisions."`
- Sub: `"Interactive financial models that turn complexity into clarity—so you can see outcomes before you live them."`
- Section eyebrow: `DECISION-SUPPORT PLATFORM`
- CTA pair: `Explore the Tools` / `Start Free`
- Closing line: `"Just clearer thinking—one decision at a time."`

---

## VISUAL FOUNDATIONS

### Colors
- **Accent / brand**: `#6c63ff` (`--primary-500` in app) and `#4f46e5` indigo-600 (marketing). Indigo→purple gradient (`from-indigo-600 to-purple-600`) is the signature treatment — used on logo mark, primary CTA buttons, "Most Popular" pill, pricing highlight.
- **Neutrals**: Tailwind `slate` scale end-to-end. `slate-900` for primary text, `slate-500` for secondary body, `slate-400` for tertiary, `slate-200` for borders, `slate-50` for tinted surfaces.
- **Semantic**: `#22c55e` emerald (positive / free / success), `#ef4444` red (negative), `#f59e0b` amber (warning), `#3b82f6` blue (info).
- **Chart palette**: purple / green / blue / orange / teal / pink — used via CSS vars in Recharts.

### Type
- **Family**: **Geist Sans** (primary) + **Geist Mono** (numeric/IBAN). Loaded via `next/font/google` in the shipped app.
- **Weights used**: 400, 500, 600, **700 / 900** (landing page leans hard on `font-black` for hero and card titles).
- **Scale extremes**: `text-7xl` hero (72px, `font-black`, `tracking-tight`, `leading-[1.08]`) down to `text-[10px]` pills.
- **Numeric**: `font-mono` + tabular figures for balances, card numbers, IBANs.
- **Tracking**: tight on display (`-0.02em`), widest on eyebrow caps (`0.15em`).

### Spacing & rhythm
- Section padding: `py-24 md:py-32` for marketing rhythm (very generous).
- Card padding: `p-4` (compact UI) → `p-6` (default card) → `p-8 lg:p-14` (hero containers).
- Max widths: `max-w-7xl` for full sections, `max-w-5xl` for text-heavy, `max-w-4xl` for manifesto-style blocks.
- Grid gap: `gap-4` / `gap-5` / `gap-6` — small and consistent.

### Corner radii
Heavy rounding is a signature — nothing is square:
- `rounded-xl` (12) on small chips/inputs
- `rounded-2xl` (16) default card
- `rounded-3xl` (24) on hero containers and the dark CTA block
- `rounded-full` (pill) on all buttons, badges, filter chips, nav links
Border radii feel almost iOS-widget: soft, friendly, tech-forward.

### Backgrounds & surfaces
- **White-dominant**. Body is `#ffffff`; sections alternate with `bg-slate-50/50` tinted bands separated by `border-y border-slate-100`.
- **Hero gradient**: three soft radial ellipses of indigo/purple at 12%/8%/6% opacity laid over white — atmospheric, not saturated.
- **Grid background** (`.grid-bg`): a 64px-grid of 3%-opacity indigo lines on the hero and dark CTA — extremely subtle, like graph paper.
- **Dark CTA block**: `bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950` with a 600×300 indigo-500/10 blur glow. Never pure black.
- **No photography** in the shipped codebase. No illustration system either. Visual weight comes from type + gradient icon chips.

### Animation
Highly consistent, understated:
- **Primary easing**: `cubic-bezier(0.16, 1, 0.3, 1)` ("spring out") — used on card fade-in, chart draw, hover lift.
- **iOS sheet easing**: `cubic-bezier(0.32, 0.72, 0, 1)` for slide-up panels.
- **Durations**: `200ms` (hover), `250ms` (card lift), `300–400ms` (entry), `500ms` (progress bars), `600ms` (chart draw).
- **Stagger**: children fade in at 60ms intervals (`.stagger-children`).
- **Float** (6s ease-in-out) applied to background blur blobs.
- **Shimmer** for skeleton loaders.
- **No bounces, no springs, no confetti** in the shipped code (despite the brief). Motion is restrained.

### Hover states
- **Buttons**: darken one shade (`bg-slate-900 → bg-slate-800`, `from-indigo-600 → from-indigo-700`), sometimes `translate-x-1` on trailing arrow icons.
- **Cards** (`.hover-lift`): `translate(-2px)` + upgrade shadow from `--shadow-card` to `--shadow-card-hover`.
- **Nav links**: add `hover:bg-slate-50` pill background + `hover:text-slate-900`.
- **Tool cards**: icon chip swaps from `bg-indigo-50 text-indigo-600` to `bg-gradient-indigo-to-purple text-white`.
- **CTA arrow icons**: `group-hover:translate-x-1 transition-transform`.

### Press / active states
Mobile only — via media query `(hover: none) and (pointer: coarse)`: `.touch-feedback:active { transform: scale(0.97); }`. Desktop gets hover only.

### Borders
Always `border-slate-200/80` (80% alpha for softness) or `border-slate-100`. Borders are universally 1px; thicker borders (`border-2 border-indigo-200`) are reserved for the featured pricing tier.

### Shadow system
Three tiers + one specialty:
- `--shadow-card`: `0 1px 3px rgba(0,0,0,.04), 0 1px 2px rgba(0,0,0,.06)` — resting default
- `--shadow-card-hover`: `0 4px 12px rgba(0,0,0,.08), 0 2px 4px rgba(0,0,0,.04)` — hover
- `--shadow-elevated`: `0 8px 24px rgba(0,0,0,.08), 0 2px 8px rgba(0,0,0,.04)` — popovers/tooltips
- Indigo glow: `shadow-lg shadow-indigo-200/50` under primary CTA buttons — subtle brand-colored drop

### Transparency & blur
- **Nav**: `bg-white/80 backdrop-blur-xl` sticky top — hallmark.
- **Eyebrow pills**: `bg-white/70 backdrop-blur` in hero.
- **Glow blobs**: `bg-indigo-400/10 rounded-full blur-3xl animate-float` behind hero.
- **Card-glow effect**: masked gradient border that appears on hover (`.card-glow::before`).

### Focus
`outline: 2px solid var(--color-accent)` + `outline-offset: 2px` + `border-radius: --radius-md`. Strong, visible, brand-colored.

### Layout rules
- Sticky top nav with `z-50` + blur.
- Every hero section has two floating blur blobs behind it, `pointer-events-none`.
- CTA buttons always pair: primary (gradient indigo) + secondary (white with slate border).
- Stats bars split with `border-t border-slate-100`.
- Mobile nav lives in a separate `MobileNav` component; desktop nav hides on `md:` breakpoint.

### Card anatomy
Default card: `bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6`. The `.card-glow` variant adds a masked-gradient border that only paints on hover — very subtle "reveal."

---

## ICONOGRAPHY

- **Library**: [`lucide-react`](https://lucide.dev) (`^0.562.0`). Exclusive — no custom icon system, no icon font.
- **Style**: 1.5–2px stroke, rounded joins, outline (no fills). Uses `size={14-22}` props, never CSS sizing.
- **Key glyphs in use** (verified in `app/page.tsx`): `Brain` (logo mark), `Zap`, `ArrowRight`, `Calculator`, `Building2`, `TrendingUp`, `TrendingDown`, `Car`, `Scale`, `Compass`, `Check`, `Lock`, `Sparkles`, `Landmark`, `MapPin`, `Wallet`, `BarChart3`, `Dices`, `BookOpen`, `Star`, `Shield`, `ChevronRight`, `Anchor`, `PiggyBank`, `MoreVertical`, `Plus`, `ChevronLeft`.
- **Icon chips**: Icons live inside rounded containers — the signature pattern is a `bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-600 p-3 rounded-xl` chip that transitions to `from-indigo-600 to-purple-600 text-white` on hover.
- **Logo mark**: The wordmark is the word `Cortex` in `font-black tracking-tight` next to a `Brain` icon in a gradient indigo-to-purple rounded square. `assets/brain-icon.svg` contains the app-icon version.
- **Emoji**: Essentially none (see Content Fundamentals). One defensive use only.
- **Unicode**: Em-dash `—` and curly quotes `'`/`"` used liberally in copy; `&copy;` in footer. No other unicode-as-icon usage.
- **SVGs**: Four generic utility SVGs shipped from Next.js boilerplate (`file.svg`, `globe.svg`, `window.svg`, `next.svg`) — *not* part of the brand. The one real brand SVG is `brain-icon.svg`.

### Using icons in this design system
- **Load from CDN**: `https://unpkg.com/lucide-static@latest/icons/<name>.svg` or use the lucide-react package in React work.
- **Default size in UI**: 16–22px depending on context.
- **Color**: always `currentColor` so `text-*` utilities cascade.

---

## INDEX

Root files:
- `README.md` — this file
- `SKILL.md` — Claude Code-compatible skill manifest
- `colors_and_type.css` — all design tokens + semantic type rules
- `assets/` — brain-icon.svg + supporting SVGs from the codebase
- `preview/` — Design System tab cards (Type, Colors, Spacing, Components, Brand)
- `ui_kits/marketing/` — landing-page UI kit (Next.js marketing site recreation)
- `ui_kits/dashboard/` — authenticated app dashboard UI kit (KPI cards, charts, transactions)

### UI Kits
| Kit | Surface | Entry |
|---|---|---|
| Marketing | cortex.vip landing | `ui_kits/marketing/index.html` |
| Dashboard | Authenticated web app | `ui_kits/dashboard/index.html` |

### Caveats
- **Fonts**: Shipped via Google Fonts CDN (`Geist` + `Geist Mono`) rather than self-hosted `.ttf` files. If an offline handoff is required, download from https://vercel.com/font and drop into `fonts/`.
- **No aspirational features built**: Sankey cash-flow diagrams, frosted-glass "Pulse" cards, and the "Vault" transition from the brief are **not** in the shipped codebase and are not included here. Flag with the user if they want those built as a forward-looking direction.
- **Icon set**: `lucide-react` is loaded via CDN (`unpkg.com/lucide-static`) for the static HTML previews — the production app uses the npm package.
