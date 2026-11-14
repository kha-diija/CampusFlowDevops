import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import type { Role } from '@/types'

interface RoleGuardProps {
  role?: Role
  roles?: Role[]
  children: ReactNode
}

export function RoleGuard({ role, roles, children }: RoleGuardProps) {
  const { user } = useAuth()
  const allowed = roles ?? (role ? [role] : [])

  if (!user || !allowed.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
