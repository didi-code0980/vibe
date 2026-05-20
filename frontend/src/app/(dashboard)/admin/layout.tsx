import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ROLES } from '@/lib/constants/roles'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const role = cookies().get('user_role')?.value

  if (role !== ROLES.ADMIN) {
    redirect('/403')
  }

  return <>{children}</>
}
