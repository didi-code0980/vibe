'use client'

import { useState } from 'react'
import { usePositions, useDeletePosition } from '@/features/admin/positions/hooks/usePositions'
import { PositionFormDialog } from './PositionFormDialog'
import type { PositionDetail } from '@/features/admin/positions/types/position.types'

export function PositionList() {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<PositionDetail | null>(null)
  const { data, isLoading, error } = usePositions({ page: 0, size: 50 })
  const remove = useDeletePosition()

  function handleEdit(p: PositionDetail) {
    setEditing(p)
    setOpen(true)
  }

  function handleNew() {
    setEditing(null)
    setOpen(true)
  }

  async function handleDelete(p: PositionDetail) {
    if (!confirm(`Delete position "${p.name}"?`)) return
    await remove.mutateAsync(p.positionId)
  }

  if (isLoading) return <p className="text-muted">Loading positions…</p>
  if (error) return <p className="text-danger">Failed to load positions.</p>

  const items = data?.items ?? []

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="text-[16px] font-semibold text-ink">Job Titles (Positions)</h2>
        <button
          type="button"
          onClick={handleNew}
          className="px-3 py-1.5 rounded-btn bg-teal text-white text-[13px] hover:bg-teal-dark"
        >
          New Position
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-muted text-[13px]">No positions yet.</p>
      ) : (
        <ul className="divide-y divide-faint border border-faint rounded-card overflow-hidden">
          {items.map((p) => (
            <li key={p.positionId} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-[14px] font-medium text-ink">{p.name}</p>
                <p className="text-[12px] text-muted">
                  {p.requiredSkills.length} required skills · {p.status}
                </p>
              </div>
              <div className="flex gap-2 text-[12px]">
                <button
                  type="button"
                  onClick={() => handleEdit(p)}
                  className="text-teal hover:underline"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(p)}
                  className="text-danger hover:underline"
                  disabled={remove.isPending}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <PositionFormDialog
        open={open}
        onClose={() => setOpen(false)}
        editing={editing}
      />
    </div>
  )
}
