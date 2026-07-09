-- Make the signup trigger populate first_name from the signup metadata
-- (supabase.auth.signUp options.data.first_name -> auth.users.raw_user_meta_data).
--
-- This makes the trigger create a COMPLETE public.users row atomically on
-- signup, which lets us delete the /api/create-user-record fallback route —
-- an unauthenticated, service-role endpoint that ran an unconditional
-- UPDATE first_name on the posted userId (anyone who knew a user's UUID could
-- overwrite their name). The trigger already has an EXCEPTION handler so it
-- never blocks auth signup.
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
  WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user trigger failed for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;
