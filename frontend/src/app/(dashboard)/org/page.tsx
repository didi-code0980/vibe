import { Card, CardHeader, CardTitle, CardSubtitle } from '@/components/ui/Card'
import { OrgChart } from '@/components/features/org/OrgChart'

export default function OrgPage() {
  return (
    <div className="max-w-[1100px]">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Organization Chart</CardTitle>
            <CardSubtitle>Technology Division · 4 members shown</CardSubtitle>
          </div>
        </CardHeader>
        <OrgChart />
      </Card>
    </div>
  )
}
