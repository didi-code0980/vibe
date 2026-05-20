'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, CheckCheck } from 'lucide-react'
import {
  useMarkAllAsRead,
  useMarkAsRead,
  useNotifications,
  useUnreadCount,
} from '@/features/notifications/hooks/useNotifications'
import { routeFor } from '@/features/notifications/lib/routeFor'
import { timeAgo } from '@/features/notifications/lib/timeAgo'
import type { NotificationItem } from '@/features/notifications/types/notification.types'

export function NotificationsBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const { data: countData } = useUnreadCount()
  const { data: list, isLoading } = useNotifications({ size: 10 })
  const markOne = useMarkAsRead()
  const markAll = useMarkAllAsRead()

  const unreadCount = countData?.count ?? 0

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [])

  async function handleClickRow(n: NotificationItem) {
    if (!n.isRead) {
      try {
        await markOne.mutateAsync(n.id)
      } catch {
        // swallow — UI still navigates
      }
    }
    const target = routeFor(n)
    setOpen(false)
    if (target) router.push(target)
  }

  async function handleMarkAll() {
    if (unreadCount === 0) return
    await markAll.mutateAsync()
  }

  const items = list?.items ?? []

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Notifications"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative w-8 h-8 rounded-btn border border-faint bg-white flex items-center justify-center text-muted hover:bg-fog transition-colors"
      >
        <Bell size={15} />
        {unreadCount > 0 && (
          <span
            data-testid="notifications-badge"
            className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-teal text-white text-[10px] font-semibold flex items-center justify-center border-2 border-white"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Notifications"
          className="absolute right-0 top-[calc(100%+8px)] w-[360px] bg-white rounded-card border border-faint shadow-[0_4px_20px_rgba(0,0,0,0.08)] z-50 overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-faint">
            <p className="text-[13px] font-semibold text-ink">Notifications</p>
            <button
              type="button"
              onClick={handleMarkAll}
              disabled={unreadCount === 0 || markAll.isPending}
              className="inline-flex items-center gap-1 text-[12px] text-teal hover:underline disabled:text-muted disabled:no-underline disabled:cursor-not-allowed"
            >
              <CheckCheck size={12} />
              Mark all read
            </button>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {isLoading && (
              <p className="px-4 py-8 text-center text-[12.5px] text-muted">Loading…</p>
            )}
            {!isLoading && items.length === 0 && (
              <p className="px-4 py-8 text-center text-[12.5px] text-muted">
                You have no notifications.
              </p>
            )}
            {items.map((n) => (
              <button
                key={n.id}
                type="button"
                role="menuitem"
                onClick={() => handleClickRow(n)}
                className={`w-full text-left px-4 py-3 border-b border-faint last:border-0 hover:bg-fog transition-colors ${
                  !n.isRead ? 'bg-teal/[0.04]' : ''
                }`}
              >
                <div className="flex items-start gap-2">
                  {!n.isRead && (
                    <span
                      data-testid={`unread-dot-${n.id}`}
                      className="mt-1.5 w-1.5 h-1.5 rounded-full bg-teal shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-[13px] truncate ${
                        !n.isRead ? 'font-semibold text-ink' : 'text-ink2'
                      }`}
                    >
                      {n.title}
                    </p>
                    {n.body && (
                      <p className="text-[12px] text-muted mt-0.5 line-clamp-2">{n.body}</p>
                    )}
                    <p className="text-[11px] text-muted mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
