'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { configService } from '@/features/admin/config/services/config.service'
import type {
  SmtpConfigPayload,
  UpdateNotificationRulesPayload,
  UpdatePermissionsPayload,
  UpdateRatingScalePayload,
} from '@/features/admin/config/types/config.types'

export const ROLES_KEY = ['admin', 'config', 'roles'] as const
export const PERMISSIONS_KEY = ['admin', 'config', 'permissions'] as const
export const RATING_SCALE_KEY = ['admin', 'config', 'rating-scale'] as const
export const SMTP_KEY = ['admin', 'config', 'smtp'] as const
export const NOTIFICATION_RULES_KEY = ['admin', 'config', 'notification-rules'] as const

export function useRoles() {
  return useQuery({ queryKey: ROLES_KEY, queryFn: () => configService.getRoles() })
}

export function usePermissionMatrix() {
  return useQuery({ queryKey: PERMISSIONS_KEY, queryFn: () => configService.getPermissions() })
}

export function useUpdatePermissions() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdatePermissionsPayload) => configService.updatePermissions(payload),
    onSuccess: (data) => qc.setQueryData(PERMISSIONS_KEY, data),
  })
}

export function useRatingScale() {
  return useQuery({ queryKey: RATING_SCALE_KEY, queryFn: () => configService.getRatingScale() })
}

export function useUpdateRatingScale() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateRatingScalePayload) => configService.updateRatingScale(payload),
    onSuccess: (data) => qc.setQueryData(RATING_SCALE_KEY, data),
  })
}

export function useSmtpConfig() {
  return useQuery({
    queryKey: SMTP_KEY,
    queryFn: () => configService.getSmtp(),
    retry: false,
  })
}

export function useUpdateSmtp() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: SmtpConfigPayload) => configService.updateSmtp(payload),
    onSuccess: (data) => qc.setQueryData(SMTP_KEY, data),
  })
}

export function useSendSmtpTest() {
  return useMutation({ mutationFn: () => configService.sendSmtpTest() })
}

export function useNotificationRules() {
  return useQuery({
    queryKey: NOTIFICATION_RULES_KEY,
    queryFn: () => configService.getNotificationRules(),
  })
}

export function useUpdateNotificationRules() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateNotificationRulesPayload) =>
      configService.updateNotificationRules(payload),
    onSuccess: (data) => qc.setQueryData(NOTIFICATION_RULES_KEY, data),
  })
}
