'use client'

import { Card, CardHeader, CardTitle, CardSubtitle } from '@/components/ui/Card'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { AssessmentForm } from '@/components/features/assessment/AssessmentForm'
import { AiInsightBanner } from '@/components/features/dashboard/AiInsightBanner'
import { MockDataWrapper } from '@/components/ui/MockDataWrapper'
import { assessmentSkills } from '@/lib/mock-data'

const initialRatings = [5, 4, 3, 0, 4, 3, 0, 2, 0, 0]

export default function AssessmentPage() {
  return (
    <div className="flex gap-5 max-w-[1100px]" style={{ alignItems: 'flex-start' }}>
      {/* Left — form (65%) */}
      <MockDataWrapper className="flex-1 min-w-0">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Q1 2026 Self-Assessment</CardTitle>
              <CardSubtitle>Rate your proficiency in each skill area</CardSubtitle>
            </div>
          </CardHeader>
          <AssessmentForm skills={assessmentSkills} initialRatings={initialRatings} />
        </Card>
      </MockDataWrapper>

      {/* Right (35%) */}
      <div className="flex flex-col gap-4" style={{ width: 280, minWidth: 260 }}>
        {/* Progress card */}
        <MockDataWrapper>
          <Card>
            <CardTitle className="mb-4">Assessment Progress</CardTitle>
            <div className="flex items-center gap-4">
              <ProgressRing percentage={60} label="60%" sublabel="done" />
              <div>
                <p className="text-[12.5px] text-muted">Due date</p>
                <p className="text-[13.5px] font-semibold text-ink">Apr 15, 2026</p>
                <p className="text-[12px] text-warning mt-2 font-medium">10 days remaining</p>
              </div>
            </div>
          </Card>
        </MockDataWrapper>

        {/* AI insight */}
        <MockDataWrapper>
          <AiInsightBanner
            text={
              <>
                Based on 47 recent commits, your Cypress proficiency may be <strong>understated</strong>. Consider rating it higher.
              </>
            }
          />
        </MockDataWrapper>

        {/* Manager review */}
        <MockDataWrapper>
          <Card>
            <CardTitle className="mb-3">Manager Review</CardTitle>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-full bg-teal-dark flex items-center justify-center text-white text-xs font-semibold shrink-0">
                VD
              </div>
              <div>
                <p className="text-[13px] font-medium text-ink">Van Duc</p>
                <p className="text-[11.5px] text-muted">Your manager</p>
              </div>
            </div>
            <p className="text-[12.5px] text-muted">
              Manager review opens <span className="text-ink font-medium">Apr 16, 2026</span> after you submit.
            </p>
          </Card>
        </MockDataWrapper>
      </div>
    </div>
  )
}
