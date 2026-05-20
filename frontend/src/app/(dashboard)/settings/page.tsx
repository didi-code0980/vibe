'use client'

import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Toggle } from '@/components/ui/Toggle'

const notifications = [
  { label: 'Assessment reminders',  sub: 'Get notified before assessment deadlines',       on: true  },
  { label: 'AI skill insights',     sub: 'Weekly personalized skill gap summaries',        on: true  },
  { label: 'Team skill updates',    sub: 'Alerts when teammates complete assessments',     on: false },
  { label: 'Course completions',    sub: 'Confirmation when you finish a course module',  on: true  },
]

const privacy = [
  { label: 'Share profile with managers', sub: 'Managers can view your full skill profile',         on: true },
  { label: 'Allow AI analysis of my work', sub: 'AI uses your activity to generate skill insights', on: true },
  { label: 'Appear in org chart',          sub: 'Your card is visible in the org chart view',       on: true },
]

function ToggleRow({ label, sub, defaultOn }: { label: string; sub: string; defaultOn: boolean }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-faint last:border-0">
      <div className="flex-1 min-w-0 pr-6">
        <p className="text-[13.5px] font-medium text-ink">{label}</p>
        <p className="text-[12px] text-muted mt-0.5">{sub}</p>
      </div>
      <Toggle defaultChecked={defaultOn} />
    </div>
  )
}

export default function SettingsPage() {
  return (
    <div className="flex gap-5 max-w-[1000px]" style={{ alignItems: 'flex-start' }}>
      {/* Left — Account */}
      <Card style={{ width: 340, minWidth: 300 }}>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <div className="space-y-3.5">
          <div>
            <label className="block text-[12px] font-medium text-ink2 mb-1.5">Full name</label>
            <input
              type="text"
              defaultValue="Thinh Nguyen"
              className="w-full rounded-btn border border-faint bg-fog px-3 py-2 text-[13px] text-ink focus:outline-none focus:border-teal/50 focus:ring-1 focus:ring-teal/20 transition-colors"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-ink2 mb-1.5">Job title</label>
            <input
              type="text"
              defaultValue="Senior Software Engineer"
              className="w-full rounded-btn border border-faint bg-fog px-3 py-2 text-[13px] text-ink focus:outline-none focus:border-teal/50 focus:ring-1 focus:ring-teal/20 transition-colors"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-ink2 mb-1.5">Email</label>
            <input
              type="email"
              defaultValue="thinh.nguyen@company.com"
              className="w-full rounded-btn border border-faint bg-fog px-3 py-2 text-[13px] text-ink focus:outline-none focus:border-teal/50 focus:ring-1 focus:ring-teal/20 transition-colors"
            />
          </div>
          <button className="w-full py-2 rounded-btn bg-teal text-white text-[13px] font-medium hover:bg-teal-dark transition-colors mt-1">
            Save changes
          </button>
        </div>
      </Card>

      {/* Right — stacked cards */}
      <div className="flex-1 min-w-0 space-y-4">
        <Card>
          <CardTitle className="mb-1">Notifications</CardTitle>
          <p className="text-[12px] text-muted mb-3">Manage how you receive updates</p>
          {notifications.map(n => (
            <ToggleRow key={n.label} label={n.label} sub={n.sub} defaultOn={n.on} />
          ))}
        </Card>

        <Card>
          <CardTitle className="mb-1">Privacy & AI</CardTitle>
          <p className="text-[12px] text-muted mb-3">Control how your data is used</p>
          {privacy.map(p => (
            <ToggleRow key={p.label} label={p.label} sub={p.sub} defaultOn={p.on} />
          ))}
        </Card>
      </div>
    </div>
  )
}
