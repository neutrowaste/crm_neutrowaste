import { Link } from 'react-router-dom'
import {
  Menu,
  Bell,
  Search,
  User as UserIcon,
  LogOut,
  Moon,
  Sun,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Sidebar } from '@/components/Sidebar'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useLeads } from '@/contexts/LeadsContext'
import { useAuth } from '@/contexts/AuthContext'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useTheme } from '@/components/ThemeProvider'

export function Header() {
  const { notifications, markNotificationsAsRead } = useLeads()
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full shrink-0 items-center justify-between border-b bg-background px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <Sidebar />
          </SheetContent>
        </Sheet>

        <div className="hidden sm:flex relative w-64 lg:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar..."
            className="w-full bg-muted/50 pl-9 rounded-full focus-visible:ring-1"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="rounded-full"
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>

        <DropdownMenu
          onOpenChange={(open) => !open && markNotificationsAsRead()}
        >
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-full"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive border border-background"></span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Notificações</p>
                <p className="text-xs text-muted-foreground">
                  Você tem {unreadCount} mensagens não lidas
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Nenhuma notificação.
                </div>
              ) : (
                notifications.slice(0, 10).map((n) => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 text-sm border-b last:border-0 ${!n.read ? 'bg-muted/50' : ''}`}
                  >
                    <p className="font-medium">{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(n.createdAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-9 w-9 rounded-full ml-1"
            >
              <Avatar className="h-9 w-9 border">
                <AvatarImage
                  src={`https://img.usecurling.com/ppl/thumbnail?seed=${user?.id}`}
                />
                <AvatarFallback>
                  {user?.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background bg-green-500"></span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none flex items-center gap-1.5">
                  {user?.name}
                  {user?.role === 'Admin' && (
                    <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
                  )}
                </p>
                <p className="text-xs text-muted-foreground leading-none">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/settings" className="cursor-pointer">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Perfil e Configurações</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={logout}
              className="text-red-600 focus:text-red-600 cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair da conta</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
