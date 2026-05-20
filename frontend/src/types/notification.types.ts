export type TriggerEvent =
  | 'ACCOUNT_CREATED'
  | 'PASSWORD_RESET'
  | 'DOCUMENT_ASSIGNED'
  | 'LEARNING_REMINDER'
  | 'GOAL_SUGGESTED'
  | 'ASSESSMENT_REVIEWED'

export interface Notification {
  id: number
  recipientId: number
  type: TriggerEvent | string
  title: string
  body: string
  relatedEntityType: string
  relatedEntityId: number
  isRead: boolean
  createdAt: string
}
