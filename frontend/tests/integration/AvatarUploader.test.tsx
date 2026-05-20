/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { AvatarUploader } from '@/features/profile/components/AvatarUploader'

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

describe('<AvatarUploader />', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  it('rejects files larger than 2 MB without calling the API', async () => {
    render(wrap(<AvatarUploader initials="AL" />))
    const input = screen.getByTestId('avatar-file-input') as HTMLInputElement

    const big = new File([new Uint8Array(3 * 1024 * 1024)], 'big.png', { type: 'image/png' })
    await userEvent.upload(input, big)

    expect(await screen.findByText(/2 MB or smaller/i)).toBeInTheDocument()
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('rejects unsupported MIME types', async () => {
    render(wrap(<AvatarUploader initials="AL" />))
    const input = screen.getByTestId('avatar-file-input') as HTMLInputElement

    const gif = new File([new Uint8Array([1, 2, 3])], 'pic.gif', { type: 'image/gif' })
    await userEvent.upload(input, gif)

    expect(await screen.findByText(/Only JPG, PNG, or WEBP/i)).toBeInTheDocument()
  })

  it('uploads a valid PNG', async () => {
    mockFetchOnce({
      success: true,
      data: { avatarUrl: '/static/avatars/me.png' },
      error: null,
    })

    render(wrap(<AvatarUploader initials="AL" />))
    const input = screen.getByTestId('avatar-file-input') as HTMLInputElement
    const file = new File([new Uint8Array([1, 2, 3])], 'me.png', { type: 'image/png' })

    await userEvent.upload(input, file)

    await waitFor(() => expect(global.fetch).toHaveBeenCalled())
  })
})
