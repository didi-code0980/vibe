import { z } from 'zod'

export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, 'Full name is required')
    .max(150, 'Full name is too long'),
  phone: z
    .string()
    .trim()
    .regex(/^[+]?[0-9\-\s]{7,20}$/, 'Invalid phone number')
    .or(z.literal(''))
    .optional(),
})

export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>