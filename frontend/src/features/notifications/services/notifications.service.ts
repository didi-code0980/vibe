import { apiClient } from '@/lib/api/client'
import { ENDPOINTS } from '@/lib/api/endpoints'
import type { ApiResponse, PageResponse } from '@/lib/api/types'
import type {
  ListNotificationsParams,
  NotificationItem,
  UnreadCount,
} from '@/features/notifications/types/notification.types'

function unwrap<T>(body: ApiResponse<T>): T {
  if (!body.success || body.data === undefined || body.data === null) {
    throw new Error(body.error?.message ?? 'Request failed')
  }
  return body.data
}

export const notificationsService = {
  list: async (params: ListNotificationsParams = {}): Promise<PageResponse<NotificationItem>> => {
    const query: Record<string, string | number | boolean> = {}
    if (params.isRead !== undefined) query.isRead = params.isRead
    if (params.page !== undefined) query.page = params.page
    if (params.size !== undefined) query.size = params.size
    const body = await apiClient.get<ApiResponse<PageResponse<NotificationItem>>>(
      ENDPOINTS.NOTIFICATIONS.LIST,
      { params: query },
    )
    return unwrap(body)
  },

  unreadCount: async (): Promise<UnreadCount> => {
    const body = await apiClient.get<ApiResponse<UnreadCount>>(
      ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT,
    )
    return unwrap(body)
  },

  markAsRead: async (id: number): Promise<NotificationItem> => {
    const body = await apiClient.patch<ApiResponse<NotificationItem>>(
      ENDPOINTS.NOTIFICATIONS.MARK_ONE(id),
    )
    return unwrap(body)
  },

  markAllAsRead: async (): Promise<UnreadCount> => {
    const body = await apiClient.patch<ApiResponse<UnreadCount>>(
      ENDPOINTS.NOTIFICATIONS.MARK_ALL,
    )
    return unwrap(body)
  },
}
