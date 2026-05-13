-- 1. Create RPC to allow users to restore their own profile if it was deleted
CREATE OR REPLACE FUNCTION public.restore_my_profile()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
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
      CASE 
        WHEN v_user.email IN ('hugo.valle@neutrowaste.com', 'admin@neutrowaste.com') THEN 'active'
        ELSE 'pending'
      END,
      false
    )
    ON CONFLICT (id) DO UPDATE SET
      status = CASE 
        WHEN EXCLUDED.email IN ('hugo.valle@neutrowaste.com', 'admin@neutrowaste.com') THEN 'active'
        ELSE public.profiles.status
      END;
  END IF;
END;
$$;

-- 2. Update trigger to ensure admins are always created as active admins
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $$
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
    CASE 
      WHEN NEW.email IN ('hugo.valle@neutrowaste.com', 'admin@neutrowaste.com') THEN 'active'
      ELSE 'pending'
    END
  ) ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 3. Restore any missing profiles for existing auth users immediately
DO $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role, status, is_online)
  SELECT 
    id, 
    COALESCE(raw_user_meta_data->>'name', 'Usuário Restaurado'), 
    email, 
    CASE 
      WHEN email IN ('hugo.valle@neutrowaste.com', 'admin@neutrowaste.com') THEN 'Admin'
      ELSE COALESCE(raw_user_meta_data->>'role', 'Vendedor')
    END,
    'active', 
    false
  FROM auth.users
  WHERE id NOT IN (SELECT id FROM public.profiles)
  ON CONFLICT (id) DO NOTHING;

  -- 4. Ensure known admins are always active admins
  UPDATE public.profiles 
  SET role = 'Admin', status = 'active'
  WHERE email IN ('hugo.valle@neutrowaste.com', 'admin@neutrowaste.com');
END $$;
