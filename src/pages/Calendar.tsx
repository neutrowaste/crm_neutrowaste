import { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useTasks } from '@/contexts/TasksContext'
import { useLeads } from '@/contexts/LeadsContext'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Trash } from 'lucide-react'

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const { tasks, addTask, toggleComplete, deleteTask } = useTasks()
  const { leads } = useLeads()

  const [title, setTitle] = useState('')
  const [time, setTime] = useState('')
  const [leadId, setLeadId] = useState('')
  const [description, setDescription] = useState('')

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!date || !title || !time || !leadId) return

    addTask({
      leadId,
      title,
      dueDate: format(date, 'yyyy-MM-dd'),
      time,
      description,
      completed: false,
    })

    setTitle('')
    setTime('')
    setLeadId('')
    setDescription('')
  }

  const selectedDateStr = date ? format(date, 'yyyy-MM-dd') : ''
  const dayTasks = tasks
    .filter((t) => t.dueDate === selectedDateStr)
    .sort((a, b) => a.time.localeCompare(b.time))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Agenda
        </h1>
        <p className="text-muted-foreground">
          Gerencie seus acompanhamentos e reuniões.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Calendário</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                locale={ptBR}
                className="rounded-md border mx-auto"
              />
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                Tarefas para{' '}
                {date ? format(date, "dd 'de' MMMM", { locale: ptBR }) : ''}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dayTasks.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Nenhuma tarefa agendada para esta data.
                </p>
              ) : (
                <div className="space-y-4">
                  {dayTasks.map((task) => {
                    const lead = leads.find((l) => l.id === task.leadId)
                    return (
                      <div
                        key={task.id}
                        className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0"
                      >
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            id={`t-${task.id}`}
                            checked={task.completed}
                            onCheckedChange={() => toggleComplete(task.id)}
                          />
                          <div className="space-y-1">
                            <label
                              htmlFor={`t-${task.id}`}
                              className={`text-sm font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}
                            >
                              {task.title} {lead ? `(${lead.name})` : ''}
                            </label>
                            <p className="text-xs text-muted-foreground">
                              {task.time}{' '}
                              {task.description ? `- ${task.description}` : ''}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteTask(task.id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Agendar Acompanhamento</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddTask} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Lead</label>
                    <Select value={leadId} onValueChange={setLeadId} required>
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
                    <label className="text-sm font-medium">
                      Título da Tarefa
                    </label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ex: Ligar para apresentar proposta"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Horário</label>
                    <Input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Descrição (Opcional)
                  </label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detalhes adicionais..."
                    className="min-h-[80px]"
                  />
                </div>
                <Button type="submit" disabled={!date}>
                  Salvar Tarefa
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
