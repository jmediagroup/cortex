-- Analytics retention for public.events
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor). Safe to re-run.
--
-- The daily Vercel cron /api/cron/delete-old-events (vercel.json) calls
-- delete_old_events(retention_days => 365) to keep the table from growing
-- forever.
--
-- Why a new signature instead of scheduling the existing function:
--   * The live zero-argument delete_old_events() deletes rows older than
--     90 days (fix_security_issues.sql shortened it from the original 365)
--     and has never run. On 2026-09-25 the planner estimated ~16,000 of the
--     table's ~25,000 rows are older than 90 days, versus ~0 older than
--     365 days, so scheduling it as-is would wipe most of the history.
--   * Taking the window as an argument keeps the retention visible in the
--     cron route, and a cron deployed before this migration is applied fails
--     with "function not found" instead of running the 90-day delete.
--
-- The zero-argument version stays (older migrations reference it) but now
-- uses the same 365-day window, so running it by hand cannot delete more.

create or replace function public.delete_old_events(retention_days integer)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_count bigint;
begin
  if retention_days is null or retention_days < 30 then
    raise exception 'delete_old_events: retention_days must be at least 30, got %', retention_days;
  end if;

  delete from public.events
  where created_at < now() - make_interval(days => retention_days);

  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

-- Only the service role (the cron route) may run it. EXECUTE defaults to
-- PUBLIC and Supabase also grants it to the API roles, so revoke both.
revoke execute on function public.delete_old_events(integer) from public, anon, authenticated;
grant execute on function public.delete_old_events(integer) to service_role;

-- Same entry point as before, on the new 365-day window. CREATE OR REPLACE
-- keeps its existing grants (service_role only, per
-- secure_users_update_and_definer_execute.sql).
create or replace function public.delete_old_events()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.delete_old_events(365);
end;
$$;

-- Let the API (PostgREST) see the new signature right away.
notify pgrst, 'reload schema';
