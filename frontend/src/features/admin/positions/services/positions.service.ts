import { apiClient } from '@/lib/api/client'
import { ENDPOINTS } from '@/lib/api/endpoints'
import type { ApiResponse, PageResponse } from '@/lib/api/types'
import type {
  PositionCreatePayload,
  PositionDetail,
  PositionUpdatePayload,
} from '@/features/admin/positions/types/position.types'

function unwrap<T>(body: ApiResponse<T>): T {
  if (!body.success || body.data === undefined || body.data === null) {
    throw new Error(body.error?.message ?? 'Request failed')
  }
  return body.data
}

export const positionsService = {
  list: async (params: { page?: number; size?: number; keyword?: string; status?: string } = {}) => {
    const body = await apiClient.get<ApiResponse<PageResponse<PositionDetail>>>(
      ENDPOINTS.ADMIN.POSITIONS.LIST,
      { params: params as Record<string, string | number | boolean> },
    )
    return unwrap(body)
  },

  getById: async (id: number) => {
    const body = await apiClient.get<ApiResponse<PositionDetail>>(
      ENDPOINTS.ADMIN.POSITIONS.DETAIL(id),
    )
    return unwrap(body)
  },

  create: async (payload: PositionCreatePayload) => {
    const body = await apiClient.post<ApiResponse<PositionDetail>>(
      ENDPOINTS.ADMIN.POSITIONS.CREATE,
      payload,
    )
    return unwrap(body)
  },

  update: async (id: number, payload: PositionUpdatePayload) => {
    const body = await apiClient.put<ApiResponse<PositionDetail>>(
      ENDPOINTS.ADMIN.POSITIONS.UPDATE(id),
      payload,
    )
    return unwrap(body)
  },

  delete: async (id: number) => {
    await apiClient.delete<ApiResponse<string>>(ENDPOINTS.ADMIN.POSITIONS.DELETE(id))
  },
}
