import { Bell, Search, User as UserIcon, MessageSquare } from 'lucide-react'
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
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { useAuth } from '@/contexts/AuthContext'
import { useLeads } from '@/contexts/LeadsContext'
import { useChat } from '@/contexts/ChatContext'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Link } from 'react-router-dom'
import { ThemeToggle } from './ThemeToggle'

export function Header() {
  const { user, logout } = useAuth()
  const { notifications, markNotificationsAsRead } = useLeads()
  const { getUnreadCount } = useChat()

  const systemUnreadCount = notifications.filter((n) => !n.read).length
  const recentNotifications = notifications.slice(0, 5)

  const chatUnreadCount = user ? getUnreadCount(user.id) : 0

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b bg-background/80 backdrop-blur-md px-4 sm:px-6 md:px-8 pl-14 md:pl-8 transition-colors duration-300">
      <div className="flex flex-1 items-center gap-4">
        <div className="relative w-full max-w-sm hidden sm:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar no sistema..."
            className="w-full bg-muted/50 pl-9"
          />
        </div>
      </div>
      <div className="flex items-center gap-1 sm:gap-2 md:gap-4 ml-auto">
        <ThemeToggle />

        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full"
          asChild
        >
          <Link to="/chat">
            <MessageSquare className="h-5 w-5" />
            {chatUnreadCount > 0 && (
              <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-background" />
            )}
          </Link>
        </Button>

        <Popover
          onOpenChange={(open) => {
            if (open) markNotificationsAsRead()
          }}
        >
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-full"
            >
              <Bell className="h-5 w-5" />
              {systemUnreadCount > 0 && (
                <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white border-2 border-background">
                  {systemUnreadCount > 9 ? '9+' : systemUnreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0 overflow-hidden">
            <div className="bg-muted/50 p-3 border-b">
              <h4 className="font-semibold text-sm">Notificações do Sistema</h4>
            </div>
            <div className="max-h-[300px] overflow-y-auto p-3 space-y-3">
              {recentNotifications.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma atividade recente.
                </p>
              ) : (
                recentNotifications.map((n) => (
                  <div
                    key={n.id}
                    className="flex flex-col gap-1 text-sm border-b pb-2 last:border-0 last:pb-0"
                  >
                    <p
                      className={`text-sm ${!n.read ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'}`}
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
              className="flex items-center gap-2 px-2 hover:bg-muted rounded-full pl-2 pr-2 md:pr-4"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={`https://img.usecurling.com/ppl/thumbnail?seed=${user?.id}`}
                />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {user?.name?.slice(0, 2).toUpperCase() || (
                    <UserIcon className="h-4 w-4" />
                  )}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start text-sm">
                <span className="font-medium leading-none mb-1">
                  {user?.name}
                </span>
                <span className="text-xs text-muted-foreground leading-none">
                  {user?.role}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Perfil</DropdownMenuItem>
            <DropdownMenuItem>Configurações</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:bg-red-50 dark:focus:bg-red-950 focus:text-red-600 cursor-pointer"
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
