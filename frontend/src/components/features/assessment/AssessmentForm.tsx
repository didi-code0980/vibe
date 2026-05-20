'use client'

import { useState } from 'react'
import { StarRating } from '@/components/ui/StarRating'
import type { AssessmentSkill } from '@/lib/types'

interface AssessmentFormProps {
  skills: AssessmentSkill[]
  initialRatings?: number[]
}

export function AssessmentForm({ skills, initialRatings = [] }: AssessmentFormProps) {
  const [ratings, setRatings] = useState<number[]>(
    skills.map((_, i) => initialRatings[i] ?? 0)
  )
  const [feedback, setFeedback] = useState('')
  const [saved, setSaved] = useState(false)

  const rated = ratings.filter(r => r > 0).length
  const progress = Math.round((rated / skills.length) * 100)

  const handleRate = (index: number, value: number) => {
    setRatings(prev => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      {/* Progress */}
      <div className="mb-5">
        <div className="flex justify-between text-[12px] text-muted mb-2">
          <span>{rated} of {skills.length} skills rated</span>
          <span>{progress}% complete</span>
        </div>
        <div className="h-1.5 bg-faint rounded-full overflow-hidden">
          <div
            className="h-full bg-teal rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Skill rows */}
      <div className="space-y-1">
        {skills.map((skill, i) => (
          <div
            key={skill.name}
            className="flex items-center justify-between py-3 border-b border-faint last:border-0"
          >
            <div className="flex-1 min-w-0 pr-4">
              <p className="text-[13.5px] font-medium text-ink">{skill.name}</p>
              <p className="text-[11.5px] text-muted mt-0.5">{skill.sub}</p>
            </div>
            <StarRating defaultValue={ratings[i]} onChange={(v) => handleRate(i, v)} />
          </div>
        ))}
      </div>

      {/* Feedback textarea */}
      <div className="mt-5">
        <label className="block text-[12.5px] font-medium text-ink2 mb-1.5">
          Overall feedback
        </label>
        <textarea
          className="w-full rounded-btn border border-faint bg-fog text-[13px] text-ink p-3 resize-none focus:outline-none focus:border-teal/50 focus:ring-1 focus:ring-teal/20 transition-colors"
          rows={3}
          placeholder="Add any additional comments about your skill assessment…"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-btn border border-faint bg-white text-[13px] font-medium text-ink2 hover:bg-fog transition-colors"
        >
          {saved ? 'Saved ✓' : 'Save draft'}
        </button>
        <button className="flex-1 px-4 py-2 rounded-btn bg-teal text-white text-[13px] font-medium hover:bg-teal-dark transition-colors">
          Submit assessment
        </button>
      </div>
    </div>
  )
}
