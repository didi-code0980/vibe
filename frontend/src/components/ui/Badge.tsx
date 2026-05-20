import { cn } from '@/lib/utils'

type Color = 'teal' | 'navy' | 'gold' | 'green' | 'red' | 'warm'

interface ChipProps {
  color?: Color
  children: React.ReactNode
  className?: string
}

const chipStyles: Record<Color, string> = {
  teal: 'bg-teal/10 text-teal',
  navy: 'bg-navy/[0.08] text-navy',
  gold: 'bg-warning/10 text-warning',
  green:'bg-success/10 text-success',
  red:  'bg-danger/[0.08] text-danger',
  warm: 'bg-warm text-ink2',
}

export function Chip({ color = 'teal', children, className }: ChipProps) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-chip text-[11.5px] font-medium', chipStyles[color], className)}>
      {children}
    </span>
  )
}

interface StatusProps { color: 'green' | 'gold' | 'red' | 'warm'; children: React.ReactNode }

const statusStyles: Record<string, string> = {
  green: 'bg-success/10 text-success',
  gold:  'bg-warning/10 text-warning',
  red:   'bg-danger/[0.08] text-danger',
  warm:  'bg-warm text-muted',
}
const dotStyles: Record<string, string> = {
  green: 'bg-success', gold: 'bg-warning', red: 'bg-danger', warm: 'bg-muted',
}

export function Status({ color, children }: StatusProps) {
  return (
    <span className={cn('inline-flex items-center gap-1 text-[11.5px] font-medium px-2 py-0.5 rounded-chip', statusStyles[color])}>
      <span className={cn('w-[5px] h-[5px] rounded-full', dotStyles[color])} />
      {children}
    </span>
  )
}
