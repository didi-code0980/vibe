'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { emailTemplatesService } from '@/features/admin/email-templates/services/email-templates.service'
import type { EmailTemplatePayload } from '@/features/admin/email-templates/types/email-template.types'

export const EMAIL_TEMPLATES_KEY = (page = 0, size = 20) =>
  ['admin', 'email-templates', page, size] as const

export function useEmailTemplates(page = 0, size = 20) {
  return useQuery({
    queryKey: EMAIL_TEMPLATES_KEY(page, size),
    queryFn: () => emailTemplatesService.list(page, size),
  })
}

export function useCreateEmailTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: EmailTemplatePayload) => emailTemplatesService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'email-templates'] }),
  })
}

export function useUpdateEmailTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: EmailTemplatePayload }) =>
      emailTemplatesService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'email-templates'] }),
  })
}
