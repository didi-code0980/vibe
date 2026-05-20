import type { SkillLevel } from './skill.types'

export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'CLOSED' | 'ARCHIVED'

export interface Project {
  id: number
  name: string
  description: string
  customer: string
  startDate: string
  endDate: string
  status: ProjectStatus
  createdBy: number
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface ProjectSkillRequirement {
  id: number
  projectId: number
  skillsetId: number
  skillsetName?: string
  minLevel: SkillLevel
  isRequired: boolean
}

export interface ProjectMember {
  id: number
  projectId: number
  userId: number
  fullName?: string
  avatarUrl?: string | null
  projectRole: string
  joinDate: string
  outDate: string | null
  createdAt: string
}

export interface ProjectDashboard {
  projectId: number
  status: ProjectStatus
  memberCount: number
  requiredSkills: ProjectSkillRequirement[]
  skillGapSummary: Array<{
    skillsetId: number
    skillsetName: string
    requiredLevel: SkillLevel
    membersMeetingRequirement: number
    totalMembers: number
  }>
}

export interface MyProject {
  projectId: number
  projectName: string
  customer: string
  status: ProjectStatus
  ownRole: string
  joinDate: string
  outDate: string | null
}
