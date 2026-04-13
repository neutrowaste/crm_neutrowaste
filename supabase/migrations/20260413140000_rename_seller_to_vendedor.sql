DO $$
BEGIN
  -- Update app_roles
  UPDATE public.app_roles SET name = 'Vendedor' WHERE name = 'Seller';

  -- Update profiles
  UPDATE public.profiles SET role = 'Vendedor' WHERE role = 'Seller';
END $$;

-- Update the handle_new_user trigger function
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
    'Vendedor',
    'pending'
  ) ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$function$;
