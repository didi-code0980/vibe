interface AiInsightBannerProps {
  text: React.ReactNode
}

export function AiInsightBanner({ text }: AiInsightBannerProps) {
  return (
    <div className="flex gap-3 p-4 rounded-card border border-teal/15 bg-gradient-to-r from-teal/[0.06] to-navy/[0.04]">
      <div className="w-7 h-7 rounded-lg bg-teal flex items-center justify-center text-white text-[13px] shrink-0">
        ✦
      </div>
      <p className="text-[13px] text-ink2 leading-[1.55]">{text}</p>
    </div>
  )
}
