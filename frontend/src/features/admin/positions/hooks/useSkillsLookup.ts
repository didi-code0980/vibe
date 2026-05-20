'use client'

import { useQuery } from '@tanstack/react-query'
import { skillsLookupService } from '@/features/admin/positions/services/skills-lookup.service'

export const SKILLS_LOOKUP_KEY = ['admin', 'positions', 'skills-lookup'] as const

export function useSkillsLookup() {
  return useQuery({
    queryKey: SKILLS_LOOKUP_KEY,
    queryFn: () => skillsLookupService.list(),
    staleTime: 5 * 60 * 1000,
  })
}
