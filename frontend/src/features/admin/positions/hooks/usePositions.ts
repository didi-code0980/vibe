'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { positionsService } from '@/features/admin/positions/services/positions.service'
import type {
  PositionCreatePayload,
  PositionUpdatePayload,
} from '@/features/admin/positions/types/position.types'

export const POSITIONS_KEY = (params: { page?: number; size?: number; keyword?: string } = {}) =>
  ['admin', 'positions', params] as const

export function usePositions(params: { page?: number; size?: number; keyword?: string } = {}) {
  return useQuery({
    queryKey: POSITIONS_KEY(params),
    queryFn: () => positionsService.list(params),
  })
}

export function useCreatePosition() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: PositionCreatePayload) => positionsService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'positions'] }),
  })
}

export function useUpdatePosition() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: PositionUpdatePayload }) =>
      positionsService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'positions'] }),
  })
}

export function useDeletePosition() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => positionsService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'positions'] }),
  })
}
