DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.email_templates WHERE name = 'proposal') THEN
    INSERT INTO public.email_templates (name, subject, body)
    VALUES (
      'proposal',
      'Proposta de Contrato - Neutrowaste',
      'Olá {{name}},

O contrato "{{contractName}}" para a empresa {{company}} foi gerado e está aguardando sua assinatura. Por favor, acesse o portal para revisá-lo e assiná-lo.

Acesse o documento aqui: {{portalLink}}

Atenciosamente,
Equipe Neutrowaste'
    );
  END IF;
END $$;
