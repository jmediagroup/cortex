-- Drop three indexes on public.events that no query uses
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor). Safe to re-run.
--
-- Every analytics insert pays to maintain these, but on 2026-09-25
-- pg_stat_user_indexes showed idx_scan = 0 for all three:
--   idx_events_data        GIN (event_data)   864 kB
--   idx_events_session_id  btree (session_id) 352 kB
--   idx_events_event_type  btree (event_type) 312 kB
--
-- Code check: nothing filters events by event_data or session_id. The admin
-- stats and analytics routes filter and sort by created_at
-- (idx_events_created_at, kept). The only event_type filter is
-- getEventsByType() in lib/analytics.ts, which nothing calls; it runs as the
-- signed-in user, whose RLS policy already limits it to their own user_id,
-- which idx_events_user_type (user_id, event_type) covers. Per-user lookups
-- (get_user_event_summary) keep idx_events_user_id.
--
-- Each DROP takes a brief lock on this small table. To undo, recreate them
-- from supabase-analytics-migration.sql.

drop index if exists public.idx_events_data;
drop index if exists public.idx_events_session_id;
drop index if exists public.idx_events_event_type;
