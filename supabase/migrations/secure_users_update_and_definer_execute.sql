-- ============================================================
-- Close the paywall / billing self-service hole on public.users
--
-- Root cause: the "Users can update own data" UPDATE policy had
-- WITH CHECK = null and BOTH `authenticated` and `anon` held table-level
-- UPDATE on every column. Because @supabase/ssr issues the browser the
-- `authenticated` Postgres role, any signed-in free user could
--   PATCH /rest/v1/users?id=eq.<self>  { "tier": "finance_pro" }
-- and grant themselves paid access — and corrupt stripe_customer_id /
-- stripe_subscription_id / subscription_status while they were at it.
--
-- Fix: authenticated users may update only their own profile + onboarding
-- columns. tier and the Stripe billing fields are writable by the service
-- role only (the Stripe webhook path), which bypasses RLS/grants.
--
-- Verified live: after this migration
--   has_column_privilege('authenticated','public.users','tier','UPDATE')       -> false
--   has_column_privilege('authenticated','public.users','first_name','UPDATE') -> true
-- and the client onboarding/profile writes (has_completed_onboarding,
-- onboarding_answers, first_name, last_name, birth_date, gender, updated_at)
-- continue to work.
-- ============================================================

REVOKE UPDATE ON public.users FROM anon, authenticated;

GRANT UPDATE (
  first_name,
  last_name,
  birth_date,
  gender,
  has_completed_onboarding,
  onboarding_answers,
  updated_at
) ON public.users TO authenticated;

-- Ensure an UPDATE cannot re-key the row to another user.
ALTER POLICY "Users can update own data" ON public.users WITH CHECK (auth.uid() = id);

-- Drop the duplicate SELECT policy (identical to "Users can read own data").
DROP POLICY IF EXISTS "Users can view own data" ON public.users;

-- ============================================================
-- Remove direct RPC callability of maintenance / trigger SECURITY DEFINER
-- helpers. EXECUTE defaults to PUBLIC, so it must be revoked from PUBLIC —
-- revoking from anon/authenticated alone is a no-op. service_role and the
-- function owner retain EXECUTE, and triggers fire regardless of caller
-- EXECUTE, so this does not affect signup, updated_at triggers, or the
-- events-cleanup cron.
--
-- NOTE: is_admin(), get_user_accessible_org_ids(), and the client-invite
-- helpers are intentionally NOT touched here — they are referenced by RLS
-- policies on the separate client-portal schema that shares this project and
-- must be audited with that app.
-- ============================================================

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_old_events() FROM PUBLIC, anon, authenticated;
