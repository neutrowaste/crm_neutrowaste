import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Phone, Mail, Calendar } from 'lucide-react'
import { useLeads } from '@/contexts/LeadsContext'

export function InteractionHistory() {
  const { leads } = useLeads()
  const recentLeads = leads.slice(0, 5)

  const getAction = (index: number) => {
    const actions = [
      {
        text: 'Ligou para',
        icon: Phone,
        color: 'text-blue-500',
        bg: 'bg-blue-50',
      },
      {
        text: 'Enviou e-mail para',
        icon: Mail,
        color: 'text-purple-500',
        bg: 'bg-purple-50',
      },
      {
        text: 'Reuniu-se com',
        icon: Calendar,
        color: 'text-green-500',
        bg: 'bg-green-50',
      },
    ]
    return actions[index % actions.length]
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Interações Recentes</CardTitle>
        <CardDescription>Últimas atividades com seus leads</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6 sm:space-y-8">
          {recentLeads.map((lead, index) => {
            const action = getAction(index)
            const ActionIcon = action.icon

            return (
              <div key={lead.id} className="flex items-center gap-4">
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarImage
                    src={`https://img.usecurling.com/ppl/thumbnail?seed=${lead.id}`}
                    alt={lead.name}
                  />
                  <AvatarFallback>
                    {lead.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1 min-w-0 flex-1">
                  <p className="text-sm font-medium leading-none truncate">
                    <span className="text-muted-foreground">{action.text}</span>{' '}
                    {lead.name}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {lead.company}
                  </p>
                </div>
                <div className="font-medium text-xs text-muted-foreground whitespace-nowrap shrink-0">
                  {index === 0 ? 'Agora' : `${index + 1}h atrás`}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
