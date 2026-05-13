DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Insert seed user into auth.users if not exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'hugo.valle@neutrowaste.com') THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'hugo.valle@neutrowaste.com',
      crypt('Skip@Pass123', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Hugo Valle"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'hugo.valle@neutrowaste.com';
  END IF;

  -- Ensure profile exists and is active (overrides the handle_new_user trigger defaults)
  INSERT INTO public.profiles (id, name, email, role, status, force_password_change)
  VALUES (v_user_id, 'Hugo Valle', 'hugo.valle@neutrowaste.com', 'Admin', 'active', false)
  ON CONFLICT (id) DO UPDATE SET 
    role = 'Admin',
    status = 'active';

  -- Fix any missing profiles for existing auth.users to prevent silent auth loop
  INSERT INTO public.profiles (id, name, email, role, status, force_password_change)
  SELECT 
    au.id, 
    COALESCE(au.raw_user_meta_data->>'name', 'Usuário'), 
    au.email, 
    'Admin', 
    'active', 
    false
  FROM auth.users au
  WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = au.id);
  
  -- Force all current pending profiles to be active to unblock stuck users
  UPDATE public.profiles SET status = 'active' WHERE status = 'pending';

  -- Ensure app_roles exists for Admin
  INSERT INTO public.app_roles (id, name, permissions)
  VALUES (gen_random_uuid(), 'Admin', '["*"]'::jsonb)
  ON CONFLICT (name) DO UPDATE SET permissions = '["*"]'::jsonb;
END $$;
