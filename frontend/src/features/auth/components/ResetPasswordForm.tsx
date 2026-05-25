'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from '@/features/auth/schemas/password.schema'
import { useResetPassword } from '@/features/auth/hooks/useAuthMutations'
import { PasswordPolicyChecklist } from '@/features/auth/components/PasswordPolicyChecklist'

export function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tokenFromQuery = searchParams.get('token') ?? ''
  const [serverError, setServerError] = useState<string | null>(null)
  const reset = useResetPassword()

  const { register, handleSubmit, formState, watch } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token: tokenFromQuery, newPassword: '', confirmPassword: '' },
    mode: 'onChange',
  })

  const newPasswordValue = watch('newPassword')

  async function onSubmit(values: ResetPasswordFormValues) {
    setServerError(null)
    try {
      await reset.mutateAsync({ token: values.token, newPassword: values.newPassword })
      router.push('/login?reset=success')
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Could not reset password')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3.5">
      <input type="hidden" {...register('token')} />

      <div>
        <label className="block text-[12px] font-medium text-ink2 mb-1.5">New password</label>
        <input
          type="password"
          autoComplete="new-password"
          {...register('newPassword')}
          disabled={reset.isPending}
          className="w-full rounded-btn border border-faint bg-fog px-3 py-2.5 text-[13.5px] text-ink placeholder:text-muted focus:outline-none focus:border-teal/50 focus:ring-1 focus:ring-teal/20 transition-colors disabled:opacity-60"
        />
        {formState.errors.newPassword && (
          <p className="mt-1.5 text-[12px] text-danger">
            {formState.errors.newPassword.message}
          </p>
        )}
        <PasswordPolicyChecklist value={newPasswordValue ?? ''} />
      </div>

      <div>
        <label className="block text-[12px] font-medium text-ink2 mb-1.5">Confirm password</label>
        <input
          type="password"
          autoComplete="new-password"
          {...register('confirmPassword')}
          disabled={reset.isPending}
          className="w-full rounded-btn border border-faint bg-fog px-3 py-2.5 text-[13.5px] text-ink placeholder:text-muted focus:outline-none focus:border-teal/50 focus:ring-1 focus:ring-teal/20 transition-colors disabled:opacity-60"
        />
        {formState.errors.confirmPassword && (
          <p className="mt-1.5 text-[12px] text-danger">
            {formState.errors.confirmPassword.message}
          </p>
        )}
      </div>

      {serverError && <p className="text-[12.5px] text-danger">{serverError}</p>}

      <button
        type="submit"
        disabled={reset.isPending || !tokenFromQuery}
        className="w-full py-2.5 rounded-btn bg-teal text-white text-[14px] font-medium hover:bg-teal-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {reset.isPending ? 'Saving…' : 'Reset password'}
      </button>
      {!tokenFromQuery && (
        <p className="text-[12px] text-danger">
          Missing reset token. Please use the link from your email.
        </p>
      )}
    </form>
  )
}