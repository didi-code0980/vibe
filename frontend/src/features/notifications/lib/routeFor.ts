import type { NotificationItem } from '@/features/notifications/types/notification.types'

export function routeFor(notification: NotificationItem): string | null {
  const { relatedEntityType, relatedEntityId } = notification
  if (!relatedEntityType || relatedEntityId == null) return null
  switch (relatedEntityType) {
    case 'DOCUMENT':
      return `/learning?docId=${relatedEntityId}`
    case 'GOAL':
      return `/profile?goalId=${relatedEntityId}`
    case 'ASSESSMENT':
      return `/assessment?id=${relatedEntityId}`
    default:
      return null
  }
}
