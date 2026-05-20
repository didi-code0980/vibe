'use client'

import { useMyTeam } from '@/features/profile/hooks/useProfile'

export function MyTeamPanel() {
  const team = useMyTeam()

  if (team.isLoading) {
    return <p className="text-[13px] text-muted">Loading team…</p>
  }
  if (team.error || !team.data) {
    return <p className="text-[13px] text-muted">You aren&apos;t in a team yet.</p>
  }

  const { teamName, managerFullName, teammates } = team.data

  return (
    <div className="space-y-3">
      <div>
        <p className="text-[13.5px] font-medium text-ink">{teamName ?? '—'}</p>
        <p className="text-[12px] text-muted">
          Manager: {managerFullName ?? 'Unassigned'}
        </p>
      </div>

      <div>
        <p className="text-[12px] font-medium text-ink2 mb-1.5">Teammates</p>
        {teammates.length === 0 ? (
          <p className="text-[12px] text-muted">No other teammates yet.</p>
        ) : (
          <ul className="space-y-2">
            {teammates.map((mate) => (
              <li
                key={mate.userId}
                className="bg-fog rounded-btn px-3 py-2 flex flex-col gap-1"
              >
                <p className="text-[13px] font-medium text-ink">{mate.fullName}</p>
                {mate.skills.length > 0 && (
                  <ul className="text-[11.5px] text-muted flex flex-wrap gap-x-3 gap-y-0.5">
                    {mate.skills.map((s) => (
                      <li key={s.skillId}>
                        {s.skillName}: <strong>{s.selfScore}</strong>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}