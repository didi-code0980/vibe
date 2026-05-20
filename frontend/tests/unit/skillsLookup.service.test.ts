/**
 * @jest-environment jsdom
 */
import { skillsLookupService } from '@/features/admin/positions/services/skills-lookup.service'

function mockFetchOnce(body: unknown, ok = true, status = 200) {
  // @ts-expect-error overriding fetch in jsdom
  global.fetch = jest.fn().mockResolvedValue({
    ok,
    status,
    statusText: ok ? 'OK' : 'Error',
    json: async () => body,
  })
}

describe('skillsLookupService.list', () => {
  beforeEach(() => jest.restoreAllMocks())

  it('returns flattened skill array from a paged ApiResponse', async () => {
    mockFetchOnce({
      success: true,
      error: null,
      data: {
        items: [
          { skillId: 11, name: 'Java', status: 'ACTIVE' },
          { skillId: 12, name: 'ReactJS', status: 'ACTIVE' },
        ],
        page: 0,
        size: 200,
        totalElements: 2,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      },
    })

    const result = await skillsLookupService.list()

    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({ skillId: 11, name: 'Java' })
    expect(result[1]).toEqual({ skillId: 12, name: 'ReactJS' })
  })

  it('throws when the request fails', async () => {
    mockFetchOnce({ success: false, data: null, error: { message: 'down' } }, false, 500)

    await expect(skillsLookupService.list()).rejects.toThrow()
  })

  it('returns an empty array when there are no skills', async () => {
    mockFetchOnce({
      success: true,
      error: null,
      data: {
        items: [],
        page: 0,
        size: 200,
        totalElements: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
      },
    })

    const result = await skillsLookupService.list()
    expect(result).toEqual([])
  })
})
