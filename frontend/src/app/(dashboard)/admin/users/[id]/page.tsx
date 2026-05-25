import Link from 'next/link'
import { notFound } from 'next/navigation'

import { AdminUserActivity } from '@/features/admin/users/components/AdminUserActivity'

interface PageProps {
  params: { id: string }
}

export default function AdminUserDetailPage({ params }: PageProps) {
  const userId = Number(params.id)
  if (!Number.isFinite(userId) || userId <= 0) notFound()

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-[18px] font-semibold text-ink">User #{userId}</h1>
        <Link href="/admin/users" className="text-teal text-[13px] hover:underline">
          ← Back to list
        </Link>
      </div>
      <section className="space-y-2">
        <h2 className="text-[14px] font-semibold text-ink">Activity Logs</h2>
        <AdminUserActivity userId={userId} />
      </section>
    </div>
  )
}
