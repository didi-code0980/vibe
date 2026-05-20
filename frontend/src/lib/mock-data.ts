import type {
  MatrixEmployee,
  AssessmentSkill,
  KpiData,
  DeptChartData,
  DonutDataItem,
  RecentAssessment,
  Course,
  AiRecommendation,
  MatchedEmployee,
  JobBriefInput,
  JobBriefAnalysis,
  SuggestedRole,
} from './types'

// ─── Matrix ────────────────────────────────────────────────────────────────────

export const matrixData: MatrixEmployee[] = [
  { id: '1', name: 'Thinh N.',  initials: 'TN', avatarBg: '#1e6280', scores: [5,3,4,2,4,5,3,3,4,2] },
  { id: '2', name: 'Hoa Ly',   initials: 'HL', avatarBg: '#c7892a', scores: [3,4,2,1,3,4,5,2,3,1] },
  { id: '3', name: 'Phu Ha',   initials: 'PH', avatarBg: '#2a8a5c', scores: [2,2,1,0,2,3,2,1,2,0] },
  { id: '4', name: 'Tu My',    initials: 'TM', avatarBg: '#533d78', scores: [1,3,0,0,1,2,3,0,1,0] },
  { id: '5', name: 'Bao K.',   initials: 'BK', avatarBg: '#8a3a2a', scores: [4,5,3,4,5,4,2,5,5,4] },
]

export const skillColumns: string[] = [
  'Node.js','Python','Cypress','AWS','Docker','SQL','React','System Design','CI/CD','Security'
]

export const levelLabels: string[] = ['Not rated','Beginner','Basic','Intermediate','Advanced','Expert']

// ─── Assessment ────────────────────────────────────────────────────────────────

export const assessmentSkills: AssessmentSkill[] = [
  { name: 'Backend Development',      sub: 'Node.js, REST APIs, databases' },
  { name: 'E2E Testing (Cypress)',     sub: 'Writing, debugging, CI integration' },
  { name: 'System Design',            sub: 'Architecture, scalability patterns' },
  { name: 'Cloud / AWS',              sub: 'EC2, S3, Lambda, networking' },
  { name: 'Docker & Containers',      sub: 'Build, deploy, orchestrate' },
  { name: 'Code Review Quality',      sub: 'Feedback quality, PR coverage' },
  { name: 'Documentation',            sub: 'Technical writing, runbooks' },
  { name: 'Cross-team Collaboration', sub: 'Communication, async work' },
  { name: 'Security Awareness',       sub: 'OWASP, secrets management' },
  { name: 'Mentoring',                sub: 'Onboarding, pair programming' },
]

// ─── Dashboard KPIs ────────────────────────────────────────────────────────────

export const kpiData: KpiData[] = [
  { label: 'Total Employees',         value: '1,284', delta: '12 new this month', deltaType: 'up',   variant: 'teal'  },
  { label: 'Avg Skill Score',         value: '74',    delta: '3 pts vs last Q',   deltaType: 'up',   variant: 'navy'  },
  { label: 'Assessments This Month',  value: '238',   delta: '94% completion',    deltaType: 'up',   variant: 'gold'  },
  { label: 'Courses Completed',       value: '91',    delta: '8 behind schedule', deltaType: 'down', variant: 'green' },
]

// ─── Dashboard charts ──────────────────────────────────────────────────────────

export const deptChartData: DeptChartData[] = [
  { dept: 'Eng',    score: 82 },
  { dept: 'Design', score: 88 },
  { dept: 'PM',     score: 74 },
  { dept: 'Data',   score: 91 },
  { dept: 'Ops',    score: 69 },
  { dept: 'Sales',  score: 55 },
  { dept: 'HR',     score: 77 },
  { dept: 'Legal',  score: 72 },
]

export const donutData: DonutDataItem[] = [
  { name: 'Expert',       value: 33, color: '#033246' },
  { name: 'Proficient',   value: 20, color: '#287393' },
  { name: 'Intermediate', value: 18, color: '#1ea8cc' },
  { name: 'Beginner',     value: 29, color: '#D3D4CE' },
]

