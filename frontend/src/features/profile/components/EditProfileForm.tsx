'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  updateProfileSchema,
  type UpdateProfileFormValues,
} from '@/features/profile/schemas/update-profile.schema'
import { useUpdateProfile } from '@/features/profile/hooks/useProfile'
import type { ProfileResponse } from '@/features/profile/types/profile.types'

interface Props {
  profile: ProfileResponse
  onDone?: () => void
}

export function EditProfileForm({ profile, onDone }: Props) {
  const update = useUpdateProfile()
  const [serverError, setServerError] = useState<string | null>(null)

  const { register, handleSubmit, formState } = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      fullName: profile.fullName ?? '',
      phone: profile.phone ?? '',
    },
  })

  async function onSubmit(values: UpdateProfileFormValues) {
    setServerError(null)
    try {
      await update.mutateAsync({
        fullName: values.fullName,
        phone: values.phone?.trim() ? values.phone.trim() : null,
      })
      onDone?.()
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Could not update profile')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3.5">
      <div>
        <label className="block text-[12px] font-medium text-ink2 mb-1.5">Full name</label>
        <input
          type="text"
          {...register('fullName')}
          disabled={update.isPending}
          className="w-full rounded-btn border border-faint bg-fog px-3 py-2.5 text-[13.5px] text-ink focus:outline-none focus:border-teal/50 focus:ring-1 focus:ring-teal/20 transition-colors disabled:opacity-60"
        />
        {formState.errors.fullName && (
          <p className="mt-1.5 text-[12px] text-danger">{formState.errors.fullName.message}</p>
        )}
      </div>

      <div>
        <label className="block text-[12px] font-medium text-ink2 mb-1.5">Phone</label>
        <input
          type="tel"
          {...register('phone')}
          disabled={update.isPending}
          className="w-full rounded-btn border border-faint bg-fog px-3 py-2.5 text-[13.5px] text-ink focus:outline-none focus:border-teal/50 focus:ring-1 focus:ring-teal/20 transition-colors disabled:opacity-60"
        />
        {formState.errors.phone && (
          <p className="mt-1.5 text-[12px] text-danger">{formState.errors.phone.message}</p>
        )}
      </div>

      {serverError && <p className="text-[12.5px] text-danger">{serverError}</p>}

      <button
        type="submit"
        disabled={update.isPending}
        className="w-full py-2.5 rounded-btn bg-teal text-white text-[14px] font-medium hover:bg-teal-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {update.isPending ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  )
}