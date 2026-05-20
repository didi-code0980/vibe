import type { TriggerEvent } from '@/features/admin/shared/types'

export interface EmailTemplate {
  id: number
  name: string
  subject: string
  bodyHtml: string
  triggerEvent: TriggerEvent
  variablesJson: string | null
  isActive: boolean
  createdAt: string | null
  updatedAt: string | null
}

export interface EmailTemplatePayload {
  name: string
  subject: string
  bodyHtml: string
  triggerEvent: TriggerEvent
  variablesJson?: string | null
  isActive: boolean
}
