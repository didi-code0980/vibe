'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notificationsService } from '@/features/notifications/services/notifications.service'
import type { ListNotificationsParams } from '@/features/notifications/types/notification.types'

const KEYS = {
  list: (params: ListNotificationsParams) => ['notifications', 'list', params] as const,
  unreadCount: ['notifications', 'unread-count'] as const,
}

export function useNotifications(params: ListNotificationsParams = {}) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: () => notificationsService.list(params),
  })
}

export function useUnreadCount() {
  return useQuery({
    queryKey: KEYS.unreadCount,
    queryFn: () => notificationsService.unreadCount(),
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  })
}

export function useMarkAsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => notificationsService.markAsRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useMarkAllAsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => notificationsService.markAllAsRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