// ─── Recent Assessments ────────────────────────────────────────────────────────

export const recentAssessments: RecentAssessment[] = [
  { id: '1', name: 'Thinh Nguyen', initials: 'TN', avatarBg: '#1e6280', department: 'Engineering', skillArea: 'Backend Dev',    score: 92, status: 'completed',  date: 'Mar 28, 2026' },
  { id: '2', name: 'Hoa Ly',      initials: 'HL', avatarBg: '#c7892a', department: 'Design',      skillArea: 'UI Systems',     score: 88, status: 'completed',  date: 'Mar 27, 2026' },
  { id: '3', name: 'Phu Ha',      initials: 'PH', avatarBg: '#2a8a5c', department: 'Engineering', skillArea: 'Cloud / AWS',    score: 61, status: 'in-progress', date: null           },
  { id: '4', name: 'Tu My',       initials: 'TM', avatarBg: '#533d78', department: 'PM',          skillArea: 'Product Strategy',score: 79, status: 'pending',    date: null           },
]

// ─── Courses ───────────────────────────────────────────────────────────────────

export const courses: Course[] = [
  { id: '1', icon: '☁️', bg: 'rgba(40,115,147,0.1)',  title: 'AWS Solutions Architect',  provider: 'Amazon',         duration: '8h 30m', progress: 35 },
  { id: '2', icon: '🧪', bg: 'rgba(42,138,92,0.1)',   title: 'Cypress E2E Mastery',      provider: 'Cypress.io',     duration: '4h',     progress: 80 },
  { id: '3', icon: '⚙️', bg: 'rgba(3,50,70,0.08)',    title: 'System Design Interviews', provider: 'Educative',      duration: '12h',    progress: 20 },
  { id: '4', icon: '🐳', bg: 'rgba(30,168,204,0.1)',  title: 'Docker & Kubernetes',      provider: 'LinuxFoundation', duration: '6h',     progress: 0  },
  { id: '5', icon: '🧠', bg: 'rgba(199,137,42,0.1)',  title: 'Engineering Leadership',   provider: "O'Reilly",        duration: '5h 20m', progress: 55 },
  { id: '6', icon: '🔒', bg: 'rgba(196,75,58,0.08)',  title: 'Security Fundamentals',    provider: 'SANS',           duration: '3h',     progress: 0  },
]

// ─── AI Recommendations ────────────────────────────────────────────────────────

export const aiRecs: AiRecommendation[] = [
  {
    id: '1',
    icon: '☁️',
    title: 'AWS Solutions Architect',
    reason: 'Bridges your biggest skill gap to Staff Engineer. Covers Cloud & Security.',
    priority: 'High priority',
  },
  {
    id: '2',
    icon: '🏗️',
    title: 'Advanced System Design',
    reason: 'Missing prerequisite for Staff Engineer promotion track.',
    priority: 'Medium priority',
  },
  {
    id: '3',
    icon: '👥',
    title: 'Engineering Management 101',
    reason: 'Aligns with your long-term career goal of Engineering Manager.',
    priority: 'Career goal',
  },
]

// ─── Job Brief — employee pool ─────────────────────────────────────────────────

