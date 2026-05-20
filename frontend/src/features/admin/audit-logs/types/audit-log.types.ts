export interface AuditLogRow {
  logId: number
  actorId: number | null
  actorFullName: string | null
  actorEmail: string | null
  action: string
  entityType: string
  entityId: number | null
  oldData: string | null
  newData: string | null
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
}

export interface AuditLogFilter {
  actorId?: number
  action?: string
  entityType?: string
  entityId?: number
  fromDate?: string
  toDate?: string
}
