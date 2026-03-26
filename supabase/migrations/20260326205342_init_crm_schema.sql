-- Handle GoTrue auth engine bug with empty strings
DO $$
BEGIN
  UPDATE auth.users
  SET
    confirmation_token = COALESCE(confirmation_token, ''),
    recovery_token = COALESCE(recovery_token, ''),
    email_change_token_new = COALESCE(email_change_token_new, ''),
    email_change = COALESCE(email_change, ''),
    email_change_token_current = COALESCE(email_change_token_current, ''),
    phone_change = COALESCE(phone_change, ''),
    phone_change_token = COALESCE(phone_change_token, ''),
    reauthentication_token = COALESCE(reauthentication_token, '')
  WHERE
    confirmation_token IS NULL OR recovery_token IS NULL
    OR email_change_token_new IS NULL OR email_change IS NULL
    OR email_change_token_current IS NULL
    OR phone_change IS NULL OR phone_change_token IS NULL
    OR reauthentication_token IS NULL;
END $$;

-- Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Seller',
  is_online BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated read profiles" ON public.profiles;
CREATE POLICY "Allow authenticated read profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Allow update own profile" ON public.profiles;
CREATE POLICY "Allow update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());

-- Leads
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'Novo',
  source TEXT NOT NULL DEFAULT 'Site',
  value NUMERIC DEFAULT 0,
  industry TEXT,
  notes TEXT,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  last_follow_up TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated full leads" ON public.leads;
CREATE POLICY "Allow authenticated full leads" ON public.leads FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Contracts
CREATE TABLE IF NOT EXISTS public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Draft',
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  uploaded_by_name TEXT,
  file_url TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read contracts" ON public.contracts;
CREATE POLICY "Allow public read contracts" ON public.contracts FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow authenticated full contracts" ON public.contracts;
CREATE POLICY "Allow authenticated full contracts" ON public.contracts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Logs
CREATE TABLE IF NOT EXISTS public.logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  user_name TEXT NOT NULL,
  action TEXT NOT NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  lead_name TEXT NOT NULL,
  details TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated public read/insert logs" ON public.logs;
CREATE POLICY "Allow authenticated public read/insert logs" ON public.logs FOR ALL USING (true) WITH CHECK (true);

-- Tasks
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  due_date TEXT NOT NULL,
  time TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated tasks" ON public.tasks;
CREATE POLICY "Allow authenticated tasks" ON public.tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Email Templates
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated email_templates" ON public.email_templates;
CREATE POLICY "Allow authenticated email_templates" ON public.email_templates FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- WhatsApp Templates
CREATE TABLE IF NOT EXISTS public.whatsapp_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated whatsapp_templates" ON public.whatsapp_templates;
CREATE POLICY "Allow authenticated whatsapp_templates" ON public.whatsapp_templates FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Chat Messages
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  text TEXT NOT NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_url TEXT,
  file_name TEXT,
  read_by TEXT[] DEFAULT '{}',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated chat_messages" ON public.chat_messages;
CREATE POLICY "Allow authenticated chat_messages" ON public.chat_messages FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Trigger for profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'Seller')
  ) ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed Users
DO $$
DECLARE
  hugo_uid uuid := gen_random_uuid();
  admin_uid uuid := gen_random_uuid();
BEGIN
  -- Admin 1
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'hugo.valle@neutrowaste.com') THEN
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      hugo_uid, '00000000-0000-0000-0000-000000000000', 'hugo.valle@neutrowaste.com',
      crypt('securepassword123', gen_salt('bf')), NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Hugo Valle", "role": "Admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, name, email, role, is_online)
    VALUES (hugo_uid, 'Hugo Valle', 'hugo.valle@neutrowaste.com', 'Admin', true)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Admin 2
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@neutrowaste.com') THEN
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      admin_uid, '00000000-0000-0000-0000-000000000000', 'admin@neutrowaste.com',
      crypt('admin123', gen_salt('bf')), NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Admin Neutrowaste", "role": "Admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, name, email, role, is_online)
    VALUES (admin_uid, 'Admin Neutrowaste', 'admin@neutrowaste.com', 'Admin', false)
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;
