DO $$
BEGIN
  -- Adiciona a coluna de status
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending';

  -- Atualiza os usuários existentes para 'active'
  UPDATE public.profiles SET status = 'active' WHERE status = 'pending';
END $$;

-- Atualiza a trigger para novos usuários serem criados como 'pending'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'),
    NEW.email,
    'Seller',
    'pending'
  ) ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função segura para verificar se o usuário é Admin (bypassa RLS para evitar recursão)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Admin'
  );
$$;

-- Atualiza as políticas de RLS para permitir que Admins editem outros perfis
DROP POLICY IF EXISTS "Allow update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow admin update profiles" ON public.profiles;

CREATE POLICY "Allow admin update profiles" ON public.profiles
  FOR UPDATE TO authenticated
  USING ( public.is_admin() OR id = auth.uid() );
