/**
 * @jest-environment jsdom
 */
import { authService } from '@/features/auth/services/auth.service'
import { useAuthStore } from '@/store/auth.store'

function makeJwt(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url')
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  return `${header}.${body}.sig`
}

interface MockResponseInit {
  ok: boolean
  status: number
  body: unknown
}

function mockFetchOnce(init: MockResponseInit) {
  const res = {
    ok: init.ok,
    status: init.status,
    statusText: init.ok ? 'OK' : 'Error',
    json: async () => init.body,
  } as Response
  // @ts-expect-error overriding fetch in jsdom
  global.fetch = jest.fn().mockResolvedValue(res)
}

describe('authService', () => {
  beforeEach(() => {
    useAuthStore.getState().logout()
    jest.restoreAllMocks()
  })

  it('login() stores tokens in the auth store on success', async () => {
    const token = makeJwt({ email: 'a@b.com', role: 'USER', userId: 7 })
    mockFetchOnce({
      ok: true,
      status: 200,
      body: { success: true, data: { accessToken: token, refreshToken: 'r' }, error: null },
    })

    const result = await authService.login({ email: 'a@b.com', password: 'pw' })

    expect(result.accessToken).toBe(token)
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
    expect(useAuthStore.getState().user?.email).toBe('a@b.com')
  })

  it('login() throws when API returns success=false', async () => {
    mockFetchOnce({
      ok: true,
      status: 200,
      body: { success: false, data: null, error: { message: 'Wrong password', errorCode: 401 } },
    })

    // The client throws on !ok responses; success=false with status 200 is unwrapped below.
    // We just expect the data check to trigger.
    await expect(
      authService.login({ email: 'a@b.com', password: 'bad' }),
    ).rejects.toThrow()
  })

  it('login() throws on HTTP 401', async () => {
    mockFetchOnce({
      ok: false,
      status: 401,
      body: { success: false, error: { message: 'Wrong password', errorCode: 401 } },
    })

    await expect(
      authService.login({ email: 'a@b.com', password: 'bad' }),
    ).rejects.toThrow()
  })

  it('forgotPassword() does not throw on non-existent email (server returns 200 always)', async () => {
    mockFetchOnce({
      ok: true,
      status: 200,
      body: {
        success: true,
        data: 'If that email exists, a reset link has been sent.',
        error: null,
      },
    })

    await expect(authService.forgotPassword({ email: 'ghost@x.com' })).resolves.toBeUndefined()
  })
})
