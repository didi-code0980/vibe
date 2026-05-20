/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { EmailTemplateList } from '@/features/admin/email-templates/components/EmailTemplateList'

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

describe('<EmailTemplateList />', () => {
  beforeEach(() => jest.restoreAllMocks())

  it('renders an Active badge for active templates and Inactive for the rest', async () => {
    mockFetchOnce({
      success: true,
      error: null,
      data: {
        items: [
          {
            id: 1,
            name: 'Welcome',
            subject: 'Hi',
            bodyHtml: '<p>Hi</p>',
            triggerEvent: 'ACCOUNT_CREATED',
            isActive: true,
            createdAt: null,
            updatedAt: null,
          },
          {
            id: 2,
            name: 'Goal suggested',
            subject: 'A goal',
            bodyHtml: '<p>x</p>',
            triggerEvent: 'GOAL_SUGGESTED',
            isActive: false,
            createdAt: null,
            updatedAt: null,
          },
        ],
        page: 0,
        size: 20,
        totalElements: 2,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      },
    })

    render(wrap(<EmailTemplateList />))

    await waitFor(() => expect(screen.getByText('Welcome')).toBeInTheDocument())

    const welcomeRow = screen.getByText('Welcome').closest('li')!
    const goalRow = screen.getByText('Goal suggested').closest('li')!

    expect(welcomeRow).toHaveTextContent(/active/i)
    expect(goalRow).toHaveTextContent(/inactive/i)
  })

  it('does not show a "New" button (events are fixed, no arbitrary creation)', async () => {
    mockFetchOnce({
      success: true,
      error: null,
      data: { items: [], page: 0, size: 20, totalElements: 0, totalPages: 0, hasNext: false, hasPrevious: false },
    })

    render(wrap(<EmailTemplateList />))

    await waitFor(() => expect(screen.getByText(/no templates yet/i)).toBeInTheDocument())
    expect(screen.queryByRole('button', { name: /^new$/i })).not.toBeInTheDocument()
  })
})
