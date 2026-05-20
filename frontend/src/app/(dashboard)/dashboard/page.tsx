import { Users, TrendingUp, ClipboardCheck, BookCheck } from 'lucide-react'
import { KpiCard } from '@/components/ui/KpiCard'
import { Card, CardHeader, CardTitle, CardSubtitle } from '@/components/ui/Card'
import { Status } from '@/components/ui/Badge'
import { BarChart } from '@/components/features/dashboard/BarChart'
import { DonutChart } from '@/components/features/dashboard/DonutChart'
import { AiInsightBanner } from '@/components/features/dashboard/AiInsightBanner'
import { MockDataWrapper } from '@/components/ui/MockDataWrapper'
import { kpiData, deptChartData, donutData, recentAssessments } from '@/lib/mock-data'

const kpiIcons = [
  <Users size={18} key="users" />,
  <TrendingUp size={18} key="trend" />,
  <ClipboardCheck size={18} key="clip" />,
  <BookCheck size={18} key="book" />,
]

const statusMap: Record<string, 'green' | 'gold' | 'warm'> = {
  completed:   'green',
  'in-progress': 'gold',
  pending:     'warm',
}
const statusLabel: Record<string, string> = {
  completed:    'Completed',
  'in-progress': 'In progress',
  pending:      'Pending',
}

export default function DashboardPage() {
  return (
    <div className="space-y-5 max-w-[1200px]">
      {/* KPI row */}
      <MockDataWrapper>
        <div className="grid grid-cols-4 gap-4">
          {kpiData.map((kpi, i) => (
            <KpiCard
              key={kpi.label}
              label={kpi.label}
              value={kpi.value}
              delta={kpi.delta}
              deltaType={kpi.deltaType}
              icon={kpiIcons[i]}
              variant={kpi.variant}
            />
          ))}
        </div>
      </MockDataWrapper>

      {/* Charts row */}
      <MockDataWrapper>
        <div className="grid grid-cols-[1fr_auto] gap-4">
          {/* Bar chart — 65% */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Skill Score by Department</CardTitle>
                <CardSubtitle>Average across all employees · Q1 2026</CardSubtitle>
              </div>
            </CardHeader>
            <BarChart data={deptChartData} />
          </Card>

          {/* Donut chart — 35% */}
          <Card style={{ minWidth: 260, maxWidth: 300 }}>
            <CardHeader>
              <div>
                <CardTitle>Skill Level Distribution</CardTitle>
                <CardSubtitle>All employees</CardSubtitle>
              </div>
            </CardHeader>
            <DonutChart data={donutData} centerLabel="74" />
          </Card>
        </div>
      </MockDataWrapper>

      {/* AI Banner */}
      <MockDataWrapper>
        <AiInsightBanner
          text={
            <>
              <strong>AI Insight:</strong> The Sales team is 18 pts below the company average. Recommend enrolling 12 reps in
              &ldquo;Consultative Selling Fundamentals&rdquo; to close the gap before Q2 reviews.{' '}
              <button className="text-teal font-medium hover:underline">View recommendations →</button>
            </>
          }
        />
      </MockDataWrapper>

      {/* Recent Assessments */}
      <MockDataWrapper>
      <Card padding="sm">
        <CardHeader>
          <div>
            <CardTitle>Recent Assessments</CardTitle>
            <CardSubtitle>Latest submissions across all teams</CardSubtitle>
          </div>
          <button className="text-[12px] text-teal font-medium hover:underline">View all</button>
        </CardHeader>
        <table className="w-full">
          <thead>
            <tr className="border-b border-faint">
              {['Employee','Department','Skill Area','Score','Status','Date'].map(col => (
                <th key={col} className="text-[11px] font-medium text-muted pb-2.5 text-left last:text-right">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentAssessments.map((row) => (
              <tr key={row.id} className="border-b border-faint last:border-0 hover:bg-fog transition-colors">
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-semibold shrink-0"
                      style={{ backgroundColor: row.avatarBg }}
                    >
                      {row.initials}
                    </div>
                    <span className="text-[13px] font-medium text-ink">{row.name}</span>
                  </div>
                </td>
                <td className="py-3 pr-4 text-[13px] text-ink2">{row.department}</td>
                <td className="py-3 pr-4 text-[13px] text-ink2">{row.skillArea}</td>
                <td className="py-3 pr-4 text-[13px] font-semibold text-navy">{row.score}</td>
                <td className="py-3 pr-4">
                  <Status color={statusMap[row.status]}>
                    {statusLabel[row.status]}
                  </Status>
                </td>
                <td className="py-3 text-[12.5px] text-muted text-right">{row.date ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      </MockDataWrapper>
    </div>
  )
}
