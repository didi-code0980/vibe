'use client'

import { useEffect, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  positionSchema,
  type PositionFormValues,
} from '@/features/admin/positions/schemas/position.schema'
import {
  useCreatePosition,
  useUpdatePosition,
} from '@/features/admin/positions/hooks/usePositions'
import { useSkillsLookup } from '@/features/admin/positions/hooks/useSkillsLookup'
import type { PositionDetail } from '@/features/admin/positions/types/position.types'

interface Props {
  open: boolean
  onClose: () => void
  editing: PositionDetail | null
}

export function PositionFormDialog({ open, onClose, editing }: Props) {
  const create = useCreatePosition()
  const update = useUpdatePosition()
  const skills = useSkillsLookup()
  const [serverError, setServerError] = useState<string | null>(null)

  const { register, handleSubmit, control, formState, reset } = useForm<PositionFormValues>({
    resolver: zodResolver(positionSchema),
    defaultValues: { name: '', description: '', requiredSkills: [] },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'requiredSkills' })

  useEffect(() => {
    if (open) {
      reset(
        editing
          ? {
              name: editing.name,
              description: editing.description ?? '',
              requiredSkills: editing.requiredSkills.map((s) => ({
                skillId: s.skillId,
                minLevel: s.minLevel,
              })),
            }
          : { name: '', description: '', requiredSkills: [] },
      )
      setServerError(null)
    }
  }, [open, editing, reset])

  if (!open) return null

  async function onSubmit(values: PositionFormValues) {
    setServerError(null)
    try {
      if (editing) {
        await update.mutateAsync({
          id: editing.positionId,
          payload: {
            name: values.name,
            description: values.description ?? null,
            requiredSkills: values.requiredSkills,
          },
        })
      } else {
        await create.mutateAsync({
          name: values.name,
          description: values.description ?? null,
          requiredSkills: values.requiredSkills,
        })
      }
      onClose()
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Save failed')
    }
  }

  const saving = create.isPending || update.isPending
  const skillOptions = skills.data ?? []

  return (
    <div
      role="dialog"
      aria-label="Position form"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    >
      <div className="bg-white rounded-card p-5 w-full max-w-[560px] space-y-3 max-h-[90vh] overflow-y-auto">
        <h3 className="text-[16px] font-semibold text-ink">
          {editing ? 'Edit Position' : 'New Position'}
        </h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
          <div>
            <label className="block text-[12px] font-medium text-ink2 mb-1.5">Name</label>
            <input
              type="text"
              {...register('name')}
              className="w-full rounded-btn border border-faint bg-fog px-3 py-2 text-[13px]"
            />
            {formState.errors.name && (
              <p className="text-[12px] text-danger mt-1">{formState.errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-[12px] font-medium text-ink2 mb-1.5">Description</label>
            <textarea
              rows={3}
              {...register('description')}
              className="w-full rounded-btn border border-faint bg-fog px-3 py-2 text-[13px]"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-medium text-ink2">Required skills</p>
              <button
                type="button"
                onClick={() => append({ skillId: 0, minLevel: 1 })}
                className="text-teal text-[12px] hover:underline disabled:text-muted disabled:no-underline"
                disabled={skills.isLoading}
              >
                + Add skill
              </button>
            </div>

            {skills.isLoading && (
              <p className="text-[11.5px] text-muted">Loading skills…</p>
            )}
            {skills.error && (
              <p className="text-[11.5px] text-danger">Could not load skills list.</p>
            )}

            {fields.map((field, index) => {
              const fieldError = formState.errors.requiredSkills?.[index]
              return (
                <div key={field.id} className="space-y-1">
                  <div className="flex gap-2 items-start">
                    <select
                      aria-label={`Skill #${index + 1}`}
                      {...register(`requiredSkills.${index}.skillId`, { valueAsNumber: true })}
                      className="flex-1 rounded-btn border border-faint bg-fog px-3 py-2 text-[13px]"
                    >
                      <option value={0}>— Select a skill —</option>
                      {skillOptions.map((s) => (
                        <option key={s.skillId} value={s.skillId}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <select
                      aria-label={`Min level #${index + 1}`}
                      {...register(`requiredSkills.${index}.minLevel`, { valueAsNumber: true })}
                      className="w-28 rounded-btn border border-faint bg-fog px-3 py-2 text-[13px]"
                    >
                      {[1, 2, 3, 4, 5].map((lv) => (
                        <option key={lv} value={lv}>
                          Level {lv}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-danger text-[12px] hover:underline px-2 py-2"
                      aria-label={`Remove skill #${index + 1}`}
                    >
                      ✕
                    </button>
                  </div>
                  {fieldError?.skillId && (
                    <p className="text-[11.5px] text-danger pl-1">
                      {fieldError.skillId.message}
                    </p>
                  )}
                </div>
              )
            })}
          </div>

          {serverError && <p className="text-[12px] text-danger">{serverError}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-btn border border-faint text-[13px] text-ink2"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-btn bg-teal text-white text-[13px] disabled:opacity-60"
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
