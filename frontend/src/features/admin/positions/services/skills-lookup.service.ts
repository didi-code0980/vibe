import { apiClient } from '@/lib/api/client'
import { ENDPOINTS } from '@/lib/api/endpoints'
import type { ApiResponse, PageResponse } from '@/lib/api/types'

export interface SkillOption {
  skillId: number
  name: string
}

interface RawSkill {
  skillId: number
  name: string
  status?: string
}

function unwrap<T>(body: ApiResponse<T>): T {
  if (!body.success || body.data === undefined || body.data === null) {
    throw new Error(body.error?.message ?? 'Failed to load skills')
  }
  return body.data
}

export const skillsLookupService = {
  list: async (): Promise<SkillOption[]> => {
    const body = await apiClient.get<ApiResponse<PageResponse<RawSkill>>>(
      ENDPOINTS.SKILLS.LIST,
      { params: { page: 0, size: 200 } },
    )
    const page = unwrap(body)
    return page.items.map((s) => ({ skillId: s.skillId, name: s.name }))
  },
}
