import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export function RequirePermission({
  module,
  children,
}: {
  module: string
  children: React.ReactNode
}) {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" replace />

  const isAdmin =
    user.role?.toLowerCase() === 'admin' || user.permissions?.includes('*')
  const hasAccess =
    isAdmin ||
    user.permissions?.some(
      (p) => typeof p === 'string' && p.toLowerCase() === module.toLowerCase(),
    )

  if (!hasAccess) {
    const firstAvailable =
      user.permissions
        ?.filter((p) => typeof p === 'string' && p !== '*')[0]
        ?.toLowerCase() || 'dashboard'
    if (module.toLowerCase() === firstAvailable.toLowerCase()) {
      return (
        <div className="p-8 flex flex-col items-center justify-center text-center space-y-4">
          <h2 className="text-2xl font-bold">Acesso Negado</h2>
          <p className="text-muted-foreground">
            Você não tem permissão para acessar nenhuma tela. Contate o
            administrador.
          </p>
        </div>
      )
    }
    return <Navigate to={`/${firstAvailable}`} replace />
  }

  return <>{children}</>
}
