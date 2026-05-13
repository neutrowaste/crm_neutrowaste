DO $$
BEGIN
  -- Insert or update Vendedor role with default permissions
  INSERT INTO public.app_roles (id, name, permissions)
  VALUES (
    gen_random_uuid(),
    'Vendedor',
    '["dashboard", "leads", "calendar", "kanban", "chat", "contracts"]'::jsonb
  )
  ON CONFLICT (name) DO UPDATE 
  SET permissions = EXCLUDED.permissions
  WHERE public.app_roles.permissions IS NULL OR public.app_roles.permissions::text = '[]'::text;

  -- Ensure existing profiles that have an empty role get mapped to Vendedor
  UPDATE public.profiles
  SET role = 'Vendedor'
  WHERE role IS NULL OR trim(role) = '';
  
  -- Force auto-activation of current dev users just to be safe
  UPDATE public.profiles
  SET status = 'active', role = 'Admin'
  WHERE email IN ('hugo.valle@neutrowaste.com', 'admin@neutrowaste.com');
END $$;
