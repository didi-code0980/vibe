'use client'

import { useEffect, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ratingScaleSchema,
  type RatingScaleFormValues,
} from '@/features/admin/config/schemas/config.schemas'
import { useRatingScale, useUpdateRatingScale } from '@/features/admin/config/hooks/useConfig'

const EMPTY_ITEMS: RatingScaleFormValues['items'] = [1, 2, 3, 4, 5].map((level) => ({
  level,
  label: '',
  description: '',
}))

export function RatingScalePanel() {
  const ratingScale = useRatingScale()
  const update = useUpdateRatingScale()
  const [savedAt, setSavedAt] = useState<number | null>(null)

  const { register, handleSubmit, control, reset, formState } = useForm<RatingScaleFormValues>({
    resolver: zodResolver(ratingScaleSchema),
    defaultValues: { items: EMPTY_ITEMS },
  })
  const { fields } = useFieldArray({ control, name: 'items' })

  useEffect(() => {
    if (ratingScale.data) {
      reset({
        items: ratingScale.data.items.map((i) => ({
          level: i.level,
          label: i.label,
          description: i.description ?? '',
        })),
      })
    }
  }, [ratingScale.data, reset])

  if (ratingScale.isLoading) return <p className="text-muted">Loading rating scale…</p>
  if (ratingScale.error) return <p className="text-danger">Could not load rating scale.</p>

  async function onSubmit(values: RatingScaleFormValues) {
    await update.mutateAsync({
      items: values.items.map((i) => ({
        level: i.level,
        label: i.label,
        description: i.description ?? null,
      })),
    })
    setSavedAt(Date.now())
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
      <h3 className="text-[15px] font-semibold text-ink">Rating Scale (Levels 1–5)</h3>
      <ul className="space-y-2">
        {fields.map((field, index) => (
          <li key={field.id} className="flex gap-2 items-start">
            <div className="w-10 text-center font-semibold text-ink mt-2">
              {field.level}
            </div>
            <div className="flex-1">
              <input
                {...register(`items.${index}.label`)}
                placeholder="Label"
                className="w-full rounded-btn border border-faint bg-fog px-3 py-2 text-[13px]"
              />
              {formState.errors.items?.[index]?.label && (
                <p className="text-[11px] text-danger mt-0.5">
                  {formState.errors.items[index]?.label?.message}
                </p>
              )}
            </div>
            <div className="flex-[2]">
              <input
                {...register(`items.${index}.description`)}
                placeholder="Description (optional)"
                className="w-full rounded-btn border border-faint bg-fog px-3 py-2 text-[13px]"
              />
            </div>
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={update.isPending}
          className="px-3 py-1.5 rounded-btn bg-teal text-white text-[13px] disabled:opacity-60"
        >
          {update.isPending ? 'Saving…' : 'Save rating scale'}
        </button>
        {savedAt && !update.isPending && (
          <span className="text-[12px] text-teal">Saved.</span>
        )}
      </div>
    </form>
  )
}
