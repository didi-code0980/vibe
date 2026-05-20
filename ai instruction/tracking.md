# Skill Matrix — Build Status Tracker

> Update this file as each step is completed.
> Status: `[ ]` Not started · `[~]` In progress · `[x]` Done · `[!]` Blocked

**Last updated:** <!-- fill in date -->
**Current sprint:** <!-- e.g. Sprint 1 / Week 1 -->

---

## Progress Overview

| Phase | Steps | Done | In Progress | Blocked | Remaining |
|-------|-------|------|-------------|---------|-----------|
| Phase 0 — Bootstrap | 3 | 0 | 0 | 0 | 3 |
| Phase 1 — Auth & Users | 5 | 0 | 0 | 0 | 5 |
| Phase 2 — Taxonomy & Teams | 6 | 0 | 0 | 0 | 6 |
| Phase 3 — Assessment + AI-01 ★ | 5 | 0 | 0 | 0 | 5 |
| Phase 4 — Dashboard & Gap | 5 | 0 | 0 | 0 | 5 |
| Phase 5 — Learning & AI | 5 | 0 | 0 | 0 | 5 |
| Phase 6 — Notifications & Config | 3 | 0 | 0 | 0 | 3 |
| Phase 7 — Phase 2 AI | 3 | 0 | 0 | 0 | 3 |
| **Total** | **35** | **0** | **0** | **0** | **35** |

---

## Feature Group → Step Mapping

| ClickUp Group | BE Steps | FE Steps | Sprint |
|--------------|----------|----------|--------|
| AUT-01 Authentication & Profile | 1.1 · 4.1 | 1.2 · 4.3 | 1 + 4 |
| USM-01 User Management | 1.4 | 1.5 | 1 |
| SKL-01 Skillset Management | 2.1 · 3.1 · 5.2 | 2.3 · 3.4 · 5.5 | 2 + 3 + 5 |
| SKL-02 Upskill Documents | 5.1 | 5.5 | 5 |
| TEM-01 Team Management | 2.2 | 2.4 | 2 |
| PRJ-01 Project Management | 3.2 · 5.3 | 3.5 · 5.5 | 3 + 5 |
| DSH-01 Dashboard & Reporting | 4.1 · 4.2 · 7.1 | 4.3 · 7.3 | 4 + 7 |
| CFG-01 App Configuration | 1.3 · 6.1 · 6.2 | 0.3 · 6.3 | 1 + 6 |
| ⭐ AI-01 Smart Resource Matching | **3.3** | **3.5** | **3** |
| AI-02 Skill Gap Analysis | 4.4 | 4.5 | 4 |
| AI-03 Learning Path Recommendation | 5.4 | 5.5 | 5 |
| AI-04 Skill Extraction from Docs | 5.4 | 5.5 | 5 |
| AI-05 Self-Assessment Chatbot | 5.4 | 5.5 | 5 |
| AI-06 Auto-Generate Taxonomy | 2.5 | 2.6 | 2 |
| AI-07 Team Trend & Risk [P2] | 7.1 | 7.3 | 7 |
| AI-08 NL Matrix Query [P2] | 7.2 | 7.3 | 7 |

---

## PHASE 0 — Bootstrap

| Step | Side | Description | Feature Groups | DB Changes | Status |
|------|------|-------------|---------------|-----------|--------|
| 0.1 | BE | Spring Boot project setup | Foundation for all | 001_ base schema | `[x]` Done |
| 0.2 | BE | Core DB entities & Alembic base migration | Foundation for all | 001_ base schema | `[x]` Done |
| 0.3 | FE | Fix foundations: TanStack Query · Zustand store · RBAC middleware · RoleGuard · endpoints.ts · admin route group | **ALL groups** (prerequisite) | None | `[ ]` |

> **Note 0.3:** App partially exists. Do not rebuild — patch only the missing pieces.

---

## PHASE 1 — Authentication & User Foundation
> Sprint 1 · Weeks 1–2

