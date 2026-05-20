/**
 * @jest-environment jsdom
 */
import { notificationsService } from '@/features/notifications/services/notifications.service'

function mockFetchOnce(body: unknown, ok = true, status = 200) {
  // @ts-expect-error overriding fetch in jsdom
  global.fetch = jest.fn().mockResolvedValue({
    ok,
    status,
    statusText: ok ? 'OK' : 'Error',
    json: async () => body,
  })
}

function getLastFetchUrl(): string {
  const call = (global.fetch as jest.Mock).mock.calls[0]
  return call[0] as string
}

function getLastFetchInit(): RequestInit {
  const call = (global.fetch as jest.Mock).mock.calls[0]
  return call[1] as RequestInit
}

describe('notificationsService', () => {
  beforeEach(() => jest.restoreAllMocks())

  it('list() unwraps paged response and forwards isRead filter', async () => {
    mockFetchOnce({
      success: true,
      data: {
        items: [
          {
            id: 1,
            type: 'DOCUMENT_ASSIGNED',
            title: 'New doc',
            body: 'b',
            relatedEntityType: 'DOCUMENT',
            relatedEntityId: 55,
            isRead: false,
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

    const result = await notificationsService.list({ isRead: false })
    expect(result.items).toHaveLength(1)
    expect(result.items[0].title).toBe('New doc')
    expect(getLastFetchUrl()).toContain('isRead=false')
  })

  it('list() omits params when none provided', async () => {
    mockFetchOnce({
      success: true,
      data: {
        items: [],
        page: 0,
        size: 20,
        totalElements: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
      },
      error: null,
    })

    await notificationsService.list()
    const url = getLastFetchUrl()
    expect(url).toContain('/api/notifications')
    expect(url).not.toContain('isRead=')
  })

  it('unreadCount() returns count payload', async () => {
    mockFetchOnce({ success: true, data: { count: 7 }, error: null })

    const result = await notificationsService.unreadCount()
    expect(result.count).toBe(7)
    expect(getLastFetchUrl()).toContain('/api/notifications/unread-count')
  })

  it('markAsRead(id) issues PATCH to /{id}/read', async () => {
    mockFetchOnce({
      success: true,
      data: {
        id: 42,
        type: 'DOCUMENT_ASSIGNED',
        title: 't',
        body: null,
        relatedEntityType: null,
        relatedEntityId: null,
        isRead: true,
        createdAt: new Date().toISOString(),
      },
      error: null,
    })

    const result = await notificationsService.markAsRead(42)
    expect(result.isRead).toBe(true)
    expect(getLastFetchUrl()).toContain('/api/notifications/42/read')
    expect(getLastFetchInit().method).toBe('PATCH')
  })

  it('markAllAsRead() issues PATCH to /read-all', async () => {
    mockFetchOnce({ success: true, data: { count: 3 }, error: null })

    const result = await notificationsService.markAllAsRead()
    expect(result.count).toBe(3)
    expect(getLastFetchUrl()).toContain('/api/notifications/read-all')
    expect(getLastFetchInit().method).toBe('PATCH')
  })

  it('throws when success=false', async () => {
    mockFetchOnce({
      success: false,
      data: null,
      error: { message: 'boom', errorCode: 500 },
    })

    await expect(notificationsService.unreadCount()).rejects.toThrow('boom')
  })
})
