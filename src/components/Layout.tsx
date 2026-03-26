import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { LeadsProvider } from '@/contexts/LeadsContext'

export function Layout() {
  return (
    <LeadsProvider>
      <div className="flex min-h-screen bg-gray-50/50 w-full relative">
        <Sidebar />
        <div className="flex-1 flex flex-col md:pl-64 transition-all duration-300 min-w-0 w-full">
          <Header />
          <main className="flex-1 p-4 sm:p-6 md:p-10 pt-6 w-full">
            <Outlet />
          </main>
        </div>
      </div>
    </LeadsProvider>
  )
}