| Step | Side | Description | Feature Groups | DB Changes | Status |
|------|------|-------------|---------------|-----------|--------|
| 1.1 | BE | Extend auth: forgot-password · reset-password · change-password · must_change_password | **AUT-01**: Login/logout · Forgot password · Change password · Force password change | `must_change_password` col + `password_reset_tokens` table | `[ ]` |
| 1.2 | FE | Complete auth pages: forgot/reset/change password · migrate LoginForm to RHF+Zod | **AUT-01**: Login/logout · Forgot password · Change password · Force password change | None | `[ ]` |
| 1.3 | BE | App config + email service: SMTP · email templates · rating scale · notification rules | **CFG-01**: RBAC/permissions · Master data (job titles, rating scale) · Email config (SMTP, templates, triggers) | `smtp_config` + `email_templates` + `notification_rules` + `rating_scale` | `[ ]` |
| 1.4 | BE | Extend user management: activity log endpoint · auto-generate password · audit_logs table | **USM-01**: User list · Activity logs · Lock/unlock · Delete · Create account | `audit_logs` table | `[ ]` |
| 1.5 | FE | Admin user management UI: user list · create · deactivate · activity log drawer | **USM-01**: User list · Activity logs · Lock/unlock · Delete · Create account | None | `[ ]` |

---

## PHASE 2 — Skill Taxonomy & Teams
> Sprint 2 · Weeks 3–4

| Step | Side | Description | Feature Groups | DB Changes | Status |
|------|------|-------------|---------------|-----------|--------|
| 2.1 | BE | Extend Skills: department_id FK · level_descriptions JSON · import/export endpoints | **SKL-01**: Career CRUD · Department CRUD · Skillset CRUD + Excel import/export | ALTER skills: + `department_id`, `level_descriptions` | `[ ]` |
| 2.2 | BE | Extend TeamMember: note + left_at · Position CRUD · member detail/logs endpoints | **TEM-01**: Team CRUD · Member management · Team list/details · Member profile/notes/logs | ALTER team_members: + `note`, `left_at` + `positions` table | `[ ]` |
| 2.3 | FE | Skill taxonomy pages: 3-panel Career→Dept→Skill CRUD + import/export UI | **SKL-01**: Career CRUD · Department CRUD · Skillset CRUD + Excel import/export | None | `[ ]` |
| 2.4 | FE | Team management pages: team list · team detail · member table · member detail drawer | **TEM-01**: Team CRUD · Member management · Team list/details · Member profile/notes/logs | None | `[ ]` |
| 2.5 | BE | AI-06: auto-generate skill taxonomy via Claude API | **AI-06**: Admin describes career/dept → AI suggests hierarchy · Admin reviews/imports · Industry standards for levels | None | `[ ]` |
| 2.6 | FE | AI-06 UI: 3-step modal (describe → review/edit → import) | **AI-06**: Admin describes career/dept → AI suggests hierarchy · Admin reviews/imports | None | `[ ]` |

---

## PHASE 3 — Skill Assessment + ★ AI-01 Smart Resource Matching
> Sprint 3 · Weeks 5–6 · **AI-01 must ship this sprint**

| Step | Side | Description | Feature Groups | DB Changes | Status |
|------|------|-------------|---------------|-----------|--------|
| 3.1 | BE | Skill Assessment module: self-assess · manager review · change log · export | **SKL-01**: Self-assessment (rate 1–5) · Manager review & modify · Assessment change log + export | `skill_assessments` + `assessment_logs` | `[ ]` |
| 3.2 | BE | Project CRUD + skill requirements: project lifecycle · required skills per project | **PRJ-01**: Project CRUD (name, dates, customer, status lifecycle) · Define required skills per project | `projects` + `project_skill_requirements` + `project_members` | `[ ]` |
| **3.3** | **BE** | **★ AI-01 Smart Resource Matching: scoring engine · ranked candidates · allocate endpoint** | **⭐ AI-01**: AI engine (match % algo) · Ranked candidate list · Skill gap highlight · One-click allocate · Admin cross-team view | None | `[ ]` |
| 3.4 | FE | Skill assessment pages: wire existing mock form to API · team review page | **SKL-01**: Self-assessment · Manager review & modify · Assessment change log \| **AUT-01**: Assessment history log | None | `[ ]` |
| **3.5** | **FE** | **★ Projects + AI-01 UI: project CRUD · skill requirements · ranked match cards · one-click allocate** | **PRJ-01**: Project CRUD · Required skills \| **⭐ AI-01**: Ranked candidate list · Skill gap highlight · One-click allocate · Admin cross-team view | None | `[ ]` |

