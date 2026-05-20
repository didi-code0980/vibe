'use client'

import { useState } from 'react'
import type { MatrixEmployee } from '@/lib/types'

const heatColors: Record<number, string> = {
  0: 'bg-warm/40 text-muted border border-faint',
  1: 'bg-teal/20 text-navy',
  2: 'bg-teal/45 text-white',
  3: 'bg-teal/70 text-white',
  4: 'bg-teal text-white',
  5: 'bg-navy text-white',
}

const levelLabels = ['Not rated','Beginner','Basic','Intermediate','Advanced','Expert']

interface TooltipInfo {
  skill: string
  employee: string
  level: string
  score: number
  x: number
  y: number
}

interface HeatmapGridProps {
  employees: MatrixEmployee[]
  skills: string[]
}

export function HeatmapGrid({ employees, skills }: HeatmapGridProps) {
  const [tooltip, setTooltip] = useState<TooltipInfo | null>(null)

  return (
    <div className="overflow-x-auto">
      {/* Color Legend */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <span className="text-[11.5px] text-muted font-medium">Level:</span>
        {levelLabels.map((label, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className={`w-5 h-5 rounded text-[9px] flex items-center justify-center font-medium ${heatColors[i]}`}>{i}</span>
            <span className="text-[11px] text-muted">{label}</span>
          </div>
        ))}
      </div>

      <div className="relative">
        <table className="border-separate border-spacing-1 min-w-max">
          <thead>
            <tr>
              <th className="w-[150px] min-w-[150px]" />
              {skills.map((skill) => (
                <th key={skill} className="text-[11px] font-medium text-muted pb-2 px-1 text-center min-w-[80px]">
                  {skill}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id}>
                <td className="pr-3 py-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-semibold shrink-0"
                      style={{ backgroundColor: emp.avatarBg }}
                    >
                      {emp.initials}
                    </div>
                    <span className="text-[12.5px] font-medium text-ink2 whitespace-nowrap">{emp.name}</span>
                  </div>
                </td>
                {emp.scores.map((score, si) => (
                  <td key={si} className="text-center">
                    <div
                      className={`w-full h-9 rounded flex items-center justify-center text-[12px] font-semibold cursor-pointer transition-opacity hover:opacity-80 ${heatColors[score as keyof typeof heatColors]}`}
                      onMouseEnter={(e) => {
                        const rect = (e.target as HTMLElement).getBoundingClientRect()
                        setTooltip({
                          skill: skills[si],
                          employee: emp.name,
                          level: levelLabels[score],
                          score,
                          x: rect.left + rect.width / 2,
                          y: rect.top - 10,
                        })
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    >
                      {score}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {tooltip && (
          <div
            className="fixed z-50 bg-white border border-faint rounded-btn shadow-md px-3 py-2 pointer-events-none -translate-x-1/2 -translate-y-full"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            <p className="text-[12px] font-semibold text-ink">{tooltip.skill}</p>
            <p className="text-[11px] text-muted">{tooltip.employee}</p>
            <p className="text-[11px] text-teal font-medium mt-0.5">{tooltip.level} ({tooltip.score}/5)</p>
          </div>
        )}
      </div>
    </div>
  )
}
