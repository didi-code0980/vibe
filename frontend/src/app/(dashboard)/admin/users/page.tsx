import { AdminUserList } from '@/features/admin/users/components/AdminUserList'

export default function AdminUsersPage() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-[18px] font-semibold text-ink">User Management</h1>
      <AdminUserList />
    </div>
  )
}
