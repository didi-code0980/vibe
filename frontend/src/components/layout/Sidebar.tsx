'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'
import {
  LayoutDashboard, User, Grid3X3, ClipboardList,
  Sparkles, GitBranch, BookOpen, Settings, Bot, Briefcase,
  Users, ShieldCheck, Wrench, Badge, Mail, ScrollText,
  type LucideIcon,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { ROLES } from '@/lib/constants/roles'
import type { Role } from '@/lib/constants/roles'

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  requiredRoles?: Role[]
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    label: 'Workspace',
    items: [
      { href: '/dashboard', label: 'Dashboard',  icon: LayoutDashboard },
      { href: '/profile',   label: 'My Profile', icon: User },
    ],
  },
  {
    label: 'Management',
    items: [
      {
        href: '/matrix',
        label: 'Skill Matrix',
        icon: Grid3X3,
        requiredRoles: [ROLES.ADMIN, ROLES.MANAGER],
      },
      { href: '/assessment', label: 'Assessment', icon: ClipboardList },
      {
        href: '/org',
        label: 'Org Chart',
        icon: GitBranch,
        requiredRoles: [ROLES.ADMIN, ROLES.MANAGER],
      },
    ],
  },
  {
    label: 'AI Tools',
    items: [
      { href: '/ai',        label: 'AI-powered Insights', icon: Sparkles  },
      { href: '/agent',     label: 'AI Agent',            icon: Bot       },
      {
        href: '/job-brief',
        label: 'Job Brief',
        icon: Briefcase,
        requiredRoles: [ROLES.ADMIN, ROLES.MANAGER],
      },
    ],
  },
  {
    label: 'Growth',
    items: [
      { href: '/learning', label: 'Learning', icon: BookOpen },
      { href: '/settings', label: 'Settings', icon: Settings },
    ],
  },
  {
    label: 'Admin',
    items: [
      {
        href: '/admin/users',
        label: 'User Management',
        icon: Users,
        requiredRoles: [ROLES.ADMIN],
      },
      {
        href: '/admin/taxonomy',
        label: 'Skill Taxonomy',
        icon: ShieldCheck,
        requiredRoles: [ROLES.ADMIN],
      },
      {
        href: '/admin/positions',
        label: 'Job Titles',
        icon: Badge,
        requiredRoles: [ROLES.ADMIN],
      },
      {
        href: '/admin/config',
        label: 'Configuration',
        icon: Wrench,
        requiredRoles: [ROLES.ADMIN],
      },
      {
        href: '/admin/email-templates',
        label: 'Email Templates',
        icon: Mail,
        requiredRoles: [ROLES.ADMIN],
      },
      {
        href: '/admin/audit-logs',
        label: 'Audit Logs',
        icon: ScrollText,
        requiredRoles: [ROLES.ADMIN],
      },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const user = useAuthStore((s) => s.user)
  const role = user?.role ?? null

  const isVisible = (item: NavItem) =>
    !item.requiredRoles || !role || item.requiredRoles.includes(role)

  return (
    <aside className="w-[220px] bg-navy flex flex-col shrink-0">
      {/* Logo */}
      <div className="h-14 flex items-center px-5 gap-2.5 border-b border-white/[0.06]">
        <div className="w-7 h-7 rounded-[7px] bg-teal flex items-center justify-center text-white text-[13px] font-semibold shrink-0">
          SM
        </div>
        <span className="text-[15px] font-semibold text-white tracking-tight">SkillMatrix</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {navGroups.map((group) => {
          const visibleItems = group.items.filter(isVisible)
          if (visibleItems.length === 0) return null
          return (
            <div key={group.label}>
              <p className="text-[10px] font-medium tracking-[0.8px] uppercase text-white/30 px-5 pt-3.5 pb-1.5">
                {group.label}
              </p>
              {visibleItems.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={clsx(
                    'flex items-center gap-2.5 px-5 py-[9px] text-[13.5px] border-l-2 transition-all',
                    pathname === href
                      ? 'text-white bg-teal/25 border-teal font-medium'
                      : 'text-white/55 border-transparent hover:text-white/85 hover:bg-white/[0.04] font-normal',
                  )}
                >
                  <Icon size={16} className={pathname === href ? 'opacity-100' : 'opacity-70'} />
                  {label}
                </Link>
              ))}
            </div>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-3.5 border-t border-white/[0.06] flex items-center gap-2.5 cursor-pointer">
        <div className="w-8 h-8 rounded-full bg-teal-dark flex items-center justify-center text-white text-xs font-semibold shrink-0">
          {user?.fullName
            ? user.fullName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
            : 'TN'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-white/85 truncate">
            {user?.fullName || 'Loading…'}
          </p>
          <p className="text-[11px] text-white/35">{user?.role ?? 'USER'}</p>
        </div>
      </div>
    </aside>
  )
}
