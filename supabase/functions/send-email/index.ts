import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, type, data } = await req.json();
    
    console.log(`[Email Service] Preparando envio de e-mail para: ${email} | Tipo: ${type}`);
    
    let subject = '';
    let body = '';
    let smtpSettings: any = null;

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (supabaseUrl && supabaseKey) {
      const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
      
      const { data: fetchedSmtpSettings, error: fetchError } = await supabaseAdmin
        .from('smtp_settings')
        .select('*')
        .limit(1)
        .single();
        
      if (fetchError && fetchError.code !== 'PGRST116') {
         console.error('[Email Service] Erro ao buscar configurações de email:', fetchError);
      }
      
      smtpSettings = fetchedSmtpSettings;
        
      const { data: template } = await supabaseAdmin
        .from('email_templates')
        .select('*')
        .eq('name', type)
        .single();
        
      if (template) {
        subject = template.subject;
        body = template.body
          .replace(/{{name}}/g, data?.name || '')
          .replace(/{{password}}/g, data?.password || '')
          .replace(/{{email}}/g, email || '')
          .replace(/{{portalLink}}/g, data?.portalLink || '')
          .replace(/{{contractName}}/g, data?.contractName || '')
          .replace(/{{company}}/g, data?.company || '');
      }
    }

    if (!subject || !body) {
      if (type === 'welcome') {
        subject = 'Cadastro Recebido - Neutrowaste CRM';
        body = `Olá ${data?.name || ''}, seu cadastro foi realizado com sucesso. Sua solicitação está em análise pelo administrador. Você será notificado assim que o acesso for liberado.`;
      } else if (type === 'welcome_new_user') {
        subject = 'Convite de Acesso - Neutrowaste CRM';
        body = `Olá ${data?.name || ''}, você foi convidado para acessar o Neutrowaste CRM.\n\nSua senha temporária é: ${data?.password}\n\nPor favor, acesse o sistema e altere sua senha o mais breve possível.`;
      } else if (type === 'password_reset') {
        subject = 'Recuperação de Senha - Neutrowaste CRM';
        body = `Olá, recebemos uma solicitação de recuperação de senha para a sua conta. As instruções de redefinição seguras foram acionadas pelo sistema.`;
      } else if (type === 'proposal') {
        subject = 'Proposta de Contrato - Neutrowaste';
        body = `Olá ${data?.name || ''},\n\nO contrato "${data?.contractName || ''}" para a empresa ${data?.company || ''} foi gerado e está aguardando sua assinatura. Por favor, acesse o portal para revisá-lo e assiná-lo.\n\nAcesse o documento aqui: ${data?.portalLink || ''}\n\nAtenciosamente,\nEquipe Neutrowaste`;
      } else {
        subject = 'Notificação do Sistema - Neutrowaste CRM';
        body = `Você tem uma nova notificação.`;
      }
    }

    console.log(`[Email Service] Assunto: ${subject}`);

    const envResendApiKey = Deno.env.get('RESEND_API_KEY');
    const dbResendApiKey = smtpSettings?.password;
    
    const resendApiKey = envResendApiKey || dbResendApiKey;
    const isConfigured = !!resendApiKey;
    // Allow if we have an env key or if the db says it's active
    const isActive = !!envResendApiKey || (smtpSettings && smtpSettings.is_active);

    if (!isConfigured || !isActive) {
      console.log(`[Email Service] AVISO: Servidor de e-mail não configurado ou inativo.`);
      return new Response(JSON.stringify({ error: `Servidor de e-mail não configurado ou inativo. Acesse as configurações para habilitar o envio.` }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    console.log(`[Email Service] Utilizando provedor: Resend API`);
    
    const fromEmail = smtpSettings?.from_email || 'noreply@crm.com';
    const fromName = smtpSettings?.from_name || 'CRM';

    if (!resendApiKey.startsWith('re_')) {
        return new Response(JSON.stringify({ error: `A API Key do Resend é inválida ou não foi configurada. Verifique as configurações.` }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: `${fromName} <${fromEmail}>`,
        to: [email],
        subject: subject,
        html: body.replace(/\n/g, '<br>'),
        text: body
      })
    });

    const resData = await res.json();

    if (!res.ok) {
      throw new Error(resData.message || 'Falha ao enviar e-mail via Resend API');
    }

    console.log(`[Email Service] E-mail enviado com sucesso via Resend para ${email}`);
    
    return new Response(JSON.stringify({ success: true, message: `Email do tipo '${type}' enviado com sucesso via Resend API.`, id: resData.id }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('[Email Service] Erro:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
