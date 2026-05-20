import { loginSchema } from '@/features/auth/schemas/login.schema'
import { forgotPasswordSchema } from '@/features/auth/schemas/forgot-password.schema'
import {
  resetPasswordSchema,
  changePasswordSchema,
} from '@/features/auth/schemas/password.schema'
import { updateProfileSchema } from '@/features/profile/schemas/update-profile.schema'
import { settingsSchema } from '@/features/profile/schemas/settings.schema'

describe('auth + profile zod schemas', () => {
  describe('loginSchema', () => {
    it('accepts valid input', () => {
      expect(loginSchema.safeParse({ email: 'a@b.com', password: 'pw' }).success).toBe(true)
    })
    it('rejects invalid email', () => {
      expect(loginSchema.safeParse({ email: 'no-email', password: 'pw' }).success).toBe(false)
    })
    it('rejects missing password', () => {
      expect(loginSchema.safeParse({ email: 'a@b.com', password: '' }).success).toBe(false)
    })
  })

  describe('forgotPasswordSchema', () => {
    it('accepts valid email', () => {
      expect(forgotPasswordSchema.safeParse({ email: 'a@b.com' }).success).toBe(true)
    })
    it('rejects malformed email', () => {
      expect(forgotPasswordSchema.safeParse({ email: 'no@' }).success).toBe(false)
    })
  })

  describe('resetPasswordSchema', () => {
    it('accepts matching strong passwords', () => {
      const result = resetPasswordSchema.safeParse({
        token: 'tok',
        newPassword: 'Strong1Pass',
        confirmPassword: 'Strong1Pass',
      })
      expect(result.success).toBe(true)
    })
    it('rejects when passwords do not match', () => {
      const result = resetPasswordSchema.safeParse({
        token: 'tok',
        newPassword: 'Strong1Pass',
        confirmPassword: 'Other1Pass',
      })
      expect(result.success).toBe(false)
    })
    it('rejects passwords missing uppercase', () => {
      const result = resetPasswordSchema.safeParse({
        token: 'tok',
        newPassword: 'weakpass1',
        confirmPassword: 'weakpass1',
      })
      expect(result.success).toBe(false)
    })
    it('rejects passwords missing digit', () => {
      const result = resetPasswordSchema.safeParse({
        token: 'tok',
        newPassword: 'NoDigitPass',
        confirmPassword: 'NoDigitPass',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('changePasswordSchema', () => {
    it('rejects when new equals current', () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: 'Strong1Pass',
        newPassword: 'Strong1Pass',
        confirmPassword: 'Strong1Pass',
      })
      expect(result.success).toBe(false)
    })
    it('accepts a valid change', () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: 'OldPass1',
        newPassword: 'NewPass2',
        confirmPassword: 'NewPass2',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('updateProfileSchema', () => {
    it('accepts full name without phone', () => {
      expect(updateProfileSchema.safeParse({ fullName: 'Alice' }).success).toBe(true)
    })
    it('accepts full name with empty phone', () => {
      expect(
        updateProfileSchema.safeParse({ fullName: 'Alice', phone: '' }).success,
      ).toBe(true)
    })
    it('rejects blank full name', () => {
      expect(updateProfileSchema.safeParse({ fullName: '   ' }).success).toBe(false)
    })
    it('rejects malformed phone', () => {
      expect(
        updateProfileSchema.safeParse({ fullName: 'Alice', phone: 'abc' }).success,
      ).toBe(false)
    })
  })

  describe('settingsSchema', () => {
    it('accepts valid language', () => {
      expect(
        settingsSchema.safeParse({ notificationEmail: true, language: 'VI' }).success,
      ).toBe(true)
    })
    it('rejects invalid language', () => {
      expect(
        settingsSchema.safeParse({ notificationEmail: true, language: 'FR' }).success,
      ).toBe(false)
    })
  })
})
