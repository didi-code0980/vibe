'use client'

import { useState } from 'react'

import { useAdminUserActivity } from '@/features/admin/users/hooks/useAdminUsers'

interface Props {
  userId: number
}

export function AdminUserActivity({ userId }: Props) {
  const [page, setPage] = useState(0)
  const { data, isLoading, error } = useAdminUserActivity(userId, page, 20)

  if (isLoading) return <p className="text-muted">Loading activity…</p>
  if (error) return <p className="text-danger">Failed to load activity.</p>

  const items = data?.items ?? []

  return (
    <div className="space-y-3" data-testid="admin-user-activity">
      {items.length === 0 ? (
        <p className="text-muted text-[13px]">No activity yet.</p>
      ) : (
        <ul className="divide-y divide-faint border border-faint rounded-card">
          {items.map((log) => (
            <li key={log.logId} className="px-4 py-3 text-[13px]">
              <div className="flex justify-between">
                <span className="font-medium">{log.action}</span>
                <span className="text-muted">{log.createdAt?.slice(0, 19)}</span>
              </div>
              <div className="text-[12px] text-muted">
                {log.entityType}#{log.entityId ?? '—'} · ip {log.ipAddress ?? '—'}
              </div>
              {(log.oldData || log.newData) && (
                <details className="mt-1 text-[12px]">
                  <summary className="cursor-pointer text-teal">diff</summary>
                  <pre className="bg-zinc-50 p-2 mt-1 rounded overflow-x-auto">
{`old: ${log.oldData ?? '—'}\nnew: ${log.newData ?? '—'}`}
                  </pre>
                </details>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-3 text-[12px] text-muted">
        <button
          type="button"
          disabled={!data?.hasPrevious}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          className="px-2 py-1 border border-faint rounded-btn disabled:opacity-50"
        >
          Prev
        </button>
        <span>Page {(data?.page ?? 0) + 1} / {Math.max(1, data?.totalPages ?? 1)}</span>
        <button
          type="button"
          disabled={!data?.hasNext}
          onClick={() => setPage((p) => p + 1)}
          className="px-2 py-1 border border-faint rounded-btn disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  )
}
