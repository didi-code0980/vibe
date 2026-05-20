'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardSubtitle } from '@/components/ui/Card'
import { CourseCard } from '@/components/features/learning/CourseCard'
import { MockDataWrapper } from '@/components/ui/MockDataWrapper'
import { courses } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const tabs = ['My Courses', 'Course Catalog', 'AI Picks'] as const
type Tab = typeof tabs[number]

export default function LearningPage() {
  const [activeTab, setActiveTab] = useState<Tab>('My Courses')

  return (
    <div className="max-w-[1100px] space-y-4">
      {/* Tab nav */}
      <div className="flex gap-1 bg-white border border-faint rounded-btn p-1 w-fit">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-1.5 rounded-[6px] text-[13px] font-medium transition-all',
              activeTab === tab
                ? 'bg-teal text-white shadow-sm'
                : 'text-muted hover:text-ink2'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>
              {activeTab === 'My Courses' && 'My Learning Path'}
              {activeTab === 'Course Catalog' && 'Course Catalog'}
              {activeTab === 'AI Picks' && 'AI-Recommended Courses'}
            </CardTitle>
            <CardSubtitle>
              {activeTab === 'My Courses' && '6 courses · 2 in progress'}
              {activeTab === 'Course Catalog' && 'Browse all available courses'}
              {activeTab === 'AI Picks' && 'Curated for your career goals'}
            </CardSubtitle>
          </div>
        </CardHeader>

        <MockDataWrapper>
          <div className="grid grid-cols-3 gap-4">
            {courses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </MockDataWrapper>
      </Card>
    </div>
  )
}
