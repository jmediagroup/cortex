# Built-in CMS

Money Guy Mutants runs its own content management system instead of WordPress.
Admins manage content from the `/admin` panel; content lives in Supabase and is
rendered from Markdown by the same pipeline used for Guides and Thinking.

**Phase 1 (shipped):** Articles are fully CMS-backed — WordPress is no longer in
the article read path. Guides, Thinking, and Ads follow in later phases (see
_Roadmap_).

## How it works

- **Storage:** Postgres tables in Supabase (see the schema below) + a public
  `cms-media` Storage bucket for uploaded images.
- **Editing:** Markdown, with a live preview that runs the exact production
  renderer (`lib/outlook/markdown.ts` → remark + GFM + HTML).
- **Access:** the existing Supabase login + the `NEXT_PUBLIC_ADMIN_EMAILS`
  allowlist (`lib/admin.ts`). No new auth system.
- **Rendering:** `lib/cms/articles.ts` reads published rows, renders Markdown to
  HTML, and exposes the same functions the public pages already used.

## Schema (`supabase/migrations/create_cms_tables.sql`)

| Table | Purpose |
|---|---|
| `cms_content` | One row per piece of content. `type` = `article`\|`guide`\|`daily`\|`weekly`; `status` = `draft`\|`published`\|`scheduled`\|`archived`. `body_markdown` is the source of truth. Type-specific fields live in `metadata` (JSONB). |
| `cms_categories`, `cms_tags` | Taxonomy terms. |
| `cms_content_categories`, `cms_content_tags` | Many-to-many joins. |
| `cms-media` (Storage bucket) | Public-read image uploads. |

RLS: the public may read **published** content and all taxonomy; every write
goes through the service-role admin API routes. The public data layer also
filters `status = 'published'` explicitly.

## Setup

1. **Run the migration.** Paste `supabase/migrations/create_cms_tables.sql` into
   the Supabase SQL Editor and run it (repo convention — no CLI migration runner).
   It creates the tables, RLS policies, the `updated_at` trigger, and the
   `cms-media` bucket.
2. **Confirm the admin allowlist.** `NEXT_PUBLIC_ADMIN_EMAILS` must include the
   admin address(es), e.g. `drew@jmediagroup.net`.
3. The one-time WordPress import is already done — see below for history.

## Admin usage

- `/admin/content` — list, filter by **type** (article / guide / daily / weekly)
  and **status**, create/edit/delete. The **New** button is a type picker; each
  row shows a type badge and links to the right public path.
- The editor is **type-aware** (`components/admin/ContentEditor.tsx` +
  `lib/cms/content-types.ts`): Markdown + live preview, featured/inline-image
  uploads, and SEO overrides are shared by every type, while type-specific
  panels swap in:
  - **article** — categories/tags, related calculator, CTA, FAQ.
  - **guide** — categories/tags, topic, related tools.
  - **daily / weekly** — tickers, sectors.
- Saving revalidates the public surfaces for that type (`revalidateContent` in
  `lib/cms/admin.ts`). Articles bust the article caches + `/articles`, home, and
  sitemap; guides/outlook revalidate their own routes only.
- **Public read path:** only **articles** are served from the CMS today. Guides
  and Thinking (daily/weekly) can be authored and stored here, but their public
  pages still render from the Markdown pipeline until Phase 2 migrates those
  reads — the editor notes this inline for non-article types.

## WordPress import (historical — retired)

> **Status: done and decommissioned.** All 23 published WordPress posts were
> imported into `cms_content` (10 categories, 48 tags) on 2026-07-04, then
> rebranded Cortex → Money Guy Mutants. The exact idempotent SQL that was applied
> is checked in at `supabase/migrations/import_wordpress_articles.sql` (SQL Editor
> upsert on `(type, slug)`, safe to re-run) and remains the reproducible record of
> the seed data.

WordPress is no longer a source of any kind: the live GraphQL importer
(`scripts/import-wordpress.mjs`), the `npm run import:wordpress` script, the
`lib/wordpress/` client, and the `cms.cortex.vip` image host have all been
removed. The single legacy inline image still hosted on `cms.cortex.vip` was
deleted from its article, so no article content references the old CMS anymore.
Author avatars still resolve via `secure.gravatar.com` (allowlisted in
`next.config.ts`). All new media is uploaded to Supabase Storage (`cms-media`).

## Adding a new content type later (Guides / Thinking)

`cms_content.type` already allows `guide`, `daily`, and `weekly`. To migrate
those: extend `lib/cms/*` with type-aware readers, add admin screens (reuse
`ContentEditor`), migrate the existing `content/**/*.md` files, and rewire the
`/guide` and `/daily-outlook` skills to POST to the admin API instead of
committing Markdown.

## Roadmap

- **Phase 2 — Guides & Thinking → DB** (includes rewiring the content skills).
- **Phase 3 — Ads/Affiliates → DB** (replaces `components/monetization/affiliates.ts`).
