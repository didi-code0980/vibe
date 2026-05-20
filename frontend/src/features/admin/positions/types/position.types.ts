export type PositionStatus = 'ACTIVE' | 'DEACTIVE' | 'DELETED'

export interface RequiredSkill {
  skillId: number
  skillName: string
  minLevel: number
}

export interface PositionDetail {
  positionId: number
  name: string
  description: string | null
  status: PositionStatus
  requiredSkills: RequiredSkill[]
}

export interface PositionCreatePayload {
  name: string
  description?: string | null
  requiredSkills: Array<{ skillId: number; minLevel: number }>
}

export interface PositionUpdatePayload extends PositionCreatePayload {}
