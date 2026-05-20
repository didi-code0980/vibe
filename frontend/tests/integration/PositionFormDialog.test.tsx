/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { PositionFormDialog } from '@/features/admin/positions/components/PositionFormDialog'

function wrap(ui: ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={qc}>{ui}</QueryClientProvider>
}

interface MockedCall {
  url: string
  init?: RequestInit
}

function installFetchRouter(
  routes: Record<string, { body: unknown; ok?: boolean; status?: number }>,
) {
  // @ts-expect-error overriding fetch in jsdom
  global.fetch = jest.fn().mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString()
    const matchKey = Object.keys(routes).find((k) => url.includes(k))
    const route = matchKey
      ? routes[matchKey]
      : { body: { success: true, error: null, data: null }, ok: true, status: 200 }
    ;((global.fetch as jest.Mock).mock as unknown as { calls: MockedCall[] }).calls
    return Promise.resolve({
      ok: route.ok ?? true,
      status: route.status ?? 200,
      statusText: 'OK',
      json: async () => route.body,
      // Keep init for assertions
      __init: init,
    } as unknown as Response)
  })
}

const SKILLS_PAGE = {
  body: {
    success: true,
    error: null,
    data: {
      items: [
        { skillId: 11, name: 'Java', status: 'ACTIVE' },
        { skillId: 12, name: 'ReactJS', status: 'ACTIVE' },
      ],
      page: 0,
      size: 200,
      totalElements: 2,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
    },
  },
}

describe('<PositionFormDialog />', () => {
  beforeEach(() => jest.restoreAllMocks())

  it('blocks submit when name is blank', async () => {
    installFetchRouter({ '/skills': SKILLS_PAGE })
    render(wrap(<PositionFormDialog open={true} onClose={() => undefined} editing={null} />))
    await userEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(await screen.findByText(/position name is required/i)).toBeInTheDocument()
  })

  it('submits and closes when input is valid', async () => {
    installFetchRouter({
      '/skills': SKILLS_PAGE,
      '/admin/positions': {
        body: {
          success: true,
          error: null,
          data: { positionId: 1, name: 'Backend', requiredSkills: [], status: 'ACTIVE' },
        },
      },
    })
    const close = jest.fn()

    render(wrap(<PositionFormDialog open={true} onClose={close} editing={null} />))
    await userEvent.type(screen.getByLabelText(/name/i), 'Backend')
    await userEvent.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => expect(close).toHaveBeenCalled())
  })

  it('populates the skill dropdown with names from /api/skills', async () => {
    installFetchRouter({ '/skills': SKILLS_PAGE })

    render(wrap(<PositionFormDialog open={true} onClose={() => undefined} editing={null} />))

    await userEvent.click(screen.getByRole('button', { name: /\+ add skill/i }))

    const select = await screen.findByRole('combobox', { name: /skill #1/i })
    expect(select).toBeInTheDocument()

    // Options should include both skill names returned by the API
    expect(screen.getByRole('option', { name: 'Java' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'ReactJS' })).toBeInTheDocument()
  })

  it('rejects submit when a required skill row has no skill selected', async () => {
    installFetchRouter({ '/skills': SKILLS_PAGE })

    render(wrap(<PositionFormDialog open={true} onClose={() => undefined} editing={null} />))
    await userEvent.type(screen.getByLabelText(/name/i), 'Backend')
    await userEvent.click(screen.getByRole('button', { name: /\+ add skill/i }))
    await userEvent.click(screen.getByRole('button', { name: /save/i }))

    expect(await screen.findByText(/skill is required/i)).toBeInTheDocument()
  })
})
