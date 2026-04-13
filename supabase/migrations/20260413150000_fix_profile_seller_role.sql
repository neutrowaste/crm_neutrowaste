DO $$
BEGIN
  -- Atualiza o valor padrão da coluna role para 'Vendedor' em vez de 'Seller'
  ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'Vendedor'::text;
  
  -- Atualiza os registros existentes que ainda possam estar como 'Seller'
  UPDATE public.profiles SET role = 'Vendedor' WHERE role = 'Seller';
END $$;
