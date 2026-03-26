import { useState } from 'react'
import { useLeads, Lead } from '@/contexts/LeadsContext'
import { useLogs } from '@/contexts/LogsContext'
import { useAuth } from '@/contexts/AuthContext'
import { useTemplates } from '@/contexts/TemplatesContext'
import { useAutomations } from '@/contexts/AutomationsContext'
import { useTasks } from '@/contexts/TasksContext'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { format, differenceInDays, addDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Send, Clock, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

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
  const { templates } = useTemplates()
  const { toast } = useToast()
  const { emailOnProposal, taskOnWon } = useAutomations()
  const { addTask } = useTasks()

  const [followUpLead, setFollowUpLead] = useState<Lead | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState('')

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('leadId', leadId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    const leadId = e.dataTransfer.getData('leadId')
    if (!leadId) return

    let newStatus = 'Novo'
    if (columnId === 'negotiation') newStatus = 'Qualificado'
    else if (columnId === 'contract_sent') newStatus = 'Proposta'
    else if (columnId === 'signed') newStatus = 'Ganho'

    const lead = leads.find((l) => l.id === leadId)
    if (lead && lead.status !== newStatus) {
      await updateLead(leadId, { status: newStatus as any })

      if (user) {
        await addLog({
          userId: user.id,
          userName: user.name,
          action: 'Atualizar Kanban',
          leadId: lead.id,
          leadName: lead.name,
          details: `Lead movido para ${columnId} (Status: ${newStatus})`,
        })
      }

      if (newStatus === 'Proposta' && emailOnProposal && user) {
        await addLog({
          userId: 'system',
          userName: 'Automação do Sistema',
          action: 'E-mail Automático',
          leadId: lead.id,
          leadName: lead.name,
          details: `E-mail de notificação de envio de contrato disparado para ${lead.email} via gatilho automático.`,
        })
        toast({
          title: 'Automação Disparada',
          description: `E-mail automático enviado para ${lead.name} referente à proposta.`,
        })
      }

      if (newStatus === 'Ganho' && taskOnWon && user) {
        await addTask({
          leadId: lead.id,
          title: `Onboarding de ${lead.company}`,
          dueDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
          time: '10:00',
          description:
            'Apresentação inicial de boas-vindas gerada automaticamente.',
          completed: false,
        })
        await addLog({
          userId: 'system',
          userName: 'Automação do Sistema',
          action: 'Tarefa Automática',
          leadId: lead.id,
          leadName: lead.name,
          details: `Tarefa de Onboarding criada para o dia seguinte via gatilho automático.`,
        })
        toast({
          title: 'Automação Disparada',
          description: `Tarefa de Onboarding agendada para amanhã.`,
        })
      }
    }
  }

  const handleSendFollowUp = async () => {
    if (!followUpLead) return

    const now = new Date().toISOString()
    await updateLead(followUpLead.id, { lastFollowUp: now })
    if (user) {
      await addLog({
        userId: user.id,
        userName: user.name,
        action: 'Follow-up',
        leadId: followUpLead.id,
        leadName: followUpLead.name,
        details: `E-mail de follow-up enviado para ${followUpLead.email} usando o modelo selecionado.`,
      })
    }
    toast({
      title: 'E-mail Enviado!',
      description: `Follow-up enviado para ${followUpLead.name} com sucesso!`,
    })
    setFollowUpLead(null)
    setSelectedTemplate('')
  }

  const selectedTemplateObj = templates.find((t) => t.id === selectedTemplate)
  const previewSubject =
    selectedTemplateObj?.subject
      .replace(/{{company_name}}/g, followUpLead?.company || '')
      .replace(/{{contact_name}}/g, followUpLead?.name || '')
      .replace(/{{lead_value}}/g, followUpLead?.value?.toString() || '') || ''
  const previewBody =
    selectedTemplateObj?.body
      .replace(/{{company_name}}/g, followUpLead?.company || '')
      .replace(/{{contact_name}}/g, followUpLead?.name || '')
      .replace(/{{lead_value}}/g, followUpLead?.value?.toString() || '') || ''

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] gap-6 overflow-hidden">
      <div className="shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Sales Funnel (Kanban)
          </h1>
          <p className="text-muted-foreground">
            Gerencie leads e contratos arrastando os cartões entre as colunas.
          </p>
        </div>
      </div>

      <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 flex-1 snap-x">
        {columns.map((col) => {
          const colLeads = leads.filter((l) => col.statuses.includes(l.status))

          return (
            <div
              key={col.id}
              className="flex flex-col w-[85vw] md:w-80 shrink-0 bg-muted/50 border rounded-xl overflow-hidden snap-center"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div className="p-4 border-b bg-card rounded-t-xl shrink-0">
                <h3 className="font-semibold text-card-foreground flex items-center justify-between">
                  {col.title}
                  <Badge variant="secondary">{colLeads.length}</Badge>
                </h3>
              </div>

              <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                {colLeads.map((lead) => {
                  const daysSinceUpdate = differenceInDays(
                    new Date(),
                    new Date(lead.updatedAt),
                  )
                  const isStale = daysSinceUpdate > 7 && col.id !== 'signed'

                  return (
                    <Card
                      key={lead.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead.id)}
                      className={cn(
                        'cursor-move transition-all hover:shadow-md relative overflow-hidden',
                        isStale
                          ? 'border-red-400 dark:border-red-800'
                          : 'border-border',
                      )}
                    >
                      {isStale && (
                        <div
                          className="absolute top-0 right-0 bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 p-1 rounded-bl-lg"
                          title={`Inativo há ${daysSinceUpdate} dias`}
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </div>
                      )}
                      <CardContent className="p-4 space-y-3">
                        <div className="pr-6">
                          <p className="font-medium text-sm text-foreground">
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
                          <div
                            className={cn(
                              'flex items-center px-1.5 py-0.5 rounded',
                              isStale
                                ? 'text-red-600 bg-red-50 dark:bg-red-950/50 font-medium'
                                : 'text-muted-foreground bg-muted/50',
                            )}
                          >
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
                              className="w-full text-xs h-8 bg-primary/5 hover:bg-primary/10 text-primary border border-primary/20"
                              onClick={() => setFollowUpLead(lead)}
                            >
                              <Send className="w-3 h-3 mr-2" />
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
                  )
                })}
                {colLeads.length === 0 && (
                  <div className="text-center text-sm text-muted-foreground p-8 border-2 border-dashed rounded-lg border-muted-foreground/20">
                    Solte cartões aqui
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <Dialog
        open={!!followUpLead}
        onOpenChange={(open) => !open && setFollowUpLead(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar E-mail de Follow-up</DialogTitle>
            <DialogDescription>
              Selecione um modelo da biblioteca para enviar a{' '}
              {followUpLead?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Select
              value={selectedTemplate}
              onValueChange={setSelectedTemplate}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um modelo salvo" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTemplateObj ? (
              <div className="space-y-3 bg-muted/30 p-3 rounded-md border text-sm">
                <div className="font-medium text-muted-foreground text-xs mb-1 uppercase">
                  Assunto
                </div>
                <Input
                  readOnly
                  value={previewSubject}
                  className="bg-background"
                />
                <div className="font-medium text-muted-foreground text-xs mb-1 uppercase mt-3">
                  Mensagem
                </div>
                <Textarea
                  className="min-h-[150px] bg-background"
                  readOnly
                  value={previewBody}
                />
              </div>
            ) : (
              <div className="h-[240px] border-2 border-dashed rounded-md flex items-center justify-center text-muted-foreground text-sm">
                Selecione um modelo acima
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFollowUpLead(null)}>
              Cancelar
            </Button>
            <Button
              disabled={!selectedTemplateObj}
              onClick={handleSendFollowUp}
            >
              <Send className="w-4 h-4 mr-2" />
              Enviar Follow-up
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
