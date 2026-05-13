-- Update is_admin function to be case-insensitive
CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND lower(role) = 'admin'
  );
$$;

-- Drop existing permissive policies for leads
DROP POLICY IF EXISTS "Allow authenticated full leads" ON public.leads;

-- Create restrictive policies for leads
CREATE POLICY "Allow authenticated users to read their own leads or all if admin"
  ON public.leads FOR SELECT TO authenticated
  USING (
    public.is_admin() OR assigned_to = auth.uid()
  );

CREATE POLICY "Allow authenticated users to insert leads"
  ON public.leads FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update their own leads or all if admin"
  ON public.leads FOR UPDATE TO authenticated
  USING (
    public.is_admin() OR assigned_to = auth.uid()
  );

CREATE POLICY "Allow authenticated users to delete their own leads or all if admin"
  ON public.leads FOR DELETE TO authenticated
  USING (
    public.is_admin() OR assigned_to = auth.uid()
  );

-- Drop existing permissive policies for contracts
DROP POLICY IF EXISTS "Allow authenticated full contracts" ON public.contracts;
DROP POLICY IF EXISTS "Allow public read contracts" ON public.contracts;

-- Create restrictive policies for contracts
CREATE POLICY "Allow authenticated users to read their own contracts or all if admin"
  ON public.contracts FOR SELECT TO authenticated
  USING (
    public.is_admin() OR uploaded_by = auth.uid()
  );

CREATE POLICY "Allow authenticated users to insert contracts"
  ON public.contracts FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update their own contracts or all if admin"
  ON public.contracts FOR UPDATE TO authenticated
  USING (
    public.is_admin() OR uploaded_by = auth.uid()
  );

CREATE POLICY "Allow authenticated users to delete their own contracts or all if admin"
  ON public.contracts FOR DELETE TO authenticated
  USING (
    public.is_admin() OR uploaded_by = auth.uid()
  );

-- Re-add public read for contracts because portal needs it
CREATE POLICY "Allow public read contracts" ON public.contracts
  FOR SELECT TO public
  USING (true);