const employeePool: MatchedEmployee[] = [
  { id: '1',  name: 'Thinh Nguyen', initials: 'TN', avatarBg: '#1e6280', role: 'Senior Engineer',     department: 'Engineering', suitabilityScore: 94, availableCapacity: 60, matchedSkills: ['Node.js','Cypress','SQL','CI/CD','System Design'] },
  { id: '2',  name: 'Hoa Ly',      initials: 'HL', avatarBg: '#c7892a', role: 'UX Engineer',          department: 'Design',      suitabilityScore: 81, availableCapacity: 80, matchedSkills: ['React','SQL','Python'] },
  { id: '3',  name: 'Phu Ha',      initials: 'PH', avatarBg: '#2a8a5c', role: 'Product Manager',      department: 'PM',          suitabilityScore: 72, availableCapacity: 50, matchedSkills: ['System Design','SQL'] },
  { id: '4',  name: 'Tu My',       initials: 'TM', avatarBg: '#533d78', role: 'Product Analyst',      department: 'PM',          suitabilityScore: 65, availableCapacity: 90, matchedSkills: ['Python','SQL'] },
  { id: '5',  name: 'Bao K.',      initials: 'BK', avatarBg: '#8a3a2a', role: 'Staff Engineer',        department: 'Engineering', suitabilityScore: 97, availableCapacity: 30, matchedSkills: ['Node.js','Python','AWS','Docker','SQL','React','System Design','CI/CD','Security'] },
  { id: '6',  name: 'Lan Anh',     initials: 'LA', avatarBg: '#533d78', role: 'Head of Data',          department: 'Data',        suitabilityScore: 88, availableCapacity: 40, matchedSkills: ['Python','SQL','System Design','Security'] },
  { id: '7',  name: 'Quoc Minh',   initials: 'QM', avatarBg: '#2a8a5c', role: 'VP Product',            department: 'Product',     suitabilityScore: 76, availableCapacity: 20, matchedSkills: ['System Design','SQL'] },
  { id: '8',  name: 'Bich Tran',   initials: 'BT', avatarBg: '#287393', role: 'VP Engineering',        department: 'Engineering', suitabilityScore: 91, availableCapacity: 25, matchedSkills: ['Node.js','AWS','Docker','CI/CD','Security','System Design'] },
  { id: '9',  name: 'Mai Phuong',  initials: 'MP', avatarBg: '#6b3a78', role: 'QA Engineer',           department: 'Engineering', suitabilityScore: 85, availableCapacity: 70, matchedSkills: ['Cypress','CI/CD','Security'] },
  { id: '10', name: 'Duc Long',    initials: 'DL', avatarBg: '#1e6280', role: 'DevOps Engineer',       department: 'Engineering', suitabilityScore: 90, availableCapacity: 65, matchedSkills: ['AWS','Docker','CI/CD','Security','Node.js'] },
]

// ─── Job Brief — keyword → skills/roles map ────────────────────────────────────

interface RoleTemplate {
  role: string
  count: number
  skills: string[]
}

const keywordMap: Array<{ keywords: string[]; roles: RoleTemplate[]; weeksBase: number }> = [
  {
    keywords: ['frontend', 'ui', 'ux', 'react', 'web app', 'dashboard', 'design'],
    roles: [
      { role: 'Frontend Engineer',  count: 2, skills: ['React','CI/CD'] },
      { role: 'UX Designer',        count: 1, skills: ['React'] },
      { role: 'QA Engineer',        count: 1, skills: ['Cypress','CI/CD'] },
    ],
    weeksBase: 8,
  },
  {
    keywords: ['backend', 'api', 'node', 'rest', 'microservice', 'server', 'database'],
    roles: [
      { role: 'Backend Engineer',   count: 2, skills: ['Node.js','SQL','Docker'] },
      { role: 'DevOps Engineer',    count: 1, skills: ['Docker','CI/CD','AWS'] },
      { role: 'QA Engineer',        count: 1, skills: ['Cypress','CI/CD'] },
    ],
    weeksBase: 10,
  },
  {
    keywords: ['data', 'ml', 'machine learning', 'analytics', 'pipeline', 'etl', 'ai'],
    roles: [
      { role: 'Data Engineer',      count: 2, skills: ['Python','SQL','AWS'] },
      { role: 'ML Engineer',        count: 1, skills: ['Python','System Design'] },
      { role: 'Backend Engineer',   count: 1, skills: ['Node.js','Docker'] },
    ],
    weeksBase: 14,
  },
  {
    keywords: ['security', 'compliance', 'audit', 'penetration', 'owasp'],
    roles: [
      { role: 'Security Engineer',  count: 2, skills: ['Security','AWS'] },
      { role: 'Backend Engineer',   count: 1, skills: ['Node.js','Security'] },
      { role: 'DevOps Engineer',    count: 1, skills: ['Docker','CI/CD','AWS'] },
    ],
    weeksBase: 6,
  },
  {
    keywords: ['mobile', 'ios', 'android', 'app', 'flutter', 'react native'],
    roles: [
      { role: 'Mobile Engineer',    count: 2, skills: ['React','CI/CD'] },
      { role: 'Backend Engineer',   count: 1, skills: ['Node.js','SQL'] },
      { role: 'QA Engineer',        count: 1, skills: ['Cypress'] },
    ],
    weeksBase: 12,
  },
]

