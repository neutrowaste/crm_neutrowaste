import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

const WARNING_TIME = 28 * 60 * 1000 // 28 minutes
const LOGOUT_TIME = 2 * 60 * 1000 // 2 minutes

export function SessionTimeout({ children }: { children: React.ReactNode }) {
  const [showWarning, setShowWarning] = useState(false)
  const { logout } = useAuth()
  const navigate = useNavigate()
  const lastActivity = useRef(Date.now())
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const handleLogout = useCallback(() => {
    logout()
    navigate('/login', {
      state: {
        message:
          'Sua sessão expirou devido à inatividade. Por favor, faça login novamente para continuar.',
      },
    })
  }, [logout, navigate])

  const handleActivity = useCallback(() => {
    if (!showWarning) {
      lastActivity.current = Date.now()
    }
  }, [showWarning])

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart']
    events.forEach((e) => window.addEventListener(e, handleActivity))

    intervalRef.current = setInterval(() => {
      const now = Date.now()
      const inactiveDuration = now - lastActivity.current
      const totalTimeout = WARNING_TIME + LOGOUT_TIME

      if (inactiveDuration >= totalTimeout) {
        if (intervalRef.current) clearInterval(intervalRef.current)
        handleLogout()
      } else if (inactiveDuration >= WARNING_TIME && !showWarning) {
        setShowWarning(true)
      }
    }, 1000)

    return () => {
      events.forEach((e) => window.removeEventListener(e, handleActivity))
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [handleActivity, handleLogout, showWarning])

  const handleStayLoggedIn = () => {
    lastActivity.current = Date.now()
    setShowWarning(false)
  }

  return (
    <>
      {children}
      <Dialog
        open={showWarning}
        onOpenChange={(open) => {
          if (!open) handleStayLoggedIn()
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Aviso de Inatividade</DialogTitle>
            <DialogDescription>
              Sua sessão está prestes a expirar devido à inatividade. Deseja
              continuar conectado?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
            <Button variant="outline" onClick={handleLogout}>
              Sair
            </Button>
            <Button onClick={handleStayLoggedIn}>Continuar Conectado</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
