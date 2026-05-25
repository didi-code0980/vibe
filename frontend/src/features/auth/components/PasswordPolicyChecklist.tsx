'use client'

import { Check, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Rule {
  label: string
  passed: boolean
}

interface Props {
  value: string
  currentPassword?: string
  className?: string
}

export function PasswordPolicyChecklist({ value, currentPassword, className }: Props) {
  const rules: Rule[] = [
    { label: 'At least 8 characters', passed: value.length >= 8 },
    { label: 'At least one uppercase letter (A–Z)', passed: /[A-Z]/.test(value) },
    { label: 'At least one number (0–9)', passed: /[0-9]/.test(value) },
  ]

  if (currentPassword !== undefined) {
    rules.push({
      label: 'Different from current password',
      passed: value.length > 0 && value !== currentPassword,
    })
  }

  return (
    <ul className={cn('mt-2 space-y-1', className)} aria-label="Password requirements">
      {rules.map((rule) => (
        <li
          key={rule.label}
          className={cn(
            'flex items-center gap-2 text-[12px] transition-colors',
            rule.passed ? 'text-teal' : 'text-muted',
          )}
        >
          {rule.passed ? (
            <Check size={13} strokeWidth={2.5} aria-hidden="true" />
          ) : (
            <Circle size={13} aria-hidden="true" className="opacity-50" />
          )}
          <span>{rule.label}</span>
        </li>
      ))}
    </ul>
  )
}
