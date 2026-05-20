import { diffJson, parseAuditPayload } from '@/features/admin/audit-logs/lib/jsonDiff'

describe('parseAuditPayload', () => {
  it('returns null for null/undefined/empty input', () => {
    expect(parseAuditPayload(null)).toBeNull()
    expect(parseAuditPayload(undefined)).toBeNull()
    expect(parseAuditPayload('')).toBeNull()
  })

  it('parses a JSON object string', () => {
    expect(parseAuditPayload('{"a":1,"b":"x"}')).toEqual({ a: 1, b: 'x' })
  })

  it('returns the raw string under a { raw } wrapper when not valid JSON', () => {
    expect(parseAuditPayload('not-json')).toEqual({ raw: 'not-json' })
  })
})

describe('diffJson', () => {
  it('reports added keys', () => {
    const result = diffJson({ a: 1 }, { a: 1, b: 2 })
    expect(result).toContainEqual({ key: 'b', kind: 'added', oldValue: null, newValue: 2 })
  })

  it('reports removed keys', () => {
    const result = diffJson({ a: 1, b: 2 }, { a: 1 })
    expect(result).toContainEqual({ key: 'b', kind: 'removed', oldValue: 2, newValue: null })
  })

  it('reports changed values', () => {
    const result = diffJson({ a: 1, b: 2 }, { a: 1, b: 3 })
    expect(result).toContainEqual({ key: 'b', kind: 'changed', oldValue: 2, newValue: 3 })
  })

  it('omits unchanged keys', () => {
    const result = diffJson({ a: 1 }, { a: 1 })
    expect(result).toHaveLength(0)
  })

  it('handles missing sides gracefully (insert / delete)', () => {
    expect(diffJson(null, { a: 1 })).toContainEqual({
      key: 'a',
      kind: 'added',
      oldValue: null,
      newValue: 1,
    })
    expect(diffJson({ a: 1 }, null)).toContainEqual({
      key: 'a',
      kind: 'removed',
      oldValue: 1,
      newValue: null,
    })
  })

  it('returns an empty diff when both sides are null', () => {
    expect(diffJson(null, null)).toEqual([])
  })
})
