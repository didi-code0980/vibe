/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { AvatarUploader } from '@/features/profile/components/AvatarUploader'

function wrap(ui: ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={qc}>{ui}</QueryClientProvider>
}

function uploadFile(input: HTMLInputElement, file: File) {
  // Bypass the input's `accept` attribute so we can verify the component's own
  // validation logic on unsupported MIME types. `userEvent.upload` (v14+)
  // enforces `accept` by default and would silently swallow the file.
  fireEvent.change(input, { target: { files: [file] } })
}

describe('<AvatarUploader />', () => {
  beforeAll(() => {
    // jsdom does not implement URL.createObjectURL / revokeObjectURL — stub them
    // so the preview modal can render its <img> without throwing.
    if (!('createObjectURL' in URL)) {
      ;(URL as unknown as { createObjectURL: (b: Blob) => string }).createObjectURL = () =>
        'blob:mock-preview'
    }
    if (!('revokeObjectURL' in URL)) {
      ;(URL as unknown as { revokeObjectURL: (s: string) => void }).revokeObjectURL = () => {}
    }
  })

  beforeEach(() => {
    jest.restoreAllMocks()
  })

  it('rejects files larger than 2 MB without opening the preview modal', () => {
    render(wrap(<AvatarUploader initials="AL" />))
    const input = screen.getByTestId('avatar-file-input') as HTMLInputElement

    const big = new File([new Uint8Array(3 * 1024 * 1024)], 'big.png', { type: 'image/png' })
    uploadFile(input, big)

    expect(screen.getByText(/2 MB or smaller/i)).toBeInTheDocument()
    expect(screen.queryByRole('dialog', { name: /avatar preview/i })).not.toBeInTheDocument()
  })

  it('rejects unsupported MIME types', () => {
    render(wrap(<AvatarUploader initials="AL" />))
    const input = screen.getByTestId('avatar-file-input') as HTMLInputElement

    const gif = new File([new Uint8Array([1, 2, 3])], 'pic.gif', { type: 'image/gif' })
    uploadFile(input, gif)

    expect(screen.getByText(/Only JPG, PNG, or WebP/i)).toBeInTheDocument()
    expect(screen.queryByRole('dialog', { name: /avatar preview/i })).not.toBeInTheDocument()
  })

  it('opens the preview modal for a valid PNG before uploading', () => {
    render(wrap(<AvatarUploader initials="AL" />))
    const input = screen.getByTestId('avatar-file-input') as HTMLInputElement

    const file = new File([new Uint8Array([1, 2, 3])], 'me.png', { type: 'image/png' })
    uploadFile(input, file)

    const dialog = screen.getByRole('dialog', { name: /avatar preview/i })
    expect(dialog).toBeInTheDocument()
    expect(screen.getByText(/me\.png/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /upload/i })).toBeEnabled()
    expect(screen.getByRole('button', { name: /^cancel$/i })).toBeInTheDocument()
  })

  it('shows the Remove photo affordance only when an avatar is set', () => {
    const { rerender } = render(wrap(<AvatarUploader initials="AL" />))
    expect(screen.queryByRole('button', { name: /remove photo/i })).not.toBeInTheDocument()

    rerender(wrap(<AvatarUploader initials="AL" currentAvatarUrl="/static/avatars/me.png" />))
    expect(screen.getByRole('button', { name: /remove photo/i })).toBeInTheDocument()
  })
})