const defaultRoles: RoleTemplate[] = [
  { role: 'Full-stack Engineer', count: 2, skills: ['Node.js','React','SQL'] },
  { role: 'Product Manager',     count: 1, skills: ['System Design','SQL'] },
  { role: 'QA Engineer',         count: 1, skills: ['Cypress','CI/CD'] },
  { role: 'DevOps Engineer',     count: 1, skills: ['Docker','AWS','CI/CD'] },
]

// ─── Job Brief — analysis engine ───────────────────────────────────────────────

export function analyzeJobBrief(input: JobBriefInput): JobBriefAnalysis {
  const text = `${input.description} ${input.goals} ${input.fileContent ?? ''}`.toLowerCase()

  // Match keyword groups (can hit multiple)
  const matched = keywordMap.filter(k => k.keywords.some(kw => text.includes(kw)))

  // Merge roles (deduplicate by role name, sum counts)
  const roleMap = new Map<string, SuggestedRole>()
  const templates = matched.length > 0 ? matched.flatMap(m => m.roles) : defaultRoles
  for (const t of templates) {
    const existing = roleMap.get(t.role)
    if (existing) {
      existing.count = Math.min(existing.count + 1, 3)
    } else {
      roleMap.set(t.role, { ...t })
    }
  }

  // Always add a PM if not present
  if (!roleMap.has('Product Manager')) {
    roleMap.set('Product Manager', { role: 'Product Manager', count: 1, skills: ['System Design','SQL'] })
  }

  const suggestedRoles = Array.from(roleMap.values())
  const teamSize = suggestedRoles.reduce((s, r) => s + r.count, 0)

  // Timeline: base weeks from matched groups, scaled by document type complexity
  const baseWeeks = matched.length > 0
    ? Math.round(matched.reduce((s, m) => s + m.weeksBase, 0) / matched.length)
    : 10
  const docMultiplier: Record<string, number> = { JD: 1, SRS: 1.3, BRD: 1.5, OTHER: 1 }
  const timelineWeeks = Math.round(baseWeeks * (docMultiplier[input.docType] ?? 1))

  // Required skill set from all roles
  const requiredSkills = new Set(suggestedRoles.flatMap(r => r.skills))

  // Score each employee
  const scored = employeePool.map(emp => {
    const hits = emp.matchedSkills.filter(s => requiredSkills.has(s)).length
    const skillRatio = hits / Math.max(requiredSkills.size, 1)
    const capacityBonus = emp.availableCapacity / 200  // up to +0.5
    const raw = Math.min(100, Math.round((skillRatio * 0.75 + capacityBonus) * 100))
    return { ...emp, suitabilityScore: raw, matchedSkills: emp.matchedSkills.filter(s => requiredSkills.has(s)) }
  })

  const matchedEmployees = scored
    .filter(e => e.suitabilityScore >= 40)
    .sort((a, b) => b.suitabilityScore - a.suitabilityScore)

  const confidence = matched.length > 0 ? Math.min(95, 65 + matched.length * 10) : 55

  const summary = `This project requires a team of ${teamSize} across ${suggestedRoles.length} roles. Based on the ${input.docType} provided, the estimated delivery timeline is ${timelineWeeks} weeks. ${matchedEmployees.length} employees in your organisation are a strong match.`

  return { timelineWeeks, teamSize, confidence, suggestedRoles, matchedEmployees, summary }
}

// ─── Chatbot replies ───────────────────────────────────────────────────────────

export const botReplies: string[] = [
  "Based on your commit patterns, I suggest focusing on AWS certifications first.",
  "You're close to Advanced level in Cypress — just 2 more assessments needed.",
  "Your team has a 15% gap in Security skills. Want me to recommend a team-wide path?",
  "For Q2 projects, System Design will be critical. I've found 3 relevant courses.",
]
