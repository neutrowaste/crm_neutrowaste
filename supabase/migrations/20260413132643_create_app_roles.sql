CREATE TABLE IF NOT EXISTS public.app_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed basic roles
INSERT INTO public.app_roles (name, permissions) VALUES
  ('Admin', '["*"]'::jsonb),
  ('Seller', '["dashboard", "leads", "calendar", "kanban", "chat", "contracts"]'::jsonb)
ON CONFLICT (name) DO UPDATE SET permissions = EXCLUDED.permissions;

-- RLS
ALTER TABLE public.app_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated read app_roles" ON public.app_roles;
CREATE POLICY "Allow authenticated read app_roles" ON public.app_roles
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow admin modify app_roles" ON public.app_roles;
CREATE POLICY "Allow admin modify app_roles" ON public.app_roles
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
