import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useTasks } from '@/contexts/TasksContext'
import { useLeads } from '@/contexts/LeadsContext'
import { useContracts } from '@/contexts/ContractsContext'
import { Calendar } from '@/components/ui/calendar'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Trash, FileSignature, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const { tasks, addTask, toggleComplete, deleteTask } = useTasks()
  const { leads } = useLeads()
  const { contracts } = useContracts()
  const { toast } = useToast()

  const [title, setTitle] = useState('')
  const [time, setTime] = useState('')
  const [leadId, setLeadId] = useState('')
  const [description, setDescription] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!date || !title || !time || !leadId) return
    setIsProcessing(true)

    try {
      await addTask({
        leadId,
        title,
        dueDate: format(date, 'yyyy-MM-dd'),
        time,
        description,
        completed: false,
      })
      toast({
        title: 'Tarefa criada',
        description: 'A tarefa foi agendada com sucesso.',
      })
      setTitle('')
      setTime('')
      setLeadId('')
      setDescription('')
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: e.message || 'Falha ao criar tarefa.',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const selectedDateStr = date ? format(date, 'yyyy-MM-dd') : ''

  const dayTasks = tasks
    .filter((t) => t.dueDate === selectedDateStr)
    .sort((a, b) => a.time.localeCompare(b.time))

  // Find expiring contracts for the selected date
  const expiringContracts = contracts.filter((c) => {
    if (!c.expiresAt || c.status !== 'Signed') return false
    const expDateStr = format(parseISO(c.expiresAt), 'yyyy-MM-dd')
    return expDateStr === selectedDateStr
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Agenda e Prazos
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerencie seus acompanhamentos, reuniões e expirações de contratos.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Calendário</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  locale={ptBR}
                  className="rounded-md border bg-card w-full max-w-[320px]"
                  modifiers={{
                    expiring: contracts
                      .filter((c) => c.expiresAt && c.status === 'Signed')
                      .map((c) => parseISO(c.expiresAt!)),
                  }}
                  modifiersStyles={{
                    expiring: { border: '2px solid hsl(var(--destructive))' },
                  }}
                />
              </div>
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <span className="w-3 h-3 rounded-full border-2 border-destructive inline-block"></span>
                <span>Data com contrato expirando</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Agendar Tarefa</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddTask} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Lead</label>
                  <Select
                    value={leadId}
                    onValueChange={setLeadId}
                    required
                    disabled={isProcessing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um lead" />
                    </SelectTrigger>
                    <SelectContent>
                      {leads.map((l) => (
                        <SelectItem key={l.id} value={l.id}>
                          {l.name} - {l.company}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Título</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Ligação"
                    required
                    disabled={isProcessing}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Horário</label>
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                    disabled={isProcessing}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={!date || isProcessing}
                  className="w-full"
                >
                  {isProcessing ? 'Salvando...' : 'Salvar Tarefa'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="min-h-[400px]">
            <CardHeader>
              <CardTitle>
                Eventos para{' '}
                {date ? format(date, "dd 'de' MMMM", { locale: ptBR }) : ''}
              </CardTitle>
              <CardDescription>
                Visualize tarefas e expirações de contratos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Expiring Contracts Section */}
              {expiringContracts.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-destructive flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Contratos Expirando ({expiringContracts.length})
                  </h3>
                  <div className="space-y-3">
                    {expiringContracts.map((contract) => {
                      const lead = leads.find((l) => l.id === contract.leadId)
                      return (
                        <div
                          key={contract.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-destructive/30 bg-destructive/5 gap-3"
                        >
                          <div className="flex items-center gap-3">
                            <FileSignature className="w-8 h-8 text-destructive shrink-0" />
                            <div>
                              <p className="font-medium text-sm">
                                {contract.name}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {lead?.company} • {lead?.name}
                              </p>
                            </div>
                          </div>
                          <Badge variant="destructive" className="w-fit">
                            Expirando Hoje
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Tasks Section */}
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  Minhas Tarefas ({dayTasks.length})
                </h3>
                {dayTasks.length === 0 ? (
                  <p className="text-muted-foreground text-sm p-8 border rounded-lg border-dashed text-center bg-muted/20">
                    Nenhuma tarefa agendada para este dia.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {dayTasks.map((task) => {
                      const lead = leads.find((l) => l.id === task.leadId)
                      return (
                        <div
                          key={task.id}
                          className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors gap-2"
                        >
                          <div className="flex items-start space-x-3 w-full">
                            <Checkbox
                              id={`t-${task.id}`}
                              checked={task.completed}
                              onCheckedChange={() => toggleComplete(task.id)}
                              className="mt-1 flex-shrink-0"
                            />
                            <div className="space-y-1 min-w-0">
                              <label
                                htmlFor={`t-${task.id}`}
                                className={`text-sm font-medium cursor-pointer block ${task.completed ? 'line-through text-muted-foreground' : ''}`}
                              >
                                <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-xs mr-2">
                                  {task.time}
                                </span>
                                {task.title}
                              </label>
                              <p className="text-xs text-muted-foreground truncate">
                                {lead ? `${lead.name} (${lead.company})` : ''}
                                {task.description
                                  ? ` • ${task.description}`
                                  : ''}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteTask(task.id)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 shrink-0"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
