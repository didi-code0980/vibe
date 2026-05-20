'use client'

import { useState } from 'react'
import { useAssessmentHistory } from '@/features/profile/hooks/useProfile'

export function AssessmentHistoryList() {
  const [page, setPage] = useState(0)
  const size = 10
  const history = useAssessmentHistory(page, size)

  if (history.isLoading) {
    return <p className="text-[13px] text-muted">Loading history…</p>
  }
  if (history.error) {
    return <p className="text-[13px] text-danger">Could not load assessment history.</p>
  }
  const items = history.data?.items ?? []
  if (items.length === 0) {
    return <p className="text-[13px] text-muted">No assessments yet.</p>
  }

  return (
    <div className="space-y-2">
      <ul className="divide-y divide-faint">
        {items.map((item) => (
          <li key={item.evaluationId} className="py-2.5 flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-ink">{item.skillName ?? '—'}</p>
              <p className="text-[11.5px] text-muted">
                {item.departmentName ?? '—'} ·{' '}
                {new Date(item.assessedAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-3 text-[12px]">
              <span className="text-ink2">
                Self: <strong>{item.selfScore ?? '—'}</strong>
              </span>
              <span className="text-ink2">
                Manager: <strong>{item.managerScore ?? '—'}</strong>
              </span>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={!history.data?.hasPrevious}
          className="text-[12px] text-teal disabled:text-muted disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <span className="text-[11.5px] text-muted">
          Page {page + 1} of {history.data?.totalPages ?? 1}
        </span>
        <button
          type="button"
          onClick={() => setPage((p) => p + 1)}
          disabled={!history.data?.hasNext}
          className="text-[12px] text-teal disabled:text-muted disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  )
}