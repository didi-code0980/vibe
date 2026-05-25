import { z } from 'zod'

export const ADMIN_USER_ROLES = [
  'ADMIN',
  'MANAGER_CAREER',
  'MANAGER_DEPARTMENT',
  'MANAGER_TEAM',
  'STAFF',
] as const

export const adminUserCreateSchema = z
  .object({
    email: z.string().email('Invalid email'),
    fullName: z.string().min(1, 'Full name is required').max(120),
    role: z.enum(ADMIN_USER_ROLES),
    positionIds: z.array(z.number().int().positive()).optional(),
    careerId: z.number().int().positive().optional(),
    departmentId: z.number().int().positive().optional(),
    teamId: z.number().int().positive().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.role !== 'ADMIN' && (!val.positionIds || val.positionIds.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['positionIds'],
        message: 'At least one position is required for non-admin roles',
      })
    }
  })

export type AdminUserCreateForm = z.infer<typeof adminUserCreateSchema>

export const adminUserStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'LOCKED']),
})
