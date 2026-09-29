-- Monetization scorecard (docs/monetization/HANDOFF.md, Phase 0 tasks 0.3–0.4)
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor). Safe to re-run.
-- Additive only: one new table and four new views; no existing object changes.
--
--   analytics_excluded_users  owner/admin user ids whose sessions are left out
--   v_scorecard_events        public.events minus bots, non-production hosts
--                             and internal sessions — the base for the rest
--   v_site_traffic            site-wide page views and sessions per window
--   v_tool_funnel             per tool, per window (7d / 30d / all): views,
--                             completions, completion rate, offers, reports,
--                             unlocks, purchases, advisor requests
--   v_revenue_by_line         per revenue line, per window. Revenue stays NULL
--                             until later phases add their sources (the
--                             `source_note` column says which)
--
-- Only the service role (the /admin/monetization API) reads any of it.

-- ---------------------------------------------------------------------------
-- 1. Users whose traffic is internal
-- ---------------------------------------------------------------------------
-- Events go from the browser straight to Supabase, so no server ever sees an
-- IP to hash. The owner is recognized by user id instead: the scorecard API
-- keeps this table in sync with the admin emails (NEXT_PUBLIC_ADMIN_EMAILS)
-- and ANALYTICS_EXCLUDED_USER_IDS, and any session in which one of these
-- users was signed in is excluded — including the anonymous events that
-- session recorded before they signed in.

create table if not exists public.analytics_excluded_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  reason text not null default 'admin' check (reason in ('admin', 'env')),
  created_at timestamptz not null default now()
);

alter table public.analytics_excluded_users enable row level security;

drop policy if exists "Service role manages excluded users" on public.analytics_excluded_users;
create policy "Service role manages excluded users"
  on public.analytics_excluded_users
  for all
  to service_role
  using (true)
  with check (true);

revoke all on public.analytics_excluded_users from anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2. Clean events
-- ---------------------------------------------------------------------------
-- Dropped:
--   * bot-like user agents (crawlers, link previews, headless browsers);
--   * page URLs on localhost or *.vercel.app (development and previews);
--   * every event of a session that was internal — a browser flagged by the
--     app (event_data.internal, lib/analytics.ts) or a user listed above.
-- `tool_id` comes from the funnel events' payload, or — for page views, so
-- the history before Phase 0 still counts — from an /apps/<tool> page URL.

create or replace view public.v_scorecard_events
with (security_invoker = true) as
with internal_sessions as (
  select distinct e.session_id
  from public.events e
  where e.session_id is not null
    and (
      e.event_data ->> 'internal' = 'true'
      or e.user_id in (select x.user_id from public.analytics_excluded_users x)
    )
)
select
  e.id,
  e.created_at,
  e.event_type,
  e.session_id,
  e.user_id,
  e.event_data,
  coalesce(
    e.event_data ->> 'tool_id',
    case
      when e.event_type = 'page_view'
        then substring(e.page_url from '^https?://[^/]+/apps/([a-z0-9-]+)/?(?:[?#].*)?$')
    end
  ) as tool_id
from public.events e
where coalesce(e.user_agent, '') !~* '(bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|facebookexternalhit|embedly|python|curl|wget|httpclient|puppeteer|playwright|selenium|phantomjs)'
  and (e.page_url is null or e.page_url !~* '^https?://(localhost|127\.0\.0\.1|[^/?#]*\.vercel\.app)([:/?#]|$)')
  and (e.session_id is null or e.session_id not in (select s.session_id from internal_sessions s));

-- ---------------------------------------------------------------------------
-- 3. Site-wide traffic
-- ---------------------------------------------------------------------------

create or replace view public.v_site_traffic
with (security_invoker = true) as
with windows (time_window, since) as (
  values
    ('7d', now() - interval '7 days'),
    ('30d', now() - interval '30 days'),
    ('all', '-infinity'::timestamptz)
)
select
  w.time_window,
  count(e.id) as page_views,
  count(distinct e.session_id) as sessions
from windows w
left join public.v_scorecard_events e
  on e.created_at >= w.since
  and e.event_type = 'page_view'
group by w.time_window;

