type Level = 'low' | 'mid' | 'high' | 'expert'

interface SkillBarProps {
  label: string
  sublabel?: string
  percentage: number
  level: Level
}

const fillColor: Record<Level, string> = {
  low:    'bg-warning/75',
  mid:    'bg-accent',
  high:   'bg-teal',
  expert: 'bg-navy',
}

export function SkillBar({ label, sublabel, percentage, level }: SkillBarProps) {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-[12.5px] mb-1.5">
        <span className="text-ink2">{label}</span>
        <span className="font-semibold text-navy">{sublabel}</span>
      </div>
      <div className="h-1.5 bg-faint rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${fillColor[level]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
