-- Semeia ou garante a integridade dos usuários de teste para o login funcionar perfeitamente
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Seed Admin (Hugo Valle)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'hugo.valle@neutrowaste.com') THEN
    new_user_id := gen_random_uuid();
    
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'hugo.valle@neutrowaste.com',
      crypt('securepassword123', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Hugo Valle"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role, status)
    VALUES (new_user_id, 'hugo.valle@neutrowaste.com', 'Hugo Valle', 'Admin', 'active')
    ON CONFLICT (id) DO UPDATE SET role = 'Admin', status = 'active';
  ELSE
    -- Garante que o usuário existente tenha a senha correta e esteja confirmado
    UPDATE auth.users 
    SET encrypted_password = crypt('securepassword123', gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, NOW())
    WHERE email = 'hugo.valle@neutrowaste.com';
    
    UPDATE public.profiles 
    SET role = 'Admin', status = 'active'
    WHERE email = 'hugo.valle@neutrowaste.com';
  END IF;

  -- Seed Default Admin (admin@neutrowaste.com)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@neutrowaste.com') THEN
    new_user_id := gen_random_uuid();
    
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'admin@neutrowaste.com',
      crypt('admin123', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Administrador"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role, status)
    VALUES (new_user_id, 'admin@neutrowaste.com', 'Administrador', 'Admin', 'active')
    ON CONFLICT (id) DO UPDATE SET role = 'Admin', status = 'active';
  ELSE
    UPDATE auth.users 
    SET encrypted_password = crypt('admin123', gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, NOW())
    WHERE email = 'admin@neutrowaste.com';

    UPDATE public.profiles 
    SET role = 'Admin', status = 'active'
    WHERE email = 'admin@neutrowaste.com';
  END IF;
END $$;
