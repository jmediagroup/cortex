# Money Guy Mutants — Codebase Audit

**Purpose:** source material for public website copy describing two AI systems ("First Light" and "Lantern").
**Repo:** `jmediagroup/cortex` (package name `cortex-io`)
**Audit date:** 2026-07-27
**Method:** static reading of the repository at commit `6cacebf` (branch `main`). No running system, no database, no Vercel/Stripe/Supabase dashboards, no production logs were inspected.

**Reading this document.** Every claim is marked:

- ✅ **Verified** — read directly in the code, with a file path.
- ⚠️ **Inferred** — a reasonable conclusion from the code, not directly stated.
- ❌ **Unverifiable here** — needs a dashboard, a live system, or a person to confirm.

---

## 0. The two names

❌ The strings "First Light" and "Lantern" **do not appear anywhere in this codebase**. They are new marketing names being applied to existing systems. Mapping used throughout this report:

| Marketing name | Actual system in the code |
|---|---|
| **First Light** | The **Daily Investment Outlook** pipeline — a GitHub Actions job that runs Claude Code, researches the market via web search, and commits a Markdown post to `content/outlook/daily/`, which is then published at `/thinking` and emailed to subscribers. |
| **Lantern** | **"What's Your Why"** — a Pro-only, 8-question guided reflection whose answers are sent to the Anthropic Messages API and returned as a structured reflection. |

⚠️ The two systems are architecturally unrelated. They share no code, no model configuration, and no data. First Light produces public editorial content; Lantern produces private per-user output. They should not be described as one platform or one engine.

---

## 1. Platform overview

### Stack

✅ All from `package.json`, `next.config.ts`, `vercel.json`:

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.1.1 |
| UI | React / React DOM | 19.2.3 |
| Language | TypeScript | 5.9.3 |
| Styling | Tailwind CSS | v4 (via `@tailwindcss/postcss`) |
| Icons | lucide-react | ^0.562.0 |
| Charts | Recharts | ^2.15.0 |
| Database + Auth | Supabase (`@supabase/supabase-js`, `@supabase/ssr`) | ^2.48.1 / ^0.5.2 |
| Payments | Stripe (`stripe` server SDK + `@stripe/stripe-js`) | ^17.6.0 / ^5.7.0 |
| Transactional email | Resend | ^6.9.1 |
| Content parsing | gray-matter, remark, remark-gfm, remark-html, reading-time | — |

✅ **Hosting:** Vercel. Confirmed by `vercel.json` (with a `crons` block, a Vercel-specific feature), Vercel-specific IP headers in `lib/rate-limit.ts`, and `NEXT_PUBLIC_APP_URL` usage in Stripe redirect URLs.

✅ **Stripe API version pinned:** `2025-02-24.acacia` (`lib/stripe/server.ts`).

### Scale

✅ Counted directly:

| Metric | Count | How counted |
|---|---|---|
| TypeScript/TSX lines | **50,754** | `wc -l` over `app/ components/ lib/ emails/ scripts/` |
| TS/TSX source files | **320** | same set |
| Page routes (`page.tsx`) | **55** | `find app -name page.tsx` |
| API routes (`route.ts` under `app/api`) | **30** | `find app/api -name route.ts` |
| SQL migration files (`supabase/migrations/`) | **12** | directory listing |
| Additional loose `.sql` files at repo root | **6** | `database-migration.sql`, `supabase-migrations.sql`, `supabase-analytics-migration.sql`, `supabase-onboarding-migration.sql`, `supabase-tier-migration.sql`, `supabase-tier-migration-fixed.sql` |
| Distinct database tables referenced in code | **13** | see below |
| Published daily outlook posts | **65** | `content/outlook/daily/*.md` |
| Published weekly outlook posts | **1** | `content/outlook/weekly/*.md` |
| Published cornerstone guides | **5** (+2 non-post files) | `content/guides/*.md` |
| Scheduled jobs | **4** | 2 Vercel crons + 2 GitHub Actions schedules |

⚠️ The migration count is a floor, not a ceiling. Migrations live in two places (`supabase/migrations/` and loose root-level `.sql` files) with no ordering convention or migration-runner config, and several are written as "run this in the Supabase SQL Editor" runbooks rather than automated migrations. **The repository is not an authoritative record of the production schema.** Confirm against the live database before publishing any schema number.

✅ **Tables referenced in application code:** `users`, `scenarios`, `why_reflections`, `events`, `webhook_events`, `outlook_subscribers`, `outlook_email_sends`, `enterprise_leads`, `cms_content`, `cms_categories`, `cms_tags`, `cms_content_categories`, `cms_content_tags`.

### Scheduled jobs

✅ Four, from `vercel.json` and `.github/workflows/`:

| Job | Where | Cron (UTC) | Effect |
|---|---|---|---|
| Daily outlook **generation** | GitHub Actions (`daily-outlook.yml`) | `30 21 * * 1-5` | Runs Claude Code, commits a post to `main` |
| Daily outlook **email** | Vercel cron | `0 11 * * 1-5` | `GET /api/outlook/email/daily` |
| Weekly guide **generation** | GitHub Actions (`weekly-guide.yml`) | `0 9 * * 0` | Runs Claude Code, commits a guide to `main` |
| Weekly outlook **email** | Vercel cron | `0 11 * * 0` | `GET /api/outlook/email/weekly` |

⚠️ **Note a gap:** there is a *weekly email* cron but no *weekly outlook generation* job. The Sunday GitHub Action produces a **guide** (`content/guides/`), while the Sunday email reads from `content/outlook/weekly/` — which contains exactly one post, from 2026-04-26. The weekly email send therefore almost certainly no-ops (the route logs a warning and returns `sent: 0` when no post falls in its 7-day lookback). ❌ Not verified against production logs, but the code path is unambiguous.

### Build duration

✅ **First commit: 2026-01-03** ("Initial commit from Create Next App", `b5b8039`), followed the same day by commits labeled `v0.1` and `v0.2`.
✅ **Most recent commit: 2026-07-27.**
✅ **376 commits total** on `main`.

**Safe statement:** *"Built over roughly seven months, from early January 2026 to late July 2026, across 376 commits."*

⚠️ Commit dates show *when code landed*, not hours worked or continuous effort. Do not translate seven months into a claim about full-time development.

### Freemium mechanics

✅ Two tiers only (`lib/access-control.ts`): `free` and `finance_pro`.

✅ Pricing, from `lib/access-control.ts` and `app/pricing/page.tsx`:

| | Monthly | Annual | Stated saving |
|---|---|---|---|
| Free | $0 | $0 | — |
| Finance Pro | $9 | $90 | "Save $18/year" |

⚠️ The `$18/year` copy on the pricing page conflicts with the code's own arithmetic: `getAnnualSavings()` computes `(9 × 12) − 90 = $18`, so the number is internally consistent — but the pricing page labels the annual plan `$90` with period text `per month` in the plan object and switches display units in the UI. Worth a human read-through before quoting prices in marketing.

✅ **Gating mechanics — three distinct mechanisms:**

1. **Whole-app gating** (`hasAppAccess`): each app carries `tier: 'free' | 'pro'`. In `components/dashboard/AppLibrary.tsx`, **13 of 14 apps are `free`**. The only `pro` app is **What's Your Why**.
2. **Feature-level gating within apps** (`hasProAccess`): used server-side in `app/api/why/route.ts` to reject non-Pro users with `403 PRO_REQUIRED`, and client-side in `components/apps/WhatsYourWhy.tsx` to swap the tool for an upgrade card.
3. **Quota gating**: free accounts may save **1 saved scenario per tool**; Pro is unlimited (`app/api/scenarios/route.ts`, error code `FREE_LIMIT_REACHED`).
4. **Ads**: `lib/access-control.ts` shows ads/affiliate content to guests and free users; Pro is ad-free.

