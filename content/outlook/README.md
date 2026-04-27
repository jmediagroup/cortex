# Cortex Investment Outlook

This directory holds Markdown source for the daily and weekly investment
outlooks published at `/thinking`. Files here are committed to the repo (by
Claude Cowork or a human) and rendered server-side by `lib/outlook/content.ts`.

## Layout

```
content/outlook/
  daily/   YYYY-MM-DD-slug.md
  weekly/  YYYY-MM-DD-slug.md
```

Filenames double as URL slugs. Use kebab-case after the date prefix; the parser
expects the regex `^[a-z0-9][a-z0-9-]*$`.

## Frontmatter contract

Every file requires `title`, `date`, and `summary`. Everything else is optional.

```yaml
---
title: "Markets shrug off the CPI miss"
date: 2026-04-27                # ISO 8601 date (yyyy-mm-dd)
type: daily                     # daily | weekly  (defaults to folder name)
summary: "Inflation came in hot but rate-cut expectations barely moved."
tickers: [SPY, QQQ, AAPL, NVDA] # optional — surfaced as chips on cards/email
sectors: [tech, financials]     # optional — surfaced as #tags on the post
ogImage: /og/outlook-2026-04-27.png   # optional — falls back to /og-image.png
metaDescription: "..."          # optional — falls back to summary
---
```

## Body shape

The first H2 section becomes the "first section" rendered inline in the daily
email. Everything from the file's start up to the **second** `## ` heading is
considered the lead. Keep that section short (1–3 paragraphs) so the email
stays scannable.

```markdown
## Lead

One short paragraph that the email subscriber sees in their inbox.

## What we're watching

The rest of the post — section by section.
```

## Publishing flow

1. Author writes/commits a file under `daily/` or `weekly/`.
2. Push to `main` → Vercel rebuilds → `/thinking` and `/thinking/<slug>` go live.
3. Vercel Cron runs `/api/outlook/email/daily` Mon–Fri 11:00 UTC and
   `/api/outlook/email/weekly` Sundays 11:00 UTC. Each handler picks up the
   matching post (by today's ET date) and emails confirmed subscribers.

If no post matches today, the cron handler exits cleanly without sending
anything.
