interface ProgressRingProps {
  percentage: number
  size?: number
  strokeWidth?: number
  label?: string
  sublabel?: string
}

export function ProgressRing({ percentage, size = 96, strokeWidth = 8, label, sublabel }: ProgressRingProps) {
  const r = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference * (1 - percentage / 100)

  return (
    <div className="relative inline-flex">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e8eced" strokeWidth={strokeWidth} />
        <circle
          cx={size/2} cy={size/2} r={r} fill="none"
          stroke="#287393" strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      {(label || sublabel) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {label    && <span className="text-xl font-semibold text-teal leading-none">{label}</span>}
          {sublabel && <span className="text-[10px] text-muted mt-0.5">{sublabel}</span>}
        </div>
      )}
    </div>
  )
}
