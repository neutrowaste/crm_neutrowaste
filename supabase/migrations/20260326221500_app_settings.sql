CREATE TABLE IF NOT EXISTS public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL DEFAULT 'Neutrowaste',
  support_email TEXT NOT NULL DEFAULT 'suporte@neutrowaste.com',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated read app_settings" ON public.app_settings;
CREATE POLICY "Allow authenticated read app_settings" ON public.app_settings
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow admin update app_settings" ON public.app_settings;
CREATE POLICY "Allow admin update app_settings" ON public.app_settings
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin')
  );

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.app_settings) THEN
    INSERT INTO public.app_settings (company_name, support_email)
    VALUES ('Neutrowaste', 'suporte@neutrowaste.com');
  END IF;
END $$;
