'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Search, MessageSquare, Flag, LogOut, Monitor, Server } from 'lucide-react'
import { authService } from '@/features/auth/services/auth.service'
import { NotificationsBell } from '@/features/notifications/components/NotificationsBell'

const pageTitles: Record<string, string> = {
  '/dashboard':  'Dashboard',
  '/profile':    'My Profile',
  '/matrix':     'Skill Matrix',
  '/assessment': 'Assessment · Q1 2026',
  '/ai':         'AI-powered Insights',
  '/agent':      'AI Agent',
  '/job-brief':  'Job Brief',
  '/org':        'Organization Chart',
  '/learning':   'Learning',
  '/settings':   'Settings',
}

function AvatarMenu() {
  const [open, setOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
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

  return (
    <div ref={ref} className="relative">
      {/* Avatar button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-[26px] h-[26px] rounded-full bg-teal-dark flex items-center justify-center text-white text-[10px] font-semibold hover:opacity-85 transition-opacity"
        aria-haspopup="true"
        aria-expanded={open}
      >
        TN
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-56 bg-white rounded-card border border-faint shadow-[0_4px_20px_rgba(0,0,0,0.08)] z-50 py-1 overflow-hidden">

          {/* User identity */}
          <div className="px-4 py-3 border-b border-faint">
            <p className="text-[13px] font-semibold text-ink">Thinh Nguyen</p>
            <p className="text-[11.5px] text-muted mt-0.5">Senior Engineer</p>
          </div>

          {/* Version info */}
          <div className="px-4 py-2.5 border-b border-faint space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[11.5px] text-muted">
                <Monitor size={12} className="shrink-0" />
                Frontend
              </span>
              <span className="text-[11px] font-mono text-ink2 bg-fog px-1.5 py-0.5 rounded">v1.0.0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[11.5px] text-muted">
                <Server size={12} className="shrink-0" />
                API
              </span>
              <span className="text-[11px] font-mono text-ink2 bg-fog px-1.5 py-0.5 rounded">v1.0.1</span>
            </div>
          </div>

          {/* Actions */}
          <div className="py-1">
            <button
              onClick={() => setOpen(false)}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-ink2 hover:bg-fog transition-colors text-left"
            >
              <Flag size={14} className="text-muted shrink-0" />
              Report an issue
            </button>

            <button
              disabled={loggingOut}
              onClick={async () => {
                setLoggingOut(true)
                await authService.logout()
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-danger hover:bg-danger/5 transition-colors text-left disabled:opacity-50"
            >
              <LogOut size={14} className="shrink-0" />
              {loggingOut ? 'Signing out…' : 'Sign out'}
            </button>
          </div>

        </div>
      )}
    </div>
  )
}

export function TopHeader() {
  const pathname = usePathname()
  const title = pageTitles[pathname] ?? 'SkillMatrix'

  return (
    <header className="h-14 bg-white border-b border-faint flex items-center px-7 gap-4 shrink-0">
      <h1 className="text-[15px] font-semibold text-ink tracking-tight flex-1">{title}</h1>

      <div className="flex items-center gap-2.5">
        {/* Search */}
        <div className="flex items-center gap-2 bg-fog border border-faint rounded-[20px] px-3 py-1.5 text-[13px] text-muted w-48 cursor-text">
          <Search size={13} />
          <span>Search…</span>
        </div>

        {/* Notifications */}
        <NotificationsBell />

        {/* Chat */}
        <button className="w-8 h-8 rounded-btn border border-faint bg-white flex items-center justify-center text-muted hover:bg-fog transition-colors">
          <MessageSquare size={15} />
        </button>

        <AvatarMenu />
      </div>
    </header>
  )
}