✅ Gating for the Pro AI feature is enforced **server-side before the model is called** — the tier check in `app/api/why/route.ts` precedes `synthesizeWhy()`. This is a real gate, not a UI-only one.

---

## 2. First Light — the Daily Investment Outlook system

**This section is the highest-risk area for overstatement. Read it carefully.**

### Architecture (the single most important fact)

✅ First Light is **not application code**. It is a **GitHub Actions workflow that invokes Claude Code as an agent**, which performs open web searches and commits a Markdown file to the repository.

`.github/workflows/daily-outlook.yml`:

```yaml
- name: Generate and publish daily outlook
  uses: anthropics/claude-code-action@v1
  with:
    claude_code_oauth_token: ${{ steps.oauth.outputs.token }}
    prompt: |
      /daily-outlook ${{ inputs.date || '' }}
      You are running in GitHub Actions. Commit the finished post directly to main —
      do NOT create a branch or open a PR.
    claude_args: "--allowedTools WebSearch,WebFetch,Bash,Read,Write,Edit --max-turns 50"
```

The agent follows a checked-in runbook at `.claude/commands/daily-outlook.md`, which in turn invokes a skill at `Daily Investment Report/SKILL.md` with a source list at `Daily Investment Report/references/sources.md` and an output template at `Daily Investment Report/assets/report-template.md`.

⚠️ **Consequence for marketing:** there is no data pipeline, no ingestion layer, no ETL, no API integrations with market data providers, and no database of market data. Describing First Light as a "data pipeline" or "signal ingestion engine" would misrepresent the architecture. What exists is *a scheduled, heavily-specified research agent with web access and a strict editorial contract.*

### Signals and data sources

✅ The agent is instructed to run **5–8 web searches** per run (`Daily Investment Report/SKILL.md`, Step 1):

1. Indices & macro — "S&P 500 Dow Nasdaq today"
2. Rates & yields — "10 year treasury yield today", "fed funds rate current"
3. Volatility — "VIX index today"
4. Currencies/commodities — "DXY oil gold today" (conditional)
5. Top headlines — "stock market news today", "biggest stock movers today"
6. Sector signals — "sector performance today S&P"

✅ Step 2 adds idea-generation searches: **analyst upgrades/downgrades**, **earnings released today**, **unusual volume or notable insider activity** (only where covered by reputable reporting), and multi-day thematic momentum.

✅ A tiered trusted-source list exists (`references/sources.md`):

- **Tier 1 (primary/institutional):** Federal Reserve, US Treasury, BLS, BEA, SEC EDGAR, company IR pages, CME FedWatch.
- **Tier 2 (financial press):** Reuters, Bloomberg, WSJ, FT, Barron's, The Economist.
- **Tier 3 (use with skepticism):** CNBC, MarketWatch, Seeking Alpha, Yahoo Finance.
- **Explicitly excluded:** anonymous social calls, Reddit hype threads, penny-stock newsletters, affiliate-driven "best stocks to buy now" content, pure TA with no fundamental grounding.

**Now, checking your specific list:**

| Signal you asked about | Status |
|---|---|
| **Market data** (indices, 10Y, VIX, DXY, oil, gold, sector performance) | ✅ **Verified** — explicit search instructions and a required snapshot table. |
| **Fed indicators** | ✅ **Verified** — fed funds rate is a named search; federalreserve.gov and CME FedWatch (rate-cut probabilities) are Tier 1 sources; the required "Watch list" section has a dedicated **Fed / central bank** line. |
| **World events** | ✅ **Verified in practice, not by name.** The skill never says "geopolitics," but the "Headlines & analysis" section and the geopolitical entries in the sources list produce it — and the published corpus is full of it (Iran/Strait of Hormuz, oil, tariffs, IMO shipping-fee coverage across many posts in `content/outlook/daily/`). |
| **Institutional selling** | ❌ **NOT verified. Do not claim this.** No instruction, source, or template field covers institutional flows, fund flows, 13F filings, dark-pool activity, or block trades. The closest instruction is *"unusual volume or notable insider activity (if covered in reputable reporting)"* — which is insider filings and volume anomalies as reported in the press, not institutional selling. This is a materially different claim. |

### Trigger, cadence, time of day

✅ From `daily-outlook.yml`:

- **Cron:** `30 21 * * 1-5` — 21:30 UTC, weekdays only.
- **Local time:** **5:30 PM ET during EDT**; the workflow's own comment notes it fires at **4:30 PM ET during EST**, and accepts that ("market data is available within minutes of the 4 PM close").
- **Manual trigger:** `workflow_dispatch` with an optional `YYYY-MM-DD` date input.
- **Timeout:** 30 minutes. **Max agent turns:** 50.

✅ **Safe statement:** *"Runs after the US market close on every weekday."* ⚠️ Avoid "every day at 5:30 PM ET" — half the year it's 4:30 PM ET.

✅ The email send is a **separate** job: Vercel cron `0 11 * * 1-5` hitting `/api/outlook/email/daily`. That's 11:00 UTC — **7:00 AM ET during EDT, 6:00 AM ET during EST**. So the post is written the evening before and delivered the next weekday morning.

### What the AI actually does with the raw inputs

✅ From `SKILL.md` Step 3 and the runbook's mandatory structure, the agent:

- **Selects and ranks** — "Lead with what matters"; if one dominant story exists, it goes first. 3–5 headlines survive; the rest are dropped as noise.
- **Classifies signal vs. noise** — "A 0.3% move on no news is noise. Flag actual catalysts."
- **Tabulates** — a fixed market-snapshot table (S&P, Nasdaq, Dow, 10Y, VIX, plus DXY/WTI/Gold when notable), each row with a level, a change, and a one-line context note.
- **Segments ideas into two buckets** — "long-term core" (quality, valuation, durability) vs. "opportunistic" (catalyst-driven, time-bound, with an explicit invalidation condition).
- **Requires a bear case for every idea.**
- **Quantifies** — price levels, P/E vs. sector median, FCF yield, dividend yield.
- **Produces a forward watch list** — earnings, economic data, Fed speakers, other catalysts.
- **Self-checks against a ~14-item checklist** before writing the file, including a hard stop if the disclaimer block is missing.

✅ There is a notably strong **source-corroboration protocol** in `.claude/commands/daily-outlook.md`, documented as "learned from prior runs":

- Headline market direction requires **≥2 independent sources**; if reputable outlets disagree, the lead is built from internals (movers, breadth, vol, rates) and the conflict is called out explicitly.
- **Index level and percent change must come from the same source** — "that's how you publish a fabricated close."
- **Every datapoint must be date-stamped** to the target date.
- **Sector leaders/laggards must be dropped entirely, not caveated,** if the freshest data is >2 trading days old.
- Single-stock moves ≥10% must be cross-checked against a second source.
- **"Never invent prices, headlines, or analyst calls. Better short than fabricated."**

⚠️ These are *instructions to a model*, not deterministic code. They are strong instructions and the corpus suggests they are followed, but they are not enforced by a validator. Marketing should say the system is *built around* a corroboration standard, not that it *guarantees* one.

### Does it genuinely reference historical market reactions? — read this before making the claim

This was your highest-priority precision question. Here is the precise answer.

