import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Loader2 } from 'lucide-react'

export default function ContractsPage() {
  const [contracts, setContracts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const { data, error } = await supabase
          .from('contracts')
          .select('*, leads(name)')
          .order('created_at', { ascending: false })

        if (!error && data) {
          setContracts(data)
        }
      } catch (err) {
        console.error('Error fetching contracts', err)
      } finally {
        setLoading(false)
      }
    }

    fetchContracts()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contratos</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie os contratos e documentos dos seus leads.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {contracts.length === 0 ? (
          <div className="col-span-full p-8 text-center text-muted-foreground border rounded-lg bg-card">
            Nenhum contrato encontrado.
          </div>
        ) : (
          contracts.map((contract) => (
            <Card key={contract.id}>
              <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">{contract.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {contract.leads?.name || 'Lead não encontrado'}
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-medium">{contract.status}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
