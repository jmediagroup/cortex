# SEO & AI discoverability — how this site is wired

Last updated 2026-09-20. Supersedes `SEO_ACTION_PLAN.md` and
`SEO_IMPLEMENTATION_COMPLETE.md` (both historical, cortex.vip era).

## The one rule that matters most

**Tool pages must render their text on the server.** `lib/useToolPageData.ts`
calls `useSearchParams()`. On a static route, that hook forces the whole
subtree to client-render, so if it runs at page level the prerendered HTML
contains no `<h1>`, intro, FAQ or related links — Google eventually renders
the JS, but the AI crawlers we explicitly allow mostly do not.

Every `/apps/<tool>/page.tsx` is therefore a **server component** that renders
`ToolLayout` (heading, sub, narration, `CalculatorSEOContent`, `RelatedTools`)
and drops the interactive part into `components/app/ToolIsland.tsx`, a client
island with its own `<Suspense>` boundary. Only `/apps/budget` keeps its
calculator inline (it never used the hook). The search landing pages under
`/calculators/*` reuse the same island.

If you add a tool: copy an existing `page.tsx`, add the tool to
`TOOL_COMPONENTS` in `ToolIsland.tsx`, add its entry to
`lib/calculator-content.ts` (that single registry feeds the sitemap, llms.txt,
llms-full.txt, JSON-LD and the on-page FAQ), and add it to `DEFAULT_TOOLS` in
`components/marketing/ToolGrid.tsx` for the `/apps` hub.

## Structured data

- `app/layout.tsx` — one `Organization` (`#organization`, legal name J Media
  Group LLC, 512px logo at `/icon2`, contact point), one `WebSite` with a
  `SearchAction` pointing at `/articles?q=`, one site-level
  `SoftwareApplication`. **No aggregate rating** — self-reported ratings are a
  policy risk. Add social profiles under `sameAs` when they exist.
- Guides / articles / outlooks reference the publisher **by id only**
  (`{ '@id': '…/#organization' }`); the "Money Guy Mutants Research" author is
  its own node (`#research`) with `parentOrganization`.
- Tools: `BreadcrumbList` + `WebApplication` + `FAQPage` from
  `generateCalculatorJsonLd()` in `lib/calculator-content.ts`.
- Landing pages: `WebPage` + `BreadcrumbList` + `SoftwareApplication` +
  `HowTo` + `FAQPage` from `lib/landing-pages.ts`.
- `/apps`: `CollectionPage` + `ItemList`.

## Metadata conventions

- Root template appends ` | Money Guy Mutants`; page titles must **not** repeat
  it.
- Do not set `openGraph.images` / `twitter.images` on tool layouts — the
  `opengraph-image.tsx` file convention next to each route generates the card
  and Twitter falls back to it. (The old explicit paths pointed at PNGs that
  don't exist.)
- Every indexable route sets `alternates.canonical`. Personal/unbounded pages
  (`/s/<token>`, auth, `/design`) are `noindex`.
- Search Console / Bing: set `NEXT_PUBLIC_GOOGLE_VERIFICATION` /
  `NEXT_PUBLIC_BING_VERIFICATION` in Vercel.

## Machine-readable indexes

- `/sitemap.xml` (`app/sitemap.ts`) — tools derived from
  `CALCULATOR_CONTENT`, landing pages from `LANDING_PAGES`, guides/outlooks/
  articles from their content sources. Bump `toolsUpdated` when calculator
  logic or copy changes.
- `/robots.txt` (`app/robots.ts`) — explicit allow-list plus named AI
  crawlers. Add new public sections to `PUBLIC_PATHS`.
- `/llms.txt` — derived index (calculators, explainers, guides, outlooks,
  articles). `/llms-full.txt` — full plain-text corpus of guides, calculator
  intros + FAQs, landing-page copy, outlooks and articles.
- `public/ai.txt` — training/ingestion permissions.

## Search landing pages (`/calculators/*`)

Registry: `lib/landing-pages.ts`. Not linked from the nav on purpose; the hub
at `/calculators` and the sitemap link them. Every CTA carries
`?ref=lp-<slug>`, which signup stores as `signup_source` in user metadata and
`landing_page_view` / `landing_cta_click` events record with UTM params, so
paid campaigns can be measured end to end.

## Still open (needs product input)

- Social profile URLs for `sameAs`; verification tokens.
- A real About page with named authors (E-E-A-T for YMYL content).
- Un-dated guide slugs (`/guides/2026-09-20-…`) would need redirects.
- Deeper per-tool content (worked examples, formulas) in
  `lib/calculator-content.ts`.
