import { Suspense } from 'react'
import { ResetPasswordForm } from '@/features/auth/components/ResetPasswordForm'

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-[400px]">
        <h2 className="text-[24px] font-semibold text-ink mb-1.5">Choose a new password</h2>
        <p className="text-[13.5px] text-muted mb-7">
          Must be at least 8 characters with an uppercase letter and a number.
        </p>
        <Suspense>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}