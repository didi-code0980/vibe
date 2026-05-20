/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { ChangePasswordForm } from '@/features/auth/components/ChangePasswordForm'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
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

describe('<ChangePasswordForm />', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  it('blocks submit when passwords do not match', async () => {
    render(wrap(<ChangePasswordForm />))
    await userEvent.type(screen.getByLabelText(/current password/i), 'OldPass1')
    await userEvent.type(screen.getByLabelText(/^new password$/i), 'NewPass2')
    await userEvent.type(screen.getByLabelText(/confirm new password/i), 'Different1')

    await userEvent.click(screen.getByRole('button', { name: /update password/i }))

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument()
  })

  it('submits when input is valid', async () => {
    mockFetchOnce({ success: true, data: 'Password changed successfully.', error: null })

    render(wrap(<ChangePasswordForm />))
    await userEvent.type(screen.getByLabelText(/current password/i), 'OldPass1')
    await userEvent.type(screen.getByLabelText(/^new password$/i), 'NewPass2')
    await userEvent.type(screen.getByLabelText(/confirm new password/i), 'NewPass2')

    await userEvent.click(screen.getByRole('button', { name: /update password/i }))

    await waitFor(() => expect(global.fetch).toHaveBeenCalled())
  })
})