---

## PHASE 4 — Dashboard, Reporting & Gap Analysis
> Sprint 4 · Weeks 7–8

| Step | Side | Description | Feature Groups | DB Changes | Status |
|------|------|-------------|---------------|-----------|--------|
| 4.1 | BE | Profile endpoints + personal dashboard: radar data · top/focus skills · to-do reminders | **AUT-01**: Profile update/avatar · General settings · Team info \| **DSH-01**: Personal dashboard (radar chart, top/focus skills, to-do widget) | `user_settings` table | `[ ]` |
| 4.2 | BE | Team skill matrix + all exports: team matrix API · PDF · Excel/CSV | **DSH-01**: Team skill matrix grid · Export individual profile PDF · Export team matrix Excel/CSV | None | `[ ]` |
| 4.3 | FE | Wire dashboard: replace all mock data · fix HeatmapGrid filters · fix export button · wire profile PUT | **AUT-01**: Profile page (update/avatar/settings/team info) \| **DSH-01**: Personal dashboard · Team skill matrix · Exports | None | `[ ]` |
| 4.4 | BE | AI-02 Skill Gap Analysis: user gap · team gap (pure DB logic — no Claude API) | **AI-02**: Auto-compare vs position · Prioritised gap report per employee · Team-wide gap analysis · Trigger from dashboard/profile | None | `[ ]` |
| 4.5 | FE | Wire gap analysis UI: replace hardcoded gapSkills · team chart · member gap drawer | **AI-02**: Auto-compare vs position · Prioritised gap report · Team-wide gap analysis · Trigger from dashboard/profile | None | `[ ]` |

---

## PHASE 5 — Learning, Documents & Remaining AI
> Sprint 5 · Weeks 9–10

| Step | Side | Description | Feature Groups | DB Changes | Status |
|------|------|-------------|---------------|-----------|--------|
| 5.1 | BE | Document library + assignments: CRUD · upload · assign to user/team · my-upskill · team progress | **SKL-02**: Document library CRUD · Assign docs to staff/team + deadline · My Upskill page · Team learning dashboard | `documents` + `document_assignments` | `[ ]` |
| 5.2 | BE | Development goals: create · complete (auto-updates assessment) · manager suggest · accept/reject | **SKL-01**: Development goal (create, track, mark complete) · Manager suggest goals for staff | `development_goals` | `[ ]` |
| 5.3 | BE | Project resource allocation: allocate · release · project dashboard | **PRJ-01**: Resource allocation (assign staff, role, join/out dates, release) · Staff view (own projects, teammates, dashboard) | None | `[ ]` |
| 5.4 | BE | AI-03 Learning Path + AI-04 Skill Extraction + AI-05 Chatbot (all use Claude API) | **AI-03**: Learning path from gaps · Auto-assign docs · Employee accept/modify \| **AI-04**: Skill extraction on upload · Confirm/reject AI tags · Apply confirmed tags \| **AI-05**: Chatbot clarifying questions · AI rating suggestion · Conversation log for manager | None | `[ ]` |
| 5.5 | FE | Wire docs/goals/learning: replace mock learning page · wire AI chatbot · build goals + doc library | **SKL-02**: Document library · My Upskill · Team learning dashboard \| **SKL-01**: Development goals · Manager suggest goals \| **PRJ-01**: Staff project view \| **AI-03/04/05**: Learning path UI · AI doc tags UI · Chatbot wired to real API | None | `[ ]` |

---

## PHASE 6 — Notifications, Config & Hardening
> Sprint 6 · Weeks 11–12

