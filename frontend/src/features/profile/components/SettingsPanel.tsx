'use client'

import { useEffect, useState } from 'react'
import {
  useProfileSettings,
  useUpdateProfileSettings,
} from '@/features/profile/hooks/useProfile'
import type { Language } from '@/features/profile/types/profile.types'

export function SettingsPanel() {
  const settings = useProfileSettings()
  const update = useUpdateProfileSettings()

  const [notificationEmail, setNotificationEmail] = useState(true)
  const [language, setLanguage] = useState<Language>('EN')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (settings.data) {
      setNotificationEmail(settings.data.notificationEmail)
      setLanguage(settings.data.language)
    }
  }, [settings.data])

  async function persist(payload: { notificationEmail: boolean; language: Language }) {
    setSaved(false)
    await update.mutateAsync(payload)
    setSaved(true)
  }

  if (settings.isLoading) {
    return <p className="text-[13px] text-muted">Loading settings…</p>
  }
  if (settings.error) {
    return <p className="text-[13px] text-danger">Could not load settings.</p>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[13.5px] font-medium text-ink">Email notifications</p>
          <p className="text-[12px] text-muted">Receive product and team updates.</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={notificationEmail}
          onClick={() => {
            const next = !notificationEmail
            setNotificationEmail(next)
            void persist({ notificationEmail: next, language })
          }}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${
            notificationEmail ? 'bg-teal' : 'bg-faint'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
              notificationEmail ? 'translate-x-4' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      <div>
        <label htmlFor="language" className="block text-[12px] font-medium text-ink2 mb-1.5">
          Language
        </label>
        <select
          id="language"
          value={language}
          onChange={(e) => {
            const next = e.target.value as Language
            setLanguage(next)
            void persist({ notificationEmail, language: next })
          }}
          className="w-full rounded-btn border border-faint bg-fog px-3 py-2 text-[13.5px] text-ink focus:outline-none focus:border-teal/50 focus:ring-1 focus:ring-teal/20"
        >
          <option value="EN">English</option>
          <option value="VI">Tiếng Việt</option>
        </select>
      </div>

      {saved && !update.isPending && (
        <p className="text-[12px] text-teal">Settings saved.</p>
      )}
    </div>
  )
}