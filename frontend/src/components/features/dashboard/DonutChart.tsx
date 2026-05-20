'use client'

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import type { DonutDataItem } from '@/lib/types'

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number }>
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-faint rounded-btn px-3 py-2 shadow-sm">
      <p className="text-[12px] text-muted">{payload[0].name}</p>
      <p className="text-[14px] font-semibold text-teal">{payload[0].value}%</p>
    </div>
  )
}

export function DonutChart({ data, centerLabel }: { data: DonutDataItem[]; centerLabel?: string }) {
  return (
    <div className="flex items-center gap-5">
      <div className="relative shrink-0" style={{ width: 120, height: 120 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={38}
              outerRadius={56}
              paddingAngle={2}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {centerLabel && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-semibold text-teal leading-none">{centerLabel}</span>
            <span className="text-[10px] text-muted mt-0.5">avg</span>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
            <span className="text-[12px] text-ink2">{item.name}</span>
            <span className="text-[12px] font-medium text-muted ml-auto pl-3">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
