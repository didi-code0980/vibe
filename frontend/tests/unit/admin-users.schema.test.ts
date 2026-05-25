import { adminUserCreateSchema, adminUserStatusSchema } from '@/features/admin/users/schemas/admin-user.schema'

describe('adminUserCreateSchema', () => {
  it('accepts a valid ADMIN payload without positions', () => {
    const result = adminUserCreateSchema.safeParse({
      email: 'a@test.com',
      fullName: 'Alice',
      role: 'ADMIN',
    })
    expect(result.success).toBe(true)
  })

  it('rejects a STAFF payload without positions', () => {
    const result = adminUserCreateSchema.safeParse({
      email: 'a@test.com',
      fullName: 'Alice',
      role: 'STAFF',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const err = result.error.issues.find((i) => i.path[0] === 'positionIds')
      expect(err?.message).toMatch(/position/i)
    }
  })

  it('rejects an invalid email', () => {
    const result = adminUserCreateSchema.safeParse({
      email: 'not-an-email',
      fullName: 'Alice',
      role: 'ADMIN',
    })
    expect(result.success).toBe(false)
  })

  it('rejects blank fullName', () => {
    const result = adminUserCreateSchema.safeParse({
      email: 'a@test.com',
      fullName: '',
      role: 'ADMIN',
    })
    expect(result.success).toBe(false)
  })
})

describe('adminUserStatusSchema', () => {
  it('accepts LOCKED', () => {
    expect(adminUserStatusSchema.safeParse({ status: 'LOCKED' }).success).toBe(true)
  })
  it('accepts ACTIVE', () => {
    expect(adminUserStatusSchema.safeParse({ status: 'ACTIVE' }).success).toBe(true)
  })
  it('rejects DEACTIVE', () => {
    expect(adminUserStatusSchema.safeParse({ status: 'DEACTIVE' }).success).toBe(false)
  })
})
