-- ============================================================
-- Fix: "Database error saving new user" on signup
--
-- Root cause: The handle_new_user() trigger on auth.users fails
-- and causes the entire auth signup to be rolled back.
--
-- Fix: Add EXCEPTION handler so trigger errors don't block signup.
-- The client-side code will handle user record creation as a fallback.
-- ============================================================

-- Fix handle_new_user function with proper error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, tier)
  VALUES (NEW.id, COALESCE(NEW.email, ''), 'free')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't block auth signup
    RAISE WARNING 'handle_new_user trigger failed for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Ensure the trigger exists on auth.users
-- (DROP first to avoid "trigger already exists" error)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Ensure the users table allows inserts from the service role
-- (needed for the API route fallback)
DO $$
BEGIN
  -- Only create policy if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'users'
    AND policyname = 'Service role can manage users'
  ) THEN
    CREATE POLICY "Service role can manage users"
    ON public.users
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
  END IF;
END $$;
