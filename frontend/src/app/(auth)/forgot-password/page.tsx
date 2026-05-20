import Link from 'next/link'
import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm'

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-[400px]">
        <h2 className="text-[24px] font-semibold text-ink mb-1.5">Forgot your password?</h2>
        <p className="text-[13.5px] text-muted mb-7">
          Enter your work email and we&apos;ll send you a reset link.
        </p>
        <ForgotPasswordForm />
        <p className="mt-6 text-[12.5px] text-muted">
          Remembered it?{' '}
          <Link href="/login" className="text-teal hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}