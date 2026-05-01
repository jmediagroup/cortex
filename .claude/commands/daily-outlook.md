---
description: Generate and publish today's daily investment outlook post under /thinking. Runs the daily-investment-report skill, adapts the output to the Cortex content/outlook/daily/ format, commits, and pushes.
argument-hint: "[YYYY-MM-DD]   (optional — defaults to today in ET)"
---

# /daily-outlook — publish today's daily outlook

End-to-end runbook: research the tape with the `daily-investment-report` skill, rewrite the output into a Cortex `/thinking` daily post, commit directly to main, and push.

`$ARGUMENTS` may be a single ISO date (`YYYY-MM-DD`). If omitted, use today's date in the **America/New_York** timezone (markets are ET).

---

## 0. Preflight

1. Confirm the working directory is the cortex repo root and the working tree is clean (`git status`). If dirty, ask the user whether to stash or abort — never silently mix unrelated changes into the outlook commit.
2. Resolve `TARGET_DATE`:
   - If `$ARGUMENTS` parses as `YYYY-MM-DD`, use it.
   - Otherwise, today's date in ET (`TZ=America/New_York date +%F`).
3. Check for an existing daily post on that date:
   ```bash
   ls content/outlook/daily/${TARGET_DATE}-*.md 2>/dev/null
   ```
   If one exists, **stop and ask the user**: replace it, publish under a different slug for the same date, or abort. Do not silently overwrite.
4. Branch: Stay on `main`. Do NOT create a branch. Daily outlook posts commit directly to main.

## 1. Run the daily-investment-report skill

Follow `Daily Investment Report/SKILL.md` end-to-end:

1. **Pull market data** (5–8 web searches). Indices, 10Y, VIX, sector leaders/laggards, top headlines, biggest movers. Use the trusted sources in `Daily Investment Report/references/sources.md`. Avoid forums, pump content, anonymous tips.
2. **Pull idea-generation signals.** Analyst upgrades/downgrades today, earnings released today, unusual volume / insider activity from reputable reporting only.
3. **Synthesize** per the skill's principles: lead with what matters, signal vs noise, ideas as hypotheses (not calls), bear case for every idea, quantify where possible, separate long-term core from opportunistic.
4. **Quality bar** — every number/quote attributed to a real source from today; every idea framed as research; every idea has a bear case; long-term and opportunistic clearly separated.

### Source-corroboration rules (learned from prior runs)

- **Headline market direction needs ≥2 independent sources.** The "S&P/Dow/Nasdaq closed up/down X%" line is the spine of the lead — if only one source supports it (or two summaries from the same outlet), run another search before drafting. If two reputable outlets still disagree on direction, lead with the *internals* (movers, breadth, vol, rates) instead of the index print, and explicitly call out the conflict in "Risks to the call."
- **Index level + percent change must come from the same source.** Don't stitch a level from one outlet with a percent move from another — that's how you publish a fabricated close.
- **Date-stamp every datapoint.** Before using a number, confirm it's from `TARGET_DATE` (or, for after-hours runs, the most recent prior trading-day close). Yields, VIX, and sector data are the most common offenders here — search summaries often mix in older readings.
- **Sector leaders/laggards: today only, or skip.** If the freshest sector-performance data you can find is more than two trading days old, **drop the sector section entirely** rather than caveat it. A week-old leaders/laggards readout is noise, not signal — don't backfill the post with it. The dominant story can carry the lead without sector context.
- **Single-stock moves: cross-check the percent.** Big intraday moves (≥10%) get reported with different intraday vs close numbers. Use the closing print, and confirm against a second source if the move is the post's anchor.

Do **not** save the raw skill template output to `/mnt/user-data/outputs/`. The cortex post format is different.

## 2. Adapt to the Cortex `/thinking` daily post format

The post lives at `content/outlook/daily/${TARGET_DATE}-${slug}.md` and is parsed by `lib/outlook/content.ts`. The contract:

### Frontmatter (required)

```yaml
---
title: "<sentence-case headline, no trailing period — the day's dominant story>"
date: ${TARGET_DATE}
type: daily
summary: "<1–2 sentences. Works as the chip on /thinking and as the email preview.>"
tickers: [<UP TO 6, deduped, ALL-CAPS tickers actually discussed in the body>]
sectors: [<1–3 lowercase tags: tech, financials, energy, semiconductors, healthcare, industrials, consumer, materials, utilities, real-estate, communications>]
metaDescription: "<optional — falls back to summary. Use only if a different SEO line helps.>"
---
```

