import { Suspense } from 'react'
import { LoginForm } from '@/features/auth/components/LoginForm'

export default function LoginPage() {
  return (
    <div className="flex h-screen font-sans">
      {/* Left panel — navy */}
      <div className="flex-1 bg-navy flex flex-col justify-between p-12">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[8px] bg-teal flex items-center justify-center text-white text-sm font-semibold">
            SM
          </div>
          <span className="text-[16px] font-semibold text-white tracking-tight">SkillMatrix</span>
        </div>

        {/* Main copy */}
        <div>
          <h1 className="text-[40px] font-light text-white leading-[1.15] mb-4 max-w-md">
            Know your team&apos;s{' '}
            <span className="text-accent font-medium">full potential.</span>
          </h1>
          <p className="text-[15px] text-white/50 max-w-sm leading-relaxed">
            The AI-powered skill intelligence platform that turns employee potential into measurable growth.
          </p>

          {/* Trust stats */}
          <div className="flex gap-6 mt-10">
            {[
              { value: '1,284', label: 'employees mapped' },
              { value: '94%',   label: 'assessment rate'  },
              { value: '3×',    label: 'faster upskilling'},
            ].map(stat => (
              <div key={stat.label}>
                <p className="text-[22px] font-semibold text-white">{stat.value}</p>
                <p className="text-[12px] text-white/40 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-white/20">© 2026 SkillMatrix Inc.</p>
      </div>

      {/* Right panel — white */}
      <div className="bg-white flex flex-col justify-center px-12" style={{ width: 440, minWidth: 440 }}>
        <div className="max-w-[340px] mx-auto w-full">
          <h2 className="text-[24px] font-semibold text-ink mb-1.5">Welcome back</h2>
          <p className="text-[13.5px] text-muted mb-7">Sign in to your SkillMatrix account</p>

          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
