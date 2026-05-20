import type { AdminRole, FeatureKey, TriggerEvent } from '@/features/admin/shared/types'

export interface RoleDescriptor {
  name: AdminRole
  description: string
}

export interface PermissionFlag {
  role: AdminRole
  featureKey: FeatureKey
  enabled: boolean
}

export interface PermissionMatrix {
  roles: AdminRole[]
  featureKeys: FeatureKey[]
  flags: PermissionFlag[]
}

export interface UpdatePermissionsPayload {
  flags: PermissionFlag[]
}

export interface RatingScaleItem {
  level: number
  label: string
  description: string | null
}

export interface RatingScale {
  items: RatingScaleItem[]
}

export interface UpdateRatingScalePayload {
  items: Array<{ level: number; label: string; description: string | null }>
}

export interface SmtpConfig {
  host: string
  port: number
  username: string | null
  passwordSet: boolean
  fromEmail: string
  fromName: string | null
  useTls: boolean
}

export interface SmtpConfigPayload {
  host: string
  port: number
  username?: string | null
  password?: string | null
  fromEmail: string
  fromName?: string | null
  useTls: boolean
}

export interface NotificationRule {
  triggerEvent: TriggerEvent
  enabled: boolean
  reminderIntervalDays: number | null
}

export interface NotificationRulesResponse {
  rules: NotificationRule[]
}

export interface UpdateNotificationRulesPayload {
  rules: Array<{
    triggerEvent: TriggerEvent
    enabled: boolean
    reminderIntervalDays?: number | null
  }>
}
