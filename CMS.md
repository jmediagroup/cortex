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
3. **(Optional) Import existing WordPress posts** — see below.

## Admin usage

- `/admin/content` — list, filter by status, create/edit/delete.
- The editor supports Markdown + live preview, featured-image and inline-image
  uploads, categories/tags (comma-separated; created on the fly), SEO overrides,
  FAQ entries, a related calculator, and a CTA.
- Saving a published article revalidates the public site immediately (article
  page, `/articles`, home, sitemap) via `revalidateTag`/`revalidatePath`.

## Importing from WordPress (one-time)

```bash
NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL=https://cms.cortex.vip/graphql \
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=<service-role-key> \
npm run import:wordpress
```

The importer (`scripts/import-wordpress.mjs`) pages through published posts,
converts each post's HTML to Markdown with `turndown`, and upserts into
`cms_content` (idempotent on `(type, slug)`) plus its categories/tags. Complex
HTML may not round-trip perfectly — clean up in the editor afterward. Imported
posts keep referencing WordPress-hosted images (`cms.cortex.vip`) until you
re-upload them, so that image host stays in `next.config.ts`.

## Adding a new content type later (Guides / Thinking)

`cms_content.type` already allows `guide`, `daily`, and `weekly`. To migrate
those: extend `lib/cms/*` with type-aware readers, add admin screens (reuse
`ContentEditor`), migrate the existing `content/**/*.md` files, and rewire the
`/guide` and `/daily-outlook` skills to POST to the admin API instead of
committing Markdown.

## Roadmap

- **Phase 2 — Guides & Thinking → DB** (includes rewiring the content skills).
- **Phase 3 — Ads/Affiliates → DB** (replaces `components/monetization/affiliates.ts`).
