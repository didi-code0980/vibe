/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { RatingScalePanel } from '@/features/admin/config/components/RatingScalePanel'

function wrap(ui: ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={qc}>{ui}</QueryClientProvider>
}

function mockFetchSequence(responses: unknown[]) {
  let i = 0
  // @ts-expect-error overriding fetch in jsdom
  global.fetch = jest.fn().mockImplementation(() => {
    const next = responses[Math.min(i, responses.length - 1)]
    i += 1
    return Promise.resolve({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => next,
    })
  })
}

describe('<RatingScalePanel />', () => {
  beforeEach(() => jest.restoreAllMocks())

  it('renders 5 rows pre-filled from API', async () => {
    mockFetchSequence([
      {
        success: true,
        error: null,
        data: {
          items: [1, 2, 3, 4, 5].map((level) => ({
            level,
            label: `Lv${level}`,
            description: null,
          })),
        },
      },
    ])

    render(wrap(<RatingScalePanel />))

    await waitFor(() => expect(screen.getByDisplayValue('Lv1')).toBeInTheDocument())
    expect(screen.getByDisplayValue('Lv5')).toBeInTheDocument()
  })

  it('saves all 5 rows on submit', async () => {
    const responses = [
      {
        success: true,
        error: null,
        data: {
          items: [1, 2, 3, 4, 5].map((level) => ({
            level,
            label: `Lv${level}`,
            description: null,
          })),
        },
      },
      {
        success: true,
        error: null,
        data: {
          items: [1, 2, 3, 4, 5].map((level) => ({
            level,
            label: `Updated${level}`,
            description: null,
          })),
        },
      },
    ]
    mockFetchSequence(responses)

    render(wrap(<RatingScalePanel />))

    await waitFor(() => expect(screen.getByDisplayValue('Lv1')).toBeInTheDocument())

    await userEvent.click(screen.getByRole('button', { name: /save rating scale/i }))

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/config/rating-scale'),
        expect.objectContaining({ method: 'PUT' }),
      ),
    )
  })
})
