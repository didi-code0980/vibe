'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from '@/features/auth/schemas/password.schema'
import { useChangePassword } from '@/features/auth/hooks/useAuthMutations'

interface Props {
  redirectTo?: string
}

export function ChangePasswordForm({ redirectTo = '/dashboard' }: Props) {
  const router = useRouter()
  const change = useChangePassword()
  const [serverError, setServerError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const { register, handleSubmit, formState, reset } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  async function onSubmit(values: ChangePasswordFormValues) {
    setServerError(null)
    try {
      await change.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })
      setSubmitted(true)
      reset()
      router.push(redirectTo)
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Could not change password')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3.5">
      <div>
        <label className="block text-[12px] font-medium text-ink2 mb-1.5">Current password</label>
        <input
          type="password"
          autoComplete="current-password"
          {...register('currentPassword')}
          disabled={change.isPending}
          className="w-full rounded-btn border border-faint bg-fog px-3 py-2.5 text-[13.5px] text-ink focus:outline-none focus:border-teal/50 focus:ring-1 focus:ring-teal/20 transition-colors disabled:opacity-60"
        />
        {formState.errors.currentPassword && (
          <p className="mt-1.5 text-[12px] text-danger">
            {formState.errors.currentPassword.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-[12px] font-medium text-ink2 mb-1.5">New password</label>
        <input
          type="password"
          autoComplete="new-password"
          {...register('newPassword')}
          disabled={change.isPending}
          className="w-full rounded-btn border border-faint bg-fog px-3 py-2.5 text-[13.5px] text-ink focus:outline-none focus:border-teal/50 focus:ring-1 focus:ring-teal/20 transition-colors disabled:opacity-60"
        />
        {formState.errors.newPassword && (
          <p className="mt-1.5 text-[12px] text-danger">
            {formState.errors.newPassword.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-[12px] font-medium text-ink2 mb-1.5">Confirm new password</label>
        <input
          type="password"
          autoComplete="new-password"
          {...register('confirmPassword')}
          disabled={change.isPending}
          className="w-full rounded-btn border border-faint bg-fog px-3 py-2.5 text-[13.5px] text-ink focus:outline-none focus:border-teal/50 focus:ring-1 focus:ring-teal/20 transition-colors disabled:opacity-60"
        />
        {formState.errors.confirmPassword && (
          <p className="mt-1.5 text-[12px] text-danger">
            {formState.errors.confirmPassword.message}
          </p>
        )}
      </div>

      {serverError && <p className="text-[12.5px] text-danger">{serverError}</p>}
      {submitted && !serverError && (
        <p className="text-[12.5px] text-teal">Password changed successfully.</p>
      )}

      <button
        type="submit"
        disabled={change.isPending}
        className="w-full py-2.5 rounded-btn bg-teal text-white text-[14px] font-medium hover:bg-teal-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {change.isPending ? 'Saving…' : 'Update password'}
      </button>
    </form>
  )
}