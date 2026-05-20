/**
 * @jest-environment jsdom
 */
import { profileService } from '@/features/profile/services/profile.service'

interface MockResponseInit {
  ok: boolean
  status: number
  body: unknown
}

function mockFetchOnce(init: MockResponseInit) {
  const res = {
    ok: init.ok,
    status: init.status,
    statusText: init.ok ? 'OK' : 'Error',
    json: async () => init.body,
  } as Response
  // @ts-expect-error overriding fetch in jsdom
  global.fetch = jest.fn().mockResolvedValue(res)
}

describe('profileService', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  it('get() unwraps the profile response', async () => {
    mockFetchOnce({
      ok: true,
      status: 200,
      body: {
        success: true,
        data: {
          userId: 1,
          email: 'a@b.com',
          fullName: 'Alice',
          notificationEmail: true,
          language: 'EN',
          positions: [],
          role: 'STAFF',
          status: 'ACTIVE',
          mustChangePassword: false,
          userAvatar: null,
          phone: null,
          createdAt: new Date().toISOString(),
        },
        error: null,
      },
    })

    const profile = await profileService.get()
    expect(profile.email).toBe('a@b.com')
    expect(profile.language).toBe('EN')
  })

  it('get() throws when success is false', async () => {
    mockFetchOnce({
      ok: true,
      status: 200,
      body: { success: false, data: null, error: { message: 'nope', errorCode: 400 } },
    })

    await expect(profileService.get()).rejects.toThrow('nope')
  })

  it('updateSettings() returns the new settings', async () => {
    mockFetchOnce({
      ok: true,
      status: 200,
      body: {
        success: true,
        data: { notificationEmail: false, language: 'VI' },
        error: null,
      },
    })

    const settings = await profileService.updateSettings({
      notificationEmail: false,
      language: 'VI',
    })

    expect(settings.notificationEmail).toBe(false)
    expect(settings.language).toBe('VI')
  })

  it('getAssessmentHistory() returns paged data', async () => {
    mockFetchOnce({
      ok: true,
      status: 200,
      body: {
        success: true,
        data: {
          items: [
            {
              evaluationId: 1,
              skillId: 5,
              skillName: 'Java',
              departmentName: 'Dev',
              selfScore: 4,
              managerScore: null,
              assessedAt: new Date().toISOString(),
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
      },
    })

    const history = await profileService.getAssessmentHistory(0, 20)
    expect(history.items).toHaveLength(1)
    expect(history.items[0].skillName).toBe('Java')
  })
})
