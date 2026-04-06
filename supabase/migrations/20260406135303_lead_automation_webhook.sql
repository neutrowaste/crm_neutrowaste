CREATE OR REPLACE FUNCTION public.trigger_lead_won_webhook()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Trigger if status changed to 'Ganho' (which represents Closed/Won - Fechamento)
  IF NEW.status = 'Ganho' AND (TG_OP = 'INSERT' OR OLD.status != 'Ganho') THEN
    
    -- Insert a log entry to document the automation action
    INSERT INTO public.logs (user_name, action, lead_id, lead_name, details)
    VALUES (
      'Sistema (Automação)', 
      'Webhook: Lead Ganho', 
      NEW.id, 
      NEW.name, 
      'Notificação de Fechamento (Ganho) disparada com sucesso.'
    );

    -- Attempt to call external webhook if pg_net is available 
    -- (Supabase extension for HTTP requests)
    BEGIN
      IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
        PERFORM net.http_post(
          url := 'https://hook.us1.make.com/lead-won-example',
          headers := '{"Content-Type": "application/json"}'::jsonb,
          body := jsonb_build_object(
            'event', 'lead_won',
            'lead_id', NEW.id,
            'name', NEW.name,
            'email', NEW.email,
            'value', NEW.value,
            'company', NEW.company,
            'timestamp', NOW()
          )
        );
      END IF;
    EXCEPTION WHEN OTHERS THEN
      -- Silently fail if pg_net errors out to prevent blocking the transaction
    END;

  END IF;
  
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS on_lead_won_webhook ON public.leads;
CREATE TRIGGER on_lead_won_webhook
  AFTER INSERT OR UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.trigger_lead_won_webhook();