❌ **There is no stored historical dataset.** No time-series database, no market-history table, no historical price files, no backtest fixtures anywhere in the repository.

❌ **There is no retrieval system.** No vector store, no embeddings, no RAG index, no similarity search over past events.

❌ **The skill and runbook never instruct the model to compare against historical conditions.** "Historical," "analog," "precedent," and "the last time" appear nowhere in `SKILL.md`, `.claude/commands/daily-outlook.md`, `references/sources.md`, or `assets/report-template.md`. The required section list contains no historical-comparison section.

✅ **Historical references nonetheless appear in the published output.** 33 of the 65 daily posts contain at least one of "historically," "the last time," or "precedent," plus many dated comparisons ("since 2007," "since 2020," "since 2021," "since 2022").

⚠️ **Mechanism, stated precisely:** historical framing in the posts is **emergent** — it comes from the model's own knowledge and from whatever historical context appears in the news articles it reads during its web searches. It is **not** produced by a stored dataset, **not** by retrieval, and **not** by an explicit instruction to perform historical comparison. It appears in roughly half the posts, not all of them, and is unverified for accuracy.

**Wording you can defend:**
> *"The analysis routinely places today's move in historical context — how similar conditions have played out before — drawn from the model's own knowledge and from the reporting it reads."*

**Wording you cannot defend:**
> ~~"Compares current events against a database of historical market reactions."~~
> ~~"Retrieves comparable historical episodes."~~
> ~~"Backtested against historical market data."~~

These would be false. There is no such database, no retrieval, and no backtest.

### Model / provider

⚠️ **The model is not pinned.** The workflow calls `anthropics/claude-code-action@v1` with no model argument, so it uses whatever default that action resolves to at run time. The provider is **Anthropic (Claude, via Claude Code)** — ✅ verified. The specific model version is ❌ **not determinable from this repository** and may have changed across the 65 published posts.

✅ Authentication is via `secrets.CLAUDE_CODE_OAUTH_TOKEN`, sanitized (whitespace-stripped) and masked with `::add-mask::` before use — a deliberate secret-hygiene step.

✅ Permissions granted to the agent: `--allowedTools WebSearch,WebFetch,Bash,Read,Write,Edit`, `contents: write`. It commits directly to `main` with git identity `cortex-bot`.

⚠️ **Governance note worth being aware of internally:** an autonomous agent has write access to `main` with no human review step (the workflow explicitly forbids opening a PR). This is a deliberate design choice, and the editorial safeguards are the checklist inside the runbook rather than a reviewer. Not a marketing point — a fact to know.

### Storage and presentation

✅ **Storage:** flat Markdown files in git at `content/outlook/daily/${DATE}-${slug}.md`, with YAML frontmatter (`title`, `date`, `type`, `summary`, `tickers` up to 6, `sectors` 1–3, optional `metaDescription`, optional `ogImage`). Not a database. Version-controlled, so every post has a full revision history.

✅ **Parsing:** `lib/outlook/content.ts` (169 lines) reads the directory at build time via `gray-matter`, validates the slug against `^[a-z0-9][a-z0-9-]*$`, coerces dates to ISO, and computes reading time.

✅ **Web presentation:** `/thinking` (index) and `/thinking/[slug]` (post), with `/thinking/rss.xml`, per-post OpenGraph images (`app/thinking/[slug]/opengraph-image.tsx`), and tag chips for tickers and sectors.

✅ **Email presentation:** `lib/outlook/runDigest.ts` (159 lines) drives the send:
- Extracts a **lead** — everything from the start of the body to the *second* `## ` heading (so "Top of mind" becomes the email preview).
- **Claims the send** by inserting into `outlook_email_sends` keyed on `(type, slug)`; a unique-constraint violation (`23505`) means it already went out and the run skips — a genuine double-send guard. `?force=1` allows a deliberate replay.
- Loads recipients from `outlook_subscribers` where `confirmed_at IS NOT NULL AND unsubscribed_at IS NULL` — **confirmed opt-in only**.
- Sends sequentially via Resend, then records `recipient_count`, `sent_count`, `failed_count`, `completed_at`.
- A **1-day lookback** for daily (7 for weekly) so a late-deploying post still goes out on the next run instead of being silently dropped.
- Warns loudly to logs when a scheduled send finds nothing to send.

✅ **Cron authentication:** the route **fails closed in production** if `CRON_SECRET` is unset, and otherwise requires `Authorization: Bearer $CRON_SECRET`. Local dev is permitted without it.

---

## 3. Lantern — "What's Your Why"

### Where the questions come from

✅ **Eight questions**, hardcoded as structured data in `lib/why/questions.ts` (98 lines). Not user-generated, not model-generated, not adaptive. Each has a stable `id` (used as the storage key — the file notes that renaming one is a data migration, not a copy edit), an `index`, a `prompt`, and a `subtext`.

| # | id | Prompt |
|---|---|---|
| 1 | `goals` | What are you hoping to achieve in your personal finance journey? |
| 2 | `spend_vs_save` | Do you get more enjoyment from spending or from saving and investing? |
| 3 | `fears` | What are your three greatest financial fears and concerns? |
| 4 | `unlimited` | If you had unlimited financial resources, what would you do more of or buy more of? |
| 5 | `wealthy` | What does "wealthy" look like to you? |
| 6 | `regrets` | What are your biggest financial mistakes or regrets? |
| 7 | `top_goals` | What are your top financial goals? |
| 8 | `time_machine` | The Time Machine Exercise (12 months / 5 years / 10 years) |

✅ All answers are **free text**. Not multiple choice. Capped at **1,500 characters each** server-side (`MAX_ANSWER_CHARS` in `app/api/why/route.ts`, with a comment explaining the cap was lowered from 5,000 to bound input-token cost).
✅ A minimum of **3 answered questions** is required, or the request is rejected with `TOO_FEW_ANSWERS` before any model call.
⚠️ ❌ The **origin** of the eight questions is not documented anywhere in the repo. They resemble a classic financial-planning "money biography" exercise, and Q7's "SMART goals" framing is a generic management concept. Whether they were adapted from a specific published source is unknown — worth confirming with a person before making any originality claim.

### What the AI actually does with the answers

✅ `lib/why/synthesis.ts` (215 lines) posts directly to `https://api.anthropic.com/v1/messages` (raw `fetch`, no SDK), with:

- **Model:** `claude-sonnet-5` — ✅ **pinned in code**, unlike First Light.
- **Provider:** Anthropic.
- `max_tokens: 2048`, `thinking: { type: 'disabled' }`, `output_config: { effort: 'low' }` — the code comments explain the reasoning: *"a synthesis/writing task — keep latency and cost low, not a deep multi-step reasoning task."*
- **Structured output enforced by JSON schema** (`SUMMARY_SCHEMA`, `additionalProperties: false`), so the response is guaranteed parseable into a fixed shape.
- **Token usage is logged** per call (`console.info('[why/synthesis] token usage', …)`) with an explicit expected range (~1k system + up to ~3k answers) so anomalies surface.
- Refusals (`stop_reason === 'refusal'`) are handled as a distinct `422`.

✅ **The output shape is a mirror, not an essay** — five discrete fields, deliberately so ("so the UI can present a mirror (not a wall of text)"):

| Field | Contract |
|---|---|
| `headline` | A single evocative line naming the person's underlying "why" |
| `mirror` | 2–4 sentences that make them feel understood |
| `themes[]` | **2–4 named themes drawn from across the answers**, each with a `title` and a 1–3 sentence `insight` |
| `tension` | The central tension or tradeoff worth sitting with |
| `nudge` | One small, clear, encouraging next step |

