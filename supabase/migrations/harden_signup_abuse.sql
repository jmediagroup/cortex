-- ============================================================
-- Signup abuse hardening
--
-- Problem: public.users filled up with never-verified "free" accounts. The
-- addresses were Gmail alias farms — Google ignores dots and anything after a
-- '+' in the local part, so b.i.la.l.man.so.or@gmail.com, bi.lal.mansoor@…
-- and bilalmansoor+1@… are all one inbox but looked like three customers.
-- Nothing canonicalised addresses, and nothing recorded whether an account had
-- ever confirmed its email, so the admin panel counted bots as users.
--
-- This migration adds:
--   1. normalize_email()      — canonical form of an address, in SQL
--   2. users.email_normalized — a GENERATED column, so it can never drift and
--                               applies even to signups that bypass our API
--   3. users.email_verified_at — kept in sync with auth.users
--   4. abuse signal columns   — signup_ip_hash, signup_flags, is_flagged
--   5. reporting views        — alias clusters and unverified accounts
--   6. purge_unverified_users() — dry-run by default
--
-- Safe to run more than once.
-- ============================================================


-- ============================================================
-- 1. Canonical address form
-- ============================================================
-- Mirrors lib/email-hygiene.ts `normalizeEmail`. Keep the two in sync: this
-- one is the source of truth for storage, the TypeScript one for pre-checks.
--
-- IMMUTABLE is required for the generated column below, and is honest here:
-- the result depends only on the input.
--
-- The result is a COMPARISON KEY, never a delivery address. Mail must always
-- go to users.email, the address the person actually typed.
CREATE OR REPLACE FUNCTION public.normalize_email(raw text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  v            text := lower(btrim(coalesce(raw, '')));
  local_part   text;
  domain_part  text;
  plus_pos     int;
BEGIN
  -- Anything that isn't a single well-formed address is returned unchanged so
  -- the column never errors on legacy junk.
  IF v !~ '^[^@[:space:]]+@[^@[:space:]]+$' THEN
    RETURN v;
  END IF;

  local_part  := split_part(v, '@', 1);
  domain_part := split_part(v, '@', 2);

  -- Domains that are the same mailbox under a different name.
  domain_part := CASE domain_part
    WHEN 'googlemail.com'  THEN 'gmail.com'
    WHEN 'hotmail.co.uk'   THEN 'hotmail.com'
    WHEN 'live.co.uk'      THEN 'live.com'
    WHEN 'ymail.com'       THEN 'yahoo.com'
    WHEN 'rocketmail.com'  THEN 'yahoo.com'
    WHEN 'me.com'          THEN 'icloud.com'
    WHEN 'mac.com'         THEN 'icloud.com'
    WHEN 'pm.me'           THEN 'proton.me'
    WHEN 'protonmail.com'  THEN 'proton.me'
    WHEN 'protonmail.ch'   THEN 'proton.me'
    ELSE domain_part
  END;

  -- Sub-addressing: every major provider treats '+tag' as a user-chosen suffix.
  plus_pos := position('+' in local_part);
  IF plus_pos > 1 THEN
    local_part := substring(local_part from 1 for plus_pos - 1);
  END IF;

  -- Google, and only Google, ignores dots in the local part.
  IF domain_part = 'gmail.com' THEN
    local_part := replace(local_part, '.', '');
  END IF;

  RETURN local_part || '@' || domain_part;
END;
$$;

COMMENT ON FUNCTION public.normalize_email(text) IS
  'Canonical comparison key for an email address (strips +tags, and dots for gmail). Never use as a delivery address.';


-- ============================================================
-- 2. Columns
-- ============================================================

-- Generated (not just backfilled) so it stays correct for every future row,
-- including accounts created by posting straight at the Supabase auth API.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'email_normalized'
  ) THEN
    ALTER TABLE public.users
      ADD COLUMN email_normalized text
      GENERATED ALWAYS AS (public.normalize_email(email)) STORED;
  END IF;
END;
$$;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS email_verified_at timestamptz,
  -- Salted SHA-256 of the signup IP. Lets us cluster a flood by origin without
  -- retaining raw addresses.
  ADD COLUMN IF NOT EXISTS signup_ip_hash    text,
  -- Reason codes from lib/email-hygiene.ts `assessSignup`.
  ADD COLUMN IF NOT EXISTS signup_flags      text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_flagged        boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.users.email_normalized IS
  'Generated canonical form of email, for duplicate/alias detection. Not a delivery address.';
COMMENT ON COLUMN public.users.email_verified_at IS
  'Mirrors auth.users.email_confirmed_at. NULL means the address was never confirmed.';
COMMENT ON COLUMN public.users.signup_flags IS
  'Abuse reason codes recorded at signup (alias_address, machine_generated_name, …).';

-- Non-unique for now: existing rows almost certainly contain alias collisions,
-- so a unique index would fail to build. Promote it to UNIQUE after cleanup —
-- see enforce_email_normalized_unique.sql.
CREATE INDEX IF NOT EXISTS idx_users_email_normalized
  ON public.users (email_normalized);

CREATE INDEX IF NOT EXISTS idx_users_email_verified_at
  ON public.users (email_verified_at);

CREATE INDEX IF NOT EXISTS idx_users_signup_ip_hash
  ON public.users (signup_ip_hash)
  WHERE signup_ip_hash IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_users_is_flagged
  ON public.users (is_flagged)
  WHERE is_flagged;


