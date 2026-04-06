DO $$
BEGIN
  -- Permite que administradores excluam perfis (usuários) do sistema
  DROP POLICY IF EXISTS "Allow admin delete profiles" ON public.profiles;
  CREATE POLICY "Allow admin delete profiles" ON public.profiles
    FOR DELETE TO authenticated
    USING ( public.is_admin() );
END $$;
