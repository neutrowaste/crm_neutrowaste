CREATE TABLE IF NOT EXISTS public.smtp_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host TEXT DEFAULT '',
  port TEXT DEFAULT '',
  "user" TEXT DEFAULT '',
  password TEXT DEFAULT '',
  from_email TEXT DEFAULT '',
  from_name TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.smtp_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow admin read smtp_settings" ON public.smtp_settings;
CREATE POLICY "Allow admin read smtp_settings" ON public.smtp_settings
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'Admin'));

DROP POLICY IF EXISTS "Allow admin insert smtp_settings" ON public.smtp_settings;
CREATE POLICY "Allow admin insert smtp_settings" ON public.smtp_settings
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'Admin'));

DROP POLICY IF EXISTS "Allow admin update smtp_settings" ON public.smtp_settings;
CREATE POLICY "Allow admin update smtp_settings" ON public.smtp_settings
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'Admin'));

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.smtp_settings LIMIT 1) THEN
    INSERT INTO public.smtp_settings (id, host, port, "user", password, from_email, from_name, is_active)
    VALUES (gen_random_uuid(), 'smtp.mailgun.org', '587', '', '', 'contato@suaempresa.com.br', 'Sua Empresa', false);
  END IF;
END $$;
