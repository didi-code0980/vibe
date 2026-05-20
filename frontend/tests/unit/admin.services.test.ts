/**
 * @jest-environment jsdom
 */
import { positionsService } from '@/features/admin/positions/services/positions.service'
import { configService } from '@/features/admin/config/services/config.service'
import { emailTemplatesService } from '@/features/admin/email-templates/services/email-templates.service'
import { auditLogsService } from '@/features/admin/audit-logs/services/audit-logs.service'

function mockFetchOnce(body: unknown, ok = true, status = 200) {
  // @ts-expect-error overriding fetch in jsdom
  global.fetch = jest.fn().mockResolvedValue({
    ok,
    status,
    statusText: ok ? 'OK' : 'Error',
    json: async () => body,
  })
}

describe('admin services', () => {
  beforeEach(() => jest.restoreAllMocks())

  it('positionsService.list() unwraps page response', async () => {
    mockFetchOnce({
      success: true,
      data: {
        items: [{ positionId: 1, name: 'Backend', requiredSkills: [], status: 'ACTIVE' }],
        page: 0,
        size: 50,
        totalElements: 1,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      },
      error: null,
    })

    const result = await positionsService.list()
    expect(result.items).toHaveLength(1)
    expect(result.items[0].name).toBe('Backend')
  })

  it('configService.getRoles() returns roles array', async () => {
    mockFetchOnce({
      success: true,
      data: { roles: [{ name: 'ADMIN', description: 'Full access' }] },
      error: null,
    })

    const roles = await configService.getRoles()
    expect(roles).toHaveLength(1)
    expect(roles[0].name).toBe('ADMIN')
  })

  it('configService.updateRatingScale() returns updated items', async () => {
    mockFetchOnce({
      success: true,
      data: { items: [1, 2, 3, 4, 5].map((level) => ({ level, label: `L${level}`, description: null })) },
      error: null,
    })

    const result = await configService.updateRatingScale({
      items: [1, 2, 3, 4, 5].map((level) => ({ level, label: `L${level}`, description: null })),
    })
    expect(result.items).toHaveLength(5)
  })

  it('configService.getSmtp() throws when success=false', async () => {
    mockFetchOnce({
      success: false,
      data: null,
      error: { message: 'not configured', errorCode: 404 },
    })

    await expect(configService.getSmtp()).rejects.toThrow('not configured')
  })

  it('emailTemplatesService.list() returns paged data', async () => {
    mockFetchOnce({
      success: true,
      data: {
        items: [
          {
            id: 1,
            name: 'Welcome',
            subject: 'Hi',
            bodyHtml: '<p>Hi</p>',
            triggerEvent: 'ACCOUNT_CREATED',
            isActive: true,
          },
        ],
        page: 0,
        size: 20,
        totalElements: 1,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      },
      error: null,
    })

    const result = await emailTemplatesService.list()
    expect(result.items[0].name).toBe('Welcome')
  })

  it('auditLogsService.search() returns rows', async () => {
    mockFetchOnce({
      success: true,
      data: {
        items: [
          {
            logId: 1,
            actorId: 10,
            actorFullName: 'Alice',
            action: 'LOGIN_SUCCESS',
            entityType: 'USER',
            entityId: 10,
            createdAt: new Date().toISOString(),
          },
        ],
        page: 0,
        size: 20,
        totalElements: 1,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      },
      error: null,
    })

    const result = await auditLogsService.search({})
    expect(result.items[0].action).toBe('LOGIN_SUCCESS')
  })
})
