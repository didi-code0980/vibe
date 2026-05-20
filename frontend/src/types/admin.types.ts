import type { TriggerEvent } from './notification.types'

export interface AuditLog {
  id: number
  actorId: number
  actorName?: string
  action: string
  entityType: string
  entityId: number
  oldData: unknown | null
  newData: unknown | null
  ipAddress: string
  userAgent: string
  createdAt: string
}

export interface EmailTemplate {
  id: number
  name: string
  subject: string
  bodyHtml: string
  variables: string[]
  triggerEvent: TriggerEvent
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface RatingScale {
  id: number
  level: 1 | 2 | 3 | 4 | 5
  label: string
  description: string
}

export interface SmtpConfig {
  host: string
  port: number
  username: string
  password: string
  fromEmail: string
  fromName: string
  useTls: boolean
}

export interface NotificationRule {
  triggerEvent: TriggerEvent
  enabled: boolean
  reminderIntervalDays?: number
}

export interface RolePermission {
  role: string
  permissions: Record<string, boolean>
}

// Dashboard / reporting
export interface PersonalDashboard {
  radarChartData: Array<{
    skillsetName: string
    department: string
    selfScore: number
    managerScore: number | null
  }>
  topSkills: Array<{ skillsetName: string; score: number }>
  focusSkills: Array<{ skillsetName: string; score: number; gap: number }>
  todoReminders: Array<{
    type: 'document' | 'goal'
    title: string
    deadline: string | null
  }>
}

export interface TeamMatrixCell {
  selfScore: number | null
  managerScore: number | null
}

export interface TeamMatrixRow {
  userId: number
  fullName: string
  avatarUrl: string | null
  skills: Record<number, TeamMatrixCell>
}

export interface TeamMatrix {
  skillsets: Array<{ id: number; name: string }>
  members: TeamMatrixRow[]
  skillCoverage: Record<number, number>
}

// AI types
export interface AIMatchResult {
  userId: number
  fullName: string
  avatarUrl: string | null
  position: string
  teamName: string
  matchScore: number
  matchedSkills: Array<{ skillsetId: number; userLevel: number; requiredLevel: number }>
  missingSkills: Array<{ skillsetId: number; requiredLevel: number }>
  currentProjectCount: number
}

export interface LearningPathItem {
  documentId: number
  title: string
  skillsetName: string
  suggestedDeadline: string
  rationale: string
}

export interface GeneratedTaxonomy {
  career: { name: string; description: string }
  departments: Array<{
    name: string
    skillsets: Array<{
      name: string
      levelDescriptions: Record<'1' | '2' | '3' | '4' | '5', string>
    }>
  }>
}
