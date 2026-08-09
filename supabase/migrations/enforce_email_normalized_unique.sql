-- ============================================================
-- Enforce one account per real inbox
--
-- RUN THIS ONLY AFTER cleaning up existing alias collisions — it will fail
-- (by design) while duplicates remain. Sequence:
--
--   1. Run harden_signup_abuse.sql
--   2. Inspect:  SELECT * FROM public.user_alias_clusters
--                ORDER BY account_count DESC;
--   3. Preview:  SELECT * FROM public.purge_unverified_users('7 days');
--   4. Execute:  SELECT * FROM public.purge_unverified_users('7 days', true);
--   5. Re-check the cluster view is empty, then run this file.
--
-- Once this index exists, a Gmail alias farm cannot create a second account
-- even by posting directly at the Supabase auth API — the insert into
-- public.users fails, which is exactly the guarantee the application-level
-- check in /api/auth/signup cannot make on its own.
-- ============================================================

-- Fail loudly and early with a useful message rather than a raw index error.
DO $$
DECLARE
  dupes int;
BEGIN
  SELECT count(*) INTO dupes FROM public.user_alias_clusters;
  IF dupes > 0 THEN
    RAISE EXCEPTION
      'Cannot add unique index: % inbox(es) still have multiple accounts. Inspect public.user_alias_clusters and clean up first.',
      dupes;
  END IF;
END;
$$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_normalized_unique
  ON public.users (email_normalized);

-- The non-unique index from harden_signup_abuse.sql is now redundant.
DROP INDEX IF EXISTS public.idx_users_email_normalized;

COMMENT ON INDEX public.idx_users_email_normalized_unique IS
  'One account per real inbox. Gmail dot/plus aliases collapse to a single key.';


-- ============================================================
-- Make the signup trigger fail gracefully on a collision
-- ============================================================
-- handle_new_user() already swallows exceptions, so a blocked duplicate leaves
-- an auth.users row with no public.users row rather than a hard signup error.
-- Log it distinctly so these are easy to find and reap.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, tier, first_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    'free',
    NULLIF(NEW.raw_user_meta_data->>'first_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    RAISE WARNING 'handle_new_user: alias collision for % (%) — no profile row created',
      NEW.email, NEW.id;
    RETURN NEW;
  WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user trigger failed for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Auth rows left orphaned by the above (no matching profile) are abuse
-- attempts; list them with:
--
--   SELECT a.id, a.email, a.created_at
--     FROM auth.users a
--     LEFT JOIN public.users u ON u.id = a.id
--    WHERE u.id IS NULL
--    ORDER BY a.created_at DESC;
