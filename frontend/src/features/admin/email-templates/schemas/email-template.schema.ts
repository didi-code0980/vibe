import { z } from 'zod'
import { TRIGGER_EVENTS } from '@/features/admin/shared/types'

export const emailTemplateSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(150),
  subject: z.string().trim().min(1, 'Subject is required').max(500),
  bodyHtml: z.string().trim().min(1, 'Body is required'),
  triggerEvent: z.enum(TRIGGER_EVENTS as [string, ...string[]]),
  variablesJson: z.string().nullable().optional(),
  isActive: z.boolean(),
})

export type EmailTemplateFormValues = z.infer<typeof emailTemplateSchema>
