// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          company_name: string
          id: string
          support_email: string
          updated_at: string
        }
        Insert: {
          company_name?: string
          id?: string
          support_email?: string
          updated_at?: string
        }
        Update: {
          company_name?: string
          id?: string
          support_email?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          file_name: string | null
          file_url: string | null
          id: string
          lead_id: string | null
          read_by: string[] | null
          receiver_id: string | null
          text: string
          timestamp: string
          user_id: string | null
          user_name: string
        }
        Insert: {
          file_name?: string | null
          file_url?: string | null
          id?: string
          lead_id?: string | null
          read_by?: string[] | null
          receiver_id?: string | null
          text: string
          timestamp?: string
          user_id?: string | null
          user_name: string
        }
        Update: {
          file_name?: string | null
          file_url?: string | null
          id?: string
          lead_id?: string | null
          read_by?: string[] | null
          receiver_id?: string | null
          text?: string
          timestamp?: string
          user_id?: string | null
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          created_at: string
          expires_at: string | null
          file_url: string | null
          id: string
          lead_id: string
          name: string
          status: string
          updated_at: string
          uploaded_by: string | null
          uploaded_by_name: string | null
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          file_url?: string | null
          id?: string
          lead_id: string
          name: string
          status?: string
          updated_at?: string
          uploaded_by?: string | null
          uploaded_by_name?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          file_url?: string | null
          id?: string
          lead_id?: string
          name?: string
          status?: string
          updated_at?: string
          uploaded_by?: string | null
          uploaded_by_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documentacoes: {
        Row: {
          analise: string | null
          conteudo: string
          created_at: string | null
          id: string
          status: string | null
          titulo: string
        }
        Insert: {
          analise?: string | null
          conteudo: string
          created_at?: string | null
          id?: string
          status?: string | null
          titulo: string
        }
        Update: {
          analise?: string | null
          conteudo?: string
          created_at?: string | null
          id?: string
          status?: string | null
          titulo?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          body: string
          created_at: string
          id: string
          name: string
          subject: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          name: string
          subject: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          name?: string
          subject?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          assigned_to: string | null
          company: string
          created_at: string
          email: string
          id: string
          industry: string | null
          last_follow_up: string | null
          name: string
          notes: string | null
          phone: string | null
          source: string
          status: string
          updated_at: string
          value: number | null
        }
        Insert: {
          assigned_to?: string | null
          company: string
          created_at?: string
          email: string
          id?: string
          industry?: string | null
          last_follow_up?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          source?: string
          status?: string
          updated_at?: string
          value?: number | null
        }
        Update: {
          assigned_to?: string | null
          company?: string
          created_at?: string
          email?: string
          id?: string
          industry?: string | null
          last_follow_up?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          source?: string
          status?: string
          updated_at?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      logs: {
        Row: {
          action: string
          details: string
          id: string
          lead_id: string | null
          lead_name: string
          timestamp: string
          user_id: string | null
          user_name: string
        }
        Insert: {
          action: string
          details: string
          id?: string
          lead_id?: string | null
          lead_name: string
          timestamp?: string
          user_id?: string | null
          user_name: string
        }
        Update: {
          action?: string
          details?: string
          id?: string
          lead_id?: string | null
          lead_name?: string
          timestamp?: string
          user_id?: string | null
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "logs_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          is_online: boolean | null
          last_sign_in_at: string | null
          name: string
          role: string
          status: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id: string
          is_online?: boolean | null
          last_sign_in_at?: string | null
          name: string
          role?: string
          status?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          is_online?: boolean | null
          last_sign_in_at?: string | null
          name?: string
          role?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      smtp_settings: {
        Row: {
          created_at: string
          from_email: string | null
          from_name: string | null
          host: string | null
          id: string
          is_active: boolean | null
          password: string | null
          port: string | null
          updated_at: string
          user: string | null
        }
        Insert: {
          created_at?: string
          from_email?: string | null
          from_name?: string | null
          host?: string | null
          id?: string
          is_active?: boolean | null
          password?: string | null
          port?: string | null
          updated_at?: string
          user?: string | null
        }
        Update: {
          created_at?: string
          from_email?: string | null
          from_name?: string | null
          host?: string | null
          id?: string
          is_active?: boolean | null
          password?: string | null
          port?: string | null
          updated_at?: string
          user?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          completed: boolean
          created_at: string
          description: string | null
          due_date: string
          id: string
          lead_id: string | null
          time: string
          title: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          description?: string | null
          due_date: string
          id?: string
          lead_id?: string | null
          time: string
          title: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          description?: string | null
          due_date?: string
          id?: string
          lead_id?: string | null
          time?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_templates: {
        Row: {
          created_at: string
          id: string
          name: string
          text: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          text: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          text?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const


// ====== DATABASE EXTENDED CONTEXT (auto-generated) ======
// This section contains actual PostgreSQL column types, constraints, RLS policies,
// functions, triggers, indexes and materialized views not present in the type definitions above.
// IMPORTANT: The TypeScript types above map UUID, TEXT, VARCHAR all to "string".
// Use the COLUMN TYPES section below to know the real PostgreSQL type for each column.
// Always use the correct PostgreSQL type when writing SQL migrations.

// --- COLUMN TYPES (actual PostgreSQL types) ---
// Use this to know the real database type when writing migrations.
// "string" in TypeScript types above may be uuid, text, varchar, timestamptz, etc.
// Table: app_settings
//   id: uuid (not null, default: gen_random_uuid())
//   company_name: text (not null, default: 'Neutrowaste'::text)
//   support_email: text (not null, default: 'suporte@neutrowaste.com'::text)
//   updated_at: timestamp with time zone (not null, default: now())
// Table: chat_messages
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (nullable)
//   user_name: text (not null)
//   text: text (not null)
//   lead_id: uuid (nullable)
//   receiver_id: uuid (nullable)
//   file_url: text (nullable)
//   file_name: text (nullable)
//   read_by: _text (nullable, default: '{}'::text[])
//   timestamp: timestamp with time zone (not null, default: now())
// Table: contracts
//   id: uuid (not null, default: gen_random_uuid())
//   lead_id: uuid (not null)
//   name: text (not null)
//   status: text (not null, default: 'Draft'::text)
//   uploaded_by: uuid (nullable)
//   uploaded_by_name: text (nullable)
//   file_url: text (nullable)
//   expires_at: timestamp with time zone (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: documentacoes
//   id: uuid (not null, default: gen_random_uuid())
//   titulo: text (not null)
//   conteudo: text (not null)
//   analise: text (nullable)
//   status: text (nullable, default: 'pendente'::text)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: email_templates
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   subject: text (not null)
//   body: text (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: leads
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   company: text (not null)
//   email: text (not null)
//   phone: text (nullable)
//   status: text (not null, default: 'Novo'::text)
//   source: text (not null, default: 'Site'::text)
//   value: numeric (nullable, default: 0)
//   industry: text (nullable)
//   notes: text (nullable)
//   assigned_to: uuid (nullable)
//   last_follow_up: timestamp with time zone (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: logs
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: text (nullable)
//   user_name: text (not null)
//   action: text (not null)
//   lead_id: uuid (nullable)
//   lead_name: text (not null)
//   details: text (not null)
//   timestamp: timestamp with time zone (not null, default: now())
// Table: profiles
//   id: uuid (not null)
//   name: text (not null)
//   email: text (not null)
//   role: text (not null, default: 'Seller'::text)
//   is_online: boolean (nullable, default: false)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
//   status: text (not null, default: 'pending'::text)
//   avatar_url: text (nullable)
//   last_sign_in_at: timestamp with time zone (nullable)
// Table: smtp_settings
//   id: uuid (not null, default: gen_random_uuid())
//   host: text (nullable, default: ''::text)
//   port: text (nullable, default: ''::text)
//   user: text (nullable, default: ''::text)
//   password: text (nullable, default: ''::text)
//   from_email: text (nullable, default: ''::text)
//   from_name: text (nullable, default: ''::text)
//   is_active: boolean (nullable, default: false)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: tasks
//   id: uuid (not null, default: gen_random_uuid())
//   lead_id: uuid (nullable)
//   title: text (not null)
//   due_date: text (not null)
//   time: text (not null)
//   description: text (nullable)
//   completed: boolean (not null, default: false)
//   created_at: timestamp with time zone (not null, default: now())
// Table: whatsapp_templates
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   text: text (not null)
//   created_at: timestamp with time zone (not null, default: now())

// --- CONSTRAINTS ---
// Table: app_settings
//   PRIMARY KEY app_settings_pkey: PRIMARY KEY (id)
// Table: chat_messages
//   FOREIGN KEY chat_messages_lead_id_fkey: FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL
//   PRIMARY KEY chat_messages_pkey: PRIMARY KEY (id)
//   FOREIGN KEY chat_messages_receiver_id_fkey: FOREIGN KEY (receiver_id) REFERENCES profiles(id) ON DELETE CASCADE
//   FOREIGN KEY chat_messages_user_id_fkey: FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
// Table: contracts
//   FOREIGN KEY contracts_lead_id_fkey: FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
//   PRIMARY KEY contracts_pkey: PRIMARY KEY (id)
//   FOREIGN KEY contracts_uploaded_by_fkey: FOREIGN KEY (uploaded_by) REFERENCES profiles(id) ON DELETE SET NULL
// Table: documentacoes
//   PRIMARY KEY documentacoes_pkey: PRIMARY KEY (id)
// Table: email_templates
//   PRIMARY KEY email_templates_pkey: PRIMARY KEY (id)
// Table: leads
//   FOREIGN KEY leads_assigned_to_fkey: FOREIGN KEY (assigned_to) REFERENCES profiles(id) ON DELETE SET NULL
//   PRIMARY KEY leads_pkey: PRIMARY KEY (id)
// Table: logs
//   FOREIGN KEY logs_lead_id_fkey: FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
//   PRIMARY KEY logs_pkey: PRIMARY KEY (id)
// Table: profiles
//   FOREIGN KEY profiles_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY profiles_pkey: PRIMARY KEY (id)
// Table: smtp_settings
//   PRIMARY KEY smtp_settings_pkey: PRIMARY KEY (id)
// Table: tasks
//   FOREIGN KEY tasks_lead_id_fkey: FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
//   PRIMARY KEY tasks_pkey: PRIMARY KEY (id)
// Table: whatsapp_templates
//   PRIMARY KEY whatsapp_templates_pkey: PRIMARY KEY (id)

// --- ROW LEVEL SECURITY POLICIES ---
// Table: app_settings
//   Policy "Allow admin update app_settings" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'Admin'::text))))
//   Policy "Allow authenticated read app_settings" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: chat_messages
//   Policy "Allow authenticated chat_messages" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: contracts
//   Policy "Allow authenticated full contracts" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
//   Policy "Allow public read contracts" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: documentacoes
//   Policy "Allow authenticated users to delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Allow authenticated users to insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "Allow authenticated users to read" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Allow authenticated users to update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: email_templates
//   Policy "Allow authenticated email_templates" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: leads
//   Policy "Allow authenticated full leads" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: logs
//   Policy "Allow authenticated public read/insert logs" (ALL, PERMISSIVE) roles={public}
//     USING: true
//     WITH CHECK: true
// Table: profiles
//   Policy "Allow admin delete profiles" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: is_admin()
//   Policy "Allow admin update profiles" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (is_admin() OR (id = auth.uid()))
//   Policy "Allow authenticated read profiles" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: smtp_settings
//   Policy "Allow admin insert smtp_settings" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'Admin'::text))))
//   Policy "Allow admin read smtp_settings" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'Admin'::text))))
//   Policy "Allow admin update smtp_settings" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'Admin'::text))))
// Table: tasks
//   Policy "Allow authenticated tasks" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: whatsapp_templates
//   Policy "Allow authenticated whatsapp_templates" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true

// --- DATABASE FUNCTIONS ---
// FUNCTION handle_new_user()
//   CREATE OR REPLACE FUNCTION public.handle_new_user()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     INSERT INTO public.profiles (id, name, email, role, status)
//     VALUES (
//       NEW.id,
//       COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'),
//       NEW.email,
//       'Seller',
//       'pending'
//     ) ON CONFLICT (id) DO NOTHING;
//     RETURN NEW;
//   END;
//   $function$
//   
// FUNCTION is_admin()
//   CREATE OR REPLACE FUNCTION public.is_admin()
//    RETURNS boolean
//    LANGUAGE sql
//    SECURITY DEFINER
//    SET search_path TO 'public'
//   AS $function$
//     SELECT EXISTS (
//       SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Admin'
//     );
//   $function$
//   
// FUNCTION trigger_lead_won_webhook()
//   CREATE OR REPLACE FUNCTION public.trigger_lead_won_webhook()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     -- Trigger if status changed to 'Ganho' (which represents Closed/Won - Fechamento)
//     IF NEW.status = 'Ganho' AND (TG_OP = 'INSERT' OR OLD.status != 'Ganho') THEN
//       
//       -- Insert a log entry to document the automation action
//       INSERT INTO public.logs (user_name, action, lead_id, lead_name, details)
//       VALUES (
//         'Sistema (Automação)', 
//         'Webhook: Lead Ganho', 
//         NEW.id, 
//         NEW.name, 
//         'Notificação de Fechamento (Ganho) disparada com sucesso.'
//       );
//   
//       -- Attempt to call external webhook if pg_net is available 
//       -- (Supabase extension for HTTP requests)
//       BEGIN
//         IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
//           PERFORM net.http_post(
//             url := 'https://hook.us1.make.com/lead-won-example',
//             headers := '{"Content-Type": "application/json"}'::jsonb,
//             body := jsonb_build_object(
//               'event', 'lead_won',
//               'lead_id', NEW.id,
//               'name', NEW.name,
//               'email', NEW.email,
//               'value', NEW.value,
//               'company', NEW.company,
//               'timestamp', NOW()
//             )
//           );
//         END IF;
//       EXCEPTION WHEN OTHERS THEN
//         -- Silently fail if pg_net errors out to prevent blocking the transaction
//       END;
//   
//     END IF;
//     
//     RETURN NEW;
//   END;
//   $function$
//   
// FUNCTION trigger_n8n_webhook()
//   CREATE OR REPLACE FUNCTION public.trigger_n8n_webhook()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     PERFORM net.http_post(
//       url := 'https://devtasks.fksato.cloud/webhook-test/e139372b-e0d1-4eb6-9cd1-568e53d60b80',
//       headers := '{"Content-Type": "application/json"}'::jsonb,
//       body := jsonb_build_object(
//         'id', NEW.id,
//         'titulo', NEW.titulo,
//         'conteudo', NEW.conteudo
//       )
//     );
//     RETURN NEW;
//   END;
//   $function$
//   

// --- TRIGGERS ---
// Table: documentacoes
//   neutro_webhook: CREATE TRIGGER neutro_webhook AFTER INSERT ON public.documentacoes FOR EACH ROW EXECUTE FUNCTION trigger_n8n_webhook()
// Table: leads
//   on_lead_won_webhook: CREATE TRIGGER on_lead_won_webhook AFTER INSERT OR UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION trigger_lead_won_webhook()

