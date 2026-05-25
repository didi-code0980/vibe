'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas/login.schema'
import { useLogin } from '@/features/auth/hooks/useAuthMutations'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const login = useLogin()
  const [serverError, setServerError] = useState<string | null>(null)

  const { register, handleSubmit, formState } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(values: LoginFormValues) {
    setServerError(null)
    try {
      const response = await login.mutateAsync(values)
      if (response.requiresPasswordChange || response.mustChangePassword) {
        router.push('/change-password')
        return
      }
      const from = searchParams.get('from') ?? '/dashboard'
      router.push(from)
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Login failed. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-3.5">
        <div>
          <label htmlFor="login-email" className="block text-[12px] font-medium text-ink2 mb-1.5">
            Work email
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            {...register('email')}
            disabled={login.isPending}
            className="w-full rounded-btn border border-faint bg-fog px-3 py-2.5 text-[13.5px] text-ink placeholder:text-muted focus:outline-none focus:border-teal/50 focus:ring-1 focus:ring-teal/20 transition-colors disabled:opacity-60"
          />
          {formState.errors.email && (
            <p className="mt-1.5 text-[12px] text-danger">{formState.errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="login-password" className="block text-[12px] font-medium text-ink2 mb-1.5">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            {...register('password')}
            disabled={login.isPending}
            className="w-full rounded-btn border border-faint bg-fog px-3 py-2.5 text-[13.5px] text-ink placeholder:text-muted focus:outline-none focus:border-teal/50 focus:ring-1 focus:ring-teal/20 transition-colors disabled:opacity-60"
          />
          {formState.errors.password && (
            <p className="mt-1.5 text-[12px] text-danger">
              {formState.errors.password.message}
            </p>
          )}
        </div>
      </div>

      {serverError && <p className="mt-3 text-[12.5px] text-danger">{serverError}</p>}

      <button
        type="submit"
        disabled={login.isPending}
        aria-busy={login.isPending}
        className="w-full mt-5 py-2.5 rounded-btn bg-teal text-white text-[14px] font-medium hover:bg-teal-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
      >
        {login.isPending && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
        <span>{login.isPending ? 'Signing in…' : 'Sign in'}</span>
      </button>

      <p className="mt-4 text-center text-[12px] text-muted">
        <a href="/forgot-password" className="text-teal hover:underline">
          Forgot your password?
        </a>
      </p>
    </form>
  )
}