import type { Role } from '@/lib/constants/roles'

export type UserStatus = 'ACTIVE' | 'DEACTIVE' | 'DELETED'

export interface User {
  id: number
  email: string
  fullName: string
  avatarUrl: string | null
  phone: string | null
  role: Role
  status: UserStatus
  positionId: number | null
  teamId: number | null
  careerId: number | null
  mustChangePassword: boolean
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface UserListItem {
  userId: number
  email: string
  fullName: string
  userAvatar: string | null
  role: Role
  status: UserStatus
  createdAt: string
}

export interface Position {
  id: number
  name: string
  requiredSkills: Array<{ skillsetId: number; minLevel: number }>
  createdAt: string
  updatedAt: string
}

export interface Team {
  id: number
  name: string
  description: string
  managerId: number
  managerName?: string
  departmentId: number | null
  memberCount?: number
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface TeamMember {
  id: number
  teamId: number
  userId: number
  fullName?: string
  avatarUrl?: string | null
  position: string
  note: string
  joinedAt: string
  leftAt: string | null
}
