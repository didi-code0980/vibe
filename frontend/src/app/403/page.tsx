import Link from 'next/link'

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-fog flex items-center justify-center">
      <div className="text-center space-y-4">
        <p className="text-[72px] font-bold text-navy/20 leading-none">403</p>
        <h1 className="text-[22px] font-semibold text-ink">Access Denied</h1>
        <p className="text-[14px] text-muted max-w-sm">
          You don&apos;t have permission to view this page. Contact your administrator if you think
          this is a mistake.
        </p>
        <Link
          href="/dashboard"
          className="inline-block mt-2 px-5 py-2.5 rounded-btn bg-teal text-white text-[13.5px] font-medium hover:bg-teal-dark transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
