import { z } from 'zod'
import { ADMIN_ROLES, FEATURE_KEYS, TRIGGER_EVENTS } from '@/features/admin/shared/types'

export const permissionMatrixSchema = z.object({
  flags: z
    .array(
      z.object({
        role: z.enum(ADMIN_ROLES as [string, ...string[]]),
        featureKey: z.enum(FEATURE_KEYS as [string, ...string[]]),
        enabled: z.boolean(),
      }),
    )
    .min(1),
})

export type PermissionMatrixFormValues = z.infer<typeof permissionMatrixSchema>

export const ratingScaleSchema = z.object({
  items: z
    .array(
      z.object({
        level: z.number().int().min(1).max(5),
        label: z.string().trim().min(1, 'Label is required').max(100),
        description: z.string().max(1000).nullable().optional(),
      }),
    )
    .length(5, 'Exactly 5 levels are required')
    .refine(
      (items) => new Set(items.map((i) => i.level)).size === items.length,
      { message: 'Each level must be unique' },
    ),
})

export type RatingScaleFormValues = z.infer<typeof ratingScaleSchema>

export const smtpSchema = z.object({
  host: z.string().trim().min(1, 'Host is required').max(255),
  port: z.number().int().min(1).max(65535),
  username: z.string().max(255).nullable().optional(),
  password: z.string().max(512).nullable().optional(),
  fromEmail: z.string().email('Invalid email').max(255),
  fromName: z.string().max(255).nullable().optional(),
  useTls: z.boolean(),
})

export type SmtpFormValues = z.infer<typeof smtpSchema>

export const notificationRulesSchema = z.object({
  rules: z
    .array(
      z.object({
        triggerEvent: z.enum(TRIGGER_EVENTS as [string, ...string[]]),
        enabled: z.boolean(),
        reminderIntervalDays: z.number().int().min(1).nullable().optional(),
      }),
    )
    .min(1),
})

export type NotificationRulesFormValues = z.infer<typeof notificationRulesSchema>
