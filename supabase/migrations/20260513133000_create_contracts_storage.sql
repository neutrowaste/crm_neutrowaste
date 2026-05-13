-- Create contracts bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('contracts', 'contracts', true) 
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies to make it idempotent
DROP POLICY IF EXISTS "Public access to contracts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload contracts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update contracts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete contracts" ON storage.objects;

-- Create new policies
CREATE POLICY "Public access to contracts" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'contracts');

CREATE POLICY "Authenticated users can upload contracts" 
  ON storage.objects FOR INSERT TO authenticated 
  WITH CHECK (bucket_id = 'contracts');

CREATE POLICY "Authenticated users can update contracts" 
  ON storage.objects FOR UPDATE TO authenticated 
  USING (bucket_id = 'contracts');

CREATE POLICY "Authenticated users can delete contracts" 
  ON storage.objects FOR DELETE TO authenticated 
  USING (bucket_id = 'contracts');
