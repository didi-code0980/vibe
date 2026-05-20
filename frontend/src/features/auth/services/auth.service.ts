import { apiClient } from '@/lib/api/client'
import { ENDPOINTS } from '@/lib/api/endpoints'
import { ROLES } from '@/lib/constants/roles'
import type { Role } from '@/lib/constants/roles'
import { useAuthStore } from '@/store/auth.store'
import type {
  ApiResponse,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  LoginPayload,
  LoginResponse,
  ResetPasswordPayload,
} from '@/features/auth/types/auth.types'

export const AUTH_COOKIE = 'auth_token'
export const USER_ID_COOKIE = 'user_id'
export const ROLE_COOKIE = 'user_role'

export function getTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${AUTH_COOKIE}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

export function getUserIdFromCookie(): number | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${USER_ID_COOKIE}=([^;]*)`))
  const raw = match ? decodeURIComponent(match[1]) : null
  return raw ? parseInt(raw, 10) : null
}

export function getRoleFromCookie(): Role | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${ROLE_COOKIE}=([^;]*)`))
  const raw = match ? decodeURIComponent(match[1]) : null
  if (raw === ROLES.ADMIN || raw === ROLES.MANAGER || raw === ROLES.USER) return raw
  return null
}

export const authService = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    // skipAuthRedirect: a wrong password returns 401 — we want the form to show
    // an error, not silently reload the page.
    const body = await apiClient.post<ApiResponse<LoginResponse>>(
      ENDPOINTS.AUTH.LOGIN,
      payload,
      { skipAuthRedirect: true },
    )
    if (!body.success || !body.data) {
      throw new Error(body.error?.message ?? 'Invalid credentials')
    }
    useAuthStore.getState().login(body.data)
    return body.data
  },

  logout: async (): Promise<void> => {
    await apiClient
      .post<ApiResponse<string>>(ENDPOINTS.AUTH.LOGOUT)
      .catch(() => null)
    useAuthStore.getState().logout()
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  },

  forgotPassword: async (payload: ForgotPasswordPayload): Promise<void> => {
    await apiClient.post<ApiResponse<string>>(ENDPOINTS.AUTH.FORGOT_PASSWORD, payload)
  },

  resetPassword: async (payload: ResetPasswordPayload): Promise<void> => {
    const body = await apiClient.post<ApiResponse<string>>(ENDPOINTS.AUTH.RESET_PASSWORD, {
      token: payload.token,
      new_password: payload.newPassword,
    })
    if (!body.success) {
      throw new Error(body.error?.message ?? 'Could not reset password')
    }
  },

  changePassword: async (payload: ChangePasswordPayload): Promise<void> => {
    const body = await apiClient.post<ApiResponse<string>>(ENDPOINTS.AUTH.CHANGE_PASSWORD, {
      current_password: payload.currentPassword,
      new_password: payload.newPassword,
    })
    if (!body.success) {
      throw new Error(body.error?.message ?? 'Could not change password')
    }
    useAuthStore.getState().updateMustChangePassword(false)
  },
}