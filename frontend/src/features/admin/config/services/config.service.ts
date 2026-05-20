import { apiClient } from '@/lib/api/client'
import { ENDPOINTS } from '@/lib/api/endpoints'
import type { ApiResponse } from '@/lib/api/types'
import type {
  NotificationRulesResponse,
  PermissionMatrix,
  RatingScale,
  RoleDescriptor,
  SmtpConfig,
  SmtpConfigPayload,
  UpdateNotificationRulesPayload,
  UpdatePermissionsPayload,
  UpdateRatingScalePayload,
} from '@/features/admin/config/types/config.types'

function unwrap<T>(body: ApiResponse<T>): T {
  if (!body.success || body.data === undefined || body.data === null) {
    throw new Error(body.error?.message ?? 'Request failed')
  }
  return body.data
}

export const configService = {
  getRoles: async () => {
    const body = await apiClient.get<ApiResponse<{ roles: RoleDescriptor[] }>>(
      ENDPOINTS.ADMIN.CONFIG.ROLES,
    )
    return unwrap(body).roles
  },

  getPermissions: async () => {
    const body = await apiClient.get<ApiResponse<PermissionMatrix>>(
      ENDPOINTS.ADMIN.CONFIG.PERMISSIONS,
    )
    return unwrap(body)
  },

  updatePermissions: async (payload: UpdatePermissionsPayload) => {
    const body = await apiClient.put<ApiResponse<PermissionMatrix>>(
      ENDPOINTS.ADMIN.CONFIG.PERMISSIONS,
      payload,
    )
    return unwrap(body)
  },

  getRatingScale: async () => {
    const body = await apiClient.get<ApiResponse<RatingScale>>(
      ENDPOINTS.ADMIN.CONFIG.RATING_SCALE,
    )
    return unwrap(body)
  },

  updateRatingScale: async (payload: UpdateRatingScalePayload) => {
    const body = await apiClient.put<ApiResponse<RatingScale>>(
      ENDPOINTS.ADMIN.CONFIG.RATING_SCALE,
      payload,
    )
    return unwrap(body)
  },

  getSmtp: async () => {
    const body = await apiClient.get<ApiResponse<SmtpConfig>>(ENDPOINTS.ADMIN.CONFIG.SMTP)
    return unwrap(body)
  },

  updateSmtp: async (payload: SmtpConfigPayload) => {
    const body = await apiClient.put<ApiResponse<SmtpConfig>>(
      ENDPOINTS.ADMIN.CONFIG.SMTP,
      payload,
    )
    return unwrap(body)
  },

  sendSmtpTest: async () => {
    await apiClient.post<ApiResponse<string>>(ENDPOINTS.ADMIN.CONFIG.SMTP_TEST)
  },

  getNotificationRules: async () => {
    const body = await apiClient.get<ApiResponse<NotificationRulesResponse>>(
      ENDPOINTS.ADMIN.CONFIG.NOTIFICATION_RULES,
    )
    return unwrap(body)
  },

  updateNotificationRules: async (payload: UpdateNotificationRulesPayload) => {
    const body = await apiClient.put<ApiResponse<NotificationRulesResponse>>(
      ENDPOINTS.ADMIN.CONFIG.NOTIFICATION_RULES,
      payload,
    )
    return unwrap(body)
  },
}
