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
    return profileService.uploadAvatarWithProgress(file)
  },

  /**
   * Upload an avatar and stream progress events via the optional callback.
   * Uses XHR because `fetch` does not surface request-body progress.
   */
  uploadAvatarWithProgress: (
    file: File,
    onProgress?: (loaded: number, total: number) => void,
    signal?: AbortSignal,
  ): Promise<AvatarUploadResponse> => {
    return new Promise<AvatarUploadResponse>((resolve, reject) => {
      const form = new FormData()
      form.append('file', file)
      const xhr = new XMLHttpRequest()
      xhr.open('POST', `/api${ENDPOINTS.PROFILE.AVATAR}`)
      const token = getTokenFromCookie()
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)

      xhr.upload.onprogress = (evt) => {
        if (evt.lengthComputable && onProgress) onProgress(evt.loaded, evt.total)
      }
      xhr.onerror = () => reject(new Error('Network error during upload'))
      xhr.onabort = () => reject(new DOMException('Upload aborted', 'AbortError'))
      xhr.onload = () => {
        let body: ApiResponse<AvatarUploadResponse> | null = null
        try {
          body = xhr.responseText ? (JSON.parse(xhr.responseText) as ApiResponse<AvatarUploadResponse>) : null
        } catch {
          body = null
        }
        if (xhr.status >= 200 && xhr.status < 300 && body?.success && body.data) {
          resolve(body.data)
        } else {
          reject(new Error(body?.error?.message ?? `Upload failed (${xhr.status})`))
        }
      }
      if (signal) {
        if (signal.aborted) {
          xhr.abort()
          return
        }
        signal.addEventListener('abort', () => xhr.abort(), { once: true })
      }
      xhr.send(form)
    })
  },

  removeAvatar: async (): Promise<void> => {
    const body = await apiClient.delete<ApiResponse<string>>(ENDPOINTS.PROFILE.AVATAR)
    if (!body.success) {
      throw new Error(body.error?.message ?? 'Could not remove avatar')
    }
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