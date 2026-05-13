-- Adiciona novos campos à tabela de contratos
ALTER TABLE public.contracts 
  ADD COLUMN IF NOT EXISTS vigencia TEXT,
  ADD COLUMN IF NOT EXISTS objeto TEXT,
  ADD COLUMN IF NOT EXISTS data_inicio DATE,
  ADD COLUMN IF NOT EXISTS data_termino DATE,
  ADD COLUMN IF NOT EXISTS nome_gestor TEXT,
  ADD COLUMN IF NOT EXISTS telefone_gestor TEXT;

-- Cria o bucket de contratos se não existir
INSERT INTO storage.buckets (id, name, public) 
VALUES ('contracts', 'contracts', true) 
ON CONFLICT (id) DO NOTHING;

-- Define as políticas de RLS para o bucket contracts
DROP POLICY IF EXISTS "Allow authenticated to upload contracts" ON storage.objects;
CREATE POLICY "Allow authenticated to upload contracts" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'contracts');

DROP POLICY IF EXISTS "Allow public to read contracts" ON storage.objects;
CREATE POLICY "Allow public to read contracts" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'contracts');

DROP POLICY IF EXISTS "Allow authenticated to update contracts" ON storage.objects;
CREATE POLICY "Allow authenticated to update contracts" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'contracts');

DROP POLICY IF EXISTS "Allow authenticated to delete contracts" ON storage.objects;
CREATE POLICY "Allow authenticated to delete contracts" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'contracts');

-- Garante que todos os perfis existentes tenham permissão para a rota "contracts"
DO $$
DECLARE
  v_role record;
  v_perms jsonb;
BEGIN
  FOR v_role IN SELECT id, permissions FROM public.app_roles LOOP
    v_perms := v_role.permissions;
    IF jsonb_typeof(v_perms) = 'array' AND NOT v_perms ? 'contracts' THEN
      UPDATE public.app_roles SET permissions = v_perms || '["contracts"]'::jsonb WHERE id = v_role.id;
    END IF;
  END LOOP;
END $$;
