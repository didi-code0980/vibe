export interface NotificationItem {
  id: number
  type: string
  title: string
  body: string | null
  relatedEntityType: string | null
  relatedEntityId: number | null
  isRead: boolean
  createdAt: string
}

export interface UnreadCount {
  count: number
}

export interface ListNotificationsParams {
  isRead?: boolean
  page?: number
  size?: number
}
