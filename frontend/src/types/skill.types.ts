export type SkillLevel = 1 | 2 | 3 | 4 | 5
export type GapPriority = 'HIGH' | 'MEDIUM' | 'LOW'
export type SkillStatus = 'ACTIVE' | 'INACTIVE' | 'DELETED'

export interface Career {
  id: number
  name: string
  description: string
  createdBy: number
  createdAt: string
  updatedAt: string
}

export interface Department {
  id: number
  name: string
  description: string
  careerId: number
  careerName?: string
  createdBy: number
  createdAt: string
  updatedAt: string
}

export interface Skillset {
  id: number
  name: string
  description: string
  departmentId: number
  departmentName?: string
  levelDescriptions: Record<'1' | '2' | '3' | '4' | '5', string>
  status: SkillStatus
  createdBy: number
  createdAt: string
  updatedAt: string
}

export interface SkillAssessment {
  id: number
  userId: number
  skillsetId: number
  skillsetName?: string
  departmentName?: string
  selfScore: SkillLevel
  managerScore: SkillLevel | null
  selfNote: string
  managerNote: string
  assessedBy: number | null
  assessedAt: string
  assessmentAiLog: unknown | null
  createdAt: string
  updatedAt: string
}

export interface AssessmentLog {
  id: number
  assessmentId: number
  changedBy: number
  changedByName?: string
  fieldChanged: string
  oldValue: string
  newValue: string
  changedAt: string
}

export interface SkillGap {
  skillsetId: number
  skillsetName: string
  requiredLevel: SkillLevel
  currentLevel: SkillLevel
  gap: number
  priority: GapPriority
}

export interface DevelopmentGoal {
  id: number
  userId: number
  skillsetId: number
  skillsetName?: string
  targetLevel: SkillLevel
  currentLevel: SkillLevel
  note: string
  suggestedBy: number | null
  status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  createdAt: string
  updatedAt: string
  completedAt: string | null
}
