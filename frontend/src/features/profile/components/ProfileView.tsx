'use client'

import { Lock } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardSubtitle } from '@/components/ui/Card'
import { Chip } from '@/components/ui/Badge'
import { SkillBar } from '@/components/ui/SkillBar'
import { MockDataWrapper } from '@/components/ui/MockDataWrapper'
import { useProfile, useUpdateProfile } from '@/features/profile/hooks/useProfile'
import { InlineEditableField } from '@/features/profile/components/InlineEditableField'
import { AvatarUploader } from '@/features/profile/components/AvatarUploader'
import { toast } from '@/components/feedback/Toaster'
import type { ProfileResponse } from '@/features/profile/types/profile.types'

const PHONE_RE = /^[+]?[0-9\-\s]{7,20}$/

function validatePhone(next: string): string | null {
  if (!next) return null
  return PHONE_RE.test(next) ? null : 'Invalid phone number'
}

function validateFullName(next: string): string | null {
  if (!next) return 'Full name is required'
  if (next.length > 150) return 'Full name is too long'
  return null
}

function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

function calcTenure(createdAt: string): string {
  const months = Math.floor(
    (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30.5),
  )
  if (months < 1) return '<1mo'
  if (months < 12) return `${months}mo`
  const years = Math.floor(months / 12)
  const rem = months % 12
  return rem > 0 ? `${years}y ${rem}mo` : `${years}y`
}

function formatMemberSince(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(d)
}

function jobTitle(data: ProfileResponse): string {
  return data.positions[0]?.name ?? data.careerName ?? data.role
}

function positionsText(data: ProfileResponse): string {
  if (data.positions.length === 0) return '—'
  return data.positions.map((p) => p.name).join(', ')
}

interface ReadOnlyFieldProps {
  label: string
  value: string
  tooltip?: string
}

function ReadOnlyField({ label, value, tooltip }: ReadOnlyFieldProps) {
  return (
    <div>
      <p className="text-[11px] font-medium text-muted uppercase tracking-wide mb-0.5">
        {label}
      </p>
      <div
        className="flex items-center gap-1.5 bg-fog rounded-btn px-2 py-1.5 border border-faint"
        title={tooltip}
      >
        <span className="flex-1 min-w-0 truncate text-[13px] text-ink2" title={value}>
          {value || '—'}
        </span>
        <Lock
          size={12}
          className="shrink-0 text-muted opacity-60"
          aria-label={tooltip ? `${label} is read-only. ${tooltip}` : `${label} is read-only`}
        />
      </div>
    </div>
  )
}

const placeholderSkills: Array<{
  label: string
  sublabel: string
  pct: number
  level: 'low' | 'mid' | 'high' | 'expert'
}> = [
  { label: 'Backend Development',   sublabel: 'Expert',       pct: 92, level: 'expert' },
  { label: 'Cypress / E2E Testing', sublabel: 'Advanced',     pct: 80, level: 'high'   },
  { label: 'System Design',         sublabel: 'Intermediate', pct: 65, level: 'mid'    },
  { label: 'Cloud / AWS',           sublabel: 'Learning',     pct: 42, level: 'low'    },
]

const placeholderTimeline = [
  { year: '2020–2022',  role: 'Junior Engineer',          current: false, suggested: false, faint: false },
  { year: 'Current',    role: 'Senior Software Engineer', current: true,  suggested: false, faint: false },
  { year: 'Est. Q3 2027', role: 'Staff Engineer',         current: false, suggested: true,  faint: false },
  { year: 'Long-term',  role: 'Engineering Manager',      current: false, suggested: false, faint: true  },
]

function ProfileSkeleton() {
  return (
    <div className="flex gap-5 max-w-[1100px]" style={{ alignItems: 'flex-start' }}>
      <div className="shrink-0 bg-white rounded-card p-5 animate-pulse" style={{ width: 260 }}>
        <div className="flex flex-col items-center gap-3 mb-5">
          <div className="w-[72px] h-[72px] rounded-full bg-faint" />
          <div className="h-4 w-32 bg-faint rounded" />
          <div className="h-3 w-24 bg-faint rounded" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-14 bg-faint rounded-btn" />
          ))}
        </div>
      </div>
      <div className="flex-1 space-y-4">
        <div className="bg-white rounded-card p-5 h-40 animate-pulse" />
        <div className="bg-white rounded-card p-5 h-48 animate-pulse" />
      </div>
    </div>
  )
}

