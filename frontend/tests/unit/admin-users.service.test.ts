/**
 * @jest-environment jsdom
 */
import { adminUsersService } from '@/features/admin/users/services/admin-users.service'

function mockFetchOnce(body: unknown, ok = true, status = 200) {
  const fetchMock = jest.fn().mockResolvedValue({
    ok,
    status,
    statusText: ok ? 'OK' : 'Error',
    json: async () => body,
  })
  ;(global as unknown as { fetch: jest.Mock }).fetch = fetchMock
  return fetchMock
}

describe('adminUsersService', () => {
  beforeEach(() => jest.restoreAllMocks())

  it('list() forwards search/status/page params in query string', async () => {
    const fetchMock = mockFetchOnce({
      success: true,
      data: {
        items: [
          {
            userId: 1,
            fullName: 'Alice',
            avatarUrl: null,
            email: 'a@test.com',
            positionName: 'Engineer',
            status: 'ACTIVE',
            createdAt: '2026-01-01T00:00:00Z',
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

    const result = await adminUsersService.list({
      search: 'ali',
      status: 'ACTIVE',
      page: 0,
      size: 20,
    })

    expect(result.items[0].email).toBe('a@test.com')
    const url = fetchMock.mock.calls[0][0] as string
    expect(url).toContain('/api/admin/users')
    expect(url).toContain('search=ali')
    expect(url).toContain('status=ACTIVE')
    expect(url).toContain('page=0')
    expect(url).toContain('size=20')
  })

  it('create() POSTs to /api/admin/users and returns created user', async () => {
    const fetchMock = mockFetchOnce({
      success: true,
      data: {
        userId: 99,
        email: 'new@test.com',
        fullName: 'New User',
        role: 'STAFF',
        status: 'ACTIVE',
      },
      error: null,
    })

    const created = await adminUsersService.create({
      email: 'new@test.com',
      fullName: 'New User',
      role: 'STAFF',
      positionIds: [1],
      teamId: 1,
    })

    expect(created.userId).toBe(99)
    const call = fetchMock.mock.calls[0]
    expect(call[0]).toContain('/api/admin/users')
    expect(call[1].method).toBe('POST')
    expect(JSON.parse(call[1].body as string)).toMatchObject({
      email: 'new@test.com',
      fullName: 'New User',
      role: 'STAFF',
    })
  })

  it('setStatus() PATCHes /api/admin/users/{id}/status', async () => {
    const fetchMock = mockFetchOnce({
      success: true,
      data: {
        userId: 7,
        email: 't@test.com',
        fullName: null,
        role: 'STAFF',
        status: 'LOCKED',
      },
      error: null,
    })

    const out = await adminUsersService.setStatus(7, { status: 'LOCKED' })

    expect(out.status).toBe('LOCKED')
    const call = fetchMock.mock.calls[0]
    expect(call[0]).toContain('/api/admin/users/7/status')
    expect(call[1].method).toBe('PATCH')
  })

  it('remove() DELETEs /api/admin/users/{id}', async () => {
    const fetchMock = mockFetchOnce({ success: true, data: null, error: null })

    await adminUsersService.remove(7)

    const call = fetchMock.mock.calls[0]
    expect(call[0]).toContain('/api/admin/users/7')
    expect(call[1].method).toBe('DELETE')
  })

  it('activity() GETs /api/admin/users/{id}/activity', async () => {
    const fetchMock = mockFetchOnce({
      success: true,
      data: {
        items: [
          {
            logId: 1,
            actorId: 7,
            action: 'USER_LOCKED',
            entityType: 'USER',
            entityId: 7,
            oldData: null,
            newData: null,
            ipAddress: '127.0.0.1',
            userAgent: null,
            createdAt: '2026-01-01T00:00:00Z',
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

    const page = await adminUsersService.activity(7, { page: 0, size: 20 })

    expect(page.items[0].action).toBe('USER_LOCKED')
    const url = fetchMock.mock.calls[0][0] as string
    expect(url).toContain('/api/admin/users/7/activity')
    expect(url).toContain('page=0')
    expect(url).toContain('size=20')
  })

  it('list() throws when response success=false', async () => {
    mockFetchOnce({ success: false, data: null, error: { message: 'forbidden', errorCode: 403 } })
    await expect(adminUsersService.list()).rejects.toThrow('forbidden')
  })
})
