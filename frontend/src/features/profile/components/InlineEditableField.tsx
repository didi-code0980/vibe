'use client'

import { useEffect, useRef, useState } from 'react'
import { Pencil, Check, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  label: string
  value: string
  /** Optional placeholder shown when value is empty. */
  placeholder?: string
  /** Sync validator. Return null/undefined when valid, or an error string. */
  validate?: (next: string) => string | null | undefined
  /** Persist the new value. Throw to surface a server error. */
  onSave: (next: string) => Promise<void> | void
  /** Input type. Defaults to text. */
  type?: 'text' | 'tel' | 'email'
  /** Optional autocomplete value. */
  autoComplete?: string
  /** Optional max length. */
  maxLength?: number
}

export function InlineEditableField({
  label,
  value,
  placeholder = '—',
  validate,
  onSave,
  type = 'text',
  autoComplete,
  maxLength,
}: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!editing) setDraft(value)
  }, [value, editing])

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  function startEdit() {
    setDraft(value)
    setError(null)
    setEditing(true)
  }

  function cancel() {
    setEditing(false)
    setDraft(value)
    setError(null)
  }

  async function save() {
    const next = draft.trim()
    if (next === value.trim()) {
      setEditing(false)
      return
    }
    const v = validate?.(next)
    if (v) {
      setError(v)
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onSave(next)
      setEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save')
    } finally {
      setSaving(false)
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      void save()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      cancel()
    }
  }

  const inputId = `inline-${label.replace(/\s+/g, '-').toLowerCase()}`

  return (
    <div>
      <label
        htmlFor={inputId}
        className="block text-[11px] font-medium text-muted uppercase tracking-wide mb-0.5"
      >
        {label}
      </label>

      {editing ? (
        <div className="flex items-start gap-1.5">
          <div className="flex-1 min-w-0">
            <input
              ref={inputRef}
              id={inputId}
              type={type}
              autoComplete={autoComplete}
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value)
                if (error) setError(null)
              }}
              onKeyDown={onKeyDown}
              disabled={saving}
              maxLength={maxLength}
              aria-invalid={!!error}
              className={cn(
                'w-full rounded-btn border bg-white px-2.5 py-1.5 text-[13px] text-ink focus:outline-none focus:ring-1 transition-colors disabled:opacity-60',
                error
                  ? 'border-danger focus:border-danger focus:ring-danger/30'
                  : 'border-teal/50 focus:border-teal focus:ring-teal/20',
              )}
            />
            {error && (
              <p role="alert" className="mt-1 text-[11.5px] text-danger">
                {error}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            aria-label={`Save ${label}`}
            className="shrink-0 mt-[1px] inline-flex items-center justify-center w-7 h-7 rounded-btn bg-teal text-white hover:bg-teal-dark disabled:opacity-60 transition-colors"
          >
            {saving ? (
              <Loader2 size={13} className="animate-spin" aria-hidden="true" />
            ) : (
              <Check size={13} aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            onClick={cancel}
            disabled={saving}
            aria-label={`Cancel editing ${label}`}
            className="shrink-0 mt-[1px] inline-flex items-center justify-center w-7 h-7 rounded-btn border border-faint text-ink2 hover:bg-fog disabled:opacity-60 transition-colors"
          >
            <X size={13} aria-hidden="true" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={startEdit}
          aria-label={`Edit ${label}`}
          className="group w-full flex items-center gap-1.5 text-left bg-white rounded-btn px-2 py-1.5 border border-faint hover:border-teal/50 hover:bg-fog transition-colors"
        >
          <span
            className={cn(
              'flex-1 min-w-0 truncate text-[13px]',
              value ? 'text-ink2' : 'text-muted italic',
            )}
            title={value || undefined}
          >
            {value || placeholder}
          </span>
          <Pencil
            size={12}
            className="shrink-0 text-muted opacity-60 group-hover:opacity-100 group-hover:text-teal transition-all"
            aria-hidden="true"
          />
        </button>
      )}
    </div>
  )
}
