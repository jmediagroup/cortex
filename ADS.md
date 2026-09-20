# Admin-managed ads

Affiliate ads on the calculators are managed from `/admin/ads` and stored in
Supabase. The legacy hard-coded config (`components/monetization/affiliates.ts`
and `ad-copy.ts`) is kept only as (a) the source for the seed migration and
(b) a runtime fallback when the database returns nothing.

## How it works

```
Tool page ──<InlineAd context="budget" />──▶ <AdSlot placement="tool-inline-top" toolId="budget" />
                                                │
                                                ├─ useAdVisibility()   ← AdProvider (AppShellClient): guests + free see ads, finance_pro does not
                                                ├─ GET /api/ads?placement=&tool=   (public, cached 5 min, tags: ads, ads-<tool>)
                                                │     └─ lib/ads/public.ts getAdsForPlacement → ad_placements + active campaigns + advertisers + creatives
                                                │     └─ empty/failed → lib/ads/fallback.ts (legacy config)
                                                ├─ weighted-random starting campaign, rotates every placement.rotation_interval_ms
                                                ├─ impressions: IntersectionObserver (≥50% visible for ≥1s), once per creative per page view
                                                └─ clicks: POST /api/ads/events (sendBeacon) + window.gtag('event','affiliate_click')
```

- **Advertisers** (`ad_advertisers`) — the affiliate partner: name, URL, category, active flag.
- **Placements** (`ad_placements`) — the slots on the site and which IAB formats they render.
  Slugs are referenced from code and are fixed: `tool-inline-top` (leaderboard + mobile banner),
  `tool-below-results` (large rectangle), `tool-sidebar` (medium rectangle). Only
  `tool-inline-top` is wired into pages today (`InlineAd` on the 14 tool pages).
- **Campaigns** (`ad_campaigns`) — an advertiser on a placement with targeting, schedule,
  weight, priority and tier hiding. `tool_ids = NULL` means every tool; `exclude_tool_ids`
  always wins. Only `status = 'active'` campaigns inside `[starts_at, ends_at)` are served,
  and only when the advertiser is active.
- **Creatives** (`ad_creatives`) — per-format copy variants for a campaign. A slot only
  renders creatives whose format is in the placement's `formats`.
- **Events** (`ad_events`) — impression/click log. `ad_stats_daily` is a rollup view used
  by the admin stats endpoint.

### Selection rules (`lib/ads/select.ts`)

1. Campaigns are filtered to live + targeting the tool. `hide_for_tiers` is applied on the
   client (the public endpoint is cached and does not know the viewer).
2. The **first ad shown** is a weighted-random pick where each creative's weight is
   `campaign.weight × creative.weight`.
3. The rotation then walks distinct campaigns ordered by `priority` (desc), with a weighted
   shuffle within the same priority. One creative of the right format is picked per campaign
   visit (weighted by creative weight).
4. Desktop (`md+`) renders the leaderboard, mobile renders the mobile banner (same markup
   pattern as the original `InlineAd`), with `min-height` reserved to avoid layout shift.

### Copy limits (enforced by the API and the editor)

| Format | Headline | Body / body line 2 | CTA |
|---|---|---|---|
| `leaderboard` (728×90) | ≤ 90 | — | ≤ 30 |
| `mobile_banner` (320×100) | ≤ 40 | — | ≤ 30 |
| `medium_rectangle` (300×250) | ≤ 40 | ≤ 60 each | ≤ 30 |
| `large_rectangle` (336×280) | ≤ 40 | ≤ 60 each | ≤ 30 |

Copy is rendered as React text (money amounts and percentages are highlighted by
`splitHighlightSegments`), so HTML in a creative is shown literally, never executed.

## Setup

1. **Run the schema migration.** Paste
   `supabase/migrations/20260920120000_create_ads_tables.sql` into the Supabase SQL Editor
   and run it. It creates the five tables, indexes, `updated_at` triggers, the
   `ad_stats_daily` view and enables RLS with **no** anon/authenticated policies — every
   read and write goes through service-role API routes. Safe to re-run.
2. **Run the seed.** Paste `supabase/migrations/20260920120100_seed_ads.sql` and run it.
   It loads 3 placements, 11 advertisers, 11 active campaigns (one per advertiser on
   `tool-inline-top`, targeting the tools that rotated that advertiser under the old
   config; `coast-fire`, `capital-gains-tax` and `gambling-redirect` — which had no ads
   before — are added to the SoFi, Rocket Money and Rakuten campaigns) and all 132
   creatives. It upserts on stable keys (`slug`, `seed_key`) so re-running refreshes copy
   and targeting without touching admin-managed state such as campaign status.
   Regenerate the file after editing the legacy config with `node scripts/generate-ads-seed.mjs`.
3. Deploy. Until the migration is applied, `/api/ads` serves the fallback config so the
   site keeps showing exactly what it showed before.

