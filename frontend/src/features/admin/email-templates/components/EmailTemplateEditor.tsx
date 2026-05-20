'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  emailTemplateSchema,
  type EmailTemplateFormValues,
} from '@/features/admin/email-templates/schemas/email-template.schema'
import {
  useCreateEmailTemplate,
  useUpdateEmailTemplate,
} from '@/features/admin/email-templates/hooks/useEmailTemplates'
import type { EmailTemplate } from '@/features/admin/email-templates/types/email-template.types'
import { TRIGGER_EVENTS, type TriggerEvent } from '@/features/admin/shared/types'

interface Props {
  editing: EmailTemplate | null
  onSaved?: () => void
}

// Default variables exposed per trigger event when the template doesn't declare its own.
const DEFAULT_VARIABLES_BY_EVENT: Record<TriggerEvent, string[]> = {
  ACCOUNT_CREATED: ['user_name', 'temp_password', 'login_url'],
  PASSWORD_RESET: ['user_name', 'reset_link'],
  DOCUMENT_ASSIGNED: ['user_name', 'document_title', 'deadline'],
  LEARNING_REMINDER: ['user_name', 'document_title', 'deadline'],
  GOAL_SUGGESTED: ['user_name', 'manager_name', 'skill_name', 'target_level'],
  ASSESSMENT_REVIEWED: ['user_name', 'manager_name', 'skill_name', 'manager_score'],
}

function parseVariables(json: string | null | undefined, event: TriggerEvent): string[] {
  if (json && json.trim().length > 0) {
    try {
      const parsed = JSON.parse(json)
      if (Array.isArray(parsed) && parsed.every((v) => typeof v === 'string')) return parsed
    } catch {
      // fall through to default
    }
  }
  return DEFAULT_VARIABLES_BY_EVENT[event] ?? []
}

