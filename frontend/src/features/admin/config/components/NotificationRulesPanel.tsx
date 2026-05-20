'use client'

import { useEffect, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  notificationRulesSchema,
  type NotificationRulesFormValues,
} from '@/features/admin/config/schemas/config.schemas'
import {
  useNotificationRules,
  useUpdateNotificationRules,
} from '@/features/admin/config/hooks/useConfig'
import { CRITICAL_TRIGGER_EVENTS, TRIGGER_EVENTS } from '@/features/admin/shared/types'

export function NotificationRulesPanel() {
  const rules = useNotificationRules()
  const update = useUpdateNotificationRules()
  const [savedAt, setSavedAt] = useState<number | null>(null)

  const { register, handleSubmit, control, reset } = useForm<NotificationRulesFormValues>({
    resolver: zodResolver(notificationRulesSchema),
    defaultValues: {
      rules: TRIGGER_EVENTS.map((event) => ({
        triggerEvent: event,
        enabled: true,
        reminderIntervalDays: null,
      })),
    },
  })
  const { fields } = useFieldArray({ control, name: 'rules' })

  useEffect(() => {
    if (rules.data) {
      const byEvent = new Map(rules.data.rules.map((r) => [r.triggerEvent, r]))
      reset({
        rules: TRIGGER_EVENTS.map((event) => {
          const r = byEvent.get(event)
          return {
            triggerEvent: event,
            enabled: r?.enabled ?? true,
            reminderIntervalDays: r?.reminderIntervalDays ?? null,
          }
        }),
      })
    }
  }, [rules.data, reset])

  if (rules.isLoading) return <p className="text-muted">Loading notification rules…</p>
  if (rules.error) return <p className="text-danger">Could not load notification rules.</p>

  async function onSubmit(values: NotificationRulesFormValues) {
    await update.mutateAsync({
      rules: values.rules.map((r) => ({
        triggerEvent: r.triggerEvent,
        enabled: r.enabled,
        reminderIntervalDays: r.reminderIntervalDays ?? null,
      })),
    })
    setSavedAt(Date.now())
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
      <h3 className="text-[15px] font-semibold text-ink">Notification Rules</h3>
      <p className="text-[12px] text-muted">
        Critical events (account creation, password reset, document assignment) always send
        regardless of the toggle.
      </p>

      <ul className="space-y-2">
        {fields.map((field, index) => {
          const isCritical = CRITICAL_TRIGGER_EVENTS.has(field.triggerEvent)
          return (
            <li key={field.id} className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-[13px] font-medium text-ink">{field.triggerEvent}</p>
                {isCritical && (
                  <p className="text-[11px] text-muted">Critical — always sent</p>
                )}
              </div>
              <label className="flex items-center gap-1.5 text-[12px] text-ink2">
                <input
                  type="checkbox"
                  disabled={isCritical}
                  {...register(`rules.${index}.enabled`)}
                />
                Enabled
              </label>
              <input
                type="number"
                min={1}
                placeholder="Remind every N days"
                {...register(`rules.${index}.reminderIntervalDays`, {
                  setValueAs: (v) => (v === '' || v == null ? null : Number(v)),
                })}
                className="w-44 rounded-btn border border-faint bg-fog px-3 py-2 text-[12.5px]"
              />
            </li>
          )
        })}
      </ul>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={update.isPending}
          className="px-3 py-1.5 rounded-btn bg-teal text-white text-[13px] disabled:opacity-60"
        >
          {update.isPending ? 'Saving…' : 'Save rules'}
        </button>
        {savedAt && !update.isPending && <span className="text-[12px] text-teal">Saved.</span>}
      </div>
    </form>
  )
}
