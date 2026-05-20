import { apiClient } from '@/lib/api/client'
import { ENDPOINTS } from '@/lib/api/endpoints'
import { getTokenFromCookie } from '@/features/auth/services/auth.service'
import type { ApiResponse, PageResponse } from '@/lib/api/types'
import type {
  AssessmentHistoryItem,
  AvatarUploadResponse,
  ProfileResponse,
  ProfileSettings,
  ProfileTeam,
  UpdateProfilePayload,
  UpdateProfileSettingsPayload,
} from '@/features/profile/types/profile.types'

function unwrap<T>(body: ApiResponse<T>): T {
  if (!body.success || body.data === undefined || body.data === null) {
    throw new Error(body.error?.message ?? 'Request failed')
  }
  return body.data
}

export const profileService = {
  get: async (): Promise<ProfileResponse> => {
    const body = await apiClient.get<ApiResponse<ProfileResponse>>(ENDPOINTS.PROFILE.GET)
    return unwrap(body)
  },

  update: async (payload: UpdateProfilePayload): Promise<ProfileResponse> => {
    const body = await apiClient.put<ApiResponse<ProfileResponse>>(
      ENDPOINTS.PROFILE.UPDATE,
      payload,
    )
    return unwrap(body)
  },

  uploadAvatar: async (file: File): Promise<AvatarUploadResponse> => {
    const form = new FormData()
    form.append('file', file)
    const token = getTokenFromCookie()
    const res = await fetch(`/api${ENDPOINTS.PROFILE.AVATAR}`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: form,
    })
    const data: ApiResponse<AvatarUploadResponse> = await res.json()
    if (!res.ok || !data.success) {
      throw new Error(data.error?.message ?? 'Failed to upload avatar')
    }
    return unwrap(data)
  },

  getSettings: async (): Promise<ProfileSettings> => {
    const body = await apiClient.get<ApiResponse<ProfileSettings>>(ENDPOINTS.PROFILE.SETTINGS)
    return unwrap(body)
  },

  updateSettings: async (payload: UpdateProfileSettingsPayload): Promise<ProfileSettings> => {
    const body = await apiClient.put<ApiResponse<ProfileSettings>>(
      ENDPOINTS.PROFILE.SETTINGS,
      payload,
    )
    return unwrap(body)
  },

  getAssessmentHistory: async (
    page = 0,
    size = 20,
  ): Promise<PageResponse<AssessmentHistoryItem>> => {
    const body = await apiClient.get<ApiResponse<PageResponse<AssessmentHistoryItem>>>(
      ENDPOINTS.PROFILE.ASSESSMENT_HISTORY,
      { params: { page, size } },
    )
    return unwrap(body)
  },

  getMyTeam: async (): Promise<ProfileTeam> => {
    const body = await apiClient.get<ApiResponse<ProfileTeam>>(ENDPOINTS.PROFILE.TEAM)
    return unwrap(body)
  },
}