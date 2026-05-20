import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ROLES } from '@/lib/constants/roles'
import type { Role } from '@/lib/constants/roles'

export interface StoredUser {
  id: number
  email: string
  fullName: string
  role: Role
  avatarUrl: string | null
}

export interface LoginResponseLike {
  accessToken: string
  refreshToken: string
  requiresPasswordChange?: boolean
}

interface AuthState {
  user: StoredUser | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  mustChangePassword: boolean
}

interface AuthActions {
  login: (response: LoginResponseLike) => void
  logout: () => void
  updateUser: (partial: Partial<StoredUser>) => void
  setAuth: (user: StoredUser, mustChangePassword?: boolean) => void
  clearAuth: () => void
  updateMustChangePassword: (value: boolean) => void
}

const AUTH_COOKIE = 'auth_token'
const USER_ID_COOKIE = 'user_id'
const ROLE_COOKIE = 'user_role'
const MUST_CHANGE_PASSWORD_COOKIE = 'must_change_password'

function setCookie(name: string, value: string, days = 7) {
  if (typeof document === 'undefined') return
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`
}

function clearCookie(name: string) {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
}

function isRole(value: unknown): value is Role {
  return value === ROLES.ADMIN || value === ROLES.MANAGER || value === ROLES.USER
}

interface JwtPayload {
  sub?: string
  email?: string
  role?: string
  userId?: number
  id?: number
}

function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const json = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json) as JwtPayload
  } catch {
    return null
  }
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      mustChangePassword: false,

      login: (response) => {
        const { accessToken, refreshToken, requiresPasswordChange = false } = response
        const payload = decodeJwt(accessToken)
        const email = payload?.email ?? payload?.sub ?? ''
        const role: Role = isRole(payload?.role) ? payload.role : ROLES.USER
        const id =
          typeof payload?.userId === 'number'
            ? payload.userId
            : typeof payload?.id === 'number'
              ? payload.id
              : 0

        const user: StoredUser = {
          id,
          email,
          fullName: '',
          role,
          avatarUrl: null,
        }

        setCookie(AUTH_COOKIE, accessToken)
        setCookie(ROLE_COOKIE, role)
        if (id) setCookie(USER_ID_COOKIE, String(id))
        if (requiresPasswordChange) {
          setCookie(MUST_CHANGE_PASSWORD_COOKIE, 'true')
        } else {
          clearCookie(MUST_CHANGE_PASSWORD_COOKIE)
        }

        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          mustChangePassword: requiresPasswordChange,
        })
      },

      logout: () => {
        clearCookie(AUTH_COOKIE)
        clearCookie(USER_ID_COOKIE)
        clearCookie(ROLE_COOKIE)
        clearCookie(MUST_CHANGE_PASSWORD_COOKIE)
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          mustChangePassword: false,
        })
      },

      updateUser: (partial) => {
        const current = get().user
        if (!current) return
        const next = { ...current, ...partial }
        if (partial.id != null && partial.id !== current.id) {
          setCookie(USER_ID_COOKIE, String(partial.id))
        }
        if (partial.role && partial.role !== current.role) {
          setCookie(ROLE_COOKIE, partial.role)
        }
        set({ user: next })
      },

      setAuth: (user, mustChangePassword = false) => {
        setCookie(ROLE_COOKIE, user.role)
        if (user.id) setCookie(USER_ID_COOKIE, String(user.id))
        set({ user, isAuthenticated: true, mustChangePassword })
      },

      clearAuth: () => get().logout(),

      updateMustChangePassword: (value) => {
        if (value) {
          setCookie(MUST_CHANGE_PASSWORD_COOKIE, 'true')
        } else {
          clearCookie(MUST_CHANGE_PASSWORD_COOKIE)
        }
        set({ mustChangePassword: value })
      },
    }),
    {
      name: 'skillmatrix-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        mustChangePassword: state.mustChangePassword,
      }),
    },
  ),
)
