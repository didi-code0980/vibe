'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import {
  ADMIN_USER_ROLES,
  adminUserCreateSchema,
  type AdminUserCreateForm as FormValues,
} from '@/features/admin/users/schemas/admin-user.schema'
import { useCreateAdminUser } from '@/features/admin/users/hooks/useAdminUsers'

export function AdminUserCreateForm() {
  const router = useRouter()
  const create = useCreateAdminUser()
  const [feedback, setFeedback] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(adminUserCreateSchema),
    defaultValues: { role: 'STAFF' },
  })

  const role = watch('role')

  async function onSubmit(values: FormValues) {
    setFeedback(null)
    try {
      await create.mutateAsync(values)
      setFeedback('User created. Credentials sent to user\'s email.')
      router.push('/admin/users')
    } catch (e) {
      const err = e as Error
      setFeedback(err.message || 'Create failed')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg" data-testid="admin-user-create-form">
      <div>
        <label className="block text-[12px] text-muted mb-1">Full name</label>
        <input
          {...register('fullName')}
          className="w-full border border-faint rounded-btn px-2 py-1 text-[13px]"
          data-testid="admin-user-full-name"
        />
        {errors.fullName && (
          <p className="text-[12px] text-danger mt-1">{errors.fullName.message}</p>
        )}
      </div>
      <div>
        <label className="block text-[12px] text-muted mb-1">Email</label>
        <input
          {...register('email')}
          className="w-full border border-faint rounded-btn px-2 py-1 text-[13px]"
          data-testid="admin-user-email"
        />
        {errors.email && (
          <p className="text-[12px] text-danger mt-1">{errors.email.message}</p>
        )}
      </div>
      <div>
        <label className="block text-[12px] text-muted mb-1">Role</label>
        <select
          {...register('role')}
          className="w-full border border-faint rounded-btn px-2 py-1 text-[13px]"
          data-testid="admin-user-role"
        >
          {ADMIN_USER_ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>
      {role !== 'ADMIN' && (
        <div>
          <label className="block text-[12px] text-muted mb-1">Position IDs (comma-separated)</label>
          <input
            placeholder="e.g. 1,2"
            data-testid="admin-user-position-ids"
            className="w-full border border-faint rounded-btn px-2 py-1 text-[13px]"
            onChange={(e) => {
              const v = e.target.value
                .split(',')
                .map((s) => Number(s.trim()))
                .filter((n) => Number.isFinite(n) && n > 0)
              ;(register('positionIds') as unknown as { onChange: (e: { target: { value: number[] } }) => void })
                .onChange({ target: { value: v } })
            }}
          />
          {errors.positionIds && (
            <p className="text-[12px] text-danger mt-1">{errors.positionIds.message as string}</p>
          )}
        </div>
      )}
      {feedback && <p className="text-[13px]" data-testid="admin-user-create-feedback">{feedback}</p>}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting || create.isPending}
          className="px-3 py-1.5 rounded-btn bg-teal text-white text-[13px] hover:bg-teal-dark disabled:opacity-50"
        >
          Create user
        </button>
      </div>
    </form>
  )
}
