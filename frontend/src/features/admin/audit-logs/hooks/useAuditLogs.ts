'use client'

import { useQuery } from '@tanstack/react-query'
import { auditLogsService } from '@/features/admin/audit-logs/services/audit-logs.service'
import type { AuditLogFilter } from '@/features/admin/audit-logs/types/audit-log.types'

export const AUDIT_LOGS_KEY = (filter: AuditLogFilter & { page?: number; size?: number }) =>
  ['admin', 'audit-logs', filter] as const

export function useAuditLogs(filter: AuditLogFilter & { page?: number; size?: number } = {}) {
  return useQuery({
    queryKey: AUDIT_LOGS_KEY(filter),
    queryFn: () => auditLogsService.search(filter),
  })
}
