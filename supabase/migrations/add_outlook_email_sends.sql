-- Outlook email send log
-- One row per digest email batch (daily/weekly). Provides:
--   1. Dedupe — the unique (type, slug) constraint lets runDigest "claim" a send
--      before dispatching, so a post is never emailed twice even if the cron
--      re-runs or the freshness window re-picks an already-sent post.
--   2. Observability — a durable record of what went out, when, and to how many.
-- Service-role-only access from the cron route; no RLS policies needed.

create extension if not exists "pgcrypto";

create table if not exists public.outlook_email_sends (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  slug text not null,
  outlook_date date not null,
  recipient_count integer not null default 0,
  sent_count integer not null default 0,
  failed_count integer not null default 0,
  claimed_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (type, slug)
);

create index if not exists outlook_email_sends_type_date_idx
  on public.outlook_email_sends (type, outlook_date desc);

alter table public.outlook_email_sends enable row level security;
-- Intentionally no policies — service role bypasses RLS, anon/authed roles
-- have zero access. Only the /api/outlook/email/* cron routes touch this table.
