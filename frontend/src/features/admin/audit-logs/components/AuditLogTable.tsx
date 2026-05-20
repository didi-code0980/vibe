'use client'

import { Fragment, useMemo, useState } from 'react'
import { useAuditLogs } from '@/features/admin/audit-logs/hooks/useAuditLogs'
import type {
  AuditLogFilter,
  AuditLogRow,
} from '@/features/admin/audit-logs/types/audit-log.types'
import { diffJson, parseAuditPayload } from '@/features/admin/audit-logs/lib/jsonDiff'

function renderValue(value: unknown): string {
  if (value === null || value === undefined) return '∅'
  if (typeof value === 'string') return JSON.stringify(value)
  return JSON.stringify(value, null, 2)
}

interface DiffRowsProps {
  row: AuditLogRow
}

function DiffRows({ row }: DiffRowsProps) {
  const oldParsed = useMemo(() => parseAuditPayload(row.oldData), [row.oldData])
  const newParsed = useMemo(() => parseAuditPayload(row.newData), [row.newData])
  const diff = useMemo(() => diffJson(oldParsed, newParsed), [oldParsed, newParsed])

  if (oldParsed === null && newParsed === null) {
    return (
      <p className="text-[12px] text-muted italic">No payload recorded for this event.</p>
    )
  }

  if (diff.length === 0) {
    return (
      <p className="text-[12px] text-muted italic">No field-level differences detected.</p>
    )
  }

  return (
    <table className="w-full text-[12px] font-mono border-collapse">
      <thead>
        <tr className="text-left text-ink2 border-b border-faint">
          <th className="px-2 py-1 w-20">Change</th>
          <th className="px-2 py-1 w-40">Field</th>
          <th className="px-2 py-1">Old</th>
          <th className="px-2 py-1">New</th>
        </tr>
      </thead>
      <tbody>
        {diff.map((entry) => (
          <tr key={entry.key} className="border-b border-faint align-top">
            <td className="px-2 py-1">
              <span
                className={`inline-block px-1.5 py-0.5 rounded-chip text-[10.5px] font-semibold ${
                  entry.kind === 'added'
                    ? 'bg-teal/15 text-teal'
                    : entry.kind === 'removed'
                    ? 'bg-danger/15 text-danger'
                    : 'bg-warning/15 text-warning'
                }`}
              >
                {entry.kind}
              </span>
            </td>
            <td className="px-2 py-1 text-ink">{entry.key}</td>
            <td className="px-2 py-1 text-ink2 whitespace-pre-wrap break-all">
              {renderValue(entry.oldValue)}
            </td>
            <td className="px-2 py-1 text-ink2 whitespace-pre-wrap break-all">
              {renderValue(entry.newValue)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function AuditLogTable() {
  const [filter, setFilter] = useState<AuditLogFilter & { page: number; size: number }>({
    page: 0,
    size: 20,
  })
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  const logs = useAuditLogs(filter)

  function update<K extends keyof typeof filter>(key: K, value: (typeof filter)[K]) {
    setFilter((prev) => ({ ...prev, [key]: value, page: 0 }))
  }

  function toggleRow(logId: number) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(logId)) next.delete(logId)
      else next.add(logId)
      return next
    })
  }

  if (logs.isLoading) return <p className="text-muted">Loading audit logs…</p>
  if (logs.error) return <p className="text-danger">Could not load audit logs.</p>

  const items = logs.data?.items ?? []

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-end">
        <div>
          <label className="block text-[12px] text-ink2 mb-1">Action</label>
          <input
            value={filter.action ?? ''}
            onChange={(e) => update('action', e.target.value || undefined)}
            placeholder="LOGIN_SUCCESS"
            className="rounded-btn border border-faint bg-fog px-3 py-2 text-[13px]"
          />
        </div>
        <div>
          <label className="block text-[12px] text-ink2 mb-1">Entity type</label>
          <input
            value={filter.entityType ?? ''}
            onChange={(e) => update('entityType', e.target.value || undefined)}
            placeholder="USER"
            className="rounded-btn border border-faint bg-fog px-3 py-2 text-[13px]"
          />
        </div>
        <div>
          <label className="block text-[12px] text-ink2 mb-1">From</label>
          <input
            type="datetime-local"
            value={filter.fromDate ?? ''}
            onChange={(e) => update('fromDate', e.target.value || undefined)}
            className="rounded-btn border border-faint bg-fog px-3 py-2 text-[13px]"
          />
        </div>
        <div>
          <label className="block text-[12px] text-ink2 mb-1">To</label>
          <input
            type="datetime-local"
            value={filter.toDate ?? ''}
            onChange={(e) => update('toDate', e.target.value || undefined)}
            className="rounded-btn border border-faint bg-fog px-3 py-2 text-[13px]"
          />
        </div>
      </div>

      <table className="w-full text-[12.5px] border-collapse">
        <thead>
          <tr className="text-left text-ink2 border-b border-faint">
            <th className="px-2 py-2 w-10"></th>
            <th className="px-2 py-2">When</th>
            <th className="px-2 py-2">Actor</th>
            <th className="px-2 py-2">Action</th>
            <th className="px-2 py-2">Entity</th>
            <th className="px-2 py-2">IP</th>
          </tr>
        </thead>
        <tbody>
          {items.map((row) => {
            const isOpen = expanded.has(row.logId)
            return (
              <Fragment key={row.logId}>
                <tr className="border-b border-faint">
                  <td className="px-2 py-2">
                    <button
                      type="button"
                      aria-label={`${isOpen ? 'Collapse' : 'Expand'} log ${row.logId}`}
                      aria-expanded={isOpen}
                      onClick={() => toggleRow(row.logId)}
                      className="w-6 h-6 rounded-btn border border-faint bg-white text-ink2 hover:bg-fog text-[12px] leading-none flex items-center justify-center"
                    >
                      {isOpen ? '−' : '+'}
                    </button>
                  </td>
                  <td className="px-2 py-2">{new Date(row.createdAt).toLocaleString()}</td>
                  <td className="px-2 py-2">
                    {row.actorFullName ?? row.actorEmail ?? '—'}
                  </td>
                  <td className="px-2 py-2 font-mono">{row.action}</td>
                  <td className="px-2 py-2">
                    {row.entityType}
                    {row.entityId != null && ` #${row.entityId}`}
                  </td>
                  <td className="px-2 py-2">{row.ipAddress ?? '—'}</td>
                </tr>
                {isOpen && (
                  <tr className="bg-fog">
                    <td></td>
                    <td colSpan={5} className="px-3 py-3">
                      <div
                        role="region"
                        aria-label={`Diff for log ${row.logId}`}
                        className="bg-white border border-faint rounded-card p-3"
                      >
                        <DiffRows row={row} />
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setFilter((p) => ({ ...p, page: Math.max(0, p.page - 1) }))}
          disabled={!logs.data?.hasPrevious}
          className="text-[12px] text-teal disabled:text-muted"
        >
          Previous
        </button>
        <span className="text-[11.5px] text-muted">
          Page {filter.page + 1} of {logs.data?.totalPages ?? 1}
        </span>
        <button
          type="button"
          onClick={() => setFilter((p) => ({ ...p, page: p.page + 1 }))}
          disabled={!logs.data?.hasNext}
          className="text-[12px] text-teal disabled:text-muted"
        >
          Next
        </button>
      </div>
    </div>
  )
}
