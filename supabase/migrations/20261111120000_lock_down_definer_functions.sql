-- ============================================================
-- Lock down two SECURITY DEFINER functions the Supabase security advisor
-- flags as callable by anyone (lints 0028 / 0029).
--
-- 1. public.get_user_event_summary(target_user_id uuid)
--    SECURITY DEFINER bypasses RLS on public.events, and it takes ANY user id.
--    Because EXECUTE defaults to PUBLIC, anyone holding the public anon key
--    could call  POST /rest/v1/rpc/get_user_event_summary {"target_user_id": …}
--    and read another person's activity summary (event types, counts, last
--    seen). Nothing in the app calls it (the unused browser helper was
--    removed in the same change), so only the service role keeps access.
--
-- 2. public.sync_email_verified_at()
--    A trigger function (harden_signup_abuse.sql). Triggers fire regardless
--    of the caller's EXECUTE privilege, so revoking it changes nothing for
--    email confirmation — it only removes the pointless public RPC endpoint.
--
-- EXECUTE defaults to PUBLIC, so it must be revoked from PUBLIC; revoking
-- from anon/authenticated alone is a no-op (same pattern as
-- secure_users_update_and_definer_execute.sql).
--
-- Deliberately NOT touched: is_admin(), get_user_accessible_org_ids(),
-- get_user_accessible_company_names(), accept_client_invite(),
-- find_pending_invite(), get_user_outstanding_balance(),
-- create_welcome_notification(), notify_on_ticket_reply() and rls_auto_enable().
-- They belong to the separate client-portal app that shares this project and
-- some are referenced by its RLS policies; revoking them here could break
-- that app. Audit them with it.
--
-- Idempotent: safe to re-run.
--
-- APPLIED to production (pehteunyustvnxmxjcfk) on 2026-11-11 at Drew's
-- instruction, after a dry run in a rolled-back transaction. Nothing else in
-- the database references either function except the on_auth_user_confirmed
-- trigger. Verified after applying: anon/authenticated cannot EXECUTE either
-- function, service_role can; advisor lints 0028/0029 went from 11 to 9
-- findings each (both functions gone); every other advisor count unchanged.
-- ============================================================

REVOKE EXECUTE ON FUNCTION public.get_user_event_summary(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_event_summary(uuid) TO service_role;

REVOKE EXECUTE ON FUNCTION public.sync_email_verified_at() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.sync_email_verified_at() TO service_role;
