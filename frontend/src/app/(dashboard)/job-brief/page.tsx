'use client'

import { useState, useRef } from 'react'
import {
  Upload, Clock, Users, Sparkles, ArrowUpDown, Filter,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardSubtitle } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import { MockDataWrapper } from '@/components/ui/MockDataWrapper'
import { analyzeJobBrief } from '@/lib/mock-data'
import type { JobBriefAnalysis, MatchedEmployee } from '@/lib/types'

type SortKey = 'suitabilityScore' | 'availableCapacity' | 'name'
type SortDir  = 'asc' | 'desc'

// ─── Analysis Summary ────────────────────────────────────────────────────────────

function AnalysisSummary({ result }: { result: JobBriefAnalysis }) {
  const kpis = [
    { icon: Clock,    label: 'Est. Timeline', value: `${result.timelineWeeks} weeks`, sub: `~${Math.ceil(result.timelineWeeks / 4)} months`, color: 'text-teal',    bg: 'bg-teal/10'     },
    { icon: Users,    label: 'Team Size',      value: result.teamSize,                sub: `${result.suggestedRoles.length} roles`,          color: 'text-navy',    bg: 'bg-navy/[0.08]' },
    { icon: Sparkles, label: 'AI Confidence',  value: `${result.confidence}%`,        sub: 'analysis accuracy',                             color: 'text-warning', bg: 'bg-warning/10'  },
  ]
  return (
    <div className="grid grid-cols-3 gap-4 mb-4">
      {kpis.map(({ icon: Icon, label, value, sub, color, bg }) => (
        <div key={label} className="bg-white rounded-card border border-faint p-4 hover:shadow-sm transition-shadow">
          <div className={cn('w-9 h-9 rounded-[9px] flex items-center justify-center mb-3', bg)}>
            <Icon size={17} className={color} />
          </div>
          <p className="text-[11.5px] text-muted font-medium mb-1">{label}</p>
          <p className="text-[24px] font-semibold text-ink leading-none">{value}</p>
          <p className="text-[11px] text-muted mt-1">{sub}</p>
        </div>
      ))}
    </div>
  )
}

// ─── Suggested Roles ─────────────────────────────────────────────────────────────

