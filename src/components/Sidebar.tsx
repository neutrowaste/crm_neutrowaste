import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Calendar,
  BarChart3,
  Settings,
  Menu,
  DollarSign,
  FileText,
  MessageSquare,
  FileArchive,
  Kanban,
} from 'lucide-react'
import { Button } from './ui/button'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useChat } from '@/contexts/ChatContext'
import logoImg from '../assets/neutrowaste-0b9d5.jpg'

const getNavigation = (role: string) => {
  const baseNav = [
    { name: 'Painel', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Kanban', href: '/kanban', icon: Kanban },
    { name: 'Leads', href: '/leads', icon: Users },
    { name: 'Agenda', href: '/calendar', icon: Calendar },
    { name: 'Chat da Equipe', href: '/chat', icon: MessageSquare },
    { name: 'Relatórios', href: '/reports', icon: BarChart3 },
  ]

  if (role === 'Admin') {
    baseNav.push({
      name: 'Relatórios Financeiros',
      href: '/financial-reports',
      icon: DollarSign,
    })
    baseNav.push({
      name: 'Logs do Sistema',
      href: '/logs',
      icon: FileText,
    })
  }

  baseNav.push({
    name: 'Modelos / Templates',
    href: '/templates',
    icon: FileArchive,
  })
  baseNav.push({ name: 'Configurações', href: '/settings', icon: Settings })

  return baseNav
}

export function Sidebar() {
  const location = useLocation()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const { user } = useAuth()
  const { getUnreadCount } = useChat()

  const navigation = getNavigation(user?.role || 'Seller')
  const unreadChatMsgs = user ? getUnreadCount(user.id) : 0

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-3 z-50 md:hidden print:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 transform border-r bg-white transition-transform duration-200 ease-in-out md:translate-x-0 flex flex-col print:hidden',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 shrink-0 items-center px-6 border-b">
          <Link to="/dashboard" className="flex items-center gap-2">
            <img
              src={logoImg}
              alt="Neutrowaste Logo"
              className="h-8 object-contain"
            />
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          {navigation.map((item) => {
            const isActive =
              location.pathname === item.href ||
              (item.href !== '/dashboard' &&
                location.pathname.startsWith(item.href))
            const Icon = item.icon
            const isChat = item.href === '/chat'

            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  'flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-gray-700 hover:bg-gray-100',
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      'h-4 w-4',
                      isActive ? 'text-primary-foreground' : 'text-gray-500',
                    )}
                  />
                  {item.name}
                </div>
                {isChat && unreadChatMsgs > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                    {unreadChatMsgs}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden backdrop-blur-sm print:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  )
}
