import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { useTasks } from '@/contexts/TasksContext'
import { useLeads } from '@/contexts/LeadsContext'
import { format } from 'date-fns'

export function TaskSchedule() {
  const { tasks, toggleComplete } = useTasks()
  const { leads } = useLeads()
  const today = format(new Date(), 'yyyy-MM-dd')

  const todaysTasks = tasks
    .filter((t) => t.dueDate === today)
    .sort((a, b) => a.time.localeCompare(b.time))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lembretes de Hoje</CardTitle>
        <CardDescription>Acompanhamentos agendados para hoje</CardDescription>
      </CardHeader>
      <CardContent>
        {todaysTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma tarefa para hoje.
          </p>
        ) : (
          <div className="space-y-6">
            {todaysTasks.map((task) => {
              const lead = leads.find((l) => l.id === task.leadId)
              return (
                <div key={task.id} className="flex items-start space-x-3">
                  <Checkbox
                    id={`task-${task.id}`}
                    checked={task.completed}
                    onCheckedChange={() => toggleComplete(task.id)}
                  />
                  <div className="space-y-1 leading-none">
                    <label
                      htmlFor={`task-${task.id}`}
                      className={`text-sm font-medium leading-none cursor-pointer ${
                        task.completed
                          ? 'text-muted-foreground line-through'
                          : ''
                      }`}
                    >
                      {task.title} {lead ? `- ${lead.name}` : ''}
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">
                      {task.time}{' '}
                      {task.description ? `- ${task.description}` : ''}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
