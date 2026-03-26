import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useContracts } from '@/contexts/ContractsContext'
import { useLeads } from '@/contexts/LeadsContext'
import { FileSignature, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function PendingSignatures() {
  const { contracts } = useContracts()
  const { leads } = useLeads()

  const pendingContracts = contracts
    .filter((c) => c.status === 'Sent for Signature')
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    .slice(0, 5)

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Assinaturas Pendentes</CardTitle>
            <CardDescription>Contratos aguardando o cliente</CardDescription>
          </div>
          <FileSignature className="h-5 w-5 text-muted-foreground hidden sm:block" />
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {pendingContracts.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground py-8">
            Nenhum contrato aguardando assinatura.
          </div>
        ) : (
          <div className="space-y-4 flex-1">
            {pendingContracts.map((contract) => {
              const lead = leads.find((l) => l.id === contract.leadId)
              return (
                <div
                  key={contract.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0 gap-3"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <p className="text-sm font-medium leading-none truncate">
                      {contract.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {lead?.name || 'Lead desconhecido'} • Enviado em{' '}
                      {format(new Date(contract.updatedAt), 'dd/MM', {
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    asChild
                  >
                    <Link to={`/leads/edit/${contract.leadId}?tab=contracts`}>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )
            })}
          </div>
        )}
        <div className="mt-6 pt-4 border-t">
          <Button variant="outline" className="w-full" asChild>
            <Link to="/contracts">Ver todos os contratos</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
