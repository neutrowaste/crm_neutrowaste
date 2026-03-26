import { useLeads, Lead } from '@/contexts/LeadsContext'
import { useLogs } from '@/contexts/LogsContext'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Send, Clock } from 'lucide-react'

const columns = [
  { id: 'lead', title: 'Lead', statuses: ['Novo', 'Contatado'] },
  { id: 'negotiation', title: 'Negotiation', statuses: ['Qualificado'] },
  { id: 'contract_sent', title: 'Contract Sent', statuses: ['Proposta'] },
  { id: 'signed', title: 'Signed', statuses: ['Ganho'] },
]

export default function KanbanPage() {
  const { leads, updateLead } = useLeads()
  const { addLog } = useLogs()
  const { user } = useAuth()
  const { toast } = useToast()

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('leadId', leadId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    const leadId = e.dataTransfer.getData('leadId')
    if (!leadId) return

    let newStatus = 'Novo'
    if (columnId === 'negotiation') newStatus = 'Qualificado'
    else if (columnId === 'contract_sent') newStatus = 'Proposta'
    else if (columnId === 'signed') newStatus = 'Ganho'

    const lead = leads.find((l) => l.id === leadId)
    if (lead && lead.status !== newStatus) {
      updateLead(leadId, { status: newStatus as any })
      if (user) {
        addLog({
          userId: user.id,
          userName: user.name,
          action: 'Atualizar Kanban',
          leadId: lead.id,
          leadName: lead.name,
          details: `Lead movido para ${columnId} (Status: ${newStatus})`,
        })
      }
    }
  }

  const handleSendFollowUp = (lead: Lead) => {
    const now = new Date().toISOString()
    updateLead(lead.id, { lastFollowUp: now })
    if (user) {
      addLog({
        userId: user.id,
        userName: user.name,
        action: 'Follow-up',
        leadId: lead.id,
        leadName: lead.name,
        details: `E-mail de follow-up enviado para ${lead.email}`,
      })
    }
    toast({
      title: 'E-mail Enviado!',
      description: `Follow-up email sent to ${lead.name} successfully!`,
    })
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] gap-6 overflow-hidden">
      <div className="shrink-0">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Sales Funnel (Kanban)
        </h1>
        <p className="text-muted-foreground">
          Gerencie leads e contratos arrastando os cartões entre as colunas.
        </p>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4 flex-1">
        {columns.map((col) => {
          const colLeads = leads.filter((l) => col.statuses.includes(l.status))

          return (
            <div
              key={col.id}
              className="flex flex-col w-80 shrink-0 bg-gray-100 border rounded-xl overflow-hidden"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div className="p-4 border-b bg-white rounded-t-xl shrink-0">
                <h3 className="font-semibold text-gray-900 flex items-center justify-between">
                  {col.title}
                  <Badge variant="secondary">{colLeads.length}</Badge>
                </h3>
              </div>

              <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                {colLeads.map((lead) => (
                  <Card
                    key={lead.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead.id)}
                    className="cursor-move hover:shadow-md transition-shadow bg-white"
                  >
                    <CardContent className="p-4 space-y-3">
                      <div>
                        <p className="font-medium text-sm text-gray-900">
                          {lead.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {lead.company}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-primary">
                          {lead.value
                            ? new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                                maximumFractionDigits: 0,
                              }).format(lead.value)
                            : '-'}
                        </span>
                        <div className="flex items-center text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                          <Clock className="w-3 h-3 mr-1" />
                          {format(new Date(lead.updatedAt), 'dd/MM')}
                        </div>
                      </div>

                      {(col.id === 'contract_sent' ||
                        col.id === 'negotiation') && (
                        <div className="pt-3 border-t mt-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="w-full text-xs h-8"
                            onClick={() => handleSendFollowUp(lead)}
                          >
                            <Send className="w-3 h-3 mr-2 text-blue-600" />
                            Send Follow-up
                          </Button>
                          {lead.lastFollowUp && (
                            <p className="text-[10px] text-center text-muted-foreground mt-1.5">
                              Último envio:{' '}
                              {format(
                                new Date(lead.lastFollowUp),
                                'dd/MM HH:mm',
                              )}
                            </p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {colLeads.length === 0 && (
                  <div className="text-center text-sm text-muted-foreground p-8 border-2 border-dashed rounded-lg border-gray-300">
                    Solte cartões aqui
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
