import { apiClient } from '@/lib/api/client'
import { ENDPOINTS } from '@/lib/api/endpoints'
import type { ApiResponse, PageResponse } from '@/lib/api/types'
import type {
  AuditLogFilter,
  AuditLogRow,
} from '@/features/admin/audit-logs/types/audit-log.types'

function unwrap<T>(body: ApiResponse<T>): T {
  if (!body.success || body.data === undefined || body.data === null) {
    throw new Error(body.error?.message ?? 'Request failed')
  }
  return body.data
}

export const auditLogsService = {
  search: async (filter: AuditLogFilter & { page?: number; size?: number }) => {
    const params: Record<string, string | number | boolean> = {}
    if (filter.actorId != null) params.actorId = filter.actorId
    if (filter.action) params.action = filter.action
    if (filter.entityType) params.entityType = filter.entityType
    if (filter.entityId != null) params.entityId = filter.entityId
    if (filter.fromDate) params.fromDate = filter.fromDate
    if (filter.toDate) params.toDate = filter.toDate
    if (filter.page != null) params.page = filter.page
    if (filter.size != null) params.size = filter.size
    const body = await apiClient.get<ApiResponse<PageResponse<AuditLogRow>>>(
      ENDPOINTS.ADMIN.AUDIT_LOGS,
      { params },
    )
    return unwrap(body)
  },
}
