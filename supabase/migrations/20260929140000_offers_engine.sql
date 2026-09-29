-- Contextual offer engine (docs/monetization/HANDOFF.md, Phase 1)
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor). Safe to re-run.
-- Additive: new nullable/defaulted columns, widened CHECK lists, one new
-- placement, one new table. Existing banner behaviour is unchanged (and the
-- banners stay off behind NEXT_PUBLIC_BANNER_ADS_ENABLED).
--
-- An offer shows after a calculator result only when ALL of these hold
-- (enforced in lib/offers/eligibility.ts, never by the database alone):
--   NEXT_PUBLIC_OFFERS_ENABLED = 'true', advertiser.program_status = 'approved',
--   advertiser.is_active, campaign.status = 'active', inside its dates, a real
--   http(s) tracking_url, and no <<PASTE…>> placeholder anywhere in its copy.

-- ---------------------------------------------------------------------------
-- 1. Advertisers: affiliate-program state
-- ---------------------------------------------------------------------------
-- program_status tracks Drew's application with the program; nothing renders
-- until it is 'approved'. payout_note is a free-text internal note — never
-- rendered, never parsed as a number.

alter table public.ad_advertisers
  add column if not exists network text check (network in ('impact', 'direct', 'other')),
  add column if not exists program_status text not null default 'draft'
    check (program_status in ('draft', 'applied', 'approved', 'paused', 'rejected')),
  add column if not exists terms_verified_at timestamptz,
  add column if not exists disclosure_text text,
  add column if not exists payout_note text;

-- Mortgage lenders (the Rent vs Buy pilot) need their own category.
alter table public.ad_advertisers drop constraint if exists ad_advertisers_category_check;
alter table public.ad_advertisers add constraint ad_advertisers_category_check
  check (category in (
    'budgeting', 'investing', 'banking', 'debt', 'insurance',
    'taxes', 'cashback', 'security', 'rewards', 'credit-cards', 'mortgage'
  ));

-- The seeded banner advertisers are refer-a-friend links, not approved
-- programs: every one starts as 'draft' (the column default). The weakest
-- brand fits for a U.S. personal-finance audience are parked as 'paused'.
update public.ad_advertisers
set program_status = 'paused'
where slug in ('nordvpn', 'weward', 'cash-app') and program_status = 'draft';

-- ---------------------------------------------------------------------------
-- 2. Campaigns: the affiliate link
-- ---------------------------------------------------------------------------
-- tracking_url holds the approved affiliate link (or a <<PASTE_AFFILIATE_URL>>
-- placeholder). If it contains {sub_id}, /go/<campaign> fills it from
-- sub_id_template ({tool_id}, {session_short}) — no PII.
-- A campaign's context is its placement: 'tool-post-result' campaigns are
-- the after-the-result offers; the rest are banners.

alter table public.ad_campaigns
  add column if not exists tracking_url text,
  add column if not exists sub_id_template text;

-- ---------------------------------------------------------------------------
-- 3. The offer card format and the after-the-result placement
-- ---------------------------------------------------------------------------

alter table public.ad_creatives drop constraint if exists ad_creatives_format_check;
alter table public.ad_creatives add constraint ad_creatives_format_check
  check (format in ('medium_rectangle', 'leaderboard', 'mobile_banner', 'large_rectangle', 'offer_card'));

insert into public.ad_placements (slug, name, formats, rotation_interval_ms, is_active)
values ('tool-post-result', 'After the result (one offer)', '{offer_card}', 15000, true)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- 4. Click tracking: the /go redirect logs 'outbound'
-- ---------------------------------------------------------------------------

alter table public.ad_events drop constraint if exists ad_events_event_type_check;
alter table public.ad_events add constraint ad_events_event_type_check
  check (event_type in ('impression', 'click', 'outbound'));

-- Same columns as before; clicks now include /go redirects.
create or replace view public.ad_stats_daily
  with (security_invoker = true) as
