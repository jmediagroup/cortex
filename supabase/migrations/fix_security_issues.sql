-- ============================================================
-- Supabase Security Fixes Migration
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- ============================================================
-- 1. FIX: RLS Disabled on webhook_events table
-- Enable Row Level Security and add appropriate policies
-- ============================================================

-- Enable RLS on webhook_events table
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can insert (webhooks come from server)
CREATE POLICY "Service role can insert webhook events"
ON public.webhook_events
FOR INSERT
TO service_role
WITH CHECK (true);

-- Policy: Only service role can select (for debugging/admin)
CREATE POLICY "Service role can select webhook events"
ON public.webhook_events
FOR SELECT
TO service_role
USING (true);

-- Policy: Only service role can delete (cleanup)
CREATE POLICY "Service role can delete webhook events"
ON public.webhook_events
FOR DELETE
TO service_role
USING (true);


-- ============================================================
-- 2. FIX: Security Definer View on event_analytics
-- Change to SECURITY INVOKER so it respects the querying user's permissions
-- ============================================================

-- First, get the view definition and recreate it with SECURITY INVOKER
-- You may need to adjust this based on your actual view definition

-- Drop the existing view
DROP VIEW IF EXISTS public.event_analytics;

-- Recreate with SECURITY INVOKER (default, but explicit is better)
-- NOTE: Adjust this query based on your actual view definition
CREATE OR REPLACE VIEW public.event_analytics
WITH (security_invoker = true)
AS
SELECT
  event_type,
  COUNT(*) as event_count,
  DATE_TRUNC('day', created_at) as event_date,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT session_id) as unique_sessions
FROM public.events
GROUP BY event_type, DATE_TRUNC('day', created_at);

-- Grant appropriate permissions
GRANT SELECT ON public.event_analytics TO authenticated;
GRANT SELECT ON public.event_analytics TO service_role;


-- ============================================================
-- 3. FIX: Function Search Path Mutable
-- Set explicit search_path for all functions to prevent search path injection
-- ============================================================

-- Fix delete_old_events function
CREATE OR REPLACE FUNCTION public.delete_old_events()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.events
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$;


-- Fix get_user_event_summary function
-- Must drop first because return type is changing
DROP FUNCTION IF EXISTS public.get_user_event_summary(UUID);

CREATE FUNCTION public.get_user_event_summary(target_user_id UUID)
RETURNS TABLE (
  event_type TEXT,
  event_count BIGINT,
  last_occurrence TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.event_type::TEXT,
    COUNT(*)::BIGINT as event_count,
    MAX(e.created_at) as last_occurrence
  FROM public.events e
  WHERE e.user_id = target_user_id
  GROUP BY e.event_type;
END;
$$;


-- Fix handle_new_user function (trigger function for auth.users)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, tier)
  VALUES (NEW.id, NEW.email, 'free')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;


-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


-- ============================================================
-- 4. Verify the fixes
-- Run these queries to confirm the fixes were applied
-- ============================================================

-- Check RLS is enabled on webhook_events
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'webhook_events';

-- Check view security
SELECT viewname, definition
FROM pg_views
WHERE schemaname = 'public' AND viewname = 'event_analytics';

-- Check function search_path settings
SELECT
  proname as function_name,
  proconfig as config
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
  AND proname IN ('delete_old_events', 'get_user_event_summary', 'handle_new_user', 'update_updated_at_column');


-- ============================================================
-- IMPORTANT: Enable Leaked Password Protection
-- This must be done in the Supabase Dashboard, not via SQL:
--
-- 1. Go to: Authentication > Providers > Email
-- 2. Enable "Leaked Password Protection"
--
-- Or via the Supabase CLI/API if you prefer.
-- ============================================================