-- ---------------------------------------------------------------------------
-- 4. Per-tool funnel
-- ---------------------------------------------------------------------------
-- One row per tool that had any activity in the window. `page_views` counts
-- /apps/<tool> page loads (history before tool_viewed existed); `views` and
-- everything after it come from the Phase 0+ funnel events.
-- completion_rate = sessions that completed / sessions that viewed.

create or replace view public.v_tool_funnel
with (security_invoker = true) as
with windows (time_window, since) as (
  values
    ('7d', now() - interval '7 days'),
    ('30d', now() - interval '30 days'),
    ('all', '-infinity'::timestamptz)
),
counts as (
  select
    e.tool_id,
    w.time_window,
    count(*) filter (where e.event_type = 'page_view') as page_views,
    count(*) filter (where e.event_type = 'tool_viewed') as views,
    count(distinct e.session_id) filter (where e.event_type = 'tool_viewed') as sessions,
    count(*) filter (where e.event_type = 'tool_calculation_completed') as completions,
    count(distinct e.session_id) filter (where e.event_type = 'tool_calculation_completed') as completing_sessions,
    count(*) filter (where e.event_type = 'result_exit_intent') as exits_after_result,
    count(*) filter (where e.event_type = 'offer_impression') as offer_impressions,
    count(*) filter (where e.event_type = 'offer_click') as offer_clicks,
    count(*) filter (where e.event_type = 'report_email_requested') as report_requests,
    count(*) filter (where e.event_type = 'report_email_sent') as reports_sent,
    count(*) filter (where e.event_type = 'unlock_cta_viewed') as unlock_views,
    count(*) filter (where e.event_type = 'unlock_cta_clicked') as unlock_clicks,
    count(*) filter (where e.event_type = 'checkout_completed') as purchases,
    count(*) filter (where e.event_type = 'advisor_intake_submitted') as advisor_requests
  from windows w
  join public.v_scorecard_events e on e.created_at >= w.since
  where e.tool_id is not null
  group by e.tool_id, w.time_window
)
select
  c.*,
  round(c.completing_sessions::numeric / nullif(c.sessions, 0), 3) as completion_rate
from counts c;

-- ---------------------------------------------------------------------------
-- 5. Revenue by line
-- ---------------------------------------------------------------------------
-- Every line appears in every window, even at zero. `units` counts what can
-- be counted today; `revenue_cents` is NULL until the line's phase gives it a
-- trustworthy source (never estimated here):
--   affiliate             confirmed payouts from offer_conversions (Phase 1)
--   lifetime              checkout_completed with plan = 'lifetime'; amounts
--                         from the purchases table (Phase 2)
--   monthly_subscription  confirmed upgrades: the webhook's server-side
--                         subscription_upgrade events. (The browser also sends
--                         subscription_upgrade when checkout STARTS; those
--                         have ordinary session ids and are not counted.)
--   advisor_referral      advisor_intake_submitted (Phase 4)

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
    ('affiliate', 1, 'Confirmed payouts arrive with offer_conversions in Phase 1.'),
    ('lifetime', 2, 'Purchases; amounts arrive with the purchases table in Phase 2.'),
    ('monthly_subscription', 3, 'Webhook-confirmed upgrades; amounts live in Stripe.'),
    ('advisor_referral', 4, 'Submitted advisor requests (Phase 4).')
)
select
  l.line,
  l.sort_order,
  w.time_window,
  count(e.id) as units,
  null::bigint as revenue_cents,
  l.source_note
from lines l
cross join windows w
left join public.v_scorecard_events e
  on e.created_at >= w.since
  and (
    (l.line = 'lifetime' and e.event_type = 'checkout_completed' and e.event_data ->> 'plan' = 'lifetime')
    or (l.line = 'monthly_subscription' and e.event_type = 'subscription_upgrade' and e.session_id like 'server-%')
    or (l.line = 'advisor_referral' and e.event_type = 'advisor_intake_submitted')
  )
group by l.line, l.sort_order, l.source_note, w.time_window;

-- The views run with the caller's rights (security_invoker), but the API
-- roles have no business reading scorecard data at all: service role only.
revoke all on public.v_scorecard_events from anon, authenticated;
revoke all on public.v_site_traffic from anon, authenticated;
revoke all on public.v_tool_funnel from anon, authenticated;
revoke all on public.v_revenue_by_line from anon, authenticated;

notify pgrst, 'reload schema';
