import { ChangePasswordForm } from '@/features/auth/components/ChangePasswordForm'

export default function ChangePasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-[400px]">
        <h2 className="text-[24px] font-semibold text-ink mb-1.5">Update your password</h2>
        <p className="text-[13.5px] text-muted mb-7">
          You must set a new password before continuing.
        </p>
        <ChangePasswordForm />
      </div>
    </div>
  )
}