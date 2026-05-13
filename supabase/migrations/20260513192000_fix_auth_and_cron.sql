-- Fix handle_new_user to make all users 'active' by default to prevent lockout
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (id, name, email, role, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'),
    NEW.email,
    CASE 
      WHEN NEW.email IN ('hugo.valle@neutrowaste.com', 'admin@neutrowaste.com') THEN 'Admin'
      ELSE COALESCE(NEW.raw_user_meta_data->>'role', 'Vendedor')
    END,
    'active' -- Changed to active to avoid login blocks
  ) ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$function$;

-- Fix restore_my_profile to ensure users are restored as 'active'
CREATE OR REPLACE FUNCTION public.restore_my_profile()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user auth.users;
BEGIN
  SELECT * INTO v_user FROM auth.users WHERE id = auth.uid();
  IF FOUND THEN
    INSERT INTO public.profiles (id, name, email, role, status, is_online)
    VALUES (
      v_user.id,
      COALESCE(v_user.raw_user_meta_data->>'name', 'Usuário Restaurado'),
      v_user.email,
      CASE 
        WHEN v_user.email IN ('hugo.valle@neutrowaste.com', 'admin@neutrowaste.com') THEN 'Admin'
        ELSE 'Vendedor'
      END,
      'active',
      false
    )
    ON CONFLICT (id) DO UPDATE SET
      status = 'active';
  END IF;
END;
$function$;

-- Update existing pending users to active to unblock them
UPDATE public.profiles SET status = 'active' WHERE status = 'pending';

-- Fix auth.users null issue just in case
UPDATE auth.users
SET
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change = COALESCE(email_change, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, '')
WHERE
  confirmation_token IS NULL OR recovery_token IS NULL
  OR email_change_token_new IS NULL OR email_change IS NULL
  OR email_change_token_current IS NULL
  OR phone_change IS NULL OR phone_change_token IS NULL
  OR reauthentication_token IS NULL;

-- Set up cron to call the check-expiring-contracts edge function daily at 8 AM
DO $block$
BEGIN
  -- Check if pg_cron and pg_net are available
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') AND EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
    PERFORM cron.schedule(
      'check_contracts_daily',
      '0 8 * * *',
      $$
      SELECT net.http_post(
          url := 'https://tdxqfluypsvaukanahxw.supabase.co/functions/v1/check-expiring-contracts',
          headers := '{"Content-Type": "application/json"}'::jsonb
      );
      $$
    );
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Silently fail if cron scheduling is not permitted by current role
  NULL;
END $block$;
