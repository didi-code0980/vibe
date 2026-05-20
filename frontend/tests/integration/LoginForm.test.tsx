/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { LoginForm } from '@/features/auth/components/LoginForm'

const pushMock = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => new URLSearchParams(),
}))

function wrap(ui: ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={qc}>{ui}</QueryClientProvider>
}

function mockFetchOnce(body: unknown, ok = true, status = 200) {
  // @ts-expect-error overriding fetch in jsdom
  global.fetch = jest.fn().mockResolvedValue({
    ok,
    status,
    statusText: ok ? 'OK' : 'Error',
    json: async () => body,
  })
}

function makeJwt(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url')
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  return `${header}.${body}.sig`
}

describe('<LoginForm />', () => {
  beforeEach(() => {
    pushMock.mockReset()
    jest.restoreAllMocks()
  })

  it('shows validation errors for empty fields', async () => {
    render(wrap(<LoginForm />))
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument()
  })

  it('redirects to /dashboard on success', async () => {
    const token = makeJwt({ email: 'a@b.com', role: 'USER', userId: 1 })
    mockFetchOnce({
      success: true,
      data: { accessToken: token, refreshToken: 'r' },
      error: null,
    })

    render(wrap(<LoginForm />))
    await userEvent.type(screen.getByLabelText(/work email/i), 'a@b.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'pw')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/dashboard'))
  })

  it('redirects to /change-password when requiresPasswordChange is true', async () => {
    const token = makeJwt({ email: 'a@b.com', role: 'USER', userId: 1 })
    mockFetchOnce({
      success: true,
      data: { accessToken: token, refreshToken: 'r', requiresPasswordChange: true },
      error: null,
    })

    render(wrap(<LoginForm />))
    await userEvent.type(screen.getByLabelText(/work email/i), 'a@b.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'pw')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/change-password'))
  })
})
