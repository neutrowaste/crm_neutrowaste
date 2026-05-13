import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase variables not set')
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

    const { data: contracts, error } = await supabaseAdmin
      .from('contracts')
      .select('id, name, data_termino, uploaded_by, leads(company)')
      .not('data_termino', 'is', null)

    if (error) throw error

    const today = new Date()
    const todayUTC = Date.UTC(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    )

    const expiringContracts = []

    for (const contract of contracts || []) {
      if (!contract.data_termino) continue

      const expireParts = contract.data_termino.split('-')
      if (expireParts.length !== 3) continue

      const expireUTC = Date.UTC(
        parseInt(expireParts[0]),
        parseInt(expireParts[1]) - 1,
        parseInt(expireParts[2]),
      )

      const diffTime = expireUTC - todayUTC
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if ([120, 90, 60, 30].includes(diffDays)) {
        if (contract.uploaded_by) {
          const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('email, name')
            .eq('id', contract.uploaded_by)
            .single()

          if (profile && profile.email) {
            expiringContracts.push({
              contractName: contract.name,
              company: contract.leads?.company || '',
              days: diffDays,
              email: profile.email,
              name: profile.name,
            })
          }
        }
      }
    }

    const results = []
    for (const item of expiringContracts) {
      const { error: sendError } = await supabaseAdmin.functions.invoke(
        'send-email',
        {
          body: {
            email: item.email,
            type: 'contract_expiring',
            data: {
              name: item.name,
              contractName: item.contractName,
              company: item.company,
              days: item.days,
            },
          },
        },
      )

      results.push({
        email: item.email,
        contract: item.contractName,
        days: item.days,
        success: !sendError,
      })
    }

    return new Response(
      JSON.stringify({ message: 'Processamento concluído', results }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      },
    )
  } catch (error: any) {
    console.error('Error processing expiring contracts:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
})