Env: nothing new. Admin access uses the existing `NEXT_PUBLIC_ADMIN_EMAILS` allowlist and
the service role key already configured for the CMS.

## Admin usage

- **`/admin/ads`** — campaign table (advertiser, placement, targeting chip with a hover
  list, status, weight/priority, schedule, 30-day impressions/clicks/CTR), a daily
  impressions + clicks chart, status filter chips, and a per-row **Pause/Activate** quick action.
- **`/admin/ads/advertisers`** — list + inline "New advertiser"; each row opens the
  advertiser editor (slug, name, URL, category, tagline, description, default CTA, active,
  notes). Deleting an advertiser cascades to its campaigns and creatives.
- **`/admin/ads/campaigns/new`** and **`/admin/ads/campaigns/<id>`** — campaign editor:
  creatives grouped by format with add/duplicate/remove, live character counters, and a
  **live preview** that renders the real `IABAd` component for the selected creative.
  Sidebar: status, advertiser, placement, tools (or "All tools"), exclusions, weight,
  priority, start/end, hide-for-tiers, notes. Saving does a full sync of the creatives
  list (rows with an id are updated, new rows inserted, missing rows deleted).

### Adding an advertiser + campaign

1. `/admin/ads/advertisers` → **New advertiser** (name, affiliate URL, category) → Create.
2. Fill in the tagline/default CTA if you like → Save → **New campaign** (top right).
3. Pick the placement (`tool-inline-top` for the calculators), choose tools, add at least
   one leaderboard and one mobile-banner creative, set status to **active** → Save.
4. The public caches are revalidated on every save, so the change is live immediately.

## API

Public
- `GET /api/ads?placement=<slug>&tool=<toolId>` → `{ ads, rotationIntervalMs, source: 'db' | 'fallback' }`.
  `Cache-Control: public, s-maxage=300, stale-while-revalidate=3600`.
- `POST /api/ads/events` — JSON or `sendBeacon` text body
  `{ type: 'impression'|'click', campaignId, creativeId, advertiserId, placement, toolId, format, sessionId, pagePath, tier }`.
  Always 204; validates UUIDs/enums; rate-limited per session (120/min); fallback ads
  (no campaign UUID) are acknowledged but not stored.

Admin (Bearer token + admin allowlist, see `lib/cms/admin.ts` `requireAdmin`)
- `GET|POST /api/admin/ads/advertisers`, `GET|PATCH|DELETE /api/admin/ads/advertisers/:id`
- `GET|POST /api/admin/ads/campaigns` (`?status=&tool=&advertiser=`),
  `GET|PATCH|DELETE /api/admin/ads/campaigns/:id` (`PATCH` accepts `creatives: [...]` for a full sync)
- `GET /api/admin/ads/placements`, `PATCH /api/admin/ads/placements/:id`
- `GET /api/admin/ads/stats?days=30` → totals, per-campaign, per-creative, per-advertiser and per-day counts

## Caching and revalidation

`lib/ads/public.ts` wraps the DB read in `unstable_cache` with tags `ads` and
`ads-<toolId>` and a 300s revalidate. Every admin write calls `revalidateAds()`
(`lib/ads/admin.ts`), which expires the `ads` tag (and the per-tool tags it knows about)
with `revalidateTag(tag, { expire: 0 })`. The route also sets a CDN `s-maxage=300`, so a
change can take up to five minutes to reach a browser that hit a CDN-cached response.
Browsers fetch on every page view (no client-side cache).

## Code map

| Path | Purpose |
|---|---|
| `lib/ads/types.ts` | Client-safe types/constants: formats, placements, tool ids, copy limits, `ServedAd` |
| `lib/ads/select.ts` | Pure selection helpers (`isCampaignLive`, `filterCampaignsForTool`, `pickWeighted`, `orderForRotation`, `splitHighlightSegments`) — tested in `tests/ads.test.mjs` |
| `lib/ads/validation.ts` | Field whitelists + validation for the admin API (also tested) |
| `lib/ads/public.ts` | Server-only cached read used by `GET /api/ads` |
| `lib/ads/fallback.ts` | Builds `ServedAd[]` from the legacy config |
| `lib/ads/admin.ts` | Server-only re-exports + `revalidateAds()` |
| `components/monetization/AdProvider.tsx` | Ad visibility context (mounted in `AppShellClient`) |
| `components/monetization/AdSlot.tsx` | Placement component: fetch, rotate, track |
| `components/monetization/IABAd.tsx` | Presentational IAB creative renderer |
| `components/monetization/InlineAd.tsx` | Thin wrapper kept for the 14 tool pages |
| `components/admin/CampaignEditor.tsx`, `AdvertiserEditor.tsx` | Admin editors |
| `scripts/generate-ads-seed.mjs` | Regenerates the seed SQL from the legacy config |
