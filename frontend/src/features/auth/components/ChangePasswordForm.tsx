'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from '@/features/auth/schemas/password.schema'
import { useChangePassword } from '@/features/auth/hooks/useAuthMutations'
import { ChangePasswordError } from '@/features/auth/services/auth.service'
import { PasswordPolicyChecklist } from '@/features/auth/components/PasswordPolicyChecklist'
import { toast } from '@/components/feedback/Toaster'

type Mode = 'forced' | 'settings'

interface Props {
  /**
   * `forced` (default): user is on the post-login change-password screen — on
   * success, redirect to the role-based dashboard.
   *
   * `settings`: rendered inside Settings → Security — on success, stay on the
   * page, show a toast, and clear the form.
   */
  mode?: Mode
  redirectTo?: string
}

export function ChangePasswordForm({ mode = 'forced', redirectTo = '/dashboard' }: Props) {
  const router = useRouter()
  const change = useChangePassword()
  const [formError, setFormError] = useState<string | null>(null)

  const { register, handleSubmit, formState, reset, watch, setError } =
    useForm<ChangePasswordFormValues>({
      resolver: zodResolver(changePasswordSchema),
      defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
      mode: 'onChange',
    })

  const newPasswordValue = watch('newPassword')
  const currentPasswordValue = watch('currentPassword')

  async function onSubmit(values: ChangePasswordFormValues) {
    setFormError(null)
    try {
      await change.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })
      toast.success('Password updated.')
      if (mode === 'forced') {
        reset()
        router.push(redirectTo)
      } else {
        reset()
      }
    } catch (err) {
      if (err instanceof ChangePasswordError && err.code === 'WRONG_CURRENT_PASSWORD') {
        setError(
          'currentPassword',
          { type: 'server', message: 'Current password is incorrect.' },
          { shouldFocus: true },
        )
        return
      }
      setFormError(err instanceof Error ? err.message : 'Could not change password')
    }
  }

  const submitLabel = mode === 'settings' ? 'Save password' : 'Update password'

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3.5">
      <div>
        <label htmlFor="cp-current" className="block text-[12px] font-medium text-ink2 mb-1.5">
          Current password
        </label>
        <input
          id="cp-current"
          type="password"
          autoComplete="current-password"
          {...register('currentPassword')}
          disabled={change.isPending}
          aria-invalid={!!formState.errors.currentPassword}
          className="w-full rounded-btn border border-faint bg-fog px-3 py-2.5 text-[13.5px] text-ink focus:outline-none focus:border-teal/50 focus:ring-1 focus:ring-teal/20 transition-colors disabled:opacity-60"
        />
        {formState.errors.currentPassword && (
          <p className="mt-1.5 text-[12px] text-danger">
            {formState.errors.currentPassword.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="cp-new" className="block text-[12px] font-medium text-ink2 mb-1.5">
          New password
        </label>
        <input
          id="cp-new"
          type="password"
          autoComplete="new-password"
          {...register('newPassword')}
          disabled={change.isPending}
          aria-invalid={!!formState.errors.newPassword}
          className="w-full rounded-btn border border-faint bg-fog px-3 py-2.5 text-[13.5px] text-ink focus:outline-none focus:border-teal/50 focus:ring-1 focus:ring-teal/20 transition-colors disabled:opacity-60"
        />
        {formState.errors.newPassword && (
          <p className="mt-1.5 text-[12px] text-danger">
            {formState.errors.newPassword.message}
          </p>
        )}
        <PasswordPolicyChecklist
          value={newPasswordValue ?? ''}
          currentPassword={currentPasswordValue ?? ''}
        />
      </div>

      <div>
        <label htmlFor="cp-confirm" className="block text-[12px] font-medium text-ink2 mb-1.5">
          Confirm new password
        </label>
        <input
          id="cp-confirm"
          type="password"
          autoComplete="new-password"
          {...register('confirmPassword')}
          disabled={change.isPending}
          aria-invalid={!!formState.errors.confirmPassword}
          className="w-full rounded-btn border border-faint bg-fog px-3 py-2.5 text-[13.5px] text-ink focus:outline-none focus:border-teal/50 focus:ring-1 focus:ring-teal/20 transition-colors disabled:opacity-60"
        />
        {formState.errors.confirmPassword && (
          <p className="mt-1.5 text-[12px] text-danger">
            {formState.errors.confirmPassword.message}
          </p>
        )}
      </div>

      {formError && (
        <p role="alert" className="text-[12.5px] text-danger">
          {formError}
        </p>
      )}

      <button
        type="submit"
        disabled={change.isPending}
        aria-busy={change.isPending}
        className="w-full py-2.5 rounded-btn bg-teal text-white text-[14px] font-medium hover:bg-teal-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
      >
        {change.isPending && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
        <span>{change.isPending ? 'Saving…' : submitLabel}</span>
      </button>
    </form>
  )
}