select
  campaign_id,
  creative_id,
  advertiser_id,
  (created_at at time zone 'utc')::date as day,
  count(*) filter (where event_type = 'impression') as impressions,
  count(*) filter (where event_type in ('click', 'outbound')) as clicks
from public.ad_events
group by campaign_id, creative_id, advertiser_id, (created_at at time zone 'utc')::date;

-- ---------------------------------------------------------------------------
-- 5. Conversions and payouts (entered by hand or from a network CSV)
-- ---------------------------------------------------------------------------
-- Amounts come only from the network's own report — never estimated here.
-- external_id (the network's conversion/action id) makes a CSV re-import
-- update rows instead of duplicating them.

create table if not exists public.offer_conversions (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.ad_campaigns(id) on delete set null,
  tool_id text,
  occurred_on date not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'reversed')),
  amount_cents integer check (amount_cents is null or amount_cents >= 0),
  source text not null default 'manual' check (source in ('manual', 'csv', 'network')),
  external_id text unique,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_offer_conversions_campaign on public.offer_conversions (campaign_id);
create index if not exists idx_offer_conversions_occurred on public.offer_conversions (occurred_on desc);

drop trigger if exists set_offer_conversions_updated_at on public.offer_conversions;
create trigger set_offer_conversions_updated_at
  before update on public.offer_conversions
  for each row execute function public.update_updated_at_column();

alter table public.offer_conversions enable row level security;

drop policy if exists "Service role manages offer conversions" on public.offer_conversions;
create policy "Service role manages offer conversions"
  on public.offer_conversions
  for all
  to service_role
  using (true)
  with check (true);

revoke all on public.offer_conversions from anon, authenticated;

-- ---------------------------------------------------------------------------
-- 6. Scorecard: affiliate revenue from confirmed conversions
-- ---------------------------------------------------------------------------
-- Same columns as 20260929120000_monetization_scorecard.sql; the affiliate
-- line now counts confirmed conversions and sums their reported amounts.

create or replace view public.v_revenue_by_line
with (security_invoker = true) as
with windows (time_window, since) as (
  values
    ('7d', now() - interval '7 days'),
    ('30d', now() - interval '30 days'),
    ('all', '-infinity'::timestamptz)
),
lines (line, sort_order, source_note) as (
  values
    ('affiliate', 1, 'Confirmed conversions and the amounts the network reported (offer_conversions).'),
    ('lifetime', 2, 'Purchases; amounts arrive with the purchases table in Phase 2.'),
    ('monthly_subscription', 3, 'Webhook-confirmed upgrades; amounts live in Stripe.'),
    ('advisor_referral', 4, 'Submitted advisor requests (Phase 4).')
),
event_units as (
  select l.line, w.time_window, count(e.id) as units
  from lines l
  cross join windows w
  left join public.v_scorecard_events e
    on e.created_at >= w.since
    and (
      (l.line = 'lifetime' and e.event_type = 'checkout_completed' and e.event_data ->> 'plan' = 'lifetime')
      or (l.line = 'monthly_subscription' and e.event_type = 'subscription_upgrade' and e.session_id like 'server-%')
      or (l.line = 'advisor_referral' and e.event_type = 'advisor_intake_submitted')
    )
  group by l.line, w.time_window
),
affiliate as (
  select
    w.time_window,
    count(c.id) as units,
    sum(c.amount_cents)::bigint as revenue_cents
  from windows w
  left join public.offer_conversions c
    on c.status = 'confirmed'
    and c.occurred_on >= (w.since at time zone 'utc')::date
  group by w.time_window
)
select
  l.line,
  l.sort_order,
  w.time_window,
  case when l.line = 'affiliate' then a.units else eu.units end as units,
  case when l.line = 'affiliate' then a.revenue_cents else null::bigint end as revenue_cents,
  l.source_note
from lines l
cross join windows w
join event_units eu on eu.line = l.line and eu.time_window = w.time_window
join affiliate a on a.time_window = w.time_window;

revoke all on public.v_revenue_by_line from anon, authenticated;

notify pgrst, 'reload schema';
