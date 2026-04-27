-- Outlook subscribers
-- Mailing list for the daily/weekly investment outlook digest sent from /thinking.
-- Service-role-only access from the Next.js API routes; no RLS policies needed
-- because public access would only ever be by token, never by row scan.

create extension if not exists citext;
create extension if not exists "pgcrypto";

create table if not exists public.outlook_subscribers (
  id uuid primary key default gen_random_uuid(),
  email citext not null unique,
  confirmation_token uuid not null default gen_random_uuid(),
  confirmed_at timestamptz,
  unsubscribe_token uuid not null default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  source text,
  created_at timestamptz not null default now()
);

create index if not exists outlook_subscribers_confirmed_idx
  on public.outlook_subscribers (confirmed_at)
  where confirmed_at is not null;

create unique index if not exists outlook_subscribers_unsubscribe_token_idx
  on public.outlook_subscribers (unsubscribe_token);

create unique index if not exists outlook_subscribers_confirmation_token_idx
  on public.outlook_subscribers (confirmation_token);

alter table public.outlook_subscribers enable row level security;
-- Intentionally no policies — service role bypasses RLS, anon/authed roles
-- have zero access. Subscribe/confirm/unsubscribe all flow through API routes
-- using SUPABASE_SERVICE_ROLE_KEY.
