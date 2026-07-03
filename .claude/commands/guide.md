---
description: Research and publish this week's cornerstone personal-finance guide under /guides. Picks an undone topic, writes a long-form evergreen explainer, links it to Cortex's calculators, commits, and pushes.
argument-hint: "[topic]   (optional — a specific topic to write about; otherwise Claude researches and picks one)"
---

# /guide — publish this week's cornerstone guide

End-to-end runbook: pick (or receive) a personal-finance topic, research it,
write a long-form evergreen guide for `/guides`, cross-link it to Cortex's
calculators, commit directly to main, and push.

`$ARGUMENTS` may be a specific topic (e.g. "Roth IRA conversions" or "how to
build an emergency fund"). If omitted, research and pick the strongest
untouched topic yourself (see Step 1).

This routine produces a **new guide every run** — Cortex Guides is a growing
library of cornerstone content, not a single page that gets rewritten. Each
run adds one new file under `content/guides/`.

---

## 0. Preflight

1. Confirm the working directory is the cortex repo root and the working tree
   is clean (`git status`). If dirty, ask the user whether to stash or abort —
   never silently mix unrelated changes into the guide commit.
2. Resolve `TARGET_DATE`: today's date in ET (`TZ=America/New_York date +%F`).
3. Read `content/guides/_topics.md` in full. This is the dedup registry —
   every topic already published is listed there. Do not pick a topic that
   substantially overlaps with an existing row (e.g. don't write "Roth IRA
   Basics" if "The Complete Guide to Roth IRAs" already exists).
4. Branch: Stay on `main`. Do NOT create a branch. Guides commit directly to
   main, same as `/daily-outlook`.

## 1. Pick the topic

If `$ARGUMENTS` gives a specific topic, use it (still check it's not a
near-duplicate of an existing entry in `_topics.md`; if it overlaps, tell the
user and ask how to proceed instead of silently substituting a different
topic).

Otherwise, research and choose:

1. Run 3–6 web searches for personal-finance topics with strong search
   demand and evergreen value — "best personal finance topics [year]",
   "most searched personal finance questions", "personal finance content
   gaps", plus targeted searches around Cortex's own tool set (budgeting,
   debt payoff, retirement, investing, house affordability, taxes, net
   worth, FIRE).
2. Cross-reference against `_topics.md` and rule out anything already
   covered or too close to it.
3. Prefer topics that map naturally to one or more of Cortex's existing
   calculators (list below) — the guide should be able to link to a tool the
   reader can immediately use. This is not a hard requirement (some good
   topics won't have a matching tool) but it's a strong tie-breaker.
4. Pick ONE topic. State it clearly at the top of your working notes so the
   rest of the routine stays anchored to it.

### Cortex's calculators (for topic tie-breaking and in-guide linking)

| Slug | Name | Best-fit topics |
|---|---|---|
| `budget` | Household Budget Calculator | budgeting, 50/30/20, zero-based budgeting, cash flow |
| `debt-paydown` | Debt Payoff Calculator | debt avalanche/snowball, credit cards, student loans, payoff strategy |
| `retirement-strategy` | Retirement Planning Calculator | 401(k), IRA, RMDs, Roth conversions, withdrawal strategy |
| `coast-fire` | Coast FIRE Calculator | FIRE, early retirement, coast FIRE, savings rate |
| `net-worth` | Net Worth Calculator | net worth tracking, financial statements, wealth building |
| `compound-interest` | Compound Interest Calculator | investing basics, compounding, time value of money |
| `index-fund-visualizer` | Index Fund Visualizer | index investing, ETFs, asset allocation, dollar-cost averaging |
| `rent-vs-buy` | Rent vs. Buy Calculator | home buying, renting, housing affordability |
| `car-affordability` | Car Affordability Calculator | car buying, auto loans, the 20/3/8 rule |
| `geographic-arbitrage` | Geographic Arbitrage Calculator | cost of living, relocating, remote work finances |
| `capital-gains-tax` | Capital Gains Tax Calculator | investment taxes, selling stock/property, tax-loss harvesting |
| `s-corp-optimizer` | S-Corp Tax Savings Calculator | small business taxes, S-corp election |
| `s-corp-investment` | S-Corp Retirement Contribution Calculator | small business retirement plans |
| `gambling-redirect` | Gambling Opportunity Cost Calculator | opportunity cost, gambling/lottery spending |

## 2. Research the topic

3–8 web searches. Gather:
- The core mechanics/rules a reader needs to actually understand the topic
  (numbers, thresholds, contribution limits, tax brackets, formulas —
  whatever applies). Use current-year figures and cite them accurately.
- Common mistakes or misconceptions worth correcting.
- 3–5 genuinely common questions people ask about this topic (for the FAQ
  section).

Prefer primary/authoritative sources (IRS.gov, official plan-provider docs,
Federal Reserve, Bureau of Labor Statistics, CFPB) over blogs. Never invent a
number, limit, or rule — if you can't confirm it, don't state it as fact.

## 3. Write the guide

The post lives at `content/guides/${TARGET_DATE}-${slug}.md` and is parsed by
`lib/guides/content.ts`.

### Frontmatter (required)

```yaml
---
title: "<clear, specific, sentence-case title — the definitive resource on this topic>"
date: ${TARGET_DATE}
summary: "<1-2 sentences. Works as the card blurb and meta description fallback.>"
topic: "<short canonical topic name, e.g. 'Roth IRA' — used for dedup, keep it distinct from other rows in _topics.md>"
category: "<one of: Budgeting, Debt, Investing, Retirement, Taxes, Housing, Saving>"
tags: [<2-5 lowercase kebab tags>]
relatedTools: [<2-4 calculator slugs from the table above that are genuinely relevant — do not force a link that doesn't fit>]
metaDescription: "<optional — falls back to summary>"
---
```

### Body

Target length: **1,000–1,500 words**. This is cornerstone/pillar content —
comprehensive enough to be the single best answer to the topic, but tight
enough to stay readable in one sitting.

Structure:

```markdown
<1-2 short intro paragraphs: what this guide covers and who it's for. No fluff.>

## <First real subtopic, as a clear H2>

<Explanation. Use concrete numbers/thresholds where relevant, cited from
your research. Short paragraphs; use lists/tables where they help.>

## <Second subtopic>

...

## <Third subtopic — as many H2s as the topic needs, typically 3-6>

...

## Frequently asked questions

### <Question 1, phrased the way a reader would ask it>

<Direct 2-4 sentence answer.>

### <Question 2>

...

<3-5 Q&As total. This section is required — it drives the page's FAQ schema
markup, which matters for search visibility.>

## Disclaimer

This guide is for general educational purposes only and does not constitute
personalized financial, tax, or legal advice. Every reader's situation is
different — consult a licensed financial advisor, accountant, or attorney
before making decisions based on this content. Figures and rules cited here
reflect the most recent information available at time of publication and may
change; verify current limits and regulations before acting.
```

The disclaimer block above is **mandatory**, **verbatim** (word-for-word,
only the surrounding context changes — never paraphrase it), and **always at
the bottom**.

**Tool linking (required):** naturally weave in references to 2–4 of
Cortex's calculators where they genuinely help the reader apply the guide's
advice — e.g. "Run your own numbers with the [Debt Payoff Calculator]" as
inline prose, not a bolted-on list. Use standard markdown links pointing to
`/apps/<slug>` (e.g. `[Debt Payoff Calculator](/apps/debt-paydown)`). These
should read as genuinely useful next steps, not SEO filler — if a tool
doesn't fit naturally, don't force it. The `relatedTools` frontmatter field
should list the same slugs you actually linked in the body (they also get
rendered as a dedicated "Put it into practice" module on the page).

### Slug

`kebab-case`, derived from the topic (not a literal restatement of the
title). Must match `^[a-z0-9][a-z0-9-]*$`. Examples:
- `roth-ira-conversions`
- `emergency-fund-how-much`
- `debt-avalanche-vs-snowball`

Filename: `${TARGET_DATE}-${slug}.md`.

## 4. Self-check before saving

Run through this list. If any answer is no, fix before writing the file.

- [ ] Frontmatter has `title`, `date` (YYYY-MM-DD), `summary`, `topic`,
      `category`, `tags`, `relatedTools`.
- [ ] Topic is not a near-duplicate of any row in `content/guides/_topics.md`.
- [ ] Slug matches `^[a-z0-9][a-z0-9-]*$` and the filename is unique.
- [ ] Body is 1,000–1,500 words.
- [ ] At least 3 clear H2 sections beyond the FAQ, each covering a distinct
      subtopic.
- [ ] `## Frequently asked questions` section present with 3-5 `### `
      sub-questions and direct answers.
- [ ] 2-4 genuine, naturally-placed links to `/apps/<slug>` calculators in
      the body, matching the `relatedTools` frontmatter list exactly.
- [ ] No fabricated numbers, limits, rules, or statistics. Every figure
      traces back to a search result from this run.
- [ ] Tone is clear, direct, and educational — no hype, no "as an AI"
      hedging, no unearned superlatives.
- [ ] **The disclaimer block is at the bottom, verbatim, exactly as in the
      template above. Not paraphrased. Not trimmed. Not relocated. If the
      disclaimer is missing or altered, the post must not be saved.**

## 5. Save

Write the file to `content/guides/${TARGET_DATE}-${slug}.md`.

Verify it parses: `grep -E '^---$' file | wc -l` should be 2, and the
required frontmatter keys (`title`, `date`, `summary`, `topic`) should all be
present as non-empty values.

## 6. Update the topic registry

Append one row to the table at the bottom of `content/guides/_topics.md`:

```
| ${TARGET_DATE} | ${slug} | ${topic} |
```

Do not touch or reorder existing rows.

## 7. Commit + push

```bash
git add content/guides/${TARGET_DATE}-${slug}.md content/guides/_topics.md
git commit -m "feat(guides): publish guide on <topic> for ${TARGET_DATE}"
git push origin main
```

If push fails on transient network errors, retry up to 4 times with
exponential backoff (2s, 4s, 8s, 16s).

Do NOT create a branch. Do NOT open a PR. Guides go directly to main, same as
the daily outlook.

## 8. Post is live

The guide goes live at `/guides/${slug}` immediately after the push. Vercel
picks up the commit and rebuilds automatically. No merge step required.

## 9. Report back

After the push completes, give the user a one-paragraph summary in chat:
- The topic chosen and why (if self-selected)
- The calculators it links to
- Confirmation it's pushed to main

Don't restate the guide — they have the file.

---

## Constraints (non-negotiable)

- **Disclaimer required.** The full disclaimer block from the template above
  MUST appear verbatim at the bottom of every published guide. No exceptions.
- **Never invent numbers, limits, rules, or statistics.** Better to omit a
  specific figure than to guess it.
- **No personalized advice.** This routine doesn't know the reader's income,
  filing status, holdings, or goals — keep guidance general.
- **No duplicate topics.** Always check `_topics.md` before committing to a
  topic.
- **One guide per run.** This command produces exactly one new file per
  invocation.
