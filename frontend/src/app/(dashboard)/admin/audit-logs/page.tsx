import { AuditLogTable } from '@/features/admin/audit-logs/components/AuditLogTable'

export default function AuditLogsPage() {
  return (
    <div className="p-6 space-y-3">
      <h1 className="text-[18px] font-semibold text-ink">Audit Logs</h1>
      <AuditLogTable />
    </div>
  )
}
