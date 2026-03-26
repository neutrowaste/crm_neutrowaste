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
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Lembretes de Hoje</CardTitle>
        <CardDescription>Acompanhamentos agendados para hoje</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {todaysTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center border-2 border-dashed rounded-lg">
            Nenhuma tarefa para hoje.
          </p>
        ) : (
          <div className="space-y-4">
            {todaysTasks.map((task) => {
              const lead = leads.find((l) => l.id === task.leadId)
              return (
                <div
                  key={task.id}
                  className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    id={`task-${task.id}`}
                    checked={task.completed}
                    onCheckedChange={() => toggleComplete(task.id)}
                    className="mt-1"
                  />
                  <div className="space-y-1 min-w-0 flex-1">
                    <label
                      htmlFor={`task-${task.id}`}
                      className={`text-sm font-medium leading-none cursor-pointer block truncate ${
                        task.completed
                          ? 'text-muted-foreground line-through'
                          : ''
                      }`}
                    >
                      {task.title} {lead ? `- ${lead.name}` : ''}
                    </label>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      <span className="font-semibold text-primary mr-1">
                        {task.time}
                      </span>
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
