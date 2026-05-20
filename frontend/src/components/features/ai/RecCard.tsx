import { Chip } from '@/components/ui/Badge'
import type { AiRecommendation } from '@/lib/types'

const priorityColor: Record<AiRecommendation['priority'], 'red' | 'gold' | 'teal'> = {
  'High priority':   'red',
  'Medium priority': 'gold',
  'Career goal':     'teal',
}

export function RecCard({ rec }: { rec: AiRecommendation }) {
  return (
    <div className="flex gap-3 p-4 rounded-card border border-faint hover:border-teal/20 hover:shadow-sm transition-all">
      <div className="w-10 h-10 rounded-[10px] bg-teal/10 flex items-center justify-center text-xl shrink-0">
        {rec.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[13.5px] font-semibold text-ink">{rec.title}</p>
          <Chip color={priorityColor[rec.priority]} className="shrink-0">{rec.priority}</Chip>
        </div>
        <p className="text-[12.5px] text-muted mt-1 leading-relaxed">{rec.reason}</p>
        <button className="mt-2.5 text-[12px] font-medium text-teal hover:text-teal-dark transition-colors">
          Enroll →
        </button>
      </div>
    </div>
  )
}
