'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardSubtitle } from '@/components/ui/Card'
import { RecCard } from '@/components/features/ai/RecCard'
import { ChatBot } from '@/components/features/ai/ChatBot'
import { BarChart } from '@/components/features/dashboard/BarChart'
import { SkillBar } from '@/components/ui/SkillBar'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { Chip } from '@/components/ui/Badge'
import { AiInsightBanner } from '@/components/features/dashboard/AiInsightBanner'
import { MockDataWrapper } from '@/components/ui/MockDataWrapper'
import { aiRecs } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

// ─── Tab types ─────────────────────────────────────────────────────────────────

const tabs = [
  'AI Recommendations',
  'Skill Gap Analysis',
  'Career Path',
  'Growth Plan',
] as const
type Tab = typeof tabs[number]

// ─── Skill Gap data ─────────────────────────────────────────────────────────────

const gapData = [
  { dept: 'Current', score: 74 },
  { dept: 'Target',  score: 85 },
]

const gapKpis = [
  { label: 'Current Score', value: 74,    color: 'text-teal'   },
  { label: 'Target Score',  value: 85,    color: 'text-navy'   },
  { label: 'Gap',           value: '−11', color: 'text-danger' },
]

const gapSkills: Array<{ label: string; current: number; target: number; pct: number; level: 'low' | 'mid' | 'high' | 'expert' }> = [
  { label: 'Cloud / AWS',        current: 2, target: 5, pct: 40,  level: 'low'    },
  { label: 'Security Awareness', current: 2, target: 4, pct: 40,  level: 'low'    },
  { label: 'System Design',      current: 3, target: 5, pct: 60,  level: 'mid'    },
  { label: 'Leadership',         current: 3, target: 4, pct: 60,  level: 'mid'    },
  { label: 'Backend Dev',        current: 5, target: 5, pct: 100, level: 'expert' },
]

// ─── Career Path data ───────────────────────────────────────────────────────────

const careerNodes = [
  {
    role: 'Junior Engineer',
    year: '2020–2022',
    done: true,
    current: false,
    suggested: false,
    skills: ['Node.js', 'REST APIs'],
  },
  {
    role: 'Senior Software Engineer',
    year: 'Current',
    done: false,
    current: true,
    suggested: false,
    skills: ['Cypress', 'System Design', 'Backend'],
  },
  {
    role: 'Staff Engineer',
    year: 'Est. Q3 2027',
    done: false,
    current: false,
    suggested: true,
    skills: ['AWS', 'Security', 'Architecture'],
    gap: 'Missing: Cloud / AWS · Security',
  },
  {
    role: 'Engineering Manager',
    year: 'Long-term',
    done: false,
    current: false,
    suggested: false,
    skills: ['Leadership', 'Mentoring', 'Strategy'],
  },
]

// ─── Growth Plan data ───────────────────────────────────────────────────────────

const growthFocus: Array<{ icon: string; title: string; desc: string; progress: number; weeks: number }> = [
  { icon: '☁️', title: 'Cloud Certification Track', desc: 'AWS Solutions Architect — complete 3 modules to unlock badge', progress: 35, weeks: 8 },
  { icon: '🔒', title: 'Security Foundations',      desc: 'OWASP top-10 + secrets management — closes Staff Eng gap',   progress: 10, weeks: 4 },
  { icon: '🏗️', title: 'System Design Deep Dive',   desc: 'Scalability patterns + distributed systems case studies',    progress: 20, weeks: 6 },
  { icon: '👥', title: 'Leadership Essentials',      desc: 'Async communication, 1:1s, team retrospectives framework',   progress: 55, weeks: 3 },
]

// ─── Tab content components ─────────────────────────────────────────────────────

function RecommendationsTab() {
  return (
    <MockDataWrapper>
    <div className="space-y-4">
      <AiInsightBanner
        text={
          <>
            <strong>3 personalized recommendations</strong> generated from your skill profile, recent commits, and Staff Engineer target.
          </>
        }
      />
      <div className="space-y-3">
        {aiRecs.map(rec => <RecCard key={rec.id} rec={rec} />)}
      </div>
    </div>
    </MockDataWrapper>
  )
}

