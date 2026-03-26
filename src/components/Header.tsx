import { Bell, Search, Recycle } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

const navLinks = [
  { name: 'Dashboard', href: '/' },
  { name: 'Leads List', href: '/leads' },
  { name: 'Register New Lead', href: '/leads/new' },
]

export function Header() {
  const location = useLocation()

  return (
    <header className="flex items-center justify-between px-6 py-4 md:px-10 bg-white shadow-sm mx-4 mt-4 rounded-full sticky top-4 z-40 border border-gray-100">
      <div className="flex items-center gap-8">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="h-8 w-8 bg-green-600 rounded-lg flex items-center justify-center group-hover:bg-green-700 transition-colors">
            <Recycle className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight hidden sm:block text-green-900">
            Neutrowaste
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-green-700',
                location.pathname === link.href
                  ? 'text-green-700 font-semibold'
                  : 'text-gray-500',
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center bg-gray-50 rounded-full px-4 py-2 border border-transparent focus-within:border-gray-200 transition-colors">
          <Search className="w-4 h-4 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent border-none outline-none text-sm w-32 focus:w-48 transition-all placeholder:text-gray-400"
          />
        </div>

        <button className="p-2 hover:bg-gray-50 rounded-full transition-colors relative">
          <Bell className="w-5 h-5 text-gray-500" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white" />
        </button>

        <div className="flex items-center gap-3 pl-2 border-l border-gray-200">
          <div className="text-right hidden xl:block">
            <p className="text-sm font-bold text-gray-900 leading-none">
              Admin User
            </p>
            <p className="text-xs text-gray-500 mt-1">Manager</p>
          </div>
          <Avatar className="h-9 w-9 border border-gray-200 cursor-pointer hover:scale-105 transition-transform">
            <AvatarImage
              src="https://img.usecurling.com/ppl/medium?gender=male&seed=12"
              alt="Admin"
            />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
