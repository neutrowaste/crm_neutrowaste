import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Users, label: 'Leads List', path: '/leads' },
  { icon: UserPlus, label: 'Register New Lead', path: '/leads/new' },
]

export function Sidebar() {
  const location = useLocation()

  return (
    <aside className="fixed left-4 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col gap-4 bg-green-900 text-white py-6 px-3 rounded-full shadow-2xl shadow-green-900/20">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path
        return (
          <Tooltip key={item.path}>
            <TooltipTrigger asChild>
              <Link
                to={item.path}
                className={cn(
                  'p-3 rounded-full transition-all duration-300 relative group',
                  isActive
                    ? 'bg-white text-green-900 shadow-md'
                    : 'text-white/70 hover:bg-white/10 hover:text-white',
                )}
              >
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </Link>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              className="bg-green-900 text-white border-0 ml-2"
            >
              <p>{item.label}</p>
            </TooltipContent>
          </Tooltip>
        )
      })}
    </aside>
  )
}
