# Cortex Guides

This directory holds Markdown source for the cornerstone personal-finance
guides published at `/guides`. Files here are committed to the repo (by the
`/guide` routine, Claude Cowork, or a human) and rendered server-side by
`lib/guides/content.ts`.

## Layout

```
content/guides/
  _topics.md        registry of every topic published so far (dedup source of truth)
  README.md         this file
  YYYY-MM-DD-slug.md  one file per guide
```

Filenames double as URL slugs. Use kebab-case; the parser expects the regex
`^[a-z0-9][a-z0-9-]*$`.

## Frontmatter contract

Every file requires `title`, `date`, `summary`, and `topic`. Everything else
is optional.

```yaml
---
title: "The Complete Guide to Roth IRAs"
date: 2026-07-05                       # ISO 8601 date (yyyy-mm-dd)
summary: "Everything to know before opening or converting to a Roth IRA."
topic: "Roth IRA"                      # short canonical topic name, used for dedup in _topics.md
category: "Retirement"                 # optional grouping tag shown on cards
tags: [retirement, tax-advantaged, ira] # optional lowercase tags
relatedTools: [retirement-strategy, coast-fire]  # optional — slugs from lib/calculator-content.ts
ogImage: /og/guides-2026-07-05.png     # optional — falls back to generated opengraph-image
metaDescription: "..."                 # optional — falls back to summary
---
```

## Body shape

Guides are long-form pillar content (~1,000–1,500 words), not daily
commentary — there's no "lead" extraction like `/thinking` posts. Structure
with clear `##`/`###` headings, a short intro, and (where relevant) an FAQ
section near the end for SEO/AEO. See the `/guide` slash command
(`.claude/commands/guide.md`) for the full authoring contract, including the
required disclaimer and tool-linking rules.

## Publishing flow

1. The `/guide` routine (or a human) writes/commits a file under
   `content/guides/`.
2. Push to `main` → Vercel rebuilds → `/guides` and `/guides/<slug>` go live.
3. A GitHub Actions cron (`.github/workflows/weekly-guide.yml`) runs the
   routine every Sunday.
