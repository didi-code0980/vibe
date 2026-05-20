'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '@/features/auth/schemas/forgot-password.schema'
import { useForgotPassword } from '@/features/auth/hooks/useAuthMutations'

export function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false)
  const forgot = useForgotPassword()
  const { register, handleSubmit, formState } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  async function onSubmit(values: ForgotPasswordFormValues) {
    await forgot.mutateAsync(values).catch(() => null)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="rounded-card border border-faint bg-fog p-5 text-[13.5px] text-ink2">
        If an account exists for that email, a password reset link has been sent. It expires in 1
        hour.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3.5">
      <div>
        <label htmlFor="email" className="block text-[12px] font-medium text-ink2 mb-1.5">
          Work email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          {...register('email')}
          disabled={forgot.isPending}
          className="w-full rounded-btn border border-faint bg-fog px-3 py-2.5 text-[13.5px] text-ink placeholder:text-muted focus:outline-none focus:border-teal/50 focus:ring-1 focus:ring-teal/20 transition-colors disabled:opacity-60"
        />
        {formState.errors.email && (
          <p className="mt-1.5 text-[12px] text-danger">{formState.errors.email.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={forgot.isPending}
        className="w-full py-2.5 rounded-btn bg-teal text-white text-[14px] font-medium hover:bg-teal-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {forgot.isPending ? 'Sending…' : 'Send reset link'}
      </button>
    </form>
  )
}