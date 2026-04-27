---
description: Generate and publish today's daily investment outlook post under /thinking. Runs the daily-investment-report skill, adapts the output to the Cortex content/outlook/daily/ format, commits, and pushes.
argument-hint: "[YYYY-MM-DD]   (optional — defaults to today in ET)"
---

# /daily-outlook — publish today's daily outlook

End-to-end runbook: research the tape with the `daily-investment-report` skill, rewrite the output into a Cortex `/thinking` daily post, commit, push, open a PR.

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
4. Branch:
   - If on `main`, create `claude/daily-outlook-${TARGET_DATE}` and switch to it.
   - If already on a feature branch (e.g. `claude/...`), stay there and commit on top.

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

The first H2 is the email lead. Everything before the **second** `## ` is what email subscribers see in their inbox — keep it tight.

```markdown
## Lead

<1–3 paragraphs. One dominant idea. The "top of mind" from the skill, rewritten in
Cortex's editorial voice. Concrete numbers > vague language.>

## What we're watching

<2–4 bullets or short paragraphs covering the headlines that actually matter.
Each one has a "so what" — what it means for a long-term + opportunistic investor.
Drop noise.>

## The decision worth making today

<Either 1 long-term core idea OR 1 opportunistic setup, framed as a hypothesis.
Include: thesis, valuation/setup, what would invalidate. Use "watch list candidate,"
"setup worth researching" — never "buy this." If today doesn't offer a compelling
single idea, write a short section on the regime read instead — don't force a name.>

## Risks to the call

<Bear case for the lead thesis. The obvious risk + at least one non-obvious one.>
```

Do **NOT** copy the skill template verbatim — the long market-snapshot table, full disclaimer block, and 3-tier idea sections do not fit this format. The cortex `/thinking` post is editorial, not a digest. If you produced a long skill artifact along the way, save it under `/mnt/user-data/outputs/` for the user to download, but the published post is the rewritten version.

Do **NOT** inline a long disclaimer in the post body — the existing posts don't, and the editorial "Cortex Research" framing handles it. (If a single tasteful "research not advice" line fits at the end, fine — match the existing posts.)

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
- [ ] Body starts with `## Lead` and has at least 2 more `## ` sections.
- [ ] Lead is 1–3 paragraphs (it's the email-only preview).
- [ ] At least one bear case is in the body (in "Risks to the call" or inline).
- [ ] No fabricated prices, headlines, or analyst calls. If a search didn't surface it, it isn't in the post.
- [ ] Headline market-direction line backed by ≥2 independent sources (or, if sources conflict, lead is built from internals + conflict is flagged in "Risks to the call").
- [ ] Every datapoint is from `TARGET_DATE` (or the most recent prior close for after-hours runs). No stale readings smuggled in via search summaries.
- [ ] If sector leaders/laggards data is older than two trading days, that section is omitted — not caveated.
- [ ] Tickers/sectors are arrays of plain strings; tickers ALL-CAPS, sectors lowercase.
- [ ] No long disclaimer block — editorial framing only.
- [ ] Tone matches existing daily posts (variant-view, opinionated, concrete).

## 4. Save

Write the file to `content/outlook/daily/${TARGET_DATE}-${slug}.md`.

Then verify it parses by checking the file is non-empty and the frontmatter delimiters (`---` open/close) and the `## Lead` heading are present. (`grep -E '^---$' file | wc -l` should be 2; `grep -c '^## Lead' file` should be 1.)

## 5. Commit + push

```bash
git add content/outlook/daily/${TARGET_DATE}-${slug}.md
git commit -m "feat(outlook): daily outlook for ${TARGET_DATE} — <short headline>"
git push -u origin <current-branch>
```

If push fails on transient network errors, retry up to 4 times with exponential backoff (2s, 4s, 8s, 16s).

## 6. PR

- If the current branch already has an open PR, just push — Vercel will rebuild and the post will go live at `/thinking/${TARGET_DATE}-${slug}` after merge.
- If not, open one as ready-for-review (not draft):
  - Title: `feat(outlook): daily outlook for ${TARGET_DATE}`
  - Body: summary of the dominant story + the variant view, plus a checklist of what was verified (sources cited, bear case present, tickers match body).

## 7. Report back

After the PR is open / push complete, give the user a one-paragraph summary in chat:
- The dominant story
- The single most important takeaway
- The PR / commit URL

Don't restate the post — they have the file and the PR.

---

## Constraints (carried over from the skill — non-negotiable)

- **Never invent prices, headlines, or analyst calls.** Better short than fabricated.
- **No personalized advice.** This routine doesn't know the reader's holdings, tax, time horizon, or risk tolerance.
- **Paraphrase news content.** Quotes under 15 words, one quote per source max.
- **Flag uncertainty.** If sources conflict or data is stale by close, say so explicitly in the body.
- **One post per date.** If today already has a daily post, ask before doing anything.
