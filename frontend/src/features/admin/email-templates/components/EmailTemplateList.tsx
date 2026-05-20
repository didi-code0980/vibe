'use client'

import { useState } from 'react'
import { useEmailTemplates } from '@/features/admin/email-templates/hooks/useEmailTemplates'
import { EmailTemplateEditor } from './EmailTemplateEditor'
import type { EmailTemplate } from '@/features/admin/email-templates/types/email-template.types'

export function EmailTemplateList() {
  const list = useEmailTemplates()
  const [editing, setEditing] = useState<EmailTemplate | null>(null)

  if (list.isLoading) return <p className="text-muted">Loading templates…</p>
  if (list.error) return <p className="text-danger">Could not load templates.</p>

  const items = list.data?.items ?? []

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[16px] font-semibold text-ink">Email Templates</h2>
          {/* No "New" button — trigger events are fixed; admin can only edit
              the seeded set (per CFG-06 spec). */}
        </div>

        {items.length === 0 ? (
          <p className="text-[13px] text-muted">No templates yet.</p>
        ) : (
          <ul className="divide-y divide-faint border border-faint rounded-card overflow-hidden">
            {items.map((t) => (
              <li
                key={t.id}
                className={`flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-fog ${
                  editing?.id === t.id ? 'bg-teal/[0.04]' : ''
                }`}
                onClick={() => setEditing(t)}
              >
                <div>
                  <p className="text-[14px] font-medium text-ink">{t.name}</p>
                  <p className="text-[11.5px] text-muted">{t.triggerEvent}</p>
                </div>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-chip ${
                    t.isActive
                      ? 'bg-teal/15 text-teal'
                      : 'bg-faint text-muted'
                  }`}
                >
                  {t.isActive ? 'Active' : 'Inactive'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        {editing ? (
          <EmailTemplateEditor editing={editing} />
        ) : (
          <p className="text-[13px] text-muted">
            Select a template on the left to edit. Trigger events are fixed by the system.
          </p>
        )}
      </div>
    </div>
  )
}
