import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'

const tasks = [
  {
    id: 1,
    title: 'Ligação de acompanhamento com a TechCorp',
    time: '09:00',
    completed: false,
  },
  {
    id: 2,
    title: 'Revisão de proposta para a GlobalSys',
    time: '11:30',
    completed: true,
  },
  {
    id: 3,
    title: 'Demonstração de produto com a Innovate',
    time: '14:00',
    completed: false,
  },
  {
    id: 4,
    title: 'Enviar e-mail de introdução para novos leads',
    time: '16:00',
    completed: false,
  },
]

export function TaskSchedule() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Próximas Tarefas</CardTitle>
        <CardDescription>Sua agenda para hoje</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-start space-x-3">
              <Checkbox
                id={`task-${task.id}`}
                defaultChecked={task.completed}
              />
              <div className="space-y-1 leading-none">
                <label
                  htmlFor={`task-${task.id}`}
                  className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                    task.completed ? 'text-muted-foreground line-through' : ''
                  }`}
                >
                  {task.title}
                </label>
                <p className="text-xs text-muted-foreground">{task.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