✅ **Yes, it genuinely finds patterns across answers.** This is architecturally real, not decorative:
- All eight answers are sent in a single labeled block (`buildAnswerBlock`), so the model sees them together, not one at a time.
- The `themes` field is explicitly specified as *"named themes drawn from across the answers."*
- The system prompt directs specific interpretive lenses at **specific named question clusters** (see below) — i.e. cross-answer reading is instructed, not incidental.

⚠️ "Cluster themes" is a fair plain-English description of the output. It is **not** clustering in the algorithmic sense — no embeddings, no vector math, no unsupervised grouping. It's a language model naming recurring themes. Avoid framing that implies a clustering algorithm.

### The five interpretive lenses

✅ The system prompt embeds five research-derived lenses, each **explicitly mapped to particular questions**, and each explicitly forbidden from appearing in the output:

> *"Interpretive lenses (use these to read the answers — they are your tools, NOT content to teach or cite to the person; **never name the theories or researchers in your output**)"*

1. **Self-Determination Theory** (autonomy, competence, relatedness) → read Q2 (spend/save), Q4 (unlimited), Q7 (top goals). Distinguishes self-integrated motivation from externally-driven/status motivation.
2. **Financial security and mental health** → read Q3 (fears), Q6 (regrets). Predictable income and emergency savings reduce financial stress.
3. **The income–happiness plateau** → read Q5 (wealthy) and Q8 (time machine). Used when the person names dollar amounts.
4. **Purpose precedes money** → read Q1, Q4, Q8. Money becomes meaningful when it serves something already cared about.
5. **Money as a tool for autonomy vs. escape or status** → read Q2, Q3, Q6.

⚠️ ❌ The prompt does not cite specific papers or authors, and the empirical claims are not sourced in the repo. Describe these as **interpretive frames grounded in established psychological and financial-wellbeing research** — which is how the code itself describes them — and do not attach named studies or effect sizes you cannot source.

### Does it connect answers to the Financial Order of Operations?

❌ **No. This is the single most important negative finding for Lantern's copy.**

- "Financial Order of Operations" appears **nowhere** in `lib/why/questions.ts`, `lib/why/synthesis.ts`, `app/api/why/route.ts`, or `components/apps/WhatsYourWhy.tsx`.
- The full-text search for FOO across the codebase returns only **five files**: `app/financial-mutants/page.tsx`, `app/the-money-guy-show/page.tsx`, `app/account/page.tsx`, `app/llms.txt/route.ts`, and `lib/outlook/email.ts` — all marketing/SEO/navigational surfaces.
- ⚠️ Further: there is **no FOO-specific calculator or tool** in the 14-app registry. The `/financial-mutants` page describes existing calculators as *"the surplus that funds the Financial Order of Operations"* — an association, not an implementation.

**Do not write copy saying Lantern maps a person's answers onto the Financial Order of Operations, sequences their FOO step, or tells them where they are in the FOO.** None of that exists. What is true: the reflection is positioned as the thing you do *before* tactical content — the system prompt says the tool *"helps a person understand their psychological relationship with money **before they touch any tactical wealth-building content**."* That framing is defensible.

### Prescriptive or purely reflective? — with the prompt text

✅ **Overwhelmingly reflective, with one deliberate, bounded prescriptive element.** Direct quotes from the system prompt in `lib/why/synthesis.ts`:

> *"Reflective and diagnostic first, **lightly prescriptive second**. **You are a mirror, not a lecture.**"*

> *"**Never generic financial advice. No wall of tips. One nudge, not ten.**"*

> *"Warm, specific, and grounded in **their own words** — quote or paraphrase details they gave you."*

> *"**Do not diagnose, moralize, or flatter.** Name what is really there, gently and honestly."*

> *"Address the person directly as 'you'. Do not restate the questions back to them."*

> *"If some answers are sparse or blank, work with what you have and **do not scold the person for skipping them**."*

✅ The one prescriptive surface is the `nudge` field: *"one small, clear, encouraging nudge toward what to do next"* / *"One small, clear, encouraging **nudge** toward what to do next."*

✅ The file's own header comment states the design intent plainly:

> *"Takes a user's eight answers and asks Claude Sonnet to reflect them back as a personalized, insight-driven summary… The research frameworks are woven into the system prompt as **interpretive lenses** — tools the model reads the answers through, **never content to cite to the user**."*

⚠️ **Honest compliance read:** the `nudge` field is a required output. Its content is not constrained by a schema, a keyword filter, or a validator — only by the prompt's "one small nudge, not generic financial advice" instruction. A nudge could, in a given run, come out as something a regulator would read as a personalized recommendation ("open a Roth IRA," "raise your 401(k) contribution to 15%"). See §7. ❌ I could not audit actual generated nudges — no reflections are stored in the repo, and the table is per-user and private.

### Storage and privacy

✅ **Table:** `why_reflections` (`supabase/migrations/create_why_reflections_table.sql`):

```sql
id UUID PRIMARY KEY,
user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
answers JSONB NOT NULL DEFAULT '{}',
summary JSONB NOT NULL DEFAULT '{}',
created_at TIMESTAMPTZ NOT NULL DEFAULT now()
```

✅ **Both the raw answers and the generated summary are stored**, in full, indefinitely. There is no retention policy or expiry for this table.
✅ **Row Level Security is enabled**, with three policies — SELECT, INSERT, and DELETE — each scoped to `auth.uid() = user_id`. **There is no UPDATE policy**, so reflections are effectively append-only and immutable at the database level.
✅ **Cascade delete:** deleting the auth user deletes their reflections.
✅ **Rate limited:** 5 reflections per 5 minutes per user (`RATE_LIMITS.whySynthesis`).
✅ **Graceful degradation:** if the model call succeeds but the database insert fails, the reflection is still returned to the user with `persisted: false` rather than being lost.
✅ ⚠️ **Third-party processing:** answers are transmitted to the Anthropic API for synthesis. That is inherent to the feature and should be disclosed. ❌ Whether a zero-retention or data-processing agreement is in place with Anthropic is not determinable from code.

⚠️ **Important nuance on "private to them."** The RLS policies are correct and restrictive. **However**, `app/api/why/route.ts` uses `createServiceClient()` — the Supabase **service-role** client, which **bypasses RLS entirely**. Isolation on the API path is therefore enforced by the explicit `.eq('user_id', auth.user.id)` filter in application code, with RLS as the backstop for any direct-from-client access. The filter is present and correct in the code as written. But the accurate claim is *"scoped to your account, enforced in both the database and the API"* — not *"the database makes it impossible for anyone to read your answers."* The service role can read everything, and so can anyone holding that key.

✅ **User-facing privacy copy already shipped**, `app/apps/whats-your-why/page.tsx`:
> *"Reflective self-assessment · not personalized financial or psychological advice · your answers are private to your account."*

That line is well-calibrated and consistent with the code. ⚠️ One caveat: it does not mention third-party AI processing.

---

## 4. Any other AI features

I searched the whole repository for `anthropic`, `claude-`, `openai`, `gpt-4`, and `ANTHROPIC_API`. **Exactly four files matched**, and two are the systems above.

| # | Feature | LLM? | Detail |
|---|---|---|---|
| 1 | Daily Investment Outlook (First Light) | ✅ Yes | §2 |
| 2 | What's Your Why (Lantern) | ✅ Yes | §3 |
| 3 | **Weekly Cornerstone Guide** | ✅ Yes | See below |
| 4 | `app/robots.ts` | ❌ No | Only names AI crawler user-agents (GPTBot etc.) in robots directives |

