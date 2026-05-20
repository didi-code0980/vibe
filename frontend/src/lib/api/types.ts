export interface ApiResponse<T> {
  data: T
  success: boolean
  error: ErrorResponse | null
}

export interface ErrorResponse {
  message: string
  errorCode: number
  details: Record<string, string> | null
}

export interface PageResponse<T> {
  items: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}
