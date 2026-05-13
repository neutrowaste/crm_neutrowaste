import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

interface RequirePermissionProps {
  children: React.ReactNode
  module: string
}

export function RequirePermission({
  children,
  module,
}: RequirePermissionProps) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const hasPermission = () => {
    if (!user) return false

    if (
      user.role?.trim().toLowerCase() === 'admin' ||
      user.permissions?.includes('*')
    ) {
      return true
    }
    return user.permissions?.some(
      (p) =>
        typeof p === 'string' &&
        p.trim().toLowerCase() === module.trim().toLowerCase(),
    )
  }

  if (!hasPermission()) {
    // Navigate to dashboard only if they are not already trying to access it
    if (module.toLowerCase() !== 'dashboard') {
      return <Navigate to="/dashboard" replace />
    }
    // Fallback UI if they don't even have dashboard permission to avoid loops
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-slate-50 dark:bg-zinc-950">
        <div className="bg-white dark:bg-zinc-900 border border-destructive/20 text-destructive p-8 rounded-xl max-w-md shadow-sm text-center">
          <h2 className="text-xl font-bold mb-3">Acesso Negado</h2>
          <p className="text-sm opacity-90">
            Você não tem permissão para acessar o sistema. Contate o
            administrador para solicitar liberação.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
