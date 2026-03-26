import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { useEffect } from 'react'

export function Layout() {
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  return (
    <div className="flex min-h-screen bg-gray-50/50 w-full relative">
      <Sidebar />
      <div className="flex-1 flex flex-col md:pl-64 transition-all duration-300 min-w-0 w-full print:pl-0">
        <div className="print:hidden">
          <Header />
        </div>
        <main className="flex-1 p-4 sm:p-6 md:p-10 pt-6 w-full print:p-0 print:m-0 print:bg-white print:text-black">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
