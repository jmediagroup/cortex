-- Product hardening: shared rate limits, failed-login log, AI spend ledger.
-- See docs/HARDENING.md. Additive only and safe to re-run.
--
-- Apply to a Supabase branch (or a local Postgres) first, never straight to
-- production (CLAUDE.md rule 3). The app works before this is applied: every
-- caller falls back to its old in-memory behaviour when these objects are
-- missing, so deploy order does not matter.
--
-- All three tables are written and read ONLY by server code holding the
-- service role key. RLS is on with no policies for anon/authenticated, and the
-- table + function grants for those roles are revoked, so the public anon key
-- can neither read nor write them through PostgREST.
--
-- No raw PII is stored: rate-limit keys and failed-login identifiers are
-- SHA-256 hashes computed in the app (salted with RATE_LIMIT_SALT when set).

-- ---------------------------------------------------------------------------
-- 1. Shared rate-limit buckets (fixed window, one row per key)
-- ---------------------------------------------------------------------------
create table if not exists public.rate_limit_buckets (
  key text primary key,
  hits integer not null default 0,
  reset_at timestamptz not null
);

comment on table public.rate_limit_buckets is
  'Fixed-window counters shared by every serverless instance (lib/rate-limit.ts). Keys are hashed. Service role only.';

alter table public.rate_limit_buckets enable row level security;
revoke all on table public.rate_limit_buckets from anon, authenticated;

create index if not exists rate_limit_buckets_reset_at_idx
  on public.rate_limit_buckets (reset_at);

-- Atomically counts one hit (or p_cost hits) against p_key and reports whether
-- the caller is still within p_limit for the current window. p_cost = 0 reads
-- the bucket without changing it (used by the AI circuit breaker to peek).
create or replace function public.rate_limit_hit(
  p_key text,
  p_limit integer,
  p_window_seconds integer,
  p_cost integer default 1
)
returns table (allowed boolean, hits integer, reset_at timestamptz)
language plpgsql
security invoker
set search_path = ''
as $$
#variable_conflict use_column
begin
  if p_key is null or length(p_key) = 0 or length(p_key) > 200 then
    raise exception 'rate_limit_hit: invalid key';
  end if;
  if p_limit is null or p_limit < 0 or p_window_seconds is null or p_window_seconds < 1
     or p_cost is null or p_cost < 0 then
    raise exception 'rate_limit_hit: invalid arguments';
  end if;

  if p_cost = 0 then
    return query
      select (b.reset_at <= now() or b.hits < p_limit),
             case when b.reset_at <= now() then 0 else b.hits end,
             b.reset_at
      from public.rate_limit_buckets b
      where b.key = p_key;
    if not found then
      return query select true, 0, now() + make_interval(secs => p_window_seconds);
    end if;
    return;
  end if;

  return query
    insert into public.rate_limit_buckets as b (key, hits, reset_at)
    values (p_key, p_cost, now() + make_interval(secs => p_window_seconds))
    on conflict (key) do update set
      hits = case when b.reset_at <= now() then excluded.hits else b.hits + excluded.hits end,
      reset_at = case when b.reset_at <= now() then excluded.reset_at else b.reset_at end
    returning (b.hits <= p_limit), b.hits, b.reset_at;
end;
$$;

revoke execute on function public.rate_limit_hit(text, integer, integer, integer) from public, anon, authenticated;
grant execute on function public.rate_limit_hit(text, integer, integer, integer) to service_role;

-- ---------------------------------------------------------------------------
-- 2. Security log: failed / blocked logins
-- ---------------------------------------------------------------------------
create table if not exists public.auth_events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  event text not null check (event in ('login_failed', 'login_blocked')),
  -- Short machine code: invalid_credentials, email_not_confirmed,
  -- rate_limited_ip, rate_limited_email, captcha_failed, honeypot, ...
  reason text not null check (length(reason) <= 60),
  -- Salted SHA-256 of the normalized email / client IP. Lets you see that one
  -- account is being hammered from many IPs (credential stuffing) or one IP is
  -- trying many accounts, without storing either in the clear.
  email_hash text check (email_hash is null or length(email_hash) = 64),
  ip_hash text check (ip_hash is null or length(ip_hash) = 64)
);

comment on table public.auth_events is
  'Every failed or blocked login through /api/auth/login. Hashed identifiers only. Service role only. Pruned after 90 days.';

alter table public.auth_events enable row level security;
revoke all on table public.auth_events from anon, authenticated;

create index if not exists auth_events_created_at_idx on public.auth_events (created_at desc);
create index if not exists auth_events_email_hash_idx on public.auth_events (email_hash, created_at desc)
  where email_hash is not null;

-- Daily summary for the admin / SQL editor. security_invoker so it never
-- widens access beyond the caller's own rights on auth_events.
create or replace view public.auth_failed_login_daily
with (security_invoker = true) as
select
  date_trunc('day', created_at) as day,
  event,
  reason,
  count(*) as attempts,
  count(distinct email_hash) as distinct_accounts,
  count(distinct ip_hash) as distinct_ips
from public.auth_events
group by 1, 2, 3;

revoke all on public.auth_failed_login_daily from anon, authenticated;

-- ---------------------------------------------------------------------------
-- 3. AI spend ledger (one row per upstream model call)
-- ---------------------------------------------------------------------------
create table if not exists public.ai_usage (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  feature text not null check (length(feature) <= 60),
  model text not null check (length(model) <= 80),
  input_tokens integer not null default 0 check (input_tokens >= 0),
  output_tokens integer not null default 0 check (output_tokens >= 0),
  cache_read_input_tokens integer not null default 0 check (cache_read_input_tokens >= 0),
  -- Estimated from the published per-token price in lib/ai/pricing.ts.
  cost_usd numeric(12, 6) not null default 0 check (cost_usd >= 0)
);

comment on table public.ai_usage is
  'Token usage and estimated cost of every Anthropic call, for the monthly AI budget (lib/ai/budget.ts). No user ids, no prompt text. Service role only.';

alter table public.ai_usage enable row level security;
revoke all on table public.ai_usage from anon, authenticated;

create index if not exists ai_usage_created_at_idx on public.ai_usage (created_at desc);

-- Month-to-date estimated spend (UTC calendar month).
create or replace function public.ai_spend_month_to_date()
returns numeric
language sql
stable
security invoker
set search_path = ''
as $$
  select coalesce(sum(cost_usd), 0)
  from public.ai_usage
  where created_at >= date_trunc('month', now() at time zone 'utc') at time zone 'utc';
$$;

revoke execute on function public.ai_spend_month_to_date() from public, anon, authenticated;
grant execute on function public.ai_spend_month_to_date() to service_role;

-- ---------------------------------------------------------------------------
-- 4. Housekeeping, called by the daily /api/cron/delete-old-events
-- ---------------------------------------------------------------------------
create or replace function public.prune_security_tables()
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  buckets bigint;
  events bigint;
  usage bigint;
begin
  delete from public.rate_limit_buckets where reset_at < now() - interval '1 day';
  get diagnostics buckets = row_count;

  delete from public.auth_events where created_at < now() - interval '90 days';
  get diagnostics events = row_count;

  -- Keep 13 months so a year-over-year comparison is possible.
  delete from public.ai_usage where created_at < now() - interval '13 months';
  get diagnostics usage = row_count;

  return jsonb_build_object('rate_limit_buckets', buckets, 'auth_events', events, 'ai_usage', usage);
end;
$$;

revoke execute on function public.prune_security_tables() from public, anon, authenticated;
grant execute on function public.prune_security_tables() to service_role;

notify pgrst, 'reload schema';
