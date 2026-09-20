-- Admin-managed ads — advertisers, placements, campaigns, creatives, events
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor), then run
-- 20260920120100_seed_ads.sql to load the legacy affiliate config.
--
-- Design notes:
--   * `ad_advertisers` replaces components/monetization/affiliates.ts.
--   * `ad_placements` are the slots on the site (e.g. tool-inline-top) and the
--     IAB formats each slot can render.
--   * `ad_campaigns` bind an advertiser to a placement with targeting
--     (tool_ids / exclude_tool_ids), scheduling, weight, priority and the
--     tiers that must never see the campaign.
--   * `ad_creatives` are the per-format copy variants for a campaign.
--   * `ad_events` is the raw impression/click log; `ad_stats_daily` rolls it up.
--   * RLS is enabled on every table with NO anon/authenticated policies —
--     every read and write goes through service-role API routes.
--   * Idempotent: safe to re-run.

create extension if not exists "pgcrypto";

-- ============================================================
-- 1. Advertisers
-- ============================================================
create table if not exists public.ad_advertisers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  url text not null,
  description text,
  tagline text,
  cta text,
  category text not null default 'banking'
    check (category in (
      'budgeting', 'investing', 'banking', 'debt', 'insurance',
      'taxes', 'cashback', 'security', 'rewards', 'credit-cards'
    )),
  is_active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_ad_advertisers_active
  on public.ad_advertisers (is_active);

drop trigger if exists set_ad_advertisers_updated_at on public.ad_advertisers;
create trigger set_ad_advertisers_updated_at
  before update on public.ad_advertisers
  for each row execute function public.update_updated_at_column();

-- ============================================================
-- 2. Placements
-- ============================================================
create table if not exists public.ad_placements (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  formats text[] not null default '{}',
  rotation_interval_ms integer not null default 15000
    check (rotation_interval_ms >= 1000),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_ad_placements_updated_at on public.ad_placements;
create trigger set_ad_placements_updated_at
  before update on public.ad_placements
  for each row execute function public.update_updated_at_column();

-- ============================================================
-- 3. Campaigns
-- ============================================================
create table if not exists public.ad_campaigns (
  id uuid primary key default gen_random_uuid(),
  -- Deterministic key used by the seed script (nullable for admin-created rows).
  slug text unique,
  advertiser_id uuid not null references public.ad_advertisers(id) on delete cascade,
  placement_id uuid not null references public.ad_placements(id) on delete cascade,
  name text not null,
  status text not null default 'draft'
    check (status in ('draft', 'active', 'paused', 'archived')),
  -- NULL = every tool. Otherwise only these tool ids.
  tool_ids text[],
  exclude_tool_ids text[] not null default '{}',
  weight integer not null default 1 check (weight > 0),
  priority integer not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  hide_for_tiers text[] not null default '{finance_pro}',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_ad_campaigns_placement_status
  on public.ad_campaigns (placement_id, status);
create index if not exists idx_ad_campaigns_advertiser
  on public.ad_campaigns (advertiser_id);
create index if not exists idx_ad_campaigns_tool_ids
  on public.ad_campaigns using gin (tool_ids);

drop trigger if exists set_ad_campaigns_updated_at on public.ad_campaigns;
create trigger set_ad_campaigns_updated_at
  before update on public.ad_campaigns
  for each row execute function public.update_updated_at_column();

-- ============================================================
-- 4. Creatives
-- ============================================================
create table if not exists public.ad_creatives (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.ad_campaigns(id) on delete cascade,
  -- Deterministic key used by the seed script (nullable for admin-created rows).
  seed_key text unique,
  format text not null
    check (format in ('medium_rectangle', 'leaderboard', 'mobile_banner', 'large_rectangle')),
  headline text not null,
  body text,
  body_line2 text,
  cta text not null,
  weight integer not null default 1 check (weight > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_ad_creatives_campaign_format
  on public.ad_creatives (campaign_id, format);

drop trigger if exists set_ad_creatives_updated_at on public.ad_creatives;
create trigger set_ad_creatives_updated_at
  before update on public.ad_creatives
  for each row execute function public.update_updated_at_column();

-- ============================================================
-- 5. Events (impressions + clicks)
-- ============================================================
create table if not exists public.ad_events (
  id bigint generated always as identity primary key,
  event_type text not null check (event_type in ('impression', 'click')),
  campaign_id uuid references public.ad_campaigns(id) on delete set null,
  creative_id uuid references public.ad_creatives(id) on delete set null,
  advertiser_id uuid references public.ad_advertisers(id) on delete set null,
  placement_slug text,
  tool_id text,
  format text,
  session_id text,
  user_id uuid references auth.users(id) on delete set null,
  tier text,
  page_path text,
  created_at timestamptz not null default now()
);

create index if not exists idx_ad_events_created_at
  on public.ad_events (created_at desc);
create index if not exists idx_ad_events_campaign_created
  on public.ad_events (campaign_id, created_at desc);
create index if not exists idx_ad_events_creative_created
  on public.ad_events (creative_id, created_at desc);

-- ============================================================
-- 6. Row Level Security — no public policies at all.
-- ============================================================
alter table public.ad_advertisers enable row level security;
alter table public.ad_placements enable row level security;
alter table public.ad_campaigns enable row level security;
alter table public.ad_creatives enable row level security;
alter table public.ad_events enable row level security;

-- Defensive: drop any leftover permissive policies from earlier experiments.
drop policy if exists "Public can read advertisers" on public.ad_advertisers;
drop policy if exists "Public can read placements" on public.ad_placements;
drop policy if exists "Public can read campaigns" on public.ad_campaigns;
drop policy if exists "Public can read creatives" on public.ad_creatives;
drop policy if exists "Public can insert events" on public.ad_events;

-- ============================================================
-- 7. Daily rollup view (security_invoker so RLS still applies to callers)
-- ============================================================
create or replace view public.ad_stats_daily
  with (security_invoker = true) as
select
  campaign_id,
  creative_id,
  advertiser_id,
  (created_at at time zone 'utc')::date as day,
  count(*) filter (where event_type = 'impression') as impressions,
  count(*) filter (where event_type = 'click') as clicks
from public.ad_events
group by campaign_id, creative_id, advertiser_id, (created_at at time zone 'utc')::date;

-- ============================================================
-- 8. Verify
-- ============================================================
-- select tablename, rowsecurity from pg_tables
--   where schemaname = 'public' and tablename like 'ad_%';
