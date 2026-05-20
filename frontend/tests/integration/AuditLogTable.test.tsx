/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { AuditLogTable } from '@/features/admin/audit-logs/components/AuditLogTable'

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

const NOW = new Date().toISOString()

const ROW = {
  logId: 42,
  actorId: 10,
  actorFullName: 'Alice',
  actorEmail: 'alice@example.com',
  action: 'UPDATE_USER',
  entityType: 'USER',
  entityId: 7,
  oldData: '{"fullName":"Bob","role":"STAFF"}',
  newData: '{"fullName":"Bob Updated","role":"MANAGER_TEAM"}',
  ipAddress: '127.0.0.1',
  userAgent: 'Mozilla/5.0',
  createdAt: NOW,
}

describe('<AuditLogTable />', () => {
  beforeEach(() => jest.restoreAllMocks())

  it('renders a row collapsed by default with an expand toggle', async () => {
    mockFetchOnce({
      success: true,
      error: null,
      data: {
        items: [ROW],
        page: 0,
        size: 20,
        totalElements: 1,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      },
    })

    render(wrap(<AuditLogTable />))

    await waitFor(() => expect(screen.getByText('UPDATE_USER')).toBeInTheDocument())

    // Diff content is hidden until expanded
    expect(screen.queryByText(/fullName/)).not.toBeInTheDocument()

    const toggle = screen.getByRole('button', { name: /expand log 42/i })
    expect(toggle).toBeInTheDocument()
  })

  it('expanding shows the JSON diff with added / removed / changed labels', async () => {
    mockFetchOnce({
      success: true,
      error: null,
      data: {
        items: [ROW],
        page: 0,
        size: 20,
        totalElements: 1,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      },
    })

    render(wrap(<AuditLogTable />))

    await waitFor(() => expect(screen.getByText('UPDATE_USER')).toBeInTheDocument())

    await userEvent.click(screen.getByRole('button', { name: /expand log 42/i }))

    const diffRegion = await screen.findByRole('region', { name: /diff for log 42/i })
    const inDiff = within(diffRegion)

    // Two fields changed
    expect(inDiff.getByText('fullName')).toBeInTheDocument()
    expect(inDiff.getByText('role')).toBeInTheDocument()

    // Old + new values shown
    expect(inDiff.getByText(/"Bob"/)).toBeInTheDocument()
    expect(inDiff.getByText(/"Bob Updated"/)).toBeInTheDocument()
    expect(inDiff.getByText(/"STAFF"/)).toBeInTheDocument()
    expect(inDiff.getByText(/"MANAGER_TEAM"/)).toBeInTheDocument()
  })

  it('shows a friendly empty diff when both sides are null', async () => {
    mockFetchOnce({
      success: true,
      error: null,
      data: {
        items: [
          {
            ...ROW,
            logId: 99,
            oldData: null,
            newData: null,
          },
        ],
        page: 0,
        size: 20,
        totalElements: 1,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      },
    })

    render(wrap(<AuditLogTable />))

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /expand log 99/i })).toBeInTheDocument(),
    )

    await userEvent.click(screen.getByRole('button', { name: /expand log 99/i }))

    expect(
      await screen.findByText(/no payload recorded for this event/i),
    ).toBeInTheDocument()
  })
})
