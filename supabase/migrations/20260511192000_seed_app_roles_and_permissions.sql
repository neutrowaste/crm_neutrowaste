DO $$
BEGIN
  -- Insert default roles with reasonable permissions to ensure Vendedor/Seller can access their areas
  INSERT INTO public.app_roles (name, permissions) VALUES
    ('Admin', '["*"]'::jsonb),
    ('Vendedor', '["dashboard", "leads", "calendar", "kanban", "chat", "templates", "contracts", "logs"]'::jsonb),
    ('Seller', '["dashboard", "leads", "calendar", "kanban", "chat", "templates", "contracts", "logs"]'::jsonb),
    ('Gestor', '["dashboard", "leads", "calendar", "kanban", "chat", "reports", "templates", "contracts", "logs", "automations", "roles", "settings"]'::jsonb)
  ON CONFLICT (name) DO UPDATE SET permissions = EXCLUDED.permissions;
END $$;
