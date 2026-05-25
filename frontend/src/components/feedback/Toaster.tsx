'use client'

import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastVariant = 'success' | 'error' | 'info'

interface ToastItem {
  id: number
  message: string
  variant: ToastVariant
  duration: number
}

type Listener = (toast: ToastItem) => void

let counter = 0
const listeners = new Set<Listener>()

function emit(message: string, variant: ToastVariant, duration: number) {
  const item: ToastItem = { id: ++counter, message, variant, duration }
  listeners.forEach((l) => l(item))
}

export const toast = {
  success: (message: string, duration = 3500) => emit(message, 'success', duration),
  error: (message: string, duration = 4500) => emit(message, 'error', duration),
  info: (message: string, duration = 3500) => emit(message, 'info', duration),
}

const variantStyles: Record<ToastVariant, { bg: string; border: string; icon: typeof CheckCircle2 }> = {
  success: { bg: 'bg-white', border: 'border-teal/40', icon: CheckCircle2 },
  error:   { bg: 'bg-white', border: 'border-danger/40', icon: AlertCircle },
  info:    { bg: 'bg-white', border: 'border-faint',   icon: Info },
}

const iconColor: Record<ToastVariant, string> = {
  success: 'text-teal',
  error: 'text-danger',
  info: 'text-muted',
}

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([])
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map())

  useEffect(() => {
    const onToast: Listener = (toast) => {
      setItems((prev) => [...prev, toast])
      const t = setTimeout(() => {
        setItems((prev) => prev.filter((x) => x.id !== toast.id))
        timers.current.delete(toast.id)
      }, toast.duration)
      timers.current.set(toast.id, t)
    }
    listeners.add(onToast)
    return () => {
      listeners.delete(onToast)
      timers.current.forEach((t) => clearTimeout(t))
      timers.current.clear()
    }
  }, [])

  function dismiss(id: number) {
    const t = timers.current.get(id)
    if (t) clearTimeout(t)
    timers.current.delete(id)
    setItems((prev) => prev.filter((x) => x.id !== id))
  }

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
    >
      {items.map((item) => {
        const { bg, border, icon: Icon } = variantStyles[item.variant]
        return (
          <div
            key={item.id}
            role={item.variant === 'error' ? 'alert' : 'status'}
            className={cn(
              'pointer-events-auto flex items-center gap-2.5 min-w-[260px] max-w-[420px] px-3.5 py-2.5 rounded-card border shadow-sm',
              bg,
              border,
            )}
          >
            <Icon size={16} className={cn('shrink-0', iconColor[item.variant])} aria-hidden="true" />
            <p className="flex-1 text-[13px] text-ink leading-snug">{item.message}</p>
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              aria-label="Dismiss"
              className="shrink-0 text-muted hover:text-ink transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
