import { Bell, Search, User, MessageSquare } from 'lucide-react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { useAuth } from '@/contexts/AuthContext'
import { useLeads } from '@/contexts/LeadsContext'
import { useChat } from '@/contexts/ChatContext'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Link } from 'react-router-dom'

export function Header() {
  const { user, logout } = useAuth()
  const { notifications, markNotificationsAsRead } = useLeads()
  const { getUnreadCount } = useChat()

  const systemUnreadCount = notifications.filter((n) => !n.read).length
  const recentNotifications = notifications.slice(0, 5)

  const chatUnreadCount = user ? getUnreadCount(user.id) : 0

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b bg-white/80 backdrop-blur-md px-4 sm:px-6 md:px-8 pl-16 md:pl-8">
      <div className="flex flex-1 items-center gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar leads..."
            className="w-full bg-muted/50 pl-9"
          />
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <Button variant="ghost" size="icon" className="relative" asChild>
          <Link to="/chat">
            <MessageSquare className="h-5 w-5" />
            {chatUnreadCount > 0 && (
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-600" />
            )}
          </Link>
        </Button>

        <Popover
          onOpenChange={(open) => {
            if (open) markNotificationsAsRead()
          }}
        >
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {systemUnreadCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] text-white">
                  {systemUnreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80">
            <h4 className="font-semibold mb-3">Notificações do Sistema</h4>
            <div className="space-y-3">
              {recentNotifications.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhuma atividade recente.
                </p>
              ) : (
                recentNotifications.map((n) => (
                  <div
                    key={n.id}
                    className="flex flex-col gap-1 text-sm border-b pb-2 last:border-0 last:pb-0"
                  >
                    <p
                      className={`text-sm ${!n.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}
                    >
                      {n.message}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(n.createdAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-primary/10 hover:bg-primary/20"
            >
              <span className="text-sm font-medium text-primary uppercase">
                {user?.name?.slice(0, 2) || <User className="h-5 w-5" />}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{user?.name}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {user?.email}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Perfil</DropdownMenuItem>
            <DropdownMenuItem>Configurações</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:bg-red-50 focus:text-red-600"
              onClick={logout}
            >
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
