-- Add idempotent migration for contract_templates table
CREATE TABLE IF NOT EXISTS public.contract_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Set up RLS for contract_templates
ALTER TABLE public.contract_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated full contract_templates" ON public.contract_templates;
CREATE POLICY "Allow authenticated full contract_templates" ON public.contract_templates
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Insert 'contracts' bucket into storage.buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('contracts', 'contracts', true) 
ON CONFLICT (id) DO NOTHING;

-- RLS policies for storage objects in 'contracts' bucket
DROP POLICY IF EXISTS "Public Access Contracts" ON storage.objects;
CREATE POLICY "Public Access Contracts" ON storage.objects
  FOR SELECT USING (bucket_id = 'contracts');

DROP POLICY IF EXISTS "Authenticated Insert Contracts" ON storage.objects;
CREATE POLICY "Authenticated Insert Contracts" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'contracts');

DROP POLICY IF EXISTS "Authenticated Update Contracts" ON storage.objects;
CREATE POLICY "Authenticated Update Contracts" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'contracts');

DROP POLICY IF EXISTS "Authenticated Delete Contracts" ON storage.objects;
CREATE POLICY "Authenticated Delete Contracts" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'contracts');
