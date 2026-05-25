export type AdminUserStatus = 'ACTIVE' | 'LOCKED' | 'DELETED' | 'DEACTIVE'

export interface AdminUserListItem {
  userId: number
  fullName: string | null
  avatarUrl: string | null
  email: string
  positionName: string | null
  status: AdminUserStatus
  createdAt: string
}

export interface AdminUserListParams {
  search?: string
  status?: AdminUserStatus
  positionId?: number
  createdFrom?: string
  createdTo?: string
  sortBy?: 'created_at' | 'full_name'
  sortDir?: 'asc' | 'desc'
  page?: number
  size?: number
}

export interface AdminUserCreatePayload {
  email: string
  fullName: string
  role: 'ADMIN' | 'MANAGER_CAREER' | 'MANAGER_DEPARTMENT' | 'MANAGER_TEAM' | 'STAFF'
  positionIds?: number[]
  careerId?: number
  departmentId?: number
  teamId?: number
}

export interface AdminUserCreated {
  userId: number
  email: string
  fullName: string | null
  role: string
  status: AdminUserStatus
}

export interface AdminUserStatusUpdate {
  status: 'ACTIVE' | 'LOCKED'
}

export interface AdminUserActivityItem {
  logId: number
  actorId: number | null
  action: string
  entityType: string
  entityId: number | null
  oldData: string | null
  newData: string | null
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
}
