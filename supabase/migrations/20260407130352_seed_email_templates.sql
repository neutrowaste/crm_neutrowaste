DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.email_templates WHERE name = 'welcome_new_user') THEN
    INSERT INTO public.email_templates (name, subject, body)
    VALUES (
      'welcome_new_user',
      'Convite de Acesso - Neutrowaste CRM',
      'Olá {{name}},

Você foi convidado para acessar o Neutrowaste CRM.

Sua senha temporária é: {{password}}

Acesse o sistema utilizando o e-mail: {{email}} e altere sua senha o mais breve possível.'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.email_templates WHERE name = 'welcome') THEN
    INSERT INTO public.email_templates (name, subject, body)
    VALUES (
      'welcome',
      'Cadastro Recebido - Neutrowaste CRM',
      'Olá {{name}}, 

Seu cadastro foi realizado com sucesso. Sua solicitação está em análise pelo administrador. 

Você será notificado assim que o acesso for liberado.'
    );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.email_templates WHERE name = 'password_reset') THEN
    INSERT INTO public.email_templates (name, subject, body)
    VALUES (
      'password_reset',
      'Recuperação de Senha - Neutrowaste CRM',
      'Olá {{name}},

Recebemos uma solicitação de recuperação de senha para a sua conta. 

As instruções de redefinição seguras foram enviadas pelo sistema para o seu e-mail: {{email}}.'
    );
  END IF;
END $$;
