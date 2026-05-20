'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { profileService } from '@/features/profile/services/profile.service'
import type {
  UpdateProfilePayload,
  UpdateProfileSettingsPayload,
} from '@/features/profile/types/profile.types'

export const PROFILE_QUERY_KEY = ['profile'] as const
export const PROFILE_SETTINGS_KEY = ['profile', 'settings'] as const
export const PROFILE_TEAM_KEY = ['profile', 'team'] as const
export const PROFILE_HISTORY_KEY = (page: number, size: number) =>
  ['profile', 'assessment-history', page, size] as const

export function useProfile() {
  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: () => profileService.get(),
    staleTime: 60_000,
  })
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => profileService.update(payload),
    onSuccess: (data) => {
      qc.setQueryData(PROFILE_QUERY_KEY, data)
    },
  })
}

export function useUploadAvatar() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => profileService.uploadAvatar(file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PROFILE_QUERY_KEY })
    },
  })
}

export function useProfileSettings() {
  return useQuery({
    queryKey: PROFILE_SETTINGS_KEY,
    queryFn: () => profileService.getSettings(),
  })
}

export function useUpdateProfileSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateProfileSettingsPayload) => profileService.updateSettings(payload),
    onSuccess: (data) => {
      qc.setQueryData(PROFILE_SETTINGS_KEY, data)
    },
  })
}

export function useAssessmentHistory(page = 0, size = 20) {
  return useQuery({
    queryKey: PROFILE_HISTORY_KEY(page, size),
    queryFn: () => profileService.getAssessmentHistory(page, size),
  })
}

export function useMyTeam() {
  return useQuery({
    queryKey: PROFILE_TEAM_KEY,
    queryFn: () => profileService.getMyTeam(),
    retry: false,
  })
}