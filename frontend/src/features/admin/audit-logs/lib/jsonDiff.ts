export type DiffKind = 'added' | 'removed' | 'changed'

export interface DiffEntry {
  key: string
  kind: DiffKind
  oldValue: unknown
  newValue: unknown
}

/**
 * Parse an audit-log payload that may be a JSON string, a JSON object, or
 * something else entirely. The backend stores it as TEXT, so we have to be
 * defensive.
 */
export function parseAuditPayload(
  raw: string | Record<string, unknown> | null | undefined,
): Record<string, unknown> | null {
  if (raw === null || raw === undefined) return null
  if (typeof raw === 'object') return raw as Record<string, unknown>
  if (typeof raw !== 'string') return null
  const trimmed = raw.trim()
  if (trimmed.length === 0) return null
  try {
    const parsed = JSON.parse(trimmed)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>
    }
    // Numeric / array / string — wrap so the UI can still display something.
    return { value: parsed }
  } catch {
    return { raw: trimmed }
  }
}

/**
 * Shallow diff of two records keyed by string. Nested objects are compared via
 * JSON.stringify — good enough for an admin audit view.
 */
export function diffJson(
  oldData: Record<string, unknown> | null,
  newData: Record<string, unknown> | null,
): DiffEntry[] {
  if (oldData === null && newData === null) return []

  const entries: DiffEntry[] = []
  const keys = new Set<string>([
    ...(oldData ? Object.keys(oldData) : []),
    ...(newData ? Object.keys(newData) : []),
  ])

  for (const key of Array.from(keys).sort()) {
    const inOld = oldData !== null && key in oldData
    const inNew = newData !== null && key in newData
    const oldValue = inOld ? oldData![key] : null
    const newValue = inNew ? newData![key] : null

    if (!inOld && inNew) {
      entries.push({ key, kind: 'added', oldValue: null, newValue })
      continue
    }
    if (inOld && !inNew) {
      entries.push({ key, kind: 'removed', oldValue, newValue: null })
      continue
    }
    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      entries.push({ key, kind: 'changed', oldValue, newValue })
    }
  }

  return entries
}
