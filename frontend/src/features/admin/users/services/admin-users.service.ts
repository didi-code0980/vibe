import { apiClient } from '@/lib/api/client'
import { ENDPOINTS } from '@/lib/api/endpoints'
import type { ApiResponse, PageResponse } from '@/lib/api/types'
import type {
  AdminUserActivityItem,
  AdminUserCreated,
  AdminUserCreatePayload,
  AdminUserListItem,
  AdminUserListParams,
  AdminUserStatusUpdate,
} from '@/features/admin/users/types/admin-user.types'

function unwrap<T>(body: ApiResponse<T>): T {
  if (!body.success || body.data === undefined || body.data === null) {
    throw new Error(body.error?.message ?? 'Request failed')
  }
  return body.data
}

function toQueryParams(params: AdminUserListParams): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {}
  if (params.search) out.search = params.search
  if (params.status) out.status = params.status
  if (params.positionId !== undefined) out.positionId = params.positionId
  if (params.createdFrom) out.createdFrom = params.createdFrom
  if (params.createdTo) out.createdTo = params.createdTo
  if (params.sortBy) out.sortBy = params.sortBy
  if (params.sortDir) out.sortDir = params.sortDir
  if (params.page !== undefined) out.page = params.page
  if (params.size !== undefined) out.size = params.size
  return out
}

export const adminUsersService = {
  list: async (params: AdminUserListParams = {}) => {
    const body = await apiClient.get<ApiResponse<PageResponse<AdminUserListItem>>>(
      ENDPOINTS.ADMIN.USERS.LIST,
      { params: toQueryParams(params) },
    )
    return unwrap(body)
  },

  create: async (payload: AdminUserCreatePayload) => {
    const body = await apiClient.post<ApiResponse<AdminUserCreated>>(
      ENDPOINTS.ADMIN.USERS.CREATE,
      payload,
    )
    return unwrap(body)
  },

  setStatus: async (id: number, payload: AdminUserStatusUpdate) => {
    const body = await apiClient.patch<ApiResponse<AdminUserCreated>>(
      ENDPOINTS.ADMIN.USERS.STATUS(id),
      payload,
    )
    return unwrap(body)
  },

  remove: async (id: number) => {
    await apiClient.delete<ApiResponse<null>>(ENDPOINTS.ADMIN.USERS.DELETE(id))
  },

  activity: async (id: number, params: { page?: number; size?: number } = {}) => {
    const body = await apiClient.get<ApiResponse<PageResponse<AdminUserActivityItem>>>(
      ENDPOINTS.ADMIN.USERS.ACTIVITY(id),
      { params: params as Record<string, string | number | boolean> },
    )
    return unwrap(body)
  },
}
