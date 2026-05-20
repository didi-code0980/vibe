'use client'

import type { ReactNode } from 'react'
import { useAuthStore } from '@/store/auth.store'
import type { Role } from '@/lib/constants/roles'

interface Props {
  allowedRoles: Role[]
  children: ReactNode
  fallback?: ReactNode
}

export function RoleGuard({ allowedRoles, children, fallback = null }: Props) {
  const role = useAuthStore((s) => s.user?.role)

  if (!role || !allowedRoles.includes(role)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
