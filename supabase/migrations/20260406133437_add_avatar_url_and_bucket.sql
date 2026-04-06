-- Add avatar_url to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create avatars bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;

-- RLS policies for avatars bucket
DROP POLICY IF EXISTS "Avatars are public" ON storage.objects;
CREATE POLICY "Avatars are public" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Authenticated users can insert avatars" ON storage.objects;
CREATE POLICY "Authenticated users can insert avatars" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Authenticated users can update avatars" ON storage.objects;
CREATE POLICY "Authenticated users can update avatars" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Authenticated users can delete avatars" ON storage.objects;
CREATE POLICY "Authenticated users can delete avatars" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'avatars');
