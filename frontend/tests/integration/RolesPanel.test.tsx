/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { RolesPanel } from '@/features/admin/config/components/RolesPanel'

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

describe('<RolesPanel />', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  it('renders all roles returned from the API', async () => {
    mockFetchOnce({
      success: true,
      error: null,
      data: {
        roles: [
          { name: 'ADMIN', description: 'Full access to all data and configuration.' },
          { name: 'MANAGER_TEAM', description: 'Manages a single Team.' },
          { name: 'STAFF', description: 'Self-service: own profile, assessments, learning.' },
        ],
      },
    })

    render(wrap(<RolesPanel />))

    await waitFor(() => expect(screen.getByText('ADMIN')).toBeInTheDocument())
    expect(screen.getByText('MANAGER_TEAM')).toBeInTheDocument()
    expect(screen.getByText('STAFF')).toBeInTheDocument()
    expect(
      screen.getByText('Full access to all data and configuration.'),
    ).toBeInTheDocument()
  })

  it('shows an informational read-only note', async () => {
    mockFetchOnce({
      success: true,
      error: null,
      data: { roles: [{ name: 'ADMIN', description: 'desc' }] },
    })

    render(wrap(<RolesPanel />))

    await waitFor(() => expect(screen.getByText(/read-only/i)).toBeInTheDocument())
  })

  it('shows an empty-state message when the API returns no roles', async () => {
    mockFetchOnce({ success: true, error: null, data: { roles: [] } })

    render(wrap(<RolesPanel />))

    await waitFor(() => expect(screen.getByText(/no roles/i)).toBeInTheDocument())
  })

  it('shows an error state when the request fails', async () => {
    mockFetchOnce({ success: false, data: null, error: { message: 'boom' } }, false, 500)

    render(wrap(<RolesPanel />))

    await waitFor(() => expect(screen.getByText(/could not load roles/i)).toBeInTheDocument())
  })
})
