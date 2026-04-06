import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, name } = await req.json();
    
    // Log para simulação do envio de e-mail. 
    // Em produção, isso pode ser integrado com Resend, SendGrid, Amazon SES, etc.
    console.log(`[Email Service] Enviando e-mail de boas-vindas para: ${email} (${name})`);
    console.log(`[Email Service] Assunto: Cadastro Recebido - Neutrowaste CRM`);
    console.log(`[Email Service] Corpo: Olá ${name}, seu cadastro foi realizado com sucesso. Sua solicitação está em análise pelo administrador. Você será notificado assim que o acesso for liberado.`);

    return new Response(JSON.stringify({ success: true, message: 'Email de boas-vindas na fila de envio.' }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
