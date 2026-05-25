import Link from 'next/link'
import { AdminUserCreateForm } from '@/features/admin/users/components/AdminUserCreateForm'

export default function AdminUsersCreatePage() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-[18px] font-semibold text-ink">Create User</h1>
        <Link href="/admin/users" className="text-teal text-[13px] hover:underline">
          ← Back to list
        </Link>
      </div>
      <AdminUserCreateForm />
    </div>
  )
}
