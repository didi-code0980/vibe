import { z } from 'zod'

export const positionSchema = z.object({
  name: z.string().trim().min(1, 'Position name is required').max(150),
  description: z.string().max(1000).optional().nullable(),
  requiredSkills: z
    .array(
      z.object({
        skillId: z
          .number({ invalid_type_error: 'Skill is required' })
          .int()
          .positive('Skill is required'),
        minLevel: z
          .number({ invalid_type_error: 'Min level must be 1-5' })
          .int()
          .min(1, 'Min level must be 1-5')
          .max(5, 'Min level must be 1-5'),
      }),
    )
    .default([]),
})

export type PositionFormValues = z.infer<typeof positionSchema>
