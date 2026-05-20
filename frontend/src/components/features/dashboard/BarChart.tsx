'use client'

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import type { DeptChartData } from '@/lib/types'

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-faint rounded-btn px-3 py-2 shadow-sm">
      <p className="text-[12px] text-muted mb-0.5">{label}</p>
      <p className="text-[14px] font-semibold text-teal">{payload[0].value}</p>
    </div>
  )
}

export function BarChart({ data }: { data: DeptChartData[] }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <RechartsBarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }} barCategoryGap="35%">
        <CartesianGrid strokeDasharray="3 3" stroke="#e8eced" vertical={false} />
        <XAxis
          dataKey="dept"
          tick={{ fontSize: 11, fill: '#6b7e87' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#6b7e87' }}
          axisLine={false}
          tickLine={false}
          domain={[0, 100]}
          ticks={[0, 25, 50, 75, 100]}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(40,115,147,0.05)' }} />
        <Bar dataKey="score" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.score >= 80 ? '#287393' : entry.score >= 70 ? '#1ea8cc' : '#D3D4CE'}
            />
          ))}
        </Bar>
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}
