import { Download } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardSubtitle } from '@/components/ui/Card'
import { HeatmapGrid } from '@/components/features/matrix/HeatmapGrid'
import { MockDataWrapper } from '@/components/ui/MockDataWrapper'
import { matrixData, skillColumns } from '@/lib/mock-data'

export default function MatrixPage() {
  return (
    <div className="max-w-[1200px] space-y-4">
      <MockDataWrapper>
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Skill Matrix — Engineering Team</CardTitle>
            <CardSubtitle>5 members · 10 skills · Last updated Apr 2026</CardSubtitle>
          </div>
          <button className="flex items-center gap-1.5 text-[12.5px] font-medium text-muted border border-faint rounded-btn px-3 py-1.5 hover:bg-fog transition-colors">
            <Download size={13} />
            Export
          </button>
        </CardHeader>
        <HeatmapGrid employees={matrixData} skills={skillColumns} />
      </Card>
      </MockDataWrapper>
    </div>
  )
}