export function ProfileView() {
  const { data, isLoading, error } = useProfile()
  const update = useUpdateProfile()

  if (isLoading) return <ProfileSkeleton />

  if (error) {
    return (
      <div className="max-w-[480px] bg-white rounded-card border border-faint p-8 text-center">
        <p className="text-[14px] font-medium text-ink mb-1.5">Unable to load profile</p>
        <p className="text-[13px] text-muted">
          {error instanceof Error ? error.message : 'Failed to load profile'}
        </p>
      </div>
    )
  }

  if (!data) return null

  async function saveFullName(next: string) {
    if (!data) return
    await update.mutateAsync({ fullName: next, phone: data.phone })
    toast.success('Saved')
  }

  async function savePhone(next: string) {
    if (!data) return
    await update.mutateAsync({ fullName: data.fullName, phone: next ? next : null })
    toast.success('Saved')
  }

  const stats = [
    { label: 'Department', value: data.departmentName ?? '—' },
    { label: 'Team',       value: data.teamName       ?? '—' },
    { label: 'Role',       value: data.role           ?? '—' },
    { label: 'Tenure',     value: calcTenure(data.createdAt)  },
  ]

  return (
    <div className="flex gap-5 max-w-[1100px]" style={{ alignItems: 'flex-start' }}>
      {/* Left — identity card */}
      <Card className="shrink-0" style={{ width: 260 }}>
        <div className="flex flex-col items-center text-center mb-5">
          <div className="mb-3 flex flex-col items-center">
            <AvatarUploader
              initials={getInitials(data.fullName)}
              currentAvatarUrl={data.userAvatar}
            />
          </div>
          <p
            className="text-[16px] font-semibold text-ink max-w-full truncate"
            title={data.fullName}
          >
            {data.fullName}
          </p>
          <p className="text-[12.5px] text-muted mt-0.5 max-w-full truncate" title={jobTitle(data)}>
            {jobTitle(data)}
          </p>
          <div className="flex flex-wrap gap-1.5 justify-center mt-3">
            {data.departmentName && <Chip color="navy">{data.departmentName}</Chip>}
            {data.teamName       && <Chip color="teal">{data.teamName}</Chip>}
            {data.positions[0]   && <Chip color="gold">{data.positions[0].name}</Chip>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="bg-fog rounded-btn p-3 text-center">
              <p className="text-[13px] font-semibold text-ink truncate" title={s.value}>
                {s.value}
              </p>
              <p className="text-[11px] text-muted mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Right column */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        {/* Contact & Info */}
        <Card>
          <CardHeader>
            <CardTitle>Contact & Info</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-2 gap-10 text-[13px]">
            <InlineEditableField
              label="Full name"
              value={data.fullName}
              onSave={saveFullName}
              validate={validateFullName}
              maxLength={150}
              autoComplete="name"
            />
            <InlineEditableField
              label="Phone"
              value={data.phone ?? ''}
              onSave={savePhone}
              validate={validatePhone}
              type="tel"
              autoComplete="tel"
              placeholder="Add a phone number"
            />
            <ReadOnlyField
              label="Email"
              value={data.email}
              tooltip="Contact admin to change."
            />
            <ReadOnlyField label="Role" value={data.role} tooltip="Contact admin to change." />
            <ReadOnlyField
              label="Position"
              value={positionsText(data)}
              tooltip="Contact admin to change."
            />
            <ReadOnlyField
              label="Team"
              value={data.teamName ?? '—'}
              tooltip="Contact admin to change."
            />
            <ReadOnlyField label="Member since" value={formatMemberSince(data.createdAt)} />
            <ReadOnlyField
              label="Status"
              value={data.status}
              tooltip="Contact admin to change."
            />
          </div>
        </Card>

        {/* Skill Proficiency */}
        <MockDataWrapper>
          <Card>
            <CardHeader>
              <CardTitle>Skill Proficiency</CardTitle>
              <CardSubtitle>Last assessed Mar 28</CardSubtitle>
            </CardHeader>
            {placeholderSkills.map((s) => (
              <SkillBar
                key={s.label}
                label={s.label}
                sublabel={s.sublabel}
                percentage={s.pct}
                level={s.level}
              />
            ))}
          </Card>
        </MockDataWrapper>

        {/* Career Path */}
        <MockDataWrapper>
          <Card>
            <CardHeader>
              <CardTitle>Career Path</CardTitle>
              <Chip color="teal">AI Assisted</Chip>
            </CardHeader>
            <div className="flex flex-col gap-0">
              {placeholderTimeline.map((node, i) => (
                <div key={node.role} className="flex items-start gap-4">
                  <div className="flex flex-col items-center shrink-0">
                    <div
                      className={`w-3 h-3 rounded-full border-2 mt-0.5 ${
                        node.current
                          ? 'border-teal bg-teal'
                          : node.suggested
                            ? 'border-teal bg-white'
                            : node.faint
                              ? 'border-faint bg-white'
                              : 'border-muted bg-muted'
                      }`}
                    />
                    {i < placeholderTimeline.length - 1 && (
                      <div
                        className={`w-px flex-1 ${node.faint || node.suggested ? 'border-l border-dashed border-faint h-10' : 'bg-faint h-10'}`}
                      />
                    )}
                  </div>
                  <div className="pb-5">
                    <div className="flex items-center gap-2">
                      <p
                        className={`text-[13.5px] font-medium ${node.faint ? 'text-muted' : 'text-ink'}`}
                      >
                        {node.role}
                      </p>
                      {node.current && <Chip color="teal">Current</Chip>}
                      {node.suggested && <Chip color="gold">AI Suggested</Chip>}
                    </div>
                    <p className="text-[12px] text-muted mt-0.5">{node.year}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </MockDataWrapper>
      </div>
    </div>
  )
}
