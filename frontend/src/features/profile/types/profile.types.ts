export interface PositionBrief {
  positionId: number
  name: string
}

export type GeneralStatus = 'ACTIVE' | 'DEACTIVE' | 'DELETED'

export type Language = 'VI' | 'EN'

export interface ProfileResponse {
  userId: number
  email: string
  fullName: string
  userAvatar: string | null
  phone: string | null
  role: string
  status: GeneralStatus
  mustChangePassword: boolean
  notificationEmail: boolean
  language: Language
  positions: PositionBrief[]
  careerId: number | null
  careerName: string | null
  departmentId: number | null
  departmentName: string | null
  teamId: number | null
  teamName: string | null
  createdAt: string
}

export interface ProfileSettings {
  notificationEmail: boolean
  language: Language
}

export interface UpdateProfilePayload {
  fullName: string
  phone: string | null
}

export interface UpdateProfileSettingsPayload {
  notificationEmail: boolean
  language: Language
}

export interface AvatarUploadResponse {
  avatarUrl: string
}

export interface AssessmentHistoryItem {
  evaluationId: number
  skillId: number | null
  skillName: string | null
  departmentName: string | null
  selfScore: number | null
  managerScore: number | null
  assessedAt: string
}

export interface PublicSkillScore {
  skillId: number
  skillName: string
  selfScore: number
}

export interface TeammateBrief {
  userId: number
  fullName: string
  userAvatar: string | null
  skills: PublicSkillScore[]
}

export interface ProfileTeam {
  teamId: number | null
  teamName: string | null
  managerFullName: string | null
  teammates: TeammateBrief[]
}

// Backward compat — the original component still expects this shape from
// `/api/users/{id}`. Keep it until ProfileView migrates to ProfileResponse.
export interface UserDetailResponse {
  userId: number
  email: string
  fullName: string
  userAvatar: string | null
  phone: string | null
  role: string
  status: GeneralStatus
  deactiveType: string | null
  deactiveUntil: string | null
  positions: PositionBrief[]
  careerId: number | null
  careerName: string | null
  departmentId: number | null
  departmentName: string | null
  teamId: number | null
  teamName: string | null
  createdAt: string
}