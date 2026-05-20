export interface Employee {
  id: string
  name: string
  initials: string
  avatarBg: string
  department: string
  role: string
  skillScore: number
}

export interface SkillScore {
  employeeId: string
  skillId: string
  score: 0 | 1 | 2 | 3 | 4 | 5
}

export interface Course {
  id: string
  icon: string
  bg: string
  title: string
  provider: string
  duration: string
  progress: number
}

export interface AiRecommendation {
  id: string
  icon: string
  title: string
  reason: string
  priority: 'High priority' | 'Medium priority' | 'Career goal'
}

export interface Assessment {
  employeeId: string
  skillName: string
  score: number
  status: 'completed' | 'in-progress' | 'pending'
  date: string | null | undefined
}

export interface ChatMessage {
  id: string
  role: 'user' | 'bot'
  content: string
  timestamp: string
}

export interface MatrixEmployee {
  id: string
  name: string
  initials: string
  avatarBg: string
  scores: number[]
}

export interface AssessmentSkill {
  name: string
  sub: string
}

export interface KpiData {
  label: string
  value: string | number
  delta: string
  deltaType: 'up' | 'down'
  variant: 'teal' | 'navy' | 'gold' | 'green'
}

export interface DeptChartData {
  dept: string
  score: number
}

export interface DonutDataItem {
  name: string
  value: number
  color: string
}

// ─── Job Brief ─────────────────────────────────────────────────────────────────

export type DocumentType = 'JD' | 'SRS' | 'BRD' | 'OTHER'

export interface JobBriefInput {
  description: string
  goals: string
  docType: DocumentType
  fileName?: string
  fileContent?: string
}

export interface SuggestedRole {
  role: string
  count: number
  skills: string[]
}

export interface MatchedEmployee {
  id: string
  name: string
  initials: string
  avatarBg: string
  role: string
  department: string
  suitabilityScore: number   // 0–100
  availableCapacity: number  // % free bandwidth
  matchedSkills: string[]
}

export interface JobBriefAnalysis {
  timelineWeeks: number
  teamSize: number
  confidence: number           // 0–100
  suggestedRoles: SuggestedRole[]
  matchedEmployees: MatchedEmployee[]
  summary: string
}

export interface RecentAssessment {
  id: string
  name: string
  initials: string
  avatarBg: string
  department: string
  skillArea: string
  score: number
  status: 'completed' | 'in-progress' | 'pending'
  date: string | null
}
