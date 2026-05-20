'use client'

import { useEffect, useState } from 'react'
import { profileService } from '@/features/profile/services/profile.service'
import type { ProfileResponse } from '@/features/profile/types/profile.types'

interface ProfileState {
  data: ProfileResponse | null
  loading: boolean
  error: string | null
}

export function useCurrentProfile(): ProfileState {
  const [state, setState] = useState<ProfileState>({ data: null, loading: true, error: null })

  useEffect(() => {
    let cancelled = false
    profileService
      .get()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null })
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setState({
            data: null,
            loading: false,
            error: err instanceof Error ? err.message : 'Failed to load profile',
          })
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  return state
}