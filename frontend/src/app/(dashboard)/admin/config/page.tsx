'use client'

import { useState } from 'react'
import { RolesPanel } from '@/features/admin/config/components/RolesPanel'
import { PermissionsPanel } from '@/features/admin/config/components/PermissionsPanel'
import { RatingScalePanel } from '@/features/admin/config/components/RatingScalePanel'
import { SmtpPanel } from '@/features/admin/config/components/SmtpPanel'
import { NotificationRulesPanel } from '@/features/admin/config/components/NotificationRulesPanel'

const TABS = [
  { key: 'roles', label: 'Roles' },
  { key: 'permissions', label: 'Permission Matrix' },
  { key: 'rating', label: 'Rating Scale' },
  { key: 'smtp', label: 'SMTP' },
  { key: 'notifications', label: 'Notification Rules' },
] as const

type TabKey = (typeof TABS)[number]['key']

export default function AdminConfigPage() {
  const [tab, setTab] = useState<TabKey>('roles')

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-[18px] font-semibold text-ink">App Configuration</h1>

      <div role="tablist" className="flex gap-1 border-b border-faint">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            type="button"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-2 text-[13px] border-b-2 -mb-px ${
              tab === t.key
                ? 'border-teal text-teal'
                : 'border-transparent text-ink2 hover:text-ink'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="pt-2">
        {tab === 'roles' && <RolesPanel />}
        {tab === 'permissions' && <PermissionsPanel />}
        {tab === 'rating' && <RatingScalePanel />}
        {tab === 'smtp' && <SmtpPanel />}
        {tab === 'notifications' && <NotificationRulesPanel />}
      </div>
    </div>
  )
}
