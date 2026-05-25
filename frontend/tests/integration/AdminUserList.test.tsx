/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

import { AdminUserList } from '@/features/admin/users/components/AdminUserList'

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

function wrap(ui: ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={qc}>{ui}</QueryClientProvider>
}

function jsonResponse(body: unknown, ok = true, status = 200) {
  return { ok, status, statusText: ok ? 'OK' : 'Error', json: async () => body }
}

const NOW = '2026-05-21T10:00:00.000Z'

const ACTIVE_USER = {
  userId: 1,
  fullName: 'Alice',
  avatarUrl: null,
  email: 'alice@test.com',
  positionName: 'Engineer',
  status: 'ACTIVE',
  createdAt: NOW,
}
const LOCKED_USER = {
  userId: 2,
  fullName: 'Bob',
  avatarUrl: null,
  email: 'bob@test.com',
  positionName: 'Designer',
  status: 'LOCKED',
  createdAt: NOW,
}

const listResponse = (items: object[]) => ({
  success: true,
  error: null,
  data: {
    items,
    page: 0,
    size: 20,
    totalElements: items.length,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
  },
})

describe('<AdminUserList />', () => {
  let confirmSpy: jest.SpyInstance

  beforeEach(() => {
    jest.restoreAllMocks()
    confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true)
  })

  afterEach(() => {
    confirmSpy.mockRestore()
  })

  it('renders rows from /api/admin/users', async () => {
    ;(global as unknown as { fetch: jest.Mock }).fetch = jest
      .fn()
      .mockResolvedValue(jsonResponse(listResponse([ACTIVE_USER, LOCKED_USER])))

    render(wrap(<AdminUserList />))

    await waitFor(() => {
      expect(screen.getByText('alice@test.com')).toBeInTheDocument()
      expect(screen.getByText('bob@test.com')).toBeInTheDocument()
    })
    expect(screen.getByTestId('admin-user-row-2')).toHaveTextContent('LOCKED')
  })

  it('clicking Lock calls PATCH and re-fetches', async () => {
    const fetchMock = jest.fn()
      .mockResolvedValueOnce(jsonResponse(listResponse([ACTIVE_USER])))
      .mockResolvedValueOnce(jsonResponse({ success: true, data: { userId: 1, status: 'LOCKED' }, error: null }))
      .mockResolvedValueOnce(jsonResponse(listResponse([{ ...ACTIVE_USER, status: 'LOCKED' }])))
    ;(global as unknown as { fetch: jest.Mock }).fetch = fetchMock

    render(wrap(<AdminUserList />))

    await waitFor(() => expect(screen.getByText('alice@test.com')).toBeInTheDocument())

    await userEvent.click(screen.getByRole('button', { name: /lock/i }))

    await waitFor(() => {
      const patchCall = fetchMock.mock.calls.find(([, opts]) => opts?.method === 'PATCH')
      expect(patchCall).toBeDefined()
      expect(patchCall![0]).toContain('/api/admin/users/1/status')
      expect(JSON.parse(patchCall![1].body as string)).toEqual({ status: 'LOCKED' })
    })
  })

  it('clicking Delete calls DELETE only after confirmation', async () => {
    confirmSpy.mockReturnValueOnce(false) // first confirm denies
    const fetchMock = jest.fn().mockResolvedValueOnce(jsonResponse(listResponse([ACTIVE_USER])))
    ;(global as unknown as { fetch: jest.Mock }).fetch = fetchMock

    render(wrap(<AdminUserList />))

    await waitFor(() => expect(screen.getByText('alice@test.com')).toBeInTheDocument())

    await userEvent.click(screen.getByRole('button', { name: /delete/i }))
    // no DELETE call should have been issued
    const deleteCalls = fetchMock.mock.calls.filter(([, opts]) => opts?.method === 'DELETE')
    expect(deleteCalls).toHaveLength(0)
  })
})
