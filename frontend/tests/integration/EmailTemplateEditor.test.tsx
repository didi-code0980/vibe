/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { EmailTemplateEditor } from '@/features/admin/email-templates/components/EmailTemplateEditor'
import type { EmailTemplate } from '@/features/admin/email-templates/types/email-template.types'

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

const existing: EmailTemplate = {
  id: 1,
  name: 'Welcome email',
  subject: 'Welcome {{user_name}}',
  bodyHtml: '<p>Hello {{user_name}}, your password is {{temp_password}}</p>',
  triggerEvent: 'ACCOUNT_CREATED',
  variablesJson: '["user_name","temp_password"]',
  isActive: true,
  createdAt: null,
  updatedAt: null,
}

describe('<EmailTemplateEditor />', () => {
  beforeEach(() => jest.restoreAllMocks())

  it('renders trigger event as a disabled (read-only) input when editing', () => {
    render(wrap(<EmailTemplateEditor editing={existing} />))

    const triggerField = screen.getByLabelText(/trigger event/i) as HTMLInputElement
    expect(triggerField).toBeDisabled()
    expect(triggerField.value).toBe('ACCOUNT_CREATED')
  })

  it('shows variable chips that insert {{name}} into the body when clicked', async () => {
    render(wrap(<EmailTemplateEditor editing={existing} />))

    const userNameChip = screen.getByRole('button', { name: /insert user_name/i })
    expect(userNameChip).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /insert temp_password/i })).toBeInTheDocument()

    const body = screen.getByLabelText(/body html/i) as HTMLTextAreaElement
    await userEvent.click(body)
    body.setSelectionRange(body.value.length, body.value.length)
    await userEvent.click(userNameChip)

    await waitFor(() => expect(body.value).toContain('{{user_name}}'))
  })

  it('submits and shows a saved confirmation', async () => {
    mockFetchOnce({
      success: true,
      error: null,
      data: { ...existing, subject: 'Welcome back {{user_name}}' },
    })

    render(wrap(<EmailTemplateEditor editing={existing} />))

    const subject = screen.getByLabelText(/^subject$/i)
    await userEvent.clear(subject)
    await userEvent.type(subject, 'New subject')

    await userEvent.click(screen.getByRole('button', { name: /save template/i }))

    await waitFor(() => expect(screen.getByText(/saved\./i)).toBeInTheDocument())
  })
})
