export const ROLES = {
  ADMIN:   'ADMIN',
  MANAGER: 'MANAGER',
  USER:    'USER',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]
