import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export function SessionTimeout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth()

  useEffect(() => {
    let timeout: NodeJS.Timeout

    const resetTimeout = () => {
      clearTimeout(timeout)
      // 4 hours timeout
      timeout = setTimeout(
        () => {
          logout()
        },
        4 * 60 * 60 * 1000,
      )
    }

    const events = [
      'load',
      'mousemove',
      'mousedown',
      'click',
      'scroll',
      'keypress',
    ]

    events.forEach((event) => {
      window.addEventListener(event, resetTimeout)
    })

    resetTimeout()

    return () => {
      clearTimeout(timeout)
      events.forEach((event) => {
        window.removeEventListener(event, resetTimeout)
      })
    }
  }, [logout])

  return <>{children}</>
}
