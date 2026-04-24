import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Phone,
  Mail,
  Calendar,
  MessageSquare,
  CheckSquare,
  FileText,
  User,
} from 'lucide-react'
import { useLogs } from '@/contexts/LogsContext'
import { useAuth } from '@/contexts/AuthContext'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function InteractionHistory() {
  const { logs } = useLogs()
  const { allUsers } = useAuth()

  const recentLogs = logs.slice(0, 5)

  const getActionIcon = (action: string) => {
    const lAction = action.toLowerCase()
    if (lAction.includes('ligou') || lAction.includes('telefone')) return Phone
    if (lAction.includes('email') || lAction.includes('e-mail')) return Mail
    if (lAction.includes('reuni') || lAction.includes('agend')) return Calendar
    if (
      lAction.includes('chat') ||
      lAction.includes('mensagem') ||
      lAction.includes('whatsapp')
    )
      return MessageSquare
    if (lAction.includes('tarefa') || lAction.includes('conclu'))
      return CheckSquare
    if (lAction.includes('contrato') || lAction.includes('documento'))
      return FileText
    return User
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Interações Recentes</CardTitle>
        <CardDescription>Últimas atividades com seus leads</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6 sm:space-y-8">
          {recentLogs.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-4">
              Nenhuma interação recente.
            </div>
          ) : (
            recentLogs.map((log) => {
              const ActionIcon = getActionIcon(log.action)
              const user = allUsers.find((u) => u.id === log.userId)

              const avatarUrl = user?.avatarUrl
              const nameToUse = log.userName || user?.name || 'Sistema'
              const fallback = nameToUse.slice(0, 2).toUpperCase()

              return (
                <div key={log.id} className="flex items-center gap-4">
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarImage src={avatarUrl || ''} alt={nameToUse} />
                    <AvatarFallback>{fallback}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1 min-w-0 flex-1">
                    <p className="text-sm font-medium leading-none truncate flex items-center gap-1.5">
                      <ActionIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate">
                        {log.action}{' '}
                        <span className="text-muted-foreground">
                          com {log.leadName}
                        </span>
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      por {nameToUse}
                    </p>
                  </div>
                  <div className="font-medium text-xs text-muted-foreground whitespace-nowrap shrink-0">
                    {formatDistanceToNow(new Date(log.timestamp), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
