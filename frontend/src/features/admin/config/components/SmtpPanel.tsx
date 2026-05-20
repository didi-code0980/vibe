'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { smtpSchema, type SmtpFormValues } from '@/features/admin/config/schemas/config.schemas'
import {
  useSmtpConfig,
  useUpdateSmtp,
  useSendSmtpTest,
} from '@/features/admin/config/hooks/useConfig'

export function SmtpPanel() {
  const smtp = useSmtpConfig()
  const update = useUpdateSmtp()
  const test = useSendSmtpTest()
  const [serverError, setServerError] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [testResult, setTestResult] = useState<string | null>(null)

  const { register, handleSubmit, reset, formState } = useForm<SmtpFormValues>({
    resolver: zodResolver(smtpSchema),
    defaultValues: {
      host: '',
      port: 587,
      username: '',
      password: '',
      fromEmail: '',
      fromName: '',
      useTls: true,
    },
  })

  useEffect(() => {
    if (smtp.data) {
      reset({
        host: smtp.data.host,
        port: smtp.data.port,
        username: smtp.data.username ?? '',
        password: '',
        fromEmail: smtp.data.fromEmail,
        fromName: smtp.data.fromName ?? '',
        useTls: smtp.data.useTls,
      })
    }
  }, [smtp.data, reset])

  async function onSubmit(values: SmtpFormValues) {
    setServerError(null)
    try {
      await update.mutateAsync({
        host: values.host,
        port: values.port,
        username: values.username ?? null,
        password: values.password?.trim() ? values.password : null,
        fromEmail: values.fromEmail,
        fromName: values.fromName ?? null,
        useTls: values.useTls,
      })
      setSavedAt(Date.now())
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Save failed')
    }
  }

  async function handleTest() {
    setTestResult(null)
    try {
      await test.mutateAsync()
      setTestResult('Test email sent.')
    } catch (err) {
      setTestResult(err instanceof Error ? err.message : 'Test failed')
    }
  }

  if (smtp.isLoading) return <p className="text-muted">Loading SMTP config…</p>

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 max-w-[640px]" noValidate>
      <h3 className="text-[15px] font-semibold text-ink">SMTP Server</h3>
      {!smtp.data && (
        <p className="text-[12.5px] text-muted">No SMTP config yet — fill in the fields below.</p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[12px] font-medium text-ink2 mb-1.5">Host</label>
          <input
            {...register('host')}
            className="w-full rounded-btn border border-faint bg-fog px-3 py-2 text-[13px]"
          />
          {formState.errors.host && (
            <p className="text-[11px] text-danger mt-0.5">{formState.errors.host.message}</p>
          )}
        </div>
        <div>
          <label className="block text-[12px] font-medium text-ink2 mb-1.5">Port</label>
          <input
            type="number"
            {...register('port', { valueAsNumber: true })}
            className="w-full rounded-btn border border-faint bg-fog px-3 py-2 text-[13px]"
          />
        </div>
        <div>
          <label className="block text-[12px] font-medium text-ink2 mb-1.5">Username</label>
          <input
            {...register('username')}
            className="w-full rounded-btn border border-faint bg-fog px-3 py-2 text-[13px]"
          />
        </div>
        <div>
          <label className="block text-[12px] font-medium text-ink2 mb-1.5">
            Password {smtp.data?.passwordSet && '(leave blank to keep)'}
          </label>
          <input
            type="password"
            {...register('password')}
            className="w-full rounded-btn border border-faint bg-fog px-3 py-2 text-[13px]"
          />
        </div>
        <div>
          <label className="block text-[12px] font-medium text-ink2 mb-1.5">From email</label>
          <input
            type="email"
            {...register('fromEmail')}
            className="w-full rounded-btn border border-faint bg-fog px-3 py-2 text-[13px]"
          />
          {formState.errors.fromEmail && (
            <p className="text-[11px] text-danger mt-0.5">{formState.errors.fromEmail.message}</p>
          )}
        </div>
        <div>
          <label className="block text-[12px] font-medium text-ink2 mb-1.5">From name</label>
          <input
            {...register('fromName')}
            className="w-full rounded-btn border border-faint bg-fog px-3 py-2 text-[13px]"
          />
        </div>
        <label className="flex items-center gap-2 text-[13px] col-span-2">
          <input type="checkbox" {...register('useTls')} />
          Use TLS / STARTTLS
        </label>
      </div>

      {serverError && <p className="text-[12px] text-danger">{serverError}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={update.isPending}
          className="px-3 py-1.5 rounded-btn bg-teal text-white text-[13px] disabled:opacity-60"
        >
          {update.isPending ? 'Saving…' : 'Save SMTP'}
        </button>
        <button
          type="button"
          onClick={handleTest}
          disabled={test.isPending || !smtp.data}
          className="px-3 py-1.5 rounded-btn border border-faint text-[13px] text-ink2 disabled:opacity-60"
        >
          {test.isPending ? 'Sending…' : 'Send test email'}
        </button>
        {savedAt && !update.isPending && <span className="text-[12px] text-teal">Saved.</span>}
        {testResult && <span className="text-[12px] text-ink2">{testResult}</span>}
      </div>
    </form>
  )
}