-- ============================================================
-- 3. Keep email_verified_at in sync with auth.users
-- ============================================================
-- Without this, public.users has no idea whether an account is real. The row
-- is created the moment auth.users gets an INSERT — which is *before* the
-- confirmation link is clicked — so every bot signup showed up as a fully
-- fledged "FREE" user in the admin panel.

CREATE OR REPLACE FUNCTION public.sync_email_verified_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.users
     SET email_verified_at = NEW.email_confirmed_at
   WHERE id = NEW.id
     AND email_verified_at IS DISTINCT FROM NEW.email_confirmed_at;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Never block a confirmation on a bookkeeping failure.
    RAISE WARNING 'sync_email_verified_at failed for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;

CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  WHEN (NEW.email_confirmed_at IS DISTINCT FROM OLD.email_confirmed_at)
  EXECUTE FUNCTION public.sync_email_verified_at();

-- Backfill for everyone who already confirmed.
UPDATE public.users u
   SET email_verified_at = a.email_confirmed_at
  FROM auth.users a
 WHERE a.id = u.id
   AND u.email_verified_at IS DISTINCT FROM a.email_confirmed_at;


-- ============================================================
-- 4. Reporting views for the admin panel
-- ============================================================

-- Alias clusters: one row per real inbox that has more than one account.
-- This is the direct view of the abuse — order by account_count desc to see
-- the worst offenders first.
CREATE OR REPLACE VIEW public.user_alias_clusters AS
SELECT
  email_normalized,
  count(*)                                                   AS account_count,
  count(*) FILTER (WHERE email_verified_at IS NOT NULL)       AS verified_count,
  array_agg(email ORDER BY created_at)                        AS addresses,
  min(created_at)                                             AS first_seen,
  max(created_at)                                             AS last_seen
FROM public.users
GROUP BY email_normalized
HAVING count(*) > 1;

COMMENT ON VIEW public.user_alias_clusters IS
  'Groups of accounts that resolve to the same real inbox (Gmail dot/plus aliases).';

-- Headline numbers for the admin overview.
CREATE OR REPLACE VIEW public.signup_abuse_summary AS
SELECT
  count(*)                                                        AS total_users,
  count(*) FILTER (WHERE email_verified_at IS NOT NULL)           AS verified_users,
  count(*) FILTER (WHERE email_verified_at IS NULL)               AS unverified_users,
  count(*) FILTER (WHERE is_flagged)                              AS flagged_users,
  count(*) FILTER (
    WHERE email_verified_at IS NULL
      AND created_at < now() - interval '7 days'
  )                                                               AS stale_unverified_users,
  count(DISTINCT email_normalized)                                AS distinct_inboxes
FROM public.users;

-- Views inherit the querying role's permissions; only the service role (used
-- by /api/admin/*) and postgres should read them.
REVOKE ALL ON public.user_alias_clusters FROM anon, authenticated;
REVOKE ALL ON public.signup_abuse_summary FROM anon, authenticated;


-- ============================================================
-- 5. Purge helper — DRY RUN BY DEFAULT
-- ============================================================
-- Deletes accounts that never confirmed their email address and are older than
-- `p_older_than`. Deleting from auth.users cascades to public.users.
--
--   SELECT * FROM public.purge_unverified_users();                  -- preview
--   SELECT * FROM public.purge_unverified_users('7 days', true);    -- execute
--
-- Always preview first. An unverified account is not automatically a bot — a
-- real person who never clicked the link looks identical.
CREATE OR REPLACE FUNCTION public.purge_unverified_users(
  p_older_than interval DEFAULT '7 days',
  p_commit     boolean  DEFAULT false
)
RETURNS TABLE (user_id uuid, email text, created_at timestamptz, deleted boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- ON COMMIT DROP only fires at transaction end, so a second call inside the
  -- same transaction would collide with the first one's table.
  DROP TABLE IF EXISTS _purge_candidates;

  CREATE TEMP TABLE _purge_candidates ON COMMIT DROP AS
  SELECT u.id, u.email, u.created_at
    FROM public.users u
   WHERE u.email_verified_at IS NULL
     AND u.created_at < now() - p_older_than
     -- Never touch anyone who has paid or is mid-subscription, whatever their
     -- verification state.
     AND u.stripe_customer_id IS NULL
     AND u.stripe_subscription_id IS NULL
     AND u.tier = 'free';

  IF p_commit THEN
    DELETE FROM auth.users a
     USING _purge_candidates c
     WHERE a.id = c.id;
  END IF;

  RETURN QUERY
  SELECT c.id, c.email, c.created_at, p_commit FROM _purge_candidates c;
END;
$$;

REVOKE ALL ON FUNCTION public.purge_unverified_users(interval, boolean) FROM PUBLIC, anon, authenticated;

COMMENT ON FUNCTION public.purge_unverified_users(interval, boolean) IS
  'Preview (default) or delete never-verified free accounts older than the given interval. Skips anyone with Stripe records.';


-- ============================================================
-- 6. Verify
-- ============================================================
-- SELECT * FROM public.signup_abuse_summary;
-- SELECT * FROM public.user_alias_clusters ORDER BY account_count DESC LIMIT 25;
-- SELECT * FROM public.purge_unverified_users();
