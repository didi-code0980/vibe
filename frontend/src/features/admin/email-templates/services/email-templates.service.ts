import { apiClient } from '@/lib/api/client'
import { ENDPOINTS } from '@/lib/api/endpoints'
import type { ApiResponse, PageResponse } from '@/lib/api/types'
import type {
  EmailTemplate,
  EmailTemplatePayload,
} from '@/features/admin/email-templates/types/email-template.types'

function unwrap<T>(body: ApiResponse<T>): T {
  if (!body.success || body.data === undefined || body.data === null) {
    throw new Error(body.error?.message ?? 'Request failed')
  }
  return body.data
}

export const emailTemplatesService = {
  list: async (page = 0, size = 20) => {
    const body = await apiClient.get<ApiResponse<PageResponse<EmailTemplate>>>(
      ENDPOINTS.ADMIN.EMAIL_TEMPLATES.LIST,
      { params: { page, size } },
    )
    return unwrap(body)
  },

  getById: async (id: number) => {
    const body = await apiClient.get<ApiResponse<EmailTemplate>>(
      ENDPOINTS.ADMIN.EMAIL_TEMPLATES.DETAIL(id),
    )
    return unwrap(body)
  },

  create: async (payload: EmailTemplatePayload) => {
    const body = await apiClient.post<ApiResponse<EmailTemplate>>(
      ENDPOINTS.ADMIN.EMAIL_TEMPLATES.CREATE,
      payload,
    )
    return unwrap(body)
  },

  update: async (id: number, payload: EmailTemplatePayload) => {
    const body = await apiClient.put<ApiResponse<EmailTemplate>>(
      ENDPOINTS.ADMIN.EMAIL_TEMPLATES.UPDATE(id),
      payload,
    )
    return unwrap(body)
  },
}
