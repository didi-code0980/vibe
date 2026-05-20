/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm'

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

describe('<ForgotPasswordForm />', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  it('shows a validation error for an invalid email', async () => {
    render(wrap(<ForgotPasswordForm />))
    await userEvent.type(screen.getByLabelText(/work email/i), 'not-an-email')
    await userEvent.click(screen.getByRole('button', { name: /send reset link/i }))

    expect(await screen.findByText(/invalid email/i)).toBeInTheDocument()
  })

  it('shows the success message even when the email may not exist', async () => {
    mockFetchOnce({
      success: true,
      data: 'If that email exists, a reset link has been sent.',
      error: null,
    })

    render(wrap(<ForgotPasswordForm />))
    await userEvent.type(screen.getByLabelText(/work email/i), 'unknown@x.com')
    await userEvent.click(screen.getByRole('button', { name: /send reset link/i }))

    await waitFor(() => {
      expect(screen.getByText(/password reset link has been sent/i)).toBeInTheDocument()
    })
  })
})
