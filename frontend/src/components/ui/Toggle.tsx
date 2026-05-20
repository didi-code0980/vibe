'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface ToggleProps {
  defaultChecked?: boolean
  onChange?: (value: boolean) => void
}

export function Toggle({ defaultChecked = false, onChange }: ToggleProps) {
  const [on, setOn] = useState(defaultChecked)

  const toggle = () => {
    const next = !on
    setOn(next)
    onChange?.(next)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        'relative w-9 h-5 rounded-full transition-colors duration-200',
        on ? 'bg-teal' : 'bg-faint'
      )}
    >
      <span className={cn(
        'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200',
        on ? 'left-[18px]' : 'left-0.5'
      )} />
    </button>
  )
}
