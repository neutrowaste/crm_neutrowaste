import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Calendar,
  MessageSquare,
  BarChart3,
  Settings,
  ShieldAlert,
  Kanban,
  FileText,
  Mail,
  Zap,
} from 'lucide-react'
import logoImg from '../assets/neutrowaste-0b9d5.jpg'
import { useAuth } from '@/contexts/AuthContext'
import { useChat } from '@/contexts/ChatContext'

const defaultNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Kanban', href: '/kanban', icon: Kanban },
  { name: 'Leads', href: '/leads', icon: Users },
  { name: 'Contratos', href: '/contracts', icon: FileText },
  { name: 'Agenda', href: '/calendar', icon: Calendar },
  { name: 'Chat', href: '/chat', icon: MessageSquare },
  { name: 'Relatórios', href: '/reports', icon: BarChart3 },
  { name: 'Modelos', href: '/templates', icon: Mail },
]

export function Sidebar() {
  const location = useLocation()
  const { user } = useAuth()
  const { getUnreadCount } = useChat()

  const navigation = [...defaultNavigation]
  if (user?.role === 'Admin') {
    navigation.push(
      { name: 'Gatilhos', href: '/automations', icon: Zap },
      { name: 'Auditoria', href: '/logs', icon: ShieldAlert },
      { name: 'Configurações', href: '/settings', icon: Settings },
    )
  }

  const unreadCount = user ? getUnreadCount(user.id) : 0

  return (
    <div className="hidden md:flex flex-col w-64 bg-card border-r h-screen fixed left-0 top-0 pt-4 z-10 print:hidden">
      <div className="flex h-16 shrink-0 items-center px-6">
        <img
          src={logoImg}
          alt="Neutrowaste Logo"
          className="h-8 object-contain dark:brightness-200 dark:contrast-200"
        />
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
        <nav className="flex-1 space-y-1 px-3">
          {navigation.map((item) => {
            const isActive = location.pathname.startsWith(item.href)
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  'group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors relative',
                )}
              >
                <item.icon
                  className={cn(
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground group-hover:text-foreground',
                    'mr-3 flex-shrink-0 h-5 w-5 transition-colors',
                  )}
                  aria-hidden="true"
                />
                {item.name}

                {item.name === 'Chat' && unreadCount > 0 && (
                  <span className="absolute right-3 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                    {unreadCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
