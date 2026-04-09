import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import nodemailer from 'npm:nodemailer@6.9.11';

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
      
      // Verificando configurações SMTP customizadas
      const { data: fetchedSmtpSettings } = await supabaseAdmin
        .from('smtp_settings')
        .select('*')
        .eq('is_active', true)
        .limit(1)
        .single();
        
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

    if (smtpSettings && smtpSettings.is_active && smtpSettings.host) {
      console.log(`[Email Service] Utilizando servidor SMTP customizado: ${smtpSettings.host}:${smtpSettings.port}`);
      
      const transporter = nodemailer.createTransport({
        host: smtpSettings.host,
        port: parseInt(smtpSettings.port || '587', 10),
        secure: smtpSettings.port === '465',
        auth: smtpSettings.user ? {
          user: smtpSettings.user,
          pass: smtpSettings.password,
        } : undefined,
      });

      await transporter.sendMail({
        from: `"${smtpSettings.from_name || 'CRM'}" <${smtpSettings.from_email || 'noreply@crm.com'}>`,
        to: email,
        subject: subject,
        text: body,
        html: body.replace(/\n/g, '<br>'),
      });

      console.log(`[Email Service] E-mail enviado com sucesso para ${email}`);
      
      return new Response(JSON.stringify({ success: true, message: `Email do tipo '${type}' enviado com sucesso via SMTP.` }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    } else {
      console.log(`[Email Service] ERRO: Servidor SMTP não configurado ou inativo.`);
      throw new Error('Servidor de e-mail SMTP não configurado ou inativo. Acesse as configurações para habilitar o envio.');
    }

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
