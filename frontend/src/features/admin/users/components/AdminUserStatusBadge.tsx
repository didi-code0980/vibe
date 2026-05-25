import type { FC } from 'react'
import type { AdminUserStatus } from '@/features/admin/users/types/admin-user.types'

const STYLES: Record<AdminUserStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  LOCKED: 'bg-amber-100 text-amber-900',
  DEACTIVE: 'bg-zinc-100 text-zinc-700',
  DELETED: 'bg-red-100 text-red-800',
}

export const AdminUserStatusBadge: FC<{ status: AdminUserStatus }> = ({ status }) => (
  <span
    data-testid="admin-user-status-badge"
    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${STYLES[status]}`}
  >
    {status}
  </span>
)