export function EmailTemplateEditor({ editing, onSaved }: Props) {
  const create = useCreateEmailTemplate()
  const update = useUpdateEmailTemplate()
  const [serverError, setServerError] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const bodyRef = useRef<HTMLTextAreaElement | null>(null)

  const { register, handleSubmit, reset, formState, watch, setValue } =
    useForm<EmailTemplateFormValues>({
      resolver: zodResolver(emailTemplateSchema),
      defaultValues: {
        name: '',
        subject: '',
        bodyHtml: '',
        triggerEvent: 'ACCOUNT_CREATED',
        variablesJson: '',
        isActive: true,
      },
    })

  const watchedEvent = watch('triggerEvent') as TriggerEvent
  const watchedVariablesJson = watch('variablesJson')

  useEffect(() => {
    reset(
      editing
        ? {
            name: editing.name,
            subject: editing.subject,
            bodyHtml: editing.bodyHtml,
            triggerEvent: editing.triggerEvent,
            variablesJson: editing.variablesJson ?? '',
            isActive: editing.isActive,
          }
        : {
            name: '',
            subject: '',
            bodyHtml: '',
            triggerEvent: 'ACCOUNT_CREATED',
            variablesJson: '',
            isActive: true,
          },
    )
    setServerError(null)
    setSavedAt(null)
  }, [editing, reset])

  const variables = useMemo(
    () => parseVariables(watchedVariablesJson, watchedEvent),
    [watchedVariablesJson, watchedEvent],
  )

  // Splice {{varName}} at the current caret position of the body textarea.
  function insertVariable(name: string) {
    const token = `{{${name}}}`
    const textarea = bodyRef.current
    if (!textarea) {
      setValue('bodyHtml', `${watch('bodyHtml') ?? ''}${token}`, { shouldDirty: true })
      return
    }
    const start = textarea.selectionStart ?? textarea.value.length
    const end = textarea.selectionEnd ?? textarea.value.length
    const current = textarea.value
    const next = current.slice(0, start) + token + current.slice(end)
    setValue('bodyHtml', next, { shouldDirty: true })
    // Move caret to the end of the inserted token after React re-renders.
    requestAnimationFrame(() => {
      textarea.focus()
      const caret = start + token.length
      textarea.setSelectionRange(caret, caret)
    })
  }

  async function onSubmit(values: EmailTemplateFormValues) {
    setServerError(null)
    try {
      const payload = {
        name: values.name,
        subject: values.subject,
        bodyHtml: values.bodyHtml,
        triggerEvent: values.triggerEvent as TriggerEvent,
        variablesJson: values.variablesJson?.trim() ? values.variablesJson : null,
        isActive: values.isActive,
      }
      if (editing) {
        await update.mutateAsync({ id: editing.id, payload })
      } else {
        await create.mutateAsync(payload)
      }
      setSavedAt(Date.now())
      onSaved?.()
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Save failed')
    }
  }

  const saving = create.isPending || update.isPending
  const isEditing = editing !== null

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
      <h3 className="text-[15px] font-semibold text-ink">
        {isEditing ? `Edit ${editing!.name}` : 'New Email Template'}
      </h3>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[12px] font-medium text-ink2 mb-1.5" htmlFor="tmpl-name">
            Name
          </label>
          <input
            id="tmpl-name"
            {...register('name')}
            className="w-full rounded-btn border border-faint bg-fog px-3 py-2 text-[13px]"
          />
          {formState.errors.name && (
            <p className="text-[11px] text-danger mt-0.5">{formState.errors.name.message}</p>
          )}
        </div>
        <div>
          <label className="block text-[12px] font-medium text-ink2 mb-1.5" htmlFor="tmpl-event">
            Trigger event
          </label>
          {isEditing ? (
            <>
              <input
                id="tmpl-event"
                aria-label="Trigger event"
                type="text"
                value={watchedEvent}
                disabled
                className="w-full rounded-btn border border-faint bg-fog px-3 py-2 text-[13px] text-ink2 cursor-not-allowed"
              />
              <input type="hidden" {...register('triggerEvent')} />
              <p className="text-[11px] text-muted mt-1">
                Trigger events are fixed and cannot be changed.
              </p>
            </>
          ) : (
            <select
              id="tmpl-event"
              aria-label="Trigger event"
              {...register('triggerEvent')}
              className="w-full rounded-btn border border-faint bg-fog px-3 py-2 text-[13px]"
            >
              {TRIGGER_EVENTS.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div>
        <label className="block text-[12px] font-medium text-ink2 mb-1.5" htmlFor="tmpl-subject">
          Subject
        </label>
        <input
          id="tmpl-subject"
          {...register('subject')}
          className="w-full rounded-btn border border-faint bg-fog px-3 py-2 text-[13px]"
        />
        {formState.errors.subject && (
          <p className="text-[11px] text-danger mt-0.5">{formState.errors.subject.message}</p>
        )}
      </div>

      {variables.length > 0 && (
        <div>
          <p className="text-[11.5px] font-medium text-ink2 mb-1.5">Insert variable:</p>
          <div className="flex flex-wrap gap-1.5">
            {variables.map((v) => (
              <button
                key={v}
                type="button"
                aria-label={`Insert ${v}`}
                onClick={() => insertVariable(v)}
                className="px-2 py-1 rounded-chip bg-fog border border-faint text-[11.5px] font-mono text-ink2 hover:bg-teal/10 hover:border-teal/40 transition-colors"
              >
                {`{{${v}}}`}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="block text-[12px] font-medium text-ink2 mb-1.5" htmlFor="tmpl-body">
          Body HTML
        </label>
        <textarea
          id="tmpl-body"
          aria-label="Body HTML"
          rows={10}
          {...register('bodyHtml')}
          ref={(el) => {
            bodyRef.current = el
            register('bodyHtml').ref(el)
          }}
          className="w-full rounded-btn border border-faint bg-fog px-3 py-2 font-mono text-[12.5px]"
        />
        {formState.errors.bodyHtml && (
          <p className="text-[11px] text-danger mt-0.5">{formState.errors.bodyHtml.message}</p>
        )}
      </div>

      <div>
        <label
          className="block text-[12px] font-medium text-ink2 mb-1.5"
          htmlFor="tmpl-variables"
        >
          Variables JSON (optional override of default list)
        </label>
        <input
          id="tmpl-variables"
          {...register('variablesJson')}
          placeholder='e.g. ["user_name", "code"]'
          className="w-full rounded-btn border border-faint bg-fog px-3 py-2 font-mono text-[12.5px]"
        />
      </div>

      <label className="flex items-center gap-2 text-[13px]">
        <input type="checkbox" {...register('isActive')} />
        Active
      </label>

      {serverError && <p className="text-[12px] text-danger">{serverError}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="px-3 py-1.5 rounded-btn bg-teal text-white text-[13px] disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save template'}
        </button>
        {savedAt && !saving && <span className="text-[12px] text-teal">Saved.</span>}
      </div>
    </form>
  )
}