| Step | Side | Description | Feature Groups | DB Changes | Status |
|------|------|-------------|---------------|-----------|--------|
| 6.1 | BE | Full notification system: in-app + email · all trigger events · daily cron reminder | **CFG-01**: Email config — notification triggers (ACCOUNT_CREATED · DOCUMENT_ASSIGNED · GOAL_SUGGESTED · ASSESSMENT_REVIEWED · LEARNING_REMINDER · PASSWORD_RESET) | `notifications` | `[ ]` |
| 6.2 | BE | Complete audit logging: verify all 9 entity types log to audit_logs | **CFG-01**: Audit logs — system-wide change history | None | `[ ]` |
| 6.3 | FE | Wire notification bell + count badge · build admin config tabs (SMTP, templates, scale, audit logs) | **CFG-01**: RBAC/permissions · Master data (job titles, rating scale) · Email config (SMTP, templates, notification triggers) · Audit logs | None | `[ ]` |

---

## PHASE 7 — Phase 2 AI Features
> Sprint 7–8 · Weeks 13–16 · Requires 3+ months of historical assessment data

| Step | Side | Description | Feature Groups | DB Changes | Status |
|------|------|-------------|---------------|-----------|--------|
| 7.1 | BE | AI-07 team trend + attrition risk + weekly cron alert | **AI-07**: Monitor skill growth trends · Flag stagnant/misaligned/low participation · Risk score card per employee · Manager notification at threshold \| **DSH-01**: Trend analysis (growth chart, team trend by quarter/year) | None | `[ ]` |
| 7.2 | BE | AI-08 natural language matrix query + saved queries | **AI-08**: NL input on dashboard · AI translates query to matrix filter · Save query as named filter | `saved_queries` | `[ ]` |
| 7.3 | FE | Phase 2 AI UIs: trend chart · risk table · NL query bar · growth chart | **AI-07**: Trend line chart, risk score table, contributing factor tags \| **AI-08**: NL query bar on team matrix, parsed filter chips, saved queries dropdown \| **DSH-01**: Growth chart (my growth section on personal dashboard) | None | `[ ]` |

---

## Database Migration Tracker

| Alembic Migration | Description | Step | Tables | Status |
|-----------|-------------|------|--------|--------|
| 001_ | Initial schema | 0.2 | users, teams, team_members, skills, departments, careers | `[x]` |
| 002_auth_extensions | Auth extensions | 1.1 | `must_change_password` col · `password_reset_tokens` | `[ ]` |
| 003_audit_logs | Audit logging infrastructure | 1.4 | `audit_logs` | `[ ]` |
| 004_config_tables | Config & email infrastructure | 1.3 | `smtp_config` · `email_templates` · `notification_rules` · `rating_scale` | `[ ]` |
| 005_skill_extensions | Skill taxonomy extensions | 2.1 | ALTER skills: + `department_id`, `level_descriptions` | `[ ]` |
| 006_team_member_extensions | TeamMember extensions | 2.2 | ALTER team_members: + `note`, `left_at` | `[ ]` |
| 007_positions | Job positions/titles | 2.2 | `positions` | `[ ]` |
| 008_skill_assessments | Assessment module | 3.1 | `skill_assessments` · `assessment_logs` | `[ ]` |
| 009_projects | Project management | 3.2 | `projects` · `project_skill_requirements` · `project_members` | `[ ]` |
| 010_user_settings | User preferences | 4.1 | `user_settings` | `[ ]` |
| 011_documents | Document management | 5.1 | `documents` · `document_assignments` | `[ ]` |
| 012_development_goals | Development goals | 5.2 | `development_goals` | `[ ]` |
| 013_notifications | Notification system | 6.1 | `notifications` | `[ ]` |
| 014_saved_queries | NL query persistence | 7.2 | `saved_queries` | `[ ]` |

---

## Blockers & Decisions

| Date | Step | Issue | Owner | Resolved |
|------|------|-------|-------|---------|
| | | | | |

---

## How to Update

1. Start a step → `[ ]` → `[~]`
2. Finish a step → `[~]` → `[x]`, update Progress Overview counts
3. Blocked → `[!]`, add row to Blockers table
4. DB migration applied → mark `[x]` in Migration Tracker
5. Update **Last updated** and **Current sprint** at the top each session