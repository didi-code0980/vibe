import { positionSchema } from '@/features/admin/positions/schemas/position.schema'
import {
  notificationRulesSchema,
  permissionMatrixSchema,
  ratingScaleSchema,
  smtpSchema,
} from '@/features/admin/config/schemas/config.schemas'
import { emailTemplateSchema } from '@/features/admin/email-templates/schemas/email-template.schema'

describe('admin zod schemas', () => {
  describe('positionSchema', () => {
    it('accepts valid input with empty skills', () => {
      expect(
        positionSchema.safeParse({ name: 'Backend', requiredSkills: [] }).success,
      ).toBe(true)
    })
    it('rejects blank name', () => {
      expect(positionSchema.safeParse({ name: '', requiredSkills: [] }).success).toBe(false)
    })
    it('rejects min level out of range', () => {
      expect(
        positionSchema.safeParse({
          name: 'Backend',
          requiredSkills: [{ skillId: 1, minLevel: 6 }],
        }).success,
      ).toBe(false)
    })
    it('rejects skillId <= 0', () => {
      expect(
        positionSchema.safeParse({
          name: 'Backend',
          requiredSkills: [{ skillId: 0, minLevel: 3 }],
        }).success,
      ).toBe(false)
    })
  })

  describe('ratingScaleSchema', () => {
    const valid = [1, 2, 3, 4, 5].map((level) => ({ level, label: `Lv${level}`, description: '' }))
    it('accepts 5 unique levels', () => {
      expect(ratingScaleSchema.safeParse({ items: valid }).success).toBe(true)
    })
    it('rejects when not 5 items', () => {
      expect(ratingScaleSchema.safeParse({ items: valid.slice(0, 4) }).success).toBe(false)
    })
    it('rejects duplicate levels', () => {
      const dup = [...valid]
      dup[4] = { level: 1, label: 'Dup', description: '' }
      expect(ratingScaleSchema.safeParse({ items: dup }).success).toBe(false)
    })
    it('rejects blank label', () => {
      const bad = valid.map((i, idx) => (idx === 0 ? { ...i, label: '' } : i))
      expect(ratingScaleSchema.safeParse({ items: bad }).success).toBe(false)
    })
  })

  describe('smtpSchema', () => {
    it('accepts valid config', () => {
      const result = smtpSchema.safeParse({
        host: 'smtp.example.com',
        port: 587,
        username: 'u',
        password: 'p',
        fromEmail: 'from@example.com',
        fromName: 'X',
        useTls: true,
      })
      expect(result.success).toBe(true)
    })
    it('rejects invalid port', () => {
      const result = smtpSchema.safeParse({
        host: 'x',
        port: 99999,
        fromEmail: 'from@example.com',
        useTls: true,
      })
      expect(result.success).toBe(false)
    })
    it('rejects invalid email', () => {
      const result = smtpSchema.safeParse({
        host: 'x',
        port: 587,
        fromEmail: 'not-email',
        useTls: true,
      })
      expect(result.success).toBe(false)
    })
  })

  describe('notificationRulesSchema', () => {
    it('accepts valid rules', () => {
      const result = notificationRulesSchema.safeParse({
        rules: [{ triggerEvent: 'GOAL_SUGGESTED', enabled: true, reminderIntervalDays: 3 }],
      })
      expect(result.success).toBe(true)
    })
    it('rejects unknown trigger event', () => {
      const result = notificationRulesSchema.safeParse({
        rules: [{ triggerEvent: 'NOPE', enabled: true }],
      })
      expect(result.success).toBe(false)
    })
  })

  describe('permissionMatrixSchema', () => {
    it('accepts valid flag list', () => {
      const result = permissionMatrixSchema.safeParse({
        flags: [
          { role: 'MANAGER_TEAM', featureKey: 'CROSS_TEAM_RESOURCE_MATCH', enabled: true },
        ],
      })
      expect(result.success).toBe(true)
    })
    it('rejects empty flag list', () => {
      expect(permissionMatrixSchema.safeParse({ flags: [] }).success).toBe(false)
    })
  })

  describe('emailTemplateSchema', () => {
    it('accepts valid template', () => {
      const result = emailTemplateSchema.safeParse({
        name: 'Welcome',
        subject: 'Hi {{name}}',
        bodyHtml: '<p>Hi</p>',
        triggerEvent: 'ACCOUNT_CREATED',
        variablesJson: null,
        isActive: true,
      })
      expect(result.success).toBe(true)
    })
    it('rejects blank body', () => {
      const result = emailTemplateSchema.safeParse({
        name: 'X',
        subject: 'X',
        bodyHtml: '',
        triggerEvent: 'ACCOUNT_CREATED',
        isActive: true,
      })
      expect(result.success).toBe(false)
    })
  })
})
