import { cn } from '@/lib/utils'

type Variant = 'teal' | 'navy' | 'gold' | 'green'

interface KpiCardProps {
  label: string
  value: string | number
  delta?: string
  deltaType?: 'up' | 'down'
  icon: React.ReactNode
  variant?: Variant
}

const iconStyles: Record<Variant, string> = {
  teal:  'bg-teal/10 text-teal',
  navy:  'bg-navy/[0.08] text-navy',
  gold:  'bg-warning/10 text-warning',
  green: 'bg-success/10 text-success',
}

export function KpiCard({ label, value, delta, deltaType = 'up', icon, variant = 'teal' }: KpiCardProps) {
  return (
    <div className="bg-white rounded-card border border-faint p-5 hover:shadow-sm transition-shadow">
      <div className={cn('w-9 h-9 rounded-[9px] flex items-center justify-center mb-3', iconStyles[variant])}>
        {icon}
      </div>
      <p className="text-[11.5px] font-medium text-muted tracking-[0.2px] mb-2">{label}</p>
      <p className="text-[28px] font-semibold text-ink leading-none tracking-tight">{value}</p>
      {delta && (
        <span className={cn(
          'inline-flex items-center gap-1 text-[11.5px] font-medium mt-1.5 px-1.5 py-0.5 rounded-chip',
          deltaType === 'up'   ? 'text-success bg-success/[0.08]' : 'text-danger bg-danger/[0.08]'
        )}>
          {deltaType === 'up' ? '↑' : '↓'} {delta}
        </span>
      )}
    </div>
  )
}
