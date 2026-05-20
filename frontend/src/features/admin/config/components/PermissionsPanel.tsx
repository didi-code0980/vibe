'use client'

import { useMemo, useState } from 'react'
import {
  usePermissionMatrix,
  useUpdatePermissions,
} from '@/features/admin/config/hooks/useConfig'
import {
  ADMIN_ROLES,
  FEATURE_KEYS,
  type AdminRole,
  type FeatureKey,
} from '@/features/admin/shared/types'

type FlagsMap = Record<string, boolean>

function buildKey(role: AdminRole, feature: FeatureKey): string {
  return `${role}::${feature}`
}

export function PermissionsPanel() {
  const matrix = usePermissionMatrix()
  const update = useUpdatePermissions()
  const [local, setLocal] = useState<FlagsMap>({})
  const [savedAt, setSavedAt] = useState<number | null>(null)

  const initial = useMemo<FlagsMap>(() => {
    if (!matrix.data) return {}
    const map: FlagsMap = {}
    for (const flag of matrix.data.flags) {
      map[buildKey(flag.role, flag.featureKey)] = flag.enabled
    }
    return map
  }, [matrix.data])

  const flagState = { ...initial, ...local }

  function toggle(role: AdminRole, feature: FeatureKey) {
    const key = buildKey(role, feature)
    setLocal((prev) => ({ ...prev, [key]: !flagState[key] }))
    setSavedAt(null)
  }

  async function save() {
    const flags = ADMIN_ROLES.flatMap((role) =>
      FEATURE_KEYS.map((feature) => ({
        role,
        featureKey: feature,
        enabled: Boolean(flagState[buildKey(role, feature)]),
      })),
    )
    await update.mutateAsync({ flags })
    setLocal({})
    setSavedAt(Date.now())
  }

  if (matrix.isLoading) return <p className="text-muted">Loading permission matrix…</p>
  if (matrix.error) return <p className="text-danger">Could not load permission matrix.</p>

  return (
    <div className="space-y-3">
      <h3 className="text-[15px] font-semibold text-ink">Permission Matrix</h3>
      <p className="text-[12px] text-muted">
        Toggle role-level access for cross-cutting features. ADMIN is always allowed.
      </p>
      <div className="overflow-x-auto">
        <table className="text-[13px] border-collapse">
          <thead>
            <tr className="text-left text-ink2">
              <th className="px-2 py-1">Feature</th>
              {ADMIN_ROLES.map((r) => (
                <th key={r} className="px-2 py-1 text-center">{r}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FEATURE_KEYS.map((feature) => (
              <tr key={feature} className="border-t border-faint">
                <td className="px-2 py-1 font-medium">{feature}</td>
                {ADMIN_ROLES.map((role) => (
                  <td key={role} className="px-2 py-1 text-center">
                    <input
                      type="checkbox"
                      aria-label={`${role} ${feature}`}
                      checked={Boolean(flagState[buildKey(role, feature)])}
                      disabled={role === 'ADMIN'}
                      onChange={() => toggle(role, feature)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={update.isPending}
          className="px-3 py-1.5 rounded-btn bg-teal text-white text-[13px] disabled:opacity-60"
        >
          {update.isPending ? 'Saving…' : 'Save matrix'}
        </button>
        {savedAt && !update.isPending && <span className="text-[12px] text-teal">Saved.</span>}
      </div>
    </div>
  )
}
