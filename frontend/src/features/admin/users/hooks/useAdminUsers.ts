'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { adminUsersService } from '@/features/admin/users/services/admin-users.service'
import type {
  AdminUserCreatePayload,
  AdminUserListParams,
  AdminUserStatusUpdate,
} from '@/features/admin/users/types/admin-user.types'

export const ADMIN_USERS_KEY = (params: AdminUserListParams) => ['admin', 'users', params] as const
export const ADMIN_USER_ACTIVITY_KEY = (id: number, page: number, size: number) =>
  ['admin', 'users', id, 'activity', page, size] as const

export function useAdminUsers(params: AdminUserListParams = {}) {
  return useQuery({
    queryKey: ADMIN_USERS_KEY(params),
    queryFn: () => adminUsersService.list(params),
  })
}

export function useAdminUserActivity(id: number, page = 0, size = 20) {
  return useQuery({
    queryKey: ADMIN_USER_ACTIVITY_KEY(id, page, size),
    queryFn: () => adminUsersService.activity(id, { page, size }),
    enabled: Number.isFinite(id) && id > 0,
  })
}

export function useCreateAdminUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: AdminUserCreatePayload) => adminUsersService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })
}

export function useSetAdminUserStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: { id: number; payload: AdminUserStatusUpdate }) =>
      adminUsersService.setStatus(vars.id, vars.payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })
}

export function useDeleteAdminUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => adminUsersService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })
}