function RolesSection({ result }: { result: JobBriefAnalysis }) {
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Recommended Roles</CardTitle>
        <CardSubtitle>{result.suggestedRoles.length} distinct roles · {result.teamSize} headcount</CardSubtitle>
      </CardHeader>
      <div className="grid grid-cols-2 gap-3">
        {result.suggestedRoles.map(r => (
          <div key={r.role} className="flex gap-3 p-3 rounded-btn border border-faint bg-fog">
            <div className="w-8 h-8 rounded-btn bg-teal/10 flex items-center justify-center shrink-0">
              <Users size={14} className="text-teal" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-[13px] font-semibold text-ink">{r.role}</p>
                <span className="text-[11px] font-medium text-teal bg-teal/10 px-1.5 py-0.5 rounded-chip">×{r.count}</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {r.skills.map(s => (
                  <span key={s} className="text-[10.5px] px-1.5 py-0.5 rounded-chip bg-white border border-faint text-ink2">{s}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

// ─── Employee Table ───────────────────────────────────────────────────────────────

function SuitabilityBar({ score }: { score: number }) {
  const bar   = score >= 80 ? 'bg-teal'      : score >= 60 ? 'bg-accent'   : 'bg-warning/75'
  const text  = score >= 80 ? 'text-teal'    : score >= 60 ? 'text-accent' : 'text-warning'
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-faint rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full', bar)} style={{ width: `${score}%` }} />
      </div>
      <span className={cn('text-[12.5px] font-semibold', text)}>{score}%</span>
    </div>
  )
}

function CapacityBadge({ pct }: { pct: number }) {
  const color = pct >= 60 ? 'text-success' : pct >= 30 ? 'text-warning' : 'text-danger'
  return <span className={cn('text-[12.5px] font-semibold', color)}>{pct}% free</span>
}

function EmployeeTable({ employees }: { employees: MatchedEmployee[] }) {
  const [sortKey,    setSortKey]    = useState<SortKey>('suitabilityScore')
  const [sortDir,    setSortDir]    = useState<SortDir>('desc')
  const [filterDept, setFilterDept] = useState('All')

  const departments = ['All', ...Array.from(new Set(employees.map(e => e.department)))]

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const rows = [...employees]
    .filter(e => filterDept === 'All' || e.department === filterDept)
    .sort((a, b) => {
      const av = a[sortKey] as string | number
      const bv = b[sortKey] as string | number
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return sortDir === 'asc' ? cmp : -cmp
    })

  const SortBtn = ({ col }: { col: SortKey }) => (
    <button onClick={() => handleSort(col)} className="inline-flex">
      <ArrowUpDown size={11} className={sortKey === col ? 'text-teal' : 'text-muted/50'} />
    </button>
  )

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Matched Employees</CardTitle>
          <CardSubtitle>{rows.length} of {employees.length} employees match</CardSubtitle>
        </div>
        <div className="flex items-center gap-1.5">
          <Filter size={13} className="text-muted" />
          <div className="flex gap-1 flex-wrap">
            {departments.map(d => (
              <button
                key={d}
                onClick={() => setFilterDept(d)}
                className={cn(
                  'text-[11.5px] px-2.5 py-0.5 rounded-chip transition-colors',
                  filterDept === d ? 'bg-teal text-white' : 'bg-faint text-muted hover:text-ink2'
                )}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-faint">
              {([
                ['Employee',       null               ],
                ['Role',           null               ],
                ['Suitability',    'suitabilityScore' ],
                ['Capacity',       'availableCapacity'],
                ['Matched Skills', null               ],
              ] as [string, SortKey | null][]).map(([col, key]) => (
                <th key={col} className="text-[11px] font-medium text-muted pb-2.5 text-left pr-4 last:pr-0">
                  <span className="flex items-center gap-1">{col}{key && <SortBtn col={key} />}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(emp => (
              <tr key={emp.id} className="border-b border-faint last:border-0 hover:bg-fog transition-colors">
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-semibold shrink-0"
                      style={{ backgroundColor: emp.avatarBg }}
                    >
                      {emp.initials}
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-ink leading-none">{emp.name}</p>
                      <p className="text-[11px] text-muted mt-0.5">{emp.department}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 pr-4 text-[12.5px] text-ink2 whitespace-nowrap">{emp.role}</td>
                <td className="py-3 pr-4"><SuitabilityBar score={emp.suitabilityScore} /></td>
                <td className="py-3 pr-4"><CapacityBadge pct={emp.availableCapacity} /></td>
                <td className="py-3">
                  <div className="flex flex-wrap gap-1">
                    {emp.matchedSkills.slice(0, 4).map(s => (
                      <span key={s} className="text-[10.5px] px-1.5 py-0.5 rounded-chip bg-teal/10 text-teal font-medium">{s}</span>
                    ))}
                    {emp.matchedSkills.length > 4 && (
                      <span className="text-[10.5px] px-1.5 py-0.5 rounded-chip bg-faint text-muted">+{emp.matchedSkills.length - 4}</span>
                    )}
                    {emp.matchedSkills.length === 0 && <span className="text-[11px] text-muted">—</span>}
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-[13px] text-muted">No employees match this filter.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────────

export default function JobBriefPage() {
  const fileRef = useRef<HTMLInputElement>(null)

  const [description,  setDescription]  = useState('')
  const [goals,        setGoals]         = useState('')
  const [fileName,     setFileName]      = useState('')
  const [analyzing,    setAnalyzing]     = useState(false)
  const [result,       setResult]        = useState<JobBriefAnalysis | null>(null)

  const canSubmit = description.trim().length >= 20

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    setFileName(f ? f.name : '')
  }

  const handleAnalyze = () => {
    if (!canSubmit) return
    setAnalyzing(true)
    setResult(null)
    setTimeout(() => {
      setResult(analyzeJobBrief({ description, goals, docType: 'JD', fileName, fileContent: fileName }))
      setAnalyzing(false)
    }, 1400)
  }

  const handleReset = () => {
    setDescription('')
    setGoals('')
    setFileName('')
    if (fileRef.current) fileRef.current.value = ''
    setResult(null)
  }

  return (
    <div className="max-w-[1100px] space-y-5">

      {/* ── Input form ───────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Project Brief</CardTitle>
            <CardSubtitle>Describe the project and let AI analyse timeline, team size, and best-fit employees</CardSubtitle>
          </div>
          {result && (
            <button
              onClick={handleReset}
              className="text-[12.5px] text-muted border border-faint rounded-btn px-3 py-1.5 hover:bg-fog transition-colors"
            >
              New analysis
            </button>
          )}
        </CardHeader>

        <div className="space-y-4">

          {/* Project description */}
          <div>
            <label className="block text-[12px] font-medium text-ink2 mb-1.5">
              Project description / Job Description <span className="text-danger">*</span>
            </label>
            <textarea
              rows={5}
              className="w-full rounded-btn border border-faint bg-fog text-[13px] text-ink p-3 resize-none focus:outline-none focus:border-teal/50 focus:ring-1 focus:ring-teal/20 transition-colors"
              placeholder="Describe the project scope, required skills, tech stack, and deliverables… (min 20 characters)"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
            <p className="text-[11px] text-muted mt-1">{description.length} characters</p>
          </div>

          {/* Goals */}
          <div>
            <label className="block text-[12px] font-medium text-ink2 mb-1.5">
              Project goals &amp; success criteria
            </label>
            <input
              type="text"
              className="w-full rounded-btn border border-faint bg-fog text-[13px] text-ink px-3 py-2.5 focus:outline-none focus:border-teal/50 focus:ring-1 focus:ring-teal/20 transition-colors"
              placeholder="e.g. Deliver MVP in 3 months, 99% uptime, support 10k concurrent users…"
              value={goals}
              onChange={e => setGoals(e.target.value)}
            />
          </div>

          {/* File upload */}
          <div>
            <label className="block text-[12px] font-medium text-ink2 mb-1.5">
              Upload document <span className="text-muted font-normal">(optional · PDF, DOC, DOCX, TXT)</span>
            </label>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 px-3 py-2 rounded-btn border border-faint bg-fog text-[13px] text-ink2 cursor-pointer hover:border-teal/40 hover:bg-white transition-colors">
                <Upload size={14} className="text-teal shrink-0" />
                <span>{fileName || 'Choose file…'}</span>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
              {fileName && (
                <button
                  type="button"
                  onClick={() => { setFileName(''); if (fileRef.current) fileRef.current.value = '' }}
                  className="text-[12px] text-muted hover:text-danger transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={handleAnalyze}
              disabled={!canSubmit || analyzing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-btn bg-teal text-white text-[13.5px] font-medium hover:bg-teal-dark transition-colors disabled:opacity-40"
            >
              {analyzing ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Analysing…
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  Analyse with AI
                </>
              )}
            </button>
            {!canSubmit && (
              <p className="text-[12px] text-muted">Minimum 20 characters required in the description.</p>
            )}
          </div>
        </div>
      </Card>

      {/* ── Results ───────────────────────────────────────────────────────── */}
      {result && (
        <MockDataWrapper>
          <div className="space-y-4">
            <div className="flex gap-3 p-4 rounded-card border border-teal/15 bg-gradient-to-r from-teal/[0.06] to-navy/[0.04]">
              <div className="w-7 h-7 rounded-lg bg-teal flex items-center justify-center text-white text-[13px] shrink-0">✦</div>
              <p className="text-[13px] text-ink2 leading-[1.55]">{result.summary}</p>
            </div>
            <AnalysisSummary result={result} />
            <RolesSection result={result} />
            <EmployeeTable employees={result.matchedEmployees} />
          </div>
        </MockDataWrapper>
      )}
    </div>
  )
}
