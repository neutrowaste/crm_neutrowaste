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

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (supabaseUrl && supabaseKey) {
      const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
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
          .replace(/{{email}}/g, email || '');
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
      } else {
        subject = 'Notificação do Sistema - Neutrowaste CRM';
        body = `Você tem uma nova notificação.`;
      }
    }

    console.log(`[Email Service] Assunto: ${subject}`);
    console.log(`[Email Service] Corpo: ${body}`);

    return new Response(JSON.stringify({ success: true, message: `Email do tipo '${type}' processado com sucesso.` }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
