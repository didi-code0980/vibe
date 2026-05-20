'use client'

import { useRoles } from '@/features/admin/config/hooks/useConfig'

export function RolesPanel() {
  const { data, isLoading, error } = useRoles()

  if (isLoading) return <p className="text-muted">Loading roles…</p>
  if (error) return <p className="text-danger">Could not load roles.</p>

  const roles = data ?? []

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-[15px] font-semibold text-ink">System Roles</h3>
        <p className="text-[12px] text-muted">
          Roles are fixed and <strong>read-only</strong> in v1. Manage feature-level toggles in
          the Permission Matrix tab.
        </p>
      </div>

      {roles.length === 0 ? (
        <p className="text-[13px] text-muted">No roles returned by the server.</p>
      ) : (
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="text-left text-ink2 border-b border-faint">
              <th className="px-3 py-2 w-[200px]">Role</th>
              <th className="px-3 py-2">Description</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role.name} className="border-b border-faint">
                <td className="px-3 py-2 font-mono text-ink">{role.name}</td>
                <td className="px-3 py-2 text-ink2">{role.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
