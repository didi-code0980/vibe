import { MockDataWrapper } from '@/components/ui/MockDataWrapper'

interface OrgNode {
  initials: string
  avatarBg: string
  name: string
  role: string
  score?: number
}

const cto: OrgNode = { initials: 'VD', avatarBg: '#1e6280', name: 'Van Duc', role: 'Chief Technology Officer', score: 97 }

const vps: OrgNode[] = [
  { initials: 'BT', avatarBg: '#287393', name: 'Bich Tran', role: 'VP Engineering',  score: 94 },
  { initials: 'QM', avatarBg: '#2a8a5c', name: 'Quoc Minh', role: 'VP Product',       score: 89 },
  { initials: 'LA', avatarBg: '#533d78', name: 'Lan Anh',   role: 'Head of Data',     score: 91 },
]

const ics: OrgNode[][] = [
  [
    { initials: 'TN', avatarBg: '#1e6280', name: 'Thinh N.',  role: 'Senior Engineer' },
    { initials: 'HL', avatarBg: '#c7892a', name: 'Hoa Ly',    role: 'UX Engineer'     },
  ],
  [
    { initials: 'PH', avatarBg: '#2a8a5c', name: 'Phu Ha',    role: 'Product Manager' },
    { initials: 'TM', avatarBg: '#533d78', name: 'Tu My',     role: 'Product Analyst' },
  ],
  [],
]

function OrgNodeCard({ node, large = false }: { node: OrgNode; large?: boolean }) {
  return (
    <div className={`flex flex-col items-center gap-1.5 p-3 bg-white rounded-card border border-faint hover:border-teal/30 hover:[&>div]:ring-2 hover:[&>div]:ring-teal/40 transition-all cursor-pointer ${large ? 'min-w-[160px]' : 'min-w-[130px]'}`}>
      <div
        className={`rounded-full flex items-center justify-center text-white font-semibold shrink-0 transition-all ${large ? 'w-14 h-14 text-base' : 'w-10 h-10 text-sm'}`}
        style={{ backgroundColor: node.avatarBg }}
      >
        {node.initials}
      </div>
      <div className="text-center">
        <p className={`font-semibold text-ink ${large ? 'text-[14px]' : 'text-[12.5px]'}`}>{node.name}</p>
        <p className={`text-muted ${large ? 'text-[12px]' : 'text-[11px]'}`}>{node.role}</p>
        {node.score && (
          <span className="mt-1 inline-block px-2 py-0.5 rounded-chip bg-teal/10 text-teal text-[10.5px] font-medium">
            Score: {node.score}
          </span>
        )}
      </div>
    </div>
  )
}

export function OrgChart() {
  return (
    <MockDataWrapper>
    <div className="flex flex-col items-center gap-0 overflow-x-auto pb-4">
      {/* Level 1 — CTO */}
      <OrgNodeCard node={cto} large />

      {/* Connector down */}
      <div className="w-px bg-faint h-6" />

      {/* Level 2 — VPs */}
      <div className="flex items-start gap-0 relative">
        {/* Horizontal line */}
        <div className="absolute top-0 left-[calc(50%-1px)] w-px h-0" />
        <div className="flex items-start">
          {vps.map((vp, i) => (
            <div key={vp.name} className="flex items-start">
              {i > 0 && <div className="w-8 h-px bg-faint mt-6" />}
              <div className="flex flex-col items-center">
                <div className="w-px bg-faint h-0" />
                <OrgNodeCard node={vp} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Connectors + Level 3 grid */}
      <div className="flex items-start gap-8 mt-0">
        {vps.map((vp, vi) => (
          <div key={vp.name} className="flex flex-col items-center">
            <div className="w-px bg-faint h-5" />
            <div className="flex gap-3">
              {(ics[vi] ?? []).map((ic) => (
                <div key={ic.name} className="flex flex-col items-center">
                  <OrgNodeCard node={ic} />
                </div>
              ))}
              {(ics[vi] ?? []).length === 0 && (
                <div className="w-[130px] h-[90px] rounded-card border border-dashed border-faint flex items-center justify-center">
                  <span className="text-[11px] text-muted">Open roles</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
    </MockDataWrapper>
  )
}