Match the tone of existing posts (see `content/outlook/daily/2026-04-24-earnings-week-recap.md` and `2026-04-27-cpi-miss-fed-stays-the-course.md`):

- Title: 6–12 words, no trailing period, captures the **why** not just the **what**.
- Summary: punchy, opinionated, names the variant view.
- Tickers: only ones you actually discuss in the body. SPY/QQQ/DXY are fine if the macro section uses them.

### Body

This routine is a **publishing surface for the `daily-investment-report` skill**, not a substitute for it. The body must align closely with the skill's `assets/report-template.md` structure. The published post must include all of the skill's sections in the order below — the only differences vs. the raw skill output are (a) the frontmatter on top (so the cortex content system can parse it), (b) the section names slightly tightened for inline reading, and (c) the title/date header is dropped from the body since the cortex layout renders them from frontmatter.

The first H2 is the email lead — `lib/outlook/content.ts` extracts everything from the start of the body up to the **second** `## ` heading and uses that as the email preview. Keep the first section short for that reason.

```markdown
> Research and idea generation for personal use. Not investment advice. See full disclaimer at the bottom.

## Top of mind

<2–3 sentences. The single most important thing happening in markets today and why
it matters for a long-term + opportunistic investor. This is the email lead — keep
it short. Concrete numbers > vague language.>

## Market snapshot

| Asset | Level | Change | Notes |
|---|---|---|---|
| S&P 500 | <level> | <% change> | <1-line context> |
| Nasdaq Composite | <level> | <% change> | <1-line context> |
| Dow Jones | <level> | <% change> | <1-line context> |
| 10Y Treasury | <yield> | <bps change> | <1-line context> |
| VIX | <level> | <% change> | <1-line context> |
| <DXY / WTI / Gold> | <level> | <% change> | <only if notable> |

**Sector leaders:** <top 2–3 — OMIT THE WHOLE LINE if data is >2 trading days stale>
**Sector laggards:** <bottom 2–3 — OMIT THE WHOLE LINE if data is >2 trading days stale>

**Read-through:** <1–2 sentences on what the tape is saying — risk-on, risk-off, rotation, etc.>

## Headlines & analysis

### 1. <Headline, paraphrased>
**Source:** <outlet>
**So what:** <1–2 sentences on why this matters and for whom.>

### 2. <Headline>
...

<3–5 stories. Drop anything that's just noise.>

## Ideas — long-term core

*Quality businesses, durable competitive advantages, reasonable valuation. Hold horizon: years.*

### <TICKER> — <Company>
- **Thesis:** <2–3 sentences on the durable case.>
- **Valuation note:** <P/E, P/S, FCF yield, etc., vs. history/peers.>
- **Why now (or why patient):** <Is the setup timely or are we just maintaining a watch?>
- **Risks / bear case:** <What would break the thesis.>

<1–3 names. If today doesn't offer compelling long-term setups, say so — don't force it.>

## Ideas — opportunistic

*Catalyst-driven, time-bound, sized smaller. Hold horizon: days to months. Define exit before entry.*

### <TICKER> — <Setup>
- **Catalyst:** <Earnings, FDA, macro print, M&A rumor, technical breakout, etc.>
- **Time horizon:** <Days / weeks / through next earnings.>
- **What would invalidate:** <Specific level, event, or condition.>
- **Risk note:** <Sizing reminder, volatility, liquidity, headline risk.>

<1–3 setups. Empty section is fine if nothing qualifies.>

## Portfolio-level guidance

*Allocation and risk observations. Not specific buy/sell calls — those depend on a full picture this report doesn't see.*

- **Concentration check:** <…>
- **Rates positioning:** <…>
- **Cash & dry powder:** <…>
- **Risk regime read:** <…>

<3–5 observations tailored to today.>

## Watch list — tomorrow / this week

**Earnings:** <Companies reporting + why they matter.>
**Economic data:** <CPI, PCE, NFP, retail sales, etc., with consensus where available.>
**Fed / central bank:** <Speakers, FOMC minutes, decisions.>
**Other:** <OPEC, geopolitical events, key auctions.>

## Disclaimer

This report is prepared for personal research and informational purposes only. It does not constitute investment advice, an offer, or a solicitation to buy or sell any security. Information is drawn from public sources believed to be reliable but is not guaranteed accurate or complete. Markets change rapidly; data may be stale by the time of reading. Any "ideas" mentioned are research candidates, not recommendations, and do not consider any specific person's financial situation, objectives, or risk tolerance. Consult a licensed financial advisor before making investment decisions. Past performance does not predict future results.
```

