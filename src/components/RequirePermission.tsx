import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export function RequirePermission({
  children,
  module,
}: {
  children: React.ReactNode
  module: string
}) {
  const { user, loading } = useAuth()

  if (loading) {
    return null
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const hasPermission = () => {
    if (
      user?.role?.toLowerCase() === 'admin' ||
      user?.permissions?.includes('*')
    ) {
      return true
    }

    return user?.permissions?.some(
      (p: string) =>
        typeof p === 'string' && p.toLowerCase() === module.toLowerCase(),
    )
  }

  if (!hasPermission()) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
