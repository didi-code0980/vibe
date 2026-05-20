import { z } from 'zod'

export const settingsSchema = z.object({
  notificationEmail: z.boolean(),
  language: z.enum(['VI', 'EN']),
})

export type SettingsFormValues = z.infer<typeof settingsSchema>