The disclaimer block above is **mandatory**, **verbatim**, and **always at the bottom**. Do not paraphrase, trim, or relocate it. Do not omit it because the cortex marketing layout has a footer. Do not omit it because earlier `/thinking` posts shipped without one. The skill's `SKILL.md` makes this a non-negotiable contract for every report this skill produces, on every surface — `/thinking` included.

If you also produced a longer raw artifact for the user to download, that file goes to `/mnt/user-data/outputs/` per the skill's Step 4 — and it must also end with this disclaimer.

### Slug

`kebab-case`, derived from the post's central thesis (not the literal headline word-for-word). Must match `^[a-z0-9][a-z0-9-]*$`. Examples:
- `cpi-miss-fed-stays-the-course`
- `earnings-week-recap`
- `dollar-breaks-200-day`

Filename: `${TARGET_DATE}-${slug}.md`.

## 3. Self-check before saving

Run through this list. If any answer is no, fix before writing the file.

- [ ] Frontmatter has `title`, `date` (YYYY-MM-DD), `summary`, `type: daily`.
- [ ] Slug matches `^[a-z0-9][a-z0-9-]*$` and the full filename is unique for that date.
- [ ] Body opens with the one-line "Research and idea generation… See full disclaimer at the bottom." callout.
- [ ] Body has all required sections in order: `## Top of mind`, `## Market snapshot`, `## Headlines & analysis`, `## Ideas — long-term core`, `## Ideas — opportunistic`, `## Portfolio-level guidance`, `## Watch list — tomorrow / this week`, `## Disclaimer`.
- [ ] `## Top of mind` is 2–3 sentences (it's the email-only preview, extracted as everything before the second `## `).
- [ ] At least one bear case is in the body (per-idea "Risks / bear case" + an obvious + non-obvious risk in the lead's risk framing).
- [ ] Long-term core and opportunistic are clearly separated; opportunistic ideas have an explicit "what would invalidate."
- [ ] No fabricated prices, headlines, or analyst calls. If a search didn't surface it, it isn't in the post.
- [ ] Headline market-direction line backed by ≥2 independent sources (or, if sources conflict, lead is built from internals + conflict is flagged in the disclaimer-adjacent risk note).
- [ ] Every datapoint is from `TARGET_DATE` (or the most recent prior close for after-hours runs). No stale readings smuggled in via search summaries.
- [ ] If sector leaders/laggards data is older than two trading days, those lines are omitted — not caveated.
- [ ] Tickers/sectors are arrays of plain strings; tickers ALL-CAPS, sectors lowercase.
- [ ] **The full disclaimer block is at the bottom, verbatim, exactly as in the template above. NOT paraphrased. NOT trimmed. NOT relocated. This is a hard requirement — if the disclaimer is missing or altered, the post must not be saved.**
- [ ] Tone is variant-view, opinionated, concrete (matches existing daily posts).

## 4. Save

Write the file to `content/outlook/daily/${TARGET_DATE}-${slug}.md`.

Then verify it parses by checking the file is non-empty and the frontmatter delimiters (`---` open/close) and the `## Lead` heading are present. (`grep -E '^---$' file | wc -l` should be 2; `grep -c '^## Lead' file` should be 1.)

## 5. Commit + push

```bash
git add content/outlook/daily/${TARGET_DATE}-${slug}.md
git commit -m "feat(outlook): daily outlook for ${TARGET_DATE} — <short headline>"
git push origin main
```

If push fails on transient network errors, retry up to 4 times with exponential backoff (2s, 4s, 8s, 16s).

Do NOT create a branch. Do NOT open a PR. Daily outlook posts go directly to main.

## 6. Post is live

The post goes live at `/thinking/${TARGET_DATE}-${slug}` immediately after the push. Vercel will pick up the commit and rebuild automatically. No merge step required.

## 7. Report back

After the push completes, give the user a one-paragraph summary in chat:
- The dominant story
- The single most important takeaway
- The commit URL (or just confirm "pushed to main")

Don't restate the post — they have the file.

---

## Constraints (carried over from the skill — non-negotiable)

- **Disclaimer required.** The full disclaimer block from the template above MUST appear verbatim at the bottom of every published post. No exceptions. If you cannot include it for any reason, do not publish.
- **Never invent prices, headlines, or analyst calls.** Better short than fabricated.
- **No personalized advice.** This routine doesn't know the reader's holdings, tax, time horizon, or risk tolerance.
- **Paraphrase news content.** Quotes under 15 words, one quote per source max.
- **Flag uncertainty.** If sources conflict or data is stale by close, say so explicitly in the body.
- **One post per date.** If today already has a daily post, ask before doing anything.
