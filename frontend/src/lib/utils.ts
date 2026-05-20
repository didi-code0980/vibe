import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatScore(score: number): string {
  return `${score}/100`
}

export function getHeatLevel(score: number): 0 | 1 | 2 | 3 | 4 | 5 {
  return Math.max(0, Math.min(5, score)) as 0 | 1 | 2 | 3 | 4 | 5
}

export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}
