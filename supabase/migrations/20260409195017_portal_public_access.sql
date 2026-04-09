-- Migration to add security definer functions for public portal access

-- 1. Function to get contract details securely without authentication
CREATE OR REPLACE FUNCTION get_public_contract(p_contract_id UUID)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $func$
DECLARE
  v_result json;
BEGIN
  SELECT json_build_object(
    'contract', row_to_json(c),
    'lead', row_to_json(l),
    'salesperson', row_to_json(p)
  ) INTO v_result
  FROM contracts c
  JOIN leads l ON c.lead_id = l.id
  LEFT JOIN profiles p ON c.uploaded_by = p.id
  WHERE c.id = p_contract_id;
  
  RETURN v_result;
END;
$func$;

-- 2. Function to sign contract securely without authentication
CREATE OR REPLACE FUNCTION sign_public_contract(p_contract_id UUID, p_signature_name TEXT)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $func$
DECLARE
  v_contract contracts;
  v_lead leads;
  v_salesperson profiles;
  v_result json;
BEGIN
  -- Get contract
  SELECT * INTO v_contract FROM contracts WHERE id = p_contract_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Contract not found';
  END IF;
  
  -- Get lead
  SELECT * INTO v_lead FROM leads WHERE id = v_contract.lead_id;
  
  -- Get salesperson
  SELECT * INTO v_salesperson FROM profiles WHERE id = v_contract.uploaded_by;
  
  -- Update contract
  UPDATE contracts SET status = 'Signed' WHERE id = p_contract_id;
  
  -- Update lead if not already 'Ganho'
  IF v_lead.status != 'Ganho' THEN
    UPDATE leads SET status = 'Ganho' WHERE id = v_lead.id;
  END IF;

  -- Add logs
  INSERT INTO logs (user_name, action, lead_id, lead_name, details)
  VALUES (
    p_signature_name, 
    'Assinatura', 
    v_lead.id, 
    v_lead.name, 
    'Documento "' || v_contract.name || '" assinado digitalmente por ' || p_signature_name || ' no Portal do Cliente.'
  );

  -- Add email log
  INSERT INTO logs (user_name, action, lead_id, lead_name, details)
  VALUES (
    'Sistema Automático', 
    'Email Enviado', 
    v_lead.id, 
    v_lead.name, 
    'Confirmação de assinatura enviada para ' || v_lead.email || ' e ' || COALESCE(v_salesperson.email, 'seu consultor') || '.'
  );

  -- Return data
  SELECT json_build_object(
    'success', true,
    'contract_name', v_contract.name,
    'lead_name', v_lead.name,
    'lead_email', v_lead.email,
    'lead_company', v_lead.company,
    'salesperson_email', v_salesperson.email
  ) INTO v_result;
  
  RETURN v_result;
END;
$func$;

-- 3. Function to log portal access securely
CREATE OR REPLACE FUNCTION log_portal_access(p_contract_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $func$
DECLARE
  v_contract contracts;
  v_lead leads;
BEGIN
  SELECT * INTO v_contract FROM contracts WHERE id = p_contract_id;
  IF FOUND THEN
    SELECT * INTO v_lead FROM leads WHERE id = v_contract.lead_id;
    IF FOUND THEN
      INSERT INTO logs (user_name, action, lead_id, lead_name, details)
      VALUES (
        v_lead.name, 
        'Acesso ao Portal', 
        v_lead.id, 
        v_lead.name, 
        'O cliente acessou o portal para visualizar o documento: ' || v_contract.name
      );
    END IF;
  END IF;
END;
$func$;

-- 4. Grant execute permissions to anon and authenticated roles
GRANT EXECUTE ON FUNCTION get_public_contract(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION sign_public_contract(UUID, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION log_portal_access(UUID) TO anon, authenticated;
