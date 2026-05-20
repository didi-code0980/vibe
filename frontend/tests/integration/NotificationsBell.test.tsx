/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { NotificationsBell } from '@/features/notifications/components/NotificationsBell'

const pushMock = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}))

function wrap(ui: ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={qc}>{ui}</QueryClientProvider>
}

type FetchResponse = { ok?: boolean; status?: number; body: unknown }

function mockFetchByUrl(map: Record<string, FetchResponse | FetchResponse[]>) {
  const cursors: Record<string, number> = {}
  // @ts-expect-error overriding fetch in jsdom
  global.fetch = jest.fn().mockImplementation((url: string, init?: RequestInit) => {
    const key = Object.keys(map).find((k) => url.includes(k))
    if (!key) throw new Error(`Unexpected fetch URL: ${url}`)
    const entry = map[key]
    let response: FetchResponse
    if (Array.isArray(entry)) {
      const i = cursors[key] ?? 0
      response = entry[Math.min(i, entry.length - 1)]
      cursors[key] = i + 1
    } else {
      response = entry
    }
    return Promise.resolve({
      ok: response.ok ?? true,
      status: response.status ?? 200,
      statusText: 'OK',
      json: async () => response.body,
      // method captured indirectly via mock.calls
      _method: init?.method,
    })
  })
}

function listEnvelope(items: unknown[]) {
  return {
    success: true,
    error: null,
    data: {
      items,
      page: 0,
      size: 10,
      totalElements: items.length,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
    },
  }
}

function buildNotification(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    type: 'DOCUMENT_ASSIGNED',
    title: 'You have a new document',
    body: 'Open it before Friday.',
    relatedEntityType: 'DOCUMENT',
    relatedEntityId: 99,
    isRead: false,
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

describe('<NotificationsBell />', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
    pushMock.mockReset()
  })

  it('renders the unread badge when count > 0', async () => {
    mockFetchByUrl({
      '/api/notifications/unread-count': { body: { success: true, error: null, data: { count: 3 } } },
      '/api/notifications': { body: listEnvelope([buildNotification()]) },
    })

    render(wrap(<NotificationsBell />))

    await waitFor(() => expect(screen.getByTestId('notifications-badge')).toHaveTextContent('3'))
  })

  it('hides the badge when unread count is 0', async () => {
    mockFetchByUrl({
      '/api/notifications/unread-count': { body: { success: true, error: null, data: { count: 0 } } },
      '/api/notifications': { body: listEnvelope([]) },
    })

    render(wrap(<NotificationsBell />))

    await waitFor(() => expect(screen.getByLabelText('Notifications')).toBeInTheDocument())
    expect(screen.queryByTestId('notifications-badge')).not.toBeInTheDocument()
  })

  it('opens dropdown, marks row as read, and navigates on click', async () => {
    const user = userEvent.setup()
    mockFetchByUrl({
      '/api/notifications/unread-count': { body: { success: true, error: null, data: { count: 1 } } },
      '/api/notifications/1/read': {
        body: { success: true, error: null, data: { ...buildNotification(), isRead: true } },
      },
      '/api/notifications': { body: listEnvelope([buildNotification()]) },
    })

    render(wrap(<NotificationsBell />))

    await waitFor(() => expect(screen.getByTestId('notifications-badge')).toBeInTheDocument())
    await user.click(screen.getByLabelText('Notifications'))
    const row = await screen.findByRole('menuitem', { name: /you have a new document/i })
    await user.click(row)

    await waitFor(() =>
      expect(pushMock).toHaveBeenCalledWith('/learning?docId=99'),
    )
  })

  it('shows empty state when there are no notifications', async () => {
    const user = userEvent.setup()
    mockFetchByUrl({
      '/api/notifications/unread-count': { body: { success: true, error: null, data: { count: 0 } } },
      '/api/notifications': { body: listEnvelope([]) },
    })

    render(wrap(<NotificationsBell />))

    await user.click(screen.getByLabelText('Notifications'))
    expect(await screen.findByText(/you have no notifications/i)).toBeInTheDocument()
  })

  it('Mark all read button is disabled when count = 0', async () => {
    const user = userEvent.setup()
    mockFetchByUrl({
      '/api/notifications/unread-count': { body: { success: true, error: null, data: { count: 0 } } },
      '/api/notifications': { body: listEnvelope([]) },
    })

    render(wrap(<NotificationsBell />))

    await user.click(screen.getByLabelText('Notifications'))
    const btn = await screen.findByRole('button', { name: /mark all read/i })
    expect(btn).toBeDisabled()
  })

  it('Mark all read triggers PATCH and refetches unread count', async () => {
    const user = userEvent.setup()
    mockFetchByUrl({
      '/api/notifications/unread-count': [
        { body: { success: true, error: null, data: { count: 2 } } },
        { body: { success: true, error: null, data: { count: 0 } } },
      ],
      '/api/notifications/read-all': {
        body: { success: true, error: null, data: { count: 2 } },
      },
      '/api/notifications': { body: listEnvelope([buildNotification()]) },
    })

    render(wrap(<NotificationsBell />))

    await waitFor(() => expect(screen.getByTestId('notifications-badge')).toBeInTheDocument())
    await user.click(screen.getByLabelText('Notifications'))
    const btn = await screen.findByRole('button', { name: /mark all read/i })
    await user.click(btn)

    await waitFor(() => {
      const patchCall = (global.fetch as jest.Mock).mock.calls.find(
        ([url]) => typeof url === 'string' && url.includes('/api/notifications/read-all'),
      )
      expect(patchCall).toBeDefined()
      expect((patchCall![1] as RequestInit).method).toBe('PATCH')
    })
  })
})