function SkillGapTab() {
  return (
    <MockDataWrapper>
    <div className="space-y-4">
      {/* KPI row */}
      <div className="grid grid-cols-3 gap-3">
        {gapKpis.map(k => (
          <div key={k.label} className="bg-fog rounded-btn p-3 text-center">
            <p className={`text-[24px] font-semibold ${k.color}`}>{k.value}</p>
            <p className="text-[11px] text-muted mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <Card padding="sm">
        <CardTitle className="mb-3">Score Overview</CardTitle>
        <BarChart data={gapData} />
      </Card>

      {/* Per-skill breakdown */}
      <Card padding="sm">
        <CardHeader>
          <CardTitle>Skill-level Breakdown</CardTitle>
          <span className="text-[11px] text-muted">vs. Staff Engineer target</span>
        </CardHeader>
        {gapSkills.map(s => (
          <div key={s.label} className="mb-4">
            <div className="flex justify-between text-[12px] mb-1">
              <span className="text-ink2 font-medium">{s.label}</span>
              <span className="text-muted">{s.current}/5 → <span className="text-navy font-semibold">{s.target}/5</span></span>
            </div>
            <SkillBar label="" percentage={s.pct} level={s.level} />
          </div>
        ))}
      </Card>
    </div>
    </MockDataWrapper>
  )
}

function CareerPathTab() {
  return (
    <MockDataWrapper>
    <div className="space-y-4">
      <AiInsightBanner
        text="Your AI-projected path to Staff Engineer is on track. Closing 2 skill gaps in Cloud & Security would accelerate the timeline by ~6 months."
      />
      <Card>
        <CardHeader>
          <CardTitle>Career Trajectory</CardTitle>
          <Chip color="teal">AI Projected</Chip>
        </CardHeader>
        <div>
          {careerNodes.map((node, i) => (
            <div key={node.role} className="flex items-start gap-4">
              {/* Timeline spine */}
              <div className="flex flex-col items-center shrink-0 pt-0.5">
                <div className={cn(
                  'w-3 h-3 rounded-full border-2',
                  node.done    ? 'border-muted bg-muted' :
                  node.current ? 'border-teal bg-teal' :
                  node.suggested ? 'border-teal bg-white' :
                  'border-faint bg-white'
                )} />
                {i < careerNodes.length - 1 && (
                  <div className={cn(
                    'w-px h-16',
                    node.suggested || (!node.done && !node.current) ? 'border-l border-dashed border-faint' : 'bg-faint'
                  )} />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-6">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className={cn(
                    'text-[14px] font-semibold',
                    node.done ? 'text-muted' : 'text-ink'
                  )}>
                    {node.role}
                  </p>
                  {node.current   && <Chip color="teal">Current</Chip>}
                  {node.suggested && <Chip color="gold">AI Suggested</Chip>}
                  {node.done      && <Chip color="warm">Completed</Chip>}
                </div>
                <p className="text-[12px] text-muted mt-0.5 mb-2">{node.year}</p>
                <div className="flex flex-wrap gap-1.5">
                  {node.skills.map(s => (
                    <span key={s} className="text-[11px] px-2 py-0.5 rounded-chip bg-fog border border-faint text-ink2">{s}</span>
                  ))}
                </div>
                {node.gap && (
                  <p className="text-[12px] text-danger mt-2 font-medium">⚠ {node.gap}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
    </MockDataWrapper>
  )
}

function GrowthPlanTab() {
  return (
    <MockDataWrapper>
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {/* Overall progress ring */}
        <Card className="flex items-center gap-5">
          <ProgressRing percentage={38} size={88} label="38%" sublabel="complete" />
          <div>
            <p className="text-[13.5px] font-semibold text-ink">Q2 Growth Plan</p>
            <p className="text-[12px] text-muted mt-0.5">Apr – Jun 2026</p>
            <p className="text-[12px] text-warning font-medium mt-2">2 of 4 tracks started</p>
          </div>
        </Card>

        {/* Streak */}
        <Card className="flex flex-col justify-between">
          <p className="text-[13.5px] font-semibold text-ink">Learning Streak</p>
          <div className="flex items-end gap-1 mt-2">
            {[3,5,2,6,4,7,5].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm bg-teal/80"
                style={{ height: h * 6 }}
              />
            ))}
          </div>
          <p className="text-[11.5px] text-muted mt-1.5">Last 7 days · <span className="text-teal font-medium">4.6h avg</span></p>
        </Card>
      </div>

      {/* Growth tracks */}
      <Card>
        <CardHeader>
          <CardTitle>Personalized Growth Tracks</CardTitle>
          <CardSubtitle>Tailored to your career goal: Staff Engineer</CardSubtitle>
        </CardHeader>
        <div className="space-y-4">
          {growthFocus.map(track => (
            <div key={track.title} className="flex gap-3 p-3 rounded-btn border border-faint hover:border-teal/20 hover:shadow-sm transition-all">
              <div className="w-10 h-10 rounded-[10px] bg-teal/10 flex items-center justify-center text-xl shrink-0">
                {track.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[13.5px] font-semibold text-ink">{track.title}</p>
                  <span className="text-[11px] text-muted shrink-0">~{track.weeks}w</span>
                </div>
                <p className="text-[12px] text-muted mt-0.5 mb-2">{track.desc}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-faint rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal rounded-full"
                      style={{ width: `${track.progress}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-teal shrink-0">{track.progress}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
    </MockDataWrapper>
  )
}

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function AiPage() {
  const [activeTab, setActiveTab] = useState<Tab>('AI Recommendations')

  return (
    <div className="flex gap-5 max-w-[1200px]" style={{ alignItems: 'flex-start' }}>
      {/* Left — tab area */}
      <div className="flex-1 min-w-0 space-y-4">
        {/* Tab nav */}
        <div className="flex gap-1 bg-white border border-faint rounded-btn p-1 w-fit flex-wrap">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-3.5 py-1.5 rounded-[6px] text-[12.5px] font-medium transition-all whitespace-nowrap',
                activeTab === tab
                  ? 'bg-teal text-white shadow-sm'
                  : 'text-muted hover:text-ink2'
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'AI Recommendations' && <RecommendationsTab />}
        {activeTab === 'Skill Gap Analysis'  && <SkillGapTab />}
        {activeTab === 'Career Path'         && <CareerPathTab />}
        {activeTab === 'Growth Plan'         && <GrowthPlanTab />}
      </div>

      {/* Right — persistent ChatBot */}
      <Card style={{ width: 300, minWidth: 280 }}>
        <CardHeader>
          <div>
            <CardTitle>AI Skill Coach</CardTitle>
            <CardSubtitle>Ask anything about your skills</CardSubtitle>
          </div>
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
        </CardHeader>
        <ChatBot />
      </Card>
    </div>
  )
}
