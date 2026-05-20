export type DocType = 'PDF' | 'LINK' | 'VIDEO'
export type AssignmentStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

export interface Document {
  id: number
  title: string
  description: string
  type: DocType
  url: string
  filePath: string | null
  skillsetTags: number[]
  aiTagSuggestions: AiTagSuggestion[] | null
  createdBy: number
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface AiTagSuggestion {
  skillsetId: number
  skillsetName: string
  confidence: number
  depth: 'INTRODUCTORY' | 'INTERMEDIATE' | 'ADVANCED'
}

export interface DocumentAssignment {
  id: number
  documentId: number
  documentTitle?: string
  documentType?: DocType
  assignedToUserId: number | null
  assignedToTeamId: number | null
  deadline: string | null
  status: AssignmentStatus
  assignedBy: number
  assignedAt: string
  completedAt: string | null
  skillsetTags?: number[]
  isAiSuggested?: boolean
}

export interface MyUpskillGroup {
  pending: DocumentAssignment[]
  completed: DocumentAssignment[]
}

export interface TeamLearningProgress {
  teamId: number
  members: Array<{
    userId: number
    fullName: string
    avatarUrl: string | null
    completionPct: number
    assignments: DocumentAssignment[]
  }>
}
