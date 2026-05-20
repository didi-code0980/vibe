/**
 * @jest-environment jsdom
 */
import { useAuthStore } from '@/store/auth.store'

function makeJwt(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url')
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  return `${header}.${body}.sig`
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

describe('auth.store', () => {
  beforeEach(() => {
    useAuthStore.getState().logout()
    document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
    document.cookie = 'user_role=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
    document.cookie = 'user_id=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
    document.cookie = 'must_change_password=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
  })

  it('login() decodes JWT and writes cookies', () => {
    const token = makeJwt({ email: 'alice@example.com', role: 'ADMIN', userId: 42 })

    useAuthStore.getState().login({ accessToken: token, refreshToken: 'r' })

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.user?.email).toBe('alice@example.com')
    expect(state.user?.role).toBe('ADMIN')
    expect(state.user?.id).toBe(42)
    expect(getCookie('auth_token')).toBe(token)
    expect(getCookie('user_role')).toBe('ADMIN')
    expect(getCookie('user_id')).toBe('42')
  })

  it('login() sets must_change_password cookie when requiresPasswordChange is true', () => {
    const token = makeJwt({ email: 'b@x.com', role: 'USER', userId: 1 })

    useAuthStore.getState().login({
      accessToken: token,
      refreshToken: 'r',
      requiresPasswordChange: true,
    })

    expect(useAuthStore.getState().mustChangePassword).toBe(true)
    expect(getCookie('must_change_password')).toBe('true')
  })

  it('logout() clears state and cookies', () => {
    const token = makeJwt({ email: 'c@x.com', role: 'USER', userId: 2 })
    useAuthStore.getState().login({ accessToken: token, refreshToken: 'r' })

    useAuthStore.getState().logout()

    expect(useAuthStore.getState().isAuthenticated).toBe(false)
    expect(useAuthStore.getState().user).toBeNull()
    expect(getCookie('auth_token')).toBeNull()
  })

  it('updateMustChangePassword(false) clears the cookie', () => {
    const token = makeJwt({ email: 'd@x.com', role: 'USER', userId: 3 })
    useAuthStore.getState().login({
      accessToken: token,
      refreshToken: 'r',
      requiresPasswordChange: true,
    })
    expect(getCookie('must_change_password')).toBe('true')

    useAuthStore.getState().updateMustChangePassword(false)

    expect(useAuthStore.getState().mustChangePassword).toBe(false)
    expect(getCookie('must_change_password')).toBeNull()
  })

  it('updateUser() merges partial fields', () => {
    const token = makeJwt({ email: 'e@x.com', role: 'USER', userId: 4 })
    useAuthStore.getState().login({ accessToken: token, refreshToken: 'r' })

    useAuthStore.getState().updateUser({ fullName: 'Eve' })

    expect(useAuthStore.getState().user?.fullName).toBe('Eve')
  })
})