### 3. Weekly Cornerstone Guide — a third LLM system you did not mention

✅ `.github/workflows/weekly-guide.yml`, identical architecture to First Light:

- **Trigger:** cron `0 9 * * 0` — 09:00 UTC Sunday (**5:00 AM ET during EDT, 4:00 AM ET during EST**, per the workflow's own comment). Plus `workflow_dispatch` with an optional topic input.
- **Agent:** `anthropics/claude-code-action@v1`, same allowed tools (`WebSearch,WebFetch,Bash,Read,Write,Edit`), `--max-turns 50`, 30-minute timeout, same OAuth-token sanitization.
- **Runbook:** `.claude/commands/guide.md` — the agent **picks an undone topic** (from `content/guides/_topics.md`), researches it, writes a long-form evergreen explainer, **links it to Cortex's calculators**, commits directly to `main`.
- **Output:** `content/guides/*.md` — currently **5 published guides** (debt avalanche vs. snowball; Coast FIRE; capital gains tax on stocks; emergency fund sizing; rent vs. buy), all dated July 2026, i.e. weekly since 2026-07-02.
- **Presentation:** `/guides`, `/guides/[slug]`, `/guides/rss.xml`, per-guide OG images.
- **Model:** ❌ not pinned (same as First Light).

⚠️ This is a legitimate third AI system — an autonomous weekly research-and-publish agent. It is arguably the cleanest "AI does the work" story on the platform, and it is currently unnamed in your marketing.

### Things that look like AI but are not — flag these hard

❌ **`lib/ai/insights.ts` (141 lines) is not AI.** Its own header says so:

> *"Generates financial insights based on user data. **Currently uses rule-based templates.** Can be extended to call Claude API or other LLM providers…"*

It contains **zero** network calls. It is `if/else` logic over ratios. **But the strings it emits are written in the first person as an AI:**

- `"AI analyzed your last 30 days — expenses are N% below income."`
- `"AI detected your expenses are N% of income this month."`

❌ **`components/dashboard/BudgetOverview.tsx` contains a hardcoded fake prediction:**

```tsx
{/* AI prediction card (Image 10) */}
<AIInsightCard
  message="AI predicts you'll exceed your monthly budget by Sept 25 if spending continues at the current rate."
```

This is a static string in a component annotated `(Image 10)` — i.e. a design mockup transcribed into code. There is no prediction engine behind it. The adjacent `GenerateWithAI` button has `onClick={async () => {}}` — an empty handler.

✅ **Mitigating fact:** none of this is reachable by users. `BudgetOverview`, `AIInsightsPanel`, `AIInsightCard`, and `GenerateWithAI` are **not imported by any page or route** — verified by grep across `app/` and `components/`. `/api/ai/insights` exists as an endpoint but has no caller in the codebase, and it is **unauthenticated and unrate-limited**. The live `/apps/budget` tool contains no AI-branded copy at all.

⚠️ **Marketing implication:** the platform's AI surface area is **three scheduled/on-demand LLM systems**, not a pervasive AI layer. Do not let dead mockup code become a website claim. See "Do not claim."

❌ **The Financial Personality Quiz is not AI.** `lib/personality-quiz-data.ts` (545 lines) is a deterministic point-scoring model over six archetypes (optimizer, accumulator, fortress, tactician, visionary, steward), with Q5 as an explicit tiebreaker. No model call. It is a well-built quiz — just don't call it AI.

---

## 5. The rest of the platform

### Tools / calculators (14 total, `components/dashboard/AppLibrary.tsx`)

| Tool | Tier |
|---|---|
| Car Affordability | Free |
| Compound Interest Calculator | Free |
| Index Fund Growth Visualizer | Free |
| S-Corp Optimizer | Free |
| S-Corp Investment Optimizer | Free |
| Retirement Strategy Engine | Free |
| Coast FIRE Calculator | Free |
| Rent vs Buy Reality Engine | Free |
| Debt Paydown Strategy Optimizer | Free |
| Geographic Arbitrage Calculator | Free |
| Net Worth Engine | Free |
| Household Budgeting System | Free |
| Gambling Spend Redirect | Free |
| **What's Your Why** | **Pro** |

⚠️ Two further routes exist under `app/apps/` — `capital-gains-tax` and `personality-quiz/r/[archetype]` (shareable archetype result pages) — beyond the 14 registry entries.

### Other platform surfaces

✅ **Dashboard:** `/dashboard` plus `/dashboard/apps`, `/dashboard/scenarios`, `/dashboard/history`, `/dashboard/analytics`.
✅ **Saved scenarios:** save tool inputs and a `key_result` string; free = 1 per tool, Pro = unlimited; shareable via a token (`/s/[token]`, `app/api/scenarios/[id]/share`).
✅ **Onboarding:** `/onboarding` collects five structured answers (`describes_you`, `financial_focus`, `investing_status`, `own_or_rent`, `tool_familiarity`) stored on `users.onboarding_answers`, feeding `lib/onboarding-recommendations.ts` — ⚠️ deterministic rules, not AI.
✅ **Content:** `/thinking` (65 daily + 1 weekly outlook), `/guides` (5 cornerstone guides), `/articles` (imported from WordPress — see `supabase/migrations/import_wordpress_articles.sql` and the `wordpress/` directory). RSS feeds for all three.
✅ **Custom CMS:** `/admin/content` with 5 tables (`cms_content`, `cms_categories`, `cms_tags`, and two join tables), 6 admin API routes including media upload and preview. Documented in `CMS.md`.
✅ **Admin:** `/admin/analytics`, `/admin/users`, `/admin/subscriptions`, `/admin/content`.
✅ **Analytics:** first-party event tracking into an `events` table, with an `event_analytics` view and a `delete_old_events()` function that **purges events older than 90 days**.
✅ **Marketing/SEO:** `/financial-mutants`, `/the-money-guy-show`, `/pricing`, `/about`, `/roadmap`, `/changelog`, `/terms`, `/security`, `/enterprise`, `/design`, plus `llms.txt` and `llms-full.txt` routes (machine-readable site descriptions for AI crawlers).
❌ **Community:** there is **no community feature** — no forum, comments, profiles, or social layer. Do not claim one.

### Subscription / billing

✅ Stripe Checkout in `subscription` mode, card payments, `allow_promotion_codes: true`.
✅ `userId` written to metadata on **both** the checkout session and the subscription, so the webhook can always resolve the user.
✅ Webhook handler at `/api/webhooks` with an idempotency/audit table (`webhook_events`).
✅ **Reconciliation fallback:** `success_url` carries `session_id`, and `/api/verify-checkout` lets `/dashboard` reconcile the tier server-side "if the webhook is delayed or fails" — a real reliability measure.
✅ Customer portal via `/api/create-portal-session`; direct cancel via `/api/cancel-subscription`.
✅ Price-ID → tier mapping centralized in `lib/stripe/tier.ts`, shared by the webhook and the verify path.
✅ Self-serve account deletion at `/api/delete-account`.

### Notifications and email

✅ **Provider:** Resend, one instance in `lib/email.ts`; sender is on the `@moneyguymutants.com` domain (a code comment notes Resend domain verification post-cutover).
✅ **Six branded auth email templates** in `emails/` — verification, magic link, password reset, change email, invite, reauthentication.
✅ **Outlook newsletter** with a full lifecycle: `/api/outlook/subscribe` → double opt-in via `/api/outlook/confirm` → send → `/api/outlook/unsubscribe` (token-based), landing on `/thinking/subscribed` and `/thinking/unsubscribed`. Subscribe is rate-limited to 5 per 5 minutes per IP.
✅ **Only confirmed, non-unsubscribed addresses receive sends** — enforced in the query, not just the UI.
✅ Enterprise lead notification email (`/api/enterprise-lead`, rate-limited).

---

## 6. Security and data controls

**No certifications are claimed or implied anywhere below. These are controls present in the code, nothing more.**

### Authentication

✅ Supabase Auth — email/password and passwordless magic links.
✅ Root `middleware.ts` runs `updateSession` on every non-static request, refreshing the session cookie at the edge and guarding authenticated routes. ⚠️ Its own comment records that this helper *"existed but was never wired up, so no session refresh or server-side protection ran at all"* before the fix — i.e. this was a real gap that was closed.
✅ API routes authenticate via `Bearer` token validated through `supabase.auth.getUser(token)` (`lib/auth-helpers.ts`), with distinct handling for expired vs. invalid tokens.
⚠️ **Admin access is an email allowlist** from `NEXT_PUBLIC_ADMIN_EMAILS` (`lib/admin.ts`). The `NEXT_PUBLIC_` prefix means **the admin email list is exposed in the client bundle** — deliberate (the comment says it's so client components can read it), but it does publish who the admins are. Not a privilege escalation on its own; still worth knowing.

### Row-level security

✅ RLS enabled with per-user policies on `why_reflections` (SELECT/INSERT/DELETE on `auth.uid() = user_id`) and `scenarios` (same three).
✅ RLS enabled on `webhook_events` with service-role-only policies.
✅ `fix_security_issues.sql` is a dedicated hardening migration that: enabled RLS on `webhook_events`; converted the `event_analytics` view from SECURITY DEFINER to `security_invoker = true`; and set an explicit `SET search_path = public` on four SECURITY DEFINER functions (`delete_old_events`, `get_user_event_summary`, `handle_new_user`, `update_updated_at_column`) to prevent search-path injection.
✅ A further migration, `secure_users_update_and_definer_execute.sql`, tightens update and execute permissions.
⚠️ As noted in §3, API routes use the **service-role client**, which bypasses RLS. Per-user isolation on those paths depends on explicit `user_id` filters in application code. Both layers are present; describe them as defense in depth, not as RLS alone.

### Encryption

⚠️ ❌ **No application-level encryption of stored data.** Reflection answers and scenario inputs are stored as plaintext JSONB. Transport is HTTPS (Vercel + Supabase + Anthropic API all TLS), and Supabase/Vercel provide encryption at rest at the infrastructure layer — but that is a **platform** property, not something this codebase implements, and I cannot verify the provider configuration from here. **Do not claim "your data is encrypted" as a product feature.** You can accurately say data is transmitted over HTTPS and stored in a managed Postgres instance.

### Secrets handling

✅ `.gitignore` excludes `.env*` and `*.pem`. `git ls-files` returns **no committed env files** — clean.
✅ All secrets read from environment: `ANTHROPIC_API_KEY`, `STRIPE_SECRET_KEY`, `RESEND_API_KEY`, `CRON_SECRET`, Supabase keys, `CLAUDE_CODE_OAUTH_TOKEN`.
✅ `ANTHROPIC_API_KEY` is used only in `lib/why/synthesis.ts`, which is marked server-only in its header comment and reached only through an API route — it never enters a client bundle.
✅ `lib/outlook/content.ts` imports `server-only` as a hard build-time guard.
✅ GitHub Actions sanitizes and `::add-mask::`s the OAuth token before use.
✅ `lib/safe-redirect.ts` exists — ⚠️ presumably open-redirect protection on auth callbacks; I did not read it line by line.

### Rate limiting

✅ `lib/rate-limit.ts` — in-memory sliding window with periodic cleanup, plus multi-header client-IP extraction (`x-forwarded-for`, `x-real-ip`, `x-vercel-forwarded-for`, `cf-connecting-ip`).

| Endpoint | Limit |
|---|---|
| **What's Your Why synthesis** | **5 per 5 min per user** |
| Checkout | 10/min per IP |
| Cancel subscription | 5/min per user |
| Portal session | 10/min per user |
| Stripe webhook | 100/min per IP |
| Email resend | 3 per 5 min per email |
| Outlook subscribe | 5 per 5 min per IP |
| Enterprise lead | 10/min per IP |
| General | 60/min per IP |

⚠️ **Material limitation, stated in the file's own comment:** the store is a `Map` in process memory, cleared on serverless cold start. On Vercel's serverless model each instance keeps its own counter, so the effective limit is per-instance, not global. The file itself recommends Redis/Upstash for production scale. **This is basic abuse protection, not a hard guarantee.** Do not describe it as enterprise-grade rate limiting.

### How personal financial data is protected — the honest summary

✅ Financial data on this platform is mostly **ephemeral**: calculators run client-side and persist nothing unless the user explicitly saves a scenario.
✅ What *is* persisted: `scenarios` (tool inputs + a result string) and `why_reflections` (free-text answers + generated summary), both per-user, both RLS-protected, both cascade-deleted with the account.
✅ **Card data never touches the platform** — Stripe Checkout is hosted; the app stores only `stripe_customer_id` and `stripe_subscription_id`.
❌ **No bank/brokerage connections.** No Plaid, no account aggregation, no credentials, no balances. This is a genuinely strong privacy position and is worth stating — the platform can't leak account data it never collects.
✅ Analytics events auto-purge after 90 days.
✅ Self-serve account deletion exists.

✅ The shipped `/security` page is accurate and appropriately modest:
> *"Authentication. Email + password or passwordless magic links via Supabase. Sessions use httpOnly cookies over HTTPS."*
> *"Billing. Payments are processed by Stripe. We never see or store your card."*
> *"Data. Your saved scenarios are stored in a row-level-secured Postgres (Supabase) database — only you can read them."*

⚠️ One correction to that page: "only you can read them" is true for direct client access under RLS, but the service role — and anyone holding that key — can read all rows. Consider softening to "only you can read them through the app."

---

## 7. Compliance and language review

### Disclaimers present in the product

✅ **Money Guy Show non-affiliation** — present and consistently worded across **six surfaces**, i.e. it appears on essentially every page:

| Location | Coverage |
|---|---|
| `components/marketing/Footer.tsx` | Site-wide footer |
| `components/app/ToolLayout.tsx` | Every calculator/tool page |
| `components/auth/AuthShell.tsx` | Login/signup screens |
| `app/financial-mutants/page.tsx` | FAQ answer + page footer |
| `app/the-money-guy-show/page.tsx` | Meta description, FAQ, hero, footer |
| `app/llms.txt/route.ts` | Machine-readable site description for AI crawlers |

Canonical wording:
> *"Money Guy Mutants is an independent, fan-made project built by personal-finance enthusiasts. We are not affiliated with, endorsed by, or sponsored by The Money Guy Show or Abound Wealth Management, LLC. 'The Money Guy Show' and related marks are the property of their respective owners."*

**This is well done.** It names the specific entities (including Abound Wealth Management, LLC), acknowledges trademark ownership, and appears above the fold on the pages most likely to create confusion.

✅ **Financial-advice disclaimers:**

| Location | Text |
|---|---|
| `app/financial-mutants/page.tsx` FAQ | *"Money Guy Mutants provides educational tools only. Nothing here is financial, legal, or tax advice. Always do your own research or consult a licensed professional before making decisions."* |
| `app/terms/page.tsx` | *"No professional advice. Information provided on our sites is for informational purposes only and does not constitute professional, legal, or financial advice."* |
| `app/apps/whats-your-why/page.tsx` | *"Reflective self-assessment · not personalized financial or psychological advice · your answers are private to your account."* |
| `components/app/ToolLayout.tsx` | Per-tool `disclaimer` prop rendered in every tool footer |
| `components/apps/RentVsBuyEngine.tsx` | *"This is a simulation, not financial advice."* |
| `components/apps/IndexFundVisualizer.tsx` | *"Historical averages are not indicative of future performance. This tool is for educational purposes only."* |
| `components/apps/SCorpInvestmentOptimizer.tsx` | *"Consult a tax professional for personalized advice."* |
| Every daily outlook post | Mandatory verbatim block (below) |

✅ **The daily-outlook disclaimer is enforced by contract, not convention.** Both `SKILL.md` and `.claude/commands/daily-outlook.md` make it a hard publish gate — *"if the disclaimer is missing or altered, the post must not be saved."* Posts also open with an inline callout: *"Research and idea generation for personal use. Not investment advice. See full disclaimer at the bottom."* The full block covers: not advice / not an offer or solicitation; sources not guaranteed; data may be stale; **"ideas are research candidates, not recommendations, and do not consider any specific person's financial situation, objectives, or risk tolerance"**; consult a licensed advisor; past performance does not predict future results.

### Copy that could read as personalized financial advice — flagged

**🚩 1 — Highest risk: the daily outlook publishes named tickers with theses.** Each post contains "Ideas — long-term core" and "Ideas — opportunistic" sections with specific tickers, entry framing, valuation notes, catalysts, invalidation levels, and horizons. The **mitigations are unusually strong**: the skill mandates hypothesis framing (*"'watch list candidate,' 'potential setup,' 'worth researching' — **never 'buy this now'**"*), a bear case for every idea, and the verbatim disclaimer. The portfolio section is explicitly constrained to allocation, *"Not: 'Sell 5% of NVDA.'"*

⚠️ Nonetheless: **this is a public newsletter naming specific securities with directional framing**, distributed by email to a subscriber list, gated behind no advisory relationship. That is a regulatory posture question, not a code question. **Get a securities lawyer to look at it before you build a marketing campaign around it.** Nothing in the codebase can resolve this for you.

**🚩 2 — Portfolio-level output is written in second-person imperative.** The template's example is *"Concentration in tech remains elevated — consider trimming if overweight."* That reads as guidance to a reader whose portfolio the system has never seen. The disclaimer covers it; the sentence construction still invites the reading.

**🚩 3 — Lantern's `nudge` field is a required prescriptive output with no content guardrail.** The prompt says "one small nudge, not generic financial advice," but nothing structurally prevents a nudge like *"start a Roth IRA"* or *"increase your savings rate to 25%."* ⚠️ **Recommendation:** add an explicit constraint to the system prompt that the nudge must be **behavioral or reflective** (e.g. "talk to your partner about this," "write down what 'enough' means to you") rather than a **product, account, allocation, or dollar-amount recommendation**. That is a one-paragraph change and it materially de-risks the feature.

**🚩 4 — Dead code contains fabricated AI claims about a user's finances.** `"AI predicts you'll exceed your monthly budget by Sept 25…"` and `"AI analyzed your last 30 days…"` are hardcoded/rule-based, present themselves as AI analysis of the user's actual data, and are not reachable by users. ⚠️ **Recommendation:** delete `components/dashboard/BudgetOverview.tsx`, the `components/ai/` mockup components, and `/api/ai/insights` — or at minimum, strip the "AI analyzed/detected/predicts" phrasing from `lib/ai/insights.ts`. It is currently harmless because nothing renders it; it becomes a false-advertising problem the moment someone wires it up, and it undermines the credibility of the two AI systems that are real.

**🚩 5 — `/api/ai/insights` is unauthenticated and unrate-limited.** It accepts arbitrary financial figures in a POST body and returns rule-based strings. No caller exists. Low severity today (no LLM, no data access), but it is an open endpoint that should be removed with the rest of the mockup code.

**Green flag:** the tools themselves are careful. Every calculator page renders a disclaimer through `ToolLayout`, and the tax-adjacent tools name a professional explicitly.

### Language that could imply Money Guy Show endorsement — flagged

The non-affiliation disclaimers are strong and pervasive. These are the residual risks, in descending order:

**🚩 1 — The product name itself.** "Money Guy Mutants" contains "Money Guy." "Financial mutants" is the show's own term for its audience. The `/the-money-guy-show` route sits on your domain. ⚠️ Disclaimers reduce confusion; they do not eliminate a trademark question. **This is a lawyer question, and it should be asked before a public marketing push, not after.** Note that the code is already careful here: `app/the-money-guy-show/page.tsx` states *"every video here opens on YouTube, where the creators get the view."*

**🚩 2 — SEO metadata that a search engine may render without the adjacent disclaimer.** `app/financial-mutants/page.tsx` meta description: *"Free calculators and decision engines for financial mutants and fans of the Money Guy Show… an independent community project inspired by the moneyguy method."* The OpenGraph description at line 36 is shorter and **omits the "independent" qualifier entirely**: *"Free calculators and decision engines for financial mutants and fans of the Money Guy Show — model the Financial Order of Operations and watch your money compound."* ⚠️ That string is what renders on a social-media share card, detached from any footer. **Recommendation:** add "independent fan project" to every OG/Twitter description that names the show. The `/the-money-guy-show` page already does this correctly — mirror it.

**🚩 3 — "Do your tools follow the Financial Order of Operations?"** (`app/financial-mutants/page.tsx` FAQ). Framing tools as *following* a named third-party framework edges toward implied authorization. ⚠️ Prefer "inspired by" / "let you run your own numbers on" — which is the wording used elsewhere on the same page and reads as clearly independent.

**🚩 4 — "the moneyguy method"** (lowercase, in the `/financial-mutants` meta description). Presenting a third party's brand as a generic method name is a small but real trademark-adjacent risk.

**🚩 5 — Sender identity.** Outlook emails send from an `@moneyguymutants.com` address. ❌ I could not verify whether the email templates carry the non-affiliation line — `lib/outlook/email.ts` references FOO but I did not audit the rendered footer. **Check this.** An email that arrives in an inbox with "Money Guy" in the sender domain and no disclaimer in the body is the highest-confusion surface in the product.

---

## 8. The user problem, in plain language

### First Light — the Daily Investment Outlook

Every weekday after the market closes, a research agent goes out and reads the day: index levels, the 10-year, the VIX, oil, sector rotation, the day's real headlines, the analyst moves, the earnings that landed. It cross-checks the numbers against more than one reputable source before it writes anything down — and if the sources disagree, it says so rather than picking one. Then it does the part that actually takes judgment: it decides what mattered and what was noise, ranks the three-to-five stories worth your attention, separates durable long-term ideas from short-horizon catalyst setups, and attaches a bear case to every single one. What it saves you is the ninety minutes of tab-juggling across Reuters, the Treasury yield curve, an earnings calendar, and six ticker pages — and the harder thing after that, which is holding all of it in your head at once long enough to see the shape of the day. It hands you the read; you keep every decision.

### Lantern — What's Your Why

Most people never write down why they want money — they just chase the number and wonder why hitting it doesn't feel like anything. Lantern asks eight questions that are genuinely uncomfortable to answer honestly: what you actually fear, what you regret, what "wealthy" means to you in dollars, what you'd do with unlimited resources. Then it reads all eight answers together and tells you what it sees running underneath them — two to four named themes in your own words, the central tension you're living with, and one small thing to do next. What it saves you is the thing almost nobody does alone: sitting with your own answers long enough to notice the pattern connecting them. It's a mirror, not a plan — the system prompt literally says *"you are a mirror, not a lecture"* — and it names what's there without telling you what to want.

---

## Do not claim

Every item below is either false, unverifiable from this codebase, or materially overstated. Ranked by how badly it would hurt if published.

### Flatly false — these would be wrong

1. ❌ **"Tracks institutional selling."** No such signal exists anywhere in the system. Nothing about fund flows, 13Fs, dark pools, or block trades.
2. ❌ **"Compares events against a historical database of market reactions"** / "retrieves comparable historical episodes" / "backtested." There is no dataset, no retrieval, no vector store, no backtest. Historical context appears in about half the posts and comes from the model's knowledge and the articles it reads. Use: *"places today's move in historical context, drawn from the model's own knowledge and the reporting it reads."*
3. ❌ **"Lantern maps your answers to the Financial Order of Operations"** — or sequences your FOO step, or tells you where you are in the FOO. Zero connection exists in the code. FOO appears only on marketing/SEO pages.
4. ❌ **"AI-powered budgeting"** / "AI spending predictions" / "AI analyzes your transactions." The only code doing this is unreachable mockup code with hardcoded strings and rule-based `if/else`. No LLM, no data access, not rendered.
5. ❌ **"Community"** — no forum, comments, profiles, or social features exist.
6. ❌ **"Connects to your accounts"** / "syncs your portfolio." No Plaid, no aggregation, no credentials. (The *absence* is a selling point — lead with it.)

### Unverifiable from the code — do not state as fact

7. ❌ **Any specific model version for First Light or the weekly guide.** Neither pins a model. Only Lantern does (`claude-sonnet-5`). "Powered by Claude" is safe for all three; a version number is not.
8. ❌ **Any certification, audit, or compliance standard** — SOC 2, ISO, PCI, GDPR/CCPA compliance. Nothing in the codebase substantiates any of it. Describe controls, never certifications.
9. ❌ **"Encrypted"** as a product feature. No application-level encryption exists. HTTPS in transit and managed-Postgres at-rest encryption are platform properties you cannot verify from here.
10. ❌ **User counts, subscriber counts, engagement, revenue, uptime.** None are in the repo.
11. ❌ **The origin of the eight Lantern questions.** Undocumented. Do not claim they are original, proprietary, or derived from a named source.

### True but easy to overstate — tighten the wording

12. ⚠️ **"Runs at 5:30 PM ET daily."** It is weekdays only, and 4:30 PM ET for half the year. Say *"after the US market close, every weekday."*
13. ⚠️ **"Guaranteed source verification"** / "every fact verified." The corroboration rules are strong **instructions to a model**, not a validator. Say *"built around a two-source corroboration standard."*
14. ⚠️ **"Clusters themes"** in the algorithmic sense. It's a language model naming recurring themes across eight answers, with no embeddings or vector math. "Finds the patterns across your answers" is accurate; "clustering algorithm" is not.
15. ⚠️ **"Enterprise-grade rate limiting."** It's an in-memory `Map` that resets on cold start and is per-instance on serverless. The file itself recommends Redis for production. Say *"rate-limited to prevent abuse."*
16. ⚠️ **"Only you can ever read your reflections."** RLS is correctly configured, but the API path uses the service-role client, which bypasses RLS. Say *"scoped to your account and enforced in both the database and the API."*
17. ⚠️ **"Your data never leaves the platform."** Lantern transmits answers to the Anthropic API. Disclose it.
18. ⚠️ **"Purely reflective, never prescriptive."** The `nudge` field is prescriptive by design. Say *"reflective first — one small nudge, not a prescription,"* which is what the prompt actually specifies.
19. ⚠️ **"Weekly market outlook."** There is a weekly *email cron*, but no weekly outlook *generator* and only one weekly post, from April. The Sunday agent produces **guides**, not outlooks. Either fix the pipeline or don't advertise a weekly outlook.
20. ⚠️ **"18 migrations"** or any precise schema number. Migrations live in two directories with no runner and several are manual runbooks. Confirm against the live database first.
21. ⚠️ **"Seven months of full-time development."** Seven calendar months is verified; effort is not.

### Fix before launch

22. 🔧 Delete or de-brand the fake AI mockup code (`components/dashboard/BudgetOverview.tsx`, `components/ai/*`, `/api/ai/insights`, and the "AI analyzed/detected/predicts" strings in `lib/ai/insights.ts`).
23. 🔧 Add the "independent fan project" qualifier to **every** OpenGraph/Twitter description that names the Money Guy Show — `app/financial-mutants/page.tsx` line 36 is currently missing it, and that string is what renders on a share card with no footer nearby.
24. 🔧 Verify the outlook **email templates** carry the non-affiliation line. Mail from `@moneyguymutants.com` landing in an inbox with no disclaimer is the highest-confusion surface in the product.
25. 🔧 Constrain Lantern's `nudge` in the system prompt to behavioral/reflective actions, explicitly excluding product, account, allocation, or dollar-amount recommendations.
26. 🔧 Have a securities lawyer review the daily outlook's named-ticker "Ideas" sections before any marketing push. The disclaimers are strong and the hypothesis framing is disciplined; the question of whether a public newsletter naming securities needs more than that is outside what a code audit can answer.

---

## Appendix — primary sources for this audit

| Claim area | Files read |
|---|---|
| Stack, scale, hosting | `package.json`, `vercel.json`, `next.config.ts`, `middleware.ts`, git history |
| First Light | `.github/workflows/daily-outlook.yml`, `.claude/commands/daily-outlook.md`, `Daily Investment Report/SKILL.md`, `Daily Investment Report/references/sources.md`, `lib/outlook/{content,email,markdown,runDigest,types}.ts`, `app/api/outlook/**`, `content/outlook/daily/*.md` (65 files) |
| Lantern | `lib/why/questions.ts`, `lib/why/synthesis.ts`, `app/api/why/route.ts`, `app/apps/whats-your-why/page.tsx`, `components/apps/WhatsYourWhy.tsx`, `supabase/migrations/create_why_reflections_table.sql` |
| Weekly guide | `.github/workflows/weekly-guide.yml`, `content/guides/*.md` |
| Non-AI "AI" | `lib/ai/insights.ts`, `app/api/ai/insights/route.ts`, `components/ai/*`, `components/dashboard/BudgetOverview.tsx`, `lib/personality-quiz-data.ts` |
| Freemium / billing | `lib/access-control.ts`, `lib/stripe/{client,server,tier}.ts`, `app/pricing/page.tsx`, `app/api/scenarios/route.ts`, `components/dashboard/AppLibrary.tsx` |
| Security | `lib/auth-helpers.ts`, `lib/rate-limit.ts`, `lib/admin.ts`, `lib/supabase/*`, `supabase/migrations/*.sql`, `.gitignore`, `app/security/page.tsx` |
| Compliance / language | `app/terms/page.tsx`, `app/financial-mutants/page.tsx`, `app/the-money-guy-show/page.tsx`, `components/marketing/Footer.tsx`, `components/app/ToolLayout.tsx`, `components/auth/AuthShell.tsx`, `app/llms.txt/route.ts` |

**Not inspected:** the live database, Vercel project configuration, Stripe dashboard, Resend domain configuration, production logs, `node_modules`, `Cortex Design System/`, `wordpress/`, and the ~15 root-level `.md` status documents. Claims requiring those sources are marked ❌ throughout.
