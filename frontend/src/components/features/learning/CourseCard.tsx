import { Clock } from 'lucide-react'
import type { Course } from '@/lib/types'

export function CourseCard({ course }: { course: Course }) {
  return (
    <div className="bg-white rounded-card border border-faint hover:shadow-sm transition-shadow overflow-hidden">
      {/* Thumbnail */}
      <div
        className="h-20 flex items-center justify-center text-4xl"
        style={{ backgroundColor: course.bg }}
      >
        {course.icon}
      </div>

      <div className="p-4">
        <p className="text-[13.5px] font-semibold text-ink leading-snug mb-1.5">{course.title}</p>

        <div className="flex items-center gap-3 text-[11.5px] text-muted mb-3">
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {course.duration}
          </span>
          <span>·</span>
          <span>{course.provider}</span>
        </div>

        {course.progress > 0 ? (
          <div>
            <div className="flex justify-between text-[11px] text-muted mb-1.5">
              <span>Progress</span>
              <span className="font-medium text-teal">{course.progress}% complete</span>
            </div>
            <div className="h-1.5 bg-faint rounded-full overflow-hidden">
              <div
                className="h-full bg-teal rounded-full"
                style={{ width: `${course.progress}%` }}
              />
            </div>
          </div>
        ) : (
          <p className="text-[11.5px] text-muted">Not started</p>
        )}
      </div>
    </div>
  )
}
