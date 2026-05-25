'use client'

import { useState } from 'react'
import Link from 'next/link'

import { AdminUserStatusBadge } from './AdminUserStatusBadge'
import {
  useAdminUsers,
  useDeleteAdminUser,
  useSetAdminUserStatus,
} from '@/features/admin/users/hooks/useAdminUsers'
import type {
  AdminUserListItem,
  AdminUserListParams,
  AdminUserStatus,
} from '@/features/admin/users/types/admin-user.types'

export function AdminUserList() {
  const [filters, setFilters] = useState<AdminUserListParams>({ page: 0, size: 20 })
  const { data, isLoading, error, refetch } = useAdminUsers(filters)
  const lockMutation = useSetAdminUserStatus()
  const deleteMutation = useDeleteAdminUser()

  async function toggleLock(u: AdminUserListItem) {
    const next: AdminUserStatus = u.status === 'LOCKED' ? 'ACTIVE' : 'LOCKED'
    const verb = next === 'LOCKED' ? 'lock' : 'unlock'
    if (!confirm(`${verb[0].toUpperCase() + verb.slice(1)} ${u.email}?`)) return
    await lockMutation.mutateAsync({ id: u.userId, payload: { status: next as 'ACTIVE' | 'LOCKED' } })
    refetch()
  }

  async function softDelete(u: AdminUserListItem) {
    if (!confirm(`Delete ${u.email}? This action cannot be undone.`)) return
    await deleteMutation.mutateAsync(u.userId)
    refetch()
  }

  if (isLoading) return <p className="text-muted">Loading users…</p>
  if (error) return <p className="text-danger">Failed to load users.</p>

  const items = data?.items ?? []

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-[12px] text-muted">
          <span className="block mb-1">Search</span>
          <input
            data-testid="admin-users-search"
            className="border border-faint rounded-btn px-2 py-1 text-[13px]"
            value={filters.search ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value, page: 0 }))}
          />
        </label>
        <label className="text-[12px] text-muted">
          <span className="block mb-1">Status</span>
          <select
            data-testid="admin-users-status-filter"
            className="border border-faint rounded-btn px-2 py-1 text-[13px]"
            value={filters.status ?? ''}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                status: (e.target.value || undefined) as AdminUserStatus | undefined,
                page: 0,
              }))
            }
          >
            <option value="">All</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="LOCKED">LOCKED</option>
            <option value="DEACTIVE">DEACTIVE</option>
          </select>
        </label>
        <Link
          href="/admin/users/create"
          className="ml-auto px-3 py-1.5 rounded-btn bg-teal text-white text-[13px] hover:bg-teal-dark"
        >
          New User
        </Link>
      </div>

      <table className="w-full text-[13px] border border-faint rounded-card overflow-hidden">
        <thead className="bg-zinc-50 text-left">
          <tr>
            <th className="px-3 py-2">Full name</th>
            <th className="px-3 py-2">Email</th>
            <th className="px-3 py-2">Position</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Created</th>
            <th className="px-3 py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-3 py-6 text-center text-muted">
                No users found.
              </td>
            </tr>
          ) : (
            items.map((u) => (
              <tr key={u.userId} className="border-t border-faint" data-testid={`admin-user-row-${u.userId}`}>
                <td className="px-3 py-2">{u.fullName ?? '—'}</td>
                <td className="px-3 py-2">{u.email}</td>
                <td className="px-3 py-2">{u.positionName ?? '—'}</td>
                <td className="px-3 py-2"><AdminUserStatusBadge status={u.status} /></td>
                <td className="px-3 py-2">{u.createdAt?.slice(0, 10) ?? ''}</td>
                <td className="px-3 py-2 text-right space-x-2">
                  <Link
                    href={`/admin/users/${u.userId}`}
                    className="text-teal hover:underline"
                  >
                    View
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggleLock(u)}
                    className="text-amber-700 hover:underline"
                    disabled={lockMutation.isPending}
                  >
                    {u.status === 'LOCKED' ? 'Unlock' : 'Lock'}
                  </button>
                  <button
                    type="button"
                    onClick={() => softDelete(u)}
                    className="text-danger hover:underline"
                    disabled={deleteMutation.isPending}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="flex items-center gap-3 text-[12px] text-muted">
        <button
          type="button"
          disabled={!data?.hasPrevious}
          onClick={() => setFilters((f) => ({ ...f, page: Math.max(0, (f.page ?? 0) - 1) }))}
          className="px-2 py-1 border border-faint rounded-btn disabled:opacity-50"
        >
          Prev
        </button>
        <span>
          Page {(data?.page ?? 0) + 1} / {Math.max(1, data?.totalPages ?? 1)}
        </span>
        <button
          type="button"
          disabled={!data?.hasNext}
          onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 0) + 1 }))}
          className="px-2 py-1 border border-faint rounded-btn disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  )
}
