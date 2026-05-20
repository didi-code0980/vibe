# Skill Matrix — System Function Reference

> Authoritative specification for Claude Code.  
> Describes every function, entity, business rule, and access constraint in the system.  
> Read this file before generating any code, API route, schema, or test.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Roles & Access Control (RBAC)](#2-roles--access-control-rbac)
3. [Data Entities](#3-data-entities)
4. [AUT-01 · Authentication & Profile](#4-aut-01--authentication--profile)
5. [USM-01 · User Management](#5-usm-01--user-management)
6. [SKL-01 · Skillset Management](#6-skl-01--skillset-management)
7. [SKL-02 · Upskill Document Management](#7-skl-02--upskill-document-management)
8. [TEM-01 · Team Management](#8-tem-01--team-management)
9. [PRJ-01 · Project Management](#9-prj-01--project-management)
10. [DSH-01 · Dashboard & Reporting](#10-dsh-01--dashboard--reporting)
11. [CFG-01 · App Configuration & Access Control](#11-cfg-01--app-configuration--access-control)
12. [AI-01 · Smart Resource Matching](#12-ai-01--smart-resource-matching)
13. [AI-02 · Skill Gap Analysis](#13-ai-02--skill-gap-analysis)
14. [AI-03 · Learning Path Recommendation](#14-ai-03--learning-path-recommendation)
15. [AI-04 · Skill Extraction from Documents](#15-ai-04--skill-extraction-from-documents)
16. [AI-05 · Self-Assessment Assistant](#16-ai-05--self-assessment-assistant)
17. [AI-06 · Auto-Generate Skill Taxonomy](#17-ai-06--auto-generate-skill-taxonomy)
18. [AI-07 · Team Trend & Attrition Risk](#18-ai-07--team-trend--attrition-risk)
19. [AI-08 · Natural Language Matrix Query](#19-ai-08--natural-language-matrix-query)
20. [AI-09 · JD Scan & Resource Finder](#20-ai-09--jd-scan--resource-finder)
21. [Notification & Email Rules](#21-notification--email-rules)
22. [Audit & Logging Rules](#22-audit--logging-rules)
23. [Global Business Rules](#23-global-business-rules)

---

## 1. System Overview

**Product:** Skill Matrix — a web application for managing, assessing, and developing employee skills across teams and projects.

**Purpose:**
- Employees self-assess skills on a 1–5 scale.
- Managers review, adjust, and track team skill profiles.
- Admins manage the skill taxonomy, users, teams, and system configuration.
- AI features surface insights: gap analysis, learning paths, resource matching, trend prediction.

**Tech stack:**
- Backend: Java Spring Boot
- Frontend: Angular / ReactJS / NextJS / VueJS
- Database: PostgreSQL (primary)
- Auth: Email/password with JWT (no OAuth in v1)
- AI: Anthropic Claude API (`claude-sonnet-4-20250514`)

---

## 2. Roles & Access Control (RBAC)

### Role Definitions

| Role | Target User | Access Scope |
|------|-------------|--------------|
| `ADMIN` | System administrator | Full access — all data, all config, all teams |
| `MANAGER` | Team lead / department head | Group access — own team only |
| `USER` | Regular employee / staff | Self-only — own profile, assessments, assigned docs |

### Permission Matrix

| Action | ADMIN | MANAGER | USER |
|--------|-------|---------|------|
| Manage all users (CRUD) | ✅ | ❌ | ❌ |
| Create / delete teams | ✅ | ✅ own | ❌ |
| Manage skill taxonomy (Career / Department / Skillset) | ✅ | ❌ | ❌ |
| View all teams and members | ✅ | ✅ own team | ❌ |
| Self-assess skills | ✅ | ✅ | ✅ |
| Review and modify team member assessments | ✅ | ✅ own team | ❌ |
| Assign upskill documents | ✅ | ✅ own team | ❌ |
| View team skill matrix | ✅ | ✅ own team | ❌ |
| View personal skill dashboard | ✅ | ✅ | ✅ |
| Export reports | ✅ | ✅ | ✅ own profile only |
| Use AI resource matching | ✅ all teams | ✅ own team | ❌ |
| App configuration (SMTP, RBAC, master data) | ✅ | ❌ | ❌ |
| View audit logs | ✅ | ❌ | ❌ |

### Access Rules

- A `MANAGER` can only manage members, assessments, documents, and projects within their own team.
- A `MANAGER` cannot view or edit data of members outside their team unless explicitly granted cross-team access by an `ADMIN`.
- A `USER` can only see their own profile, assessments, assigned documents, and projects they are a member of.
- A `USER` can view the skillset profiles (not personal info) of teammates in the same team.
- Closed or Archived projects cannot have new members added.
- Soft-deleted records are not visible to any role except `ADMIN` in audit views.

---

## 3. Data Entities

### User
```
id, email, password_hash, full_name, avatar_url, phone,
role: ENUM(ADMIN, MANAGER, USER),
status: ENUM(ACTIVE, LOCKED, DELETED),
position_id → Position,
team_id → Team,
career_id → Career,
must_change_password: boolean,
created_at, updated_at, deleted_at
```

### Career
```
id, name, description, created_by → User, created_at, updated_at
```

### Department
```
id, name, description, career_id → Career, created_by → User, created_at, updated_at
```

### Skillset
```
id, name, description, department_id → Department,
level_descriptions: JSON { "1": string, "2": string, "3": string, "4": string, "5": string },
created_by → User, created_at, updated_at
```

### SkillAssessment
```
id, user_id → User, skillset_id → Skillset,
self_score: INT(1–5), manager_score: INT(1–5) nullable,
self_note: text, manager_note: text,
assessed_by → User (manager),
assessed_at: timestamp,
assessment_ai_log: JSON nullable,
created_at, updated_at
```

### AssessmentLog
```
id, assessment_id → SkillAssessment, changed_by → User,
field_changed: string, old_value, new_value,
changed_at: timestamp
```

### Team
```
id, name, description, manager_id → User,
department_id → Department nullable,
created_at, updated_at, deleted_at
```

### TeamMember
```
id, team_id → Team, user_id → User,
position: string (default: "Member"),
note: text,
joined_at: timestamp, left_at: timestamp nullable
```

### Position (Job Title)
```
id, name,
required_skills: JSON [{ skillset_id, min_level }],
created_at, updated_at
```

### Project
```
id, name, description, customer: string,
start_date, end_date,
status: ENUM(PLANNING, ACTIVE, CLOSED, ARCHIVED),
created_by → User, created_at, updated_at, deleted_at
```

### ProjectSkillRequirement
```
id, project_id → Project, skillset_id → Skillset,
min_level: INT(1–5), is_required: boolean
```

### ProjectMember
```
id, project_id → Project, user_id → User,
project_role: string,
join_date, out_date nullable,
created_at
```

### Document
```
id, title, description,
type: ENUM(PDF, LINK, VIDEO),
url: string, file_path: string nullable,
skillset_tags: [skillset_id],
ai_tag_suggestions: JSON nullable,
created_by → User,
created_at, updated_at, deleted_at
```

### DocumentAssignment
```
id, document_id → Document,
assigned_to_user_id → User nullable,
assigned_to_team_id → Team nullable,
deadline: date nullable,
status: ENUM(NOT_STARTED, IN_PROGRESS, COMPLETED, CANCELLED),
assigned_by → User,
assigned_at, completed_at nullable
```

### DevelopmentGoal
```
id, user_id → User, skillset_id → Skillset,
target_level: INT(1–5), current_level: INT(1–5),
note: text, suggested_by → User nullable,
status: ENUM(IN_PROGRESS, COMPLETED, CANCELLED),
created_at, updated_at, completed_at nullable
```

### Notification
```
id, recipient_id → User, type: string,
title, body,
related_entity_type, related_entity_id,
is_read: boolean, created_at
```

### AuditLog
```
id, actor_id → User, action: string,
entity_type, entity_id,
old_data: JSON, new_data: JSON,
ip_address, user_agent,
created_at
```

### EmailTemplate
```
id, name, subject, body_html,
variables: [string],
trigger_event: string, is_active: boolean,
created_at, updated_at
```

### RatingScale
```
id, level: INT(1–5), label: string, description: string
```

### AIMatchResult _(transient — not persisted long-term)_
```
project_id, user_id, match_score: float(0–100),
matched_skills: [{ skillset_id, user_level, required_level }],
missing_skills: [{ skillset_id, required_level }],
generated_at
```

---

## 4. AUT-01 · Authentication & Profile

### 4.1 Login
- **Endpoint:** `POST /api/auth/login`
- **Input:** `{ email, password }`
- **Logic:**
  - Verify email exists and `status = ACTIVE`.
  - Compare password with bcrypt hash.
  - On success: return JWT access token + refresh token.
  - On `LOCKED` account: return `403` with message "Account is locked. Contact administrator."
  - On wrong password: return `401`. Do not reveal whether email exists.
  - If `must_change_password = true`: return token with flag `{ requiresPasswordChange: true }`. Frontend must redirect to change-password screen before allowing any other access.
- **Audit:** Log login success and failure.

### 4.2 Logout
- **Endpoint:** `POST /api/auth/logout`
- **Logic:** Invalidate refresh token server-side (blacklist or delete from store).

### 4.3 Forgot Password
- **Endpoint:** `POST /api/auth/forgot-password`
- **Input:** `{ email }`
- **Logic:** Always return `200` regardless of whether email exists (prevent user enumeration). If email exists: generate signed reset token (expires 1 hour), send `PASSWORD_RESET` email.
- **Endpoint:** `POST /api/auth/reset-password`
- **Input:** `{ token, new_password }`
- **Logic:** Validate token is valid and not expired. Update `password_hash`, invalidate token, set `must_change_password = false`.

### 4.4 Change Password
- **Endpoint:** `POST /api/auth/change-password`
- **Auth:** Any role
- **Input:** `{ current_password, new_password }`
- **Logic:** Verify `current_password` matches hash. Validate new password meets policy. Update hash, set `must_change_password = false`.

### 4.5 Get / Update Profile
- **Endpoint:** `GET /api/profile` — returns own user record.
- **Endpoint:** `PUT /api/profile` — update `full_name`, `phone`.
- **Read-only fields on profile:** `email`, `role`, `position_id` (managed by admin/manager only).

### 4.6 Upload Avatar
- **Endpoint:** `POST /api/profile/avatar`
- **Input:** Multipart file (jpg, png, webp; max 2 MB).
- **Logic:** Store file to object storage, update `avatar_url`. Delete old avatar.

### 4.7 General Settings
- **Endpoint:** `GET/PUT /api/profile/settings`
- **Fields:** `notification_email: boolean`, `language: ENUM(vi, en)`.

### 4.8 Assessment History
- **Endpoint:** `GET /api/profile/assessment-history`
- **Auth:** Any role (own data only)
- **Returns:** Own `SkillAssessment` records ordered by `assessed_at DESC`. Fields: skillset name, department, `self_score`, `manager_score`, `assessed_at`.

### 4.9 View Team Info
- **Endpoint:** `GET /api/profile/team`
- **Returns:** Current team name, manager name, list of teammates with their public skill profiles (skillset name + `self_score` only — no personal data).

---

## 5. USM-01 · User Management

### 5.1 List Users
- **Endpoint:** `GET /api/admin/users`
- **Auth:** `ADMIN` only
- **Query params:** `search` (partial name/email), `status`, `position_id`, `created_from`, `created_to`, `sort_by`, `sort_dir`, `page` (default 1), `page_size` (default 20)
- **Default sort:** `created_at DESC`
- **Returns:** Paginated list. Columns: `id`, `full_name`, `avatar_url`, `position`, `email`, `status`, `created_at`.

### 5.2 View User Activity Logs
- **Endpoint:** `GET /api/admin/users/:id/activity`
- **Auth:** `ADMIN` only
- **Returns:** `AuditLog` entries where `actor_id = :id`, ordered by `created_at DESC`.

### 5.3 Lock / Unlock Account
- **Endpoint:** `PATCH /api/admin/users/:id/status`
- **Auth:** `ADMIN` only
- **Input:** `{ status: "LOCKED" | "ACTIVE" }`
- **Rule:** Admin cannot lock their own account.

### 5.4 Delete Account
- **Endpoint:** `DELETE /api/admin/users/:id`
- **Auth:** `ADMIN` only
- **Logic:** Soft delete — set `status = DELETED`, `deleted_at = now()`. Remove from active team and project memberships.
- **Rule:** Admin cannot delete their own account.

### 5.5 Create User Account
- **Endpoint:** `POST /api/admin/users`
- **Auth:** `ADMIN` only
- **Input:** `{ email, full_name, role, position_id (optional), team_id (optional) }`
- **Logic:**
  - Generate a random password (min 10 chars, mixed case + number).
  - Set `must_change_password = true`.
  - Save user with `status = ACTIVE`.
  - Send `ACCOUNT_CREATED` email with credentials to the new user.

---

## 6. SKL-01 · Skillset Management

### 6.1 Career CRUD
- **Endpoints:** `GET/POST /api/admin/careers`, `GET/PUT/DELETE /api/admin/careers/:id`
- **Auth:** `ADMIN` only
- **Fields:** `name`, `description`
- **Example careers:** IT, Banking, Business, Design, Testing, BA
- **Rule:** Cannot delete a Career that has linked Departments.

### 6.2 Department CRUD
- **Endpoints:** `GET/POST /api/admin/departments`, `GET/PUT/DELETE /api/admin/departments/:id`
- **Auth:** `ADMIN` only
- **Fields:** `name`, `description`, `career_id`
- **Example:** Frontend Development (under IT Career)
- **Rule:** Cannot delete a Department that has linked Skillsets.

### 6.3 Skillset CRUD
- **Endpoints:** `GET/POST /api/admin/skillsets`, `GET/PUT/DELETE /api/admin/skillsets/:id`
- **Auth:** `ADMIN` only
- **Fields:** `name`, `description`, `department_id`, `level_descriptions` (JSON, keys 1–5)
- **Example skillsets:** VueJS, Microservices, Docker, Selenium
- **Rule:** Cannot delete a Skillset that has existing assessments or is tagged in documents.

### 6.4 Import / Export Skillsets
- **Endpoint:** `POST /api/admin/skillsets/import` — accepts `.xlsx`
- **Expected columns:** `career_name`, `department_name`, `skillset_name`, `description`, `level_1` … `level_5`
- **Logic:** Upsert by name. Create Career/Department if not existing.
- **Endpoint:** `GET /api/admin/skillsets/export` — returns `.xlsx` of all skillsets.

### 6.5 Self-Assessment
- **Endpoint:** `POST /api/assessments`
- **Auth:** Any role (assessing self only)
- **Input:** `{ skillset_id, self_score: INT(1–5), self_note: string }`
- **Logic:** If assessment already exists for this user + skillset: update and log the change in `AssessmentLog`. If new: create record. `manager_score` is not set by this endpoint.

### 6.6 Manager Review Assessment
- **Endpoint:** `PUT /api/assessments/:id/manager-review`
- **Auth:** `MANAGER` (must be manager of assessed user's team), `ADMIN`
- **Input:** `{ manager_score: INT(1–5), manager_note: string }`
- **Logic:** Update `manager_score`, `manager_note`, `assessed_by`, `assessed_at`. Log change in `AssessmentLog`. Send `ASSESSMENT_REVIEWED` notification to user.

### 6.7 Assessment Change Log
- **Endpoint:** `GET /api/assessments/:id/logs`
- **Auth:** Assessment owner, their Manager, Admin
- **Returns:** All `AssessmentLog` entries for the assessment, ordered by `changed_at DESC`.

### 6.8 Export Assessments
- **Endpoint:** `GET /api/assessments/export`
- **Auth:** Any role (scoped: own data for USER; team data for MANAGER; all for ADMIN)
- **Format:** `.xlsx`
- **Columns:** `employee_name`, `skillset`, `department`, `career`, `self_score`, `manager_score`, `assessed_at`

### 6.9 Development Goals
- **Endpoint:** `POST /api/goals` — create `{ skillset_id, target_level, note }`
- **Endpoint:** `GET /api/goals` — list own goals
- **Endpoint:** `PUT /api/goals/:id` — update `note` or `target_level`
- **Endpoint:** `PATCH /api/goals/:id/complete` — mark complete; auto-creates or updates self-assessment for the skillset at `target_level`
- **Auth:** `USER` (own goals only)

### 6.10 Manager Suggest Goals
- **Endpoint:** `POST /api/goals/suggest`
- **Auth:** `MANAGER`, `ADMIN`
- **Input:** `{ user_id, skillset_id, target_level, note }`
- **Logic:** Creates a goal with `suggested_by = manager_id` and `status = IN_PROGRESS`. User receives `GOAL_SUGGESTED` notification and must accept or reject.
- **Endpoint:** `PATCH /api/goals/:id/accept` — user accepts (status stays `IN_PROGRESS`).
- **Endpoint:** `PATCH /api/goals/:id/reject` — user rejects (status → `CANCELLED`).

---

## 7. SKL-02 · Upskill Document Management

### 7.1 Document Library CRUD
- **Endpoints:** `GET/POST /api/documents`, `GET/PUT/DELETE /api/documents/:id`
- **Auth CREATE/UPDATE/DELETE:** `ADMIN`; `MANAGER` (own documents only)
- **Auth READ:** All roles
- **Fields:** `title`, `description`, `type: ENUM(PDF, LINK, VIDEO)`, `url`, `skillset_tags: [skillset_id]`
- **Rule:** `MANAGER` can only edit or delete documents they created. `ADMIN` can manage all.
- **File upload:** `POST /api/documents/upload` — accepts PDF (max 20 MB), returns `file_path`.

### 7.2 Assign Document to Employee
- **Endpoint:** `POST /api/documents/:id/assign`
- **Auth:** `ADMIN`, `MANAGER`
- **Input:** `{ user_id, deadline (optional) }`
- **Rule:** `MANAGER` can only assign to members of their own team.
- **Creates:** `DocumentAssignment` with `status = NOT_STARTED`. Sends `DOCUMENT_ASSIGNED` notification.

### 7.3 Assign Document to Team
- **Endpoint:** `POST /api/documents/:id/assign-team`
- **Auth:** `MANAGER` (own team), `ADMIN`
- **Input:** `{ team_id, deadline (optional) }`
- **Logic:** Creates a `DocumentAssignment` for each active member of the team.

### 7.4 My Upskill List
- **Endpoint:** `GET /api/my-upskill`
- **Auth:** Any role
- **Returns:** All `DocumentAssignment` records for current user grouped into `pending` (NOT_STARTED + IN_PROGRESS) and `completed`.
- **Fields:** document title, type, deadline, status, skillset tags.

### 7.5 Update Learning Status
- **Endpoint:** `PATCH /api/my-upskill/:assignment_id/status`
- **Auth:** Assignee only
- **Input:** `{ status: "IN_PROGRESS" | "COMPLETED" }`
- **Logic:** On `COMPLETED`: set `completed_at = now()`.

### 7.6 Team Learning Dashboard
- **Endpoint:** `GET /api/team/learning-progress`
- **Auth:** `MANAGER` (own team), `ADMIN`
- **Query params:** `team_id`
- **Returns:** Per-member completion percentage, document list, individual status per member.

### 7.7 Send Learning Reminder
- **Endpoint:** `POST /api/team/learning-progress/remind`
- **Auth:** `MANAGER`, `ADMIN`
- **Input:** `{ team_id, document_id (optional) }`
- **Logic:** Sends `LEARNING_REMINDER` email to all members with incomplete assignments. Logs reminder in `AuditLog`.

---

## 8. TEM-01 · Team Management

### 8.1 Team CRUD
- **Endpoints:** `GET/POST /api/teams`, `GET/PUT/DELETE /api/teams/:id`
- **Auth CREATE:** `ADMIN`, `MANAGER`
- **Auth UPDATE/DELETE:** `ADMIN`; `MANAGER` own team only
- **Fields:** `name`, `description`, `manager_id`
- **Rule on delete:** Soft delete only. Members are not deleted; their `team_id` is set to null.
- **Rule on update:** Only the manager of the team can edit it (unless Admin).

### 8.2 Member Management
- **Endpoint:** `POST /api/teams/:id/members` — add `{ user_id, position }`
- **Endpoint:** `DELETE /api/teams/:id/members/:user_id` — remove
- **Endpoint:** `PATCH /api/teams/:id/members/:user_id` — update position
- **Auth:** `ADMIN`, `MANAGER` (own team)
- **Default position:** `"Member"`
- **Rule:** A user can only belong to one team at a time. Adding a user to a new team sets `left_at` on their previous `TeamMember` record.

### 8.3 View Team List
- **Endpoint:** `GET /api/teams`
- **Auth:** `ADMIN` (all teams), `MANAGER` (own team only)
- **Returns:** `id`, `name`, `manager_name`, `member_count`, `created_at`

### 8.4 View Team Details
- **Endpoint:** `GET /api/teams/:id`
- **Auth:** `ADMIN`, `MANAGER` (own team)
- **Returns:** Team info + full member list with `user_id`, `full_name`, `avatar_url`, `position`, `joined_at`.

### 8.5 View Member Detail
- **Endpoint:** `GET /api/teams/:id/members/:user_id`
- **Auth:** `MANAGER` (own team), `ADMIN`
- **Returns:** Full profile, assessment summary, active goals, assigned documents.

### 8.6 Member Notes
- **Endpoint:** `POST /api/teams/:id/members/:user_id/notes`
- **Auth:** `MANAGER` (own team), `ADMIN`
- **Input:** `{ content: string }`
- **Behaviour:** Replaces previous note (not appended).

### 8.7 Member Change Logs
- **Endpoint:** `GET /api/teams/:id/members/:user_id/logs`
- **Auth:** `MANAGER` (own team), `ADMIN`
- **Returns:** `AuditLog` entries related to this user's team membership, assessments, and document assignments.

---

## 9. PRJ-01 · Project Management

### 9.1 Project CRUD
- **Endpoints:** `GET/POST /api/projects`, `GET/PUT/DELETE /api/projects/:id`
- **Auth CREATE/UPDATE:** `ADMIN`, `MANAGER`
- **Auth DELETE:** `ADMIN` only (soft delete)
- **Fields:** `name`, `description`, `customer`, `start_date`, `end_date`, `status`
- **Status lifecycle:** `PLANNING → ACTIVE → CLOSED → ARCHIVED`
- **Rule:** A `CLOSED` project does not allow new member assignments.
- **Rule:** Status can only move forward; no reverting from `CLOSED` to `ACTIVE`.
- **Rule:** `MANAGER` can only edit projects they created or manage.

### 9.2 Project Skill Requirements
- **Endpoint:** `POST /api/projects/:id/skills` — add `{ skillset_id, min_level, is_required }`
- **Endpoint:** `PUT /api/projects/:id/skills/:skillset_id` — update
- **Endpoint:** `DELETE /api/projects/:id/skills/:skillset_id` — remove
- **Auth:** `ADMIN`, `MANAGER`

### 9.3 Project Member Allocation
- **Endpoint:** `POST /api/projects/:id/members` — allocate `{ user_id, project_role, join_date }`
- **Endpoint:** `PUT /api/projects/:id/members/:user_id` — update role or dates
- **Endpoint:** `DELETE /api/projects/:id/members/:user_id` — release (sets `out_date = today`)
- **Auth:** `ADMIN`, `MANAGER`
- **Rule:** Cannot add members to `CLOSED` or `ARCHIVED` projects.
- **Rule:** `MANAGER` can only allocate members from their own team (unless cross-team access granted).

### 9.4 Staff Project View
- **Endpoint:** `GET /api/my-projects`
- **Auth:** Any role
- **Returns:** Projects current user is a member of. Fields: project name, customer, status, own role, join/out dates.

### 9.5 Project Members List
- **Endpoint:** `GET /api/projects/:id/members`
- **Auth:** Any member of the project can view teammates; `MANAGER`, `ADMIN` see all.
- **Returns:** `full_name`, `avatar_url`, `project_role`, `join_date`, `out_date`.

### 9.6 Project Dashboard
- **Endpoint:** `GET /api/projects/:id/dashboard`
- **Auth:** `MANAGER` (assigned), `ADMIN`
- **Returns:** Status, member count, required skills list, skill gap summary (how many members meet each required skill level).

---

## 10. DSH-01 · Dashboard & Reporting

### 10.1 Personal Dashboard
- **Endpoint:** `GET /api/dashboard/personal`
- **Auth:** Any role
- **Returns:**
  - `radar_chart_data`: list of `{ skillset_name, department, self_score, manager_score }` for all user's assessments — used to render a radar/spider chart.
  - `top_skills`: top 5 skillsets by `manager_score` (fallback to `self_score`).
  - `focus_skills`: skillsets with score ≤ 2, or with a gap between user score and position's required level.
  - `todo_reminders`: incomplete document assignments with upcoming deadlines + pending manager-suggested goals.

### 10.2 Team Skill Matrix
- **Endpoint:** `GET /api/dashboard/team-matrix`
- **Auth:** `ADMIN`, `MANAGER`
- **Query params:** `team_id`, `skillset_id`, `min_level`, `member_name`
- **Returns:** Grid — rows = team members, columns = skillsets, cells = `{ self_score, manager_score }`.
- **Also returns:** `skill_coverage` — per skillset, percentage of members with `manager_score >= 3`.

### 10.3 Export Personal Profile PDF
- **Endpoint:** `GET /api/export/profile/pdf`
- **Auth:** Any role (own); `MANAGER`, `ADMIN` can pass `?user_id=` param.
- **Content:** Name, position, team, assessment table, radar chart image, development goals.

### 10.4 Export Team Matrix Excel/CSV
- **Endpoint:** `GET /api/export/team-matrix`
- **Auth:** `ADMIN`, `MANAGER`
- **Query params:** `team_id`, `format: xlsx | csv`
- **Content:** Member rows × skillset columns with score values.

### 10.5 Completion Rate Report
- **Endpoint:** `GET /api/dashboard/completion-rate`
- **Auth:** `ADMIN`, `MANAGER`
- **Query params:** `team_id`
- **Returns:** Per-member percentage of assigned documents completed, team average.

### 10.6 Trend Analysis _(Phase 2)_
- **Endpoint:** `GET /api/dashboard/trend`
- **Auth:** Any role (own data); `MANAGER`, `ADMIN` (team data)
- **Returns:** Assessment score over time per skillset, based on `AssessmentLog` history.
- **Note:** Requires at least 3 months of assessment data to be meaningful.

---

## 11. CFG-01 · App Configuration & Access Control

### 11.1 Roles Definition
- **Endpoint:** `GET /api/admin/config/roles`
- **Returns:** Role names and permission flag descriptors (read-only in v1; roles are fixed as ADMIN, MANAGER, USER).

### 11.2 Permission Matrix Config
- **Endpoint:** `GET/PUT /api/admin/config/permissions`
- **Auth:** `ADMIN` only
- **Controls:** Feature-level toggles per role (e.g. enable cross-team access for MANAGER).

### 11.3 Job Titles (Positions) CRUD
- **Endpoints:** `GET/POST /api/admin/positions`, `GET/PUT/DELETE /api/admin/positions/:id`
- **Auth:** `ADMIN` only
- **Fields:** `name`, `required_skills: [{ skillset_id, min_level }]`
- **Note:** `required_skills` is used by AI-02 (gap analysis) and AI-01 (resource matching).

### 11.4 Rating Scale Config
- **Endpoint:** `GET/PUT /api/admin/config/rating-scale`
- **Auth:** `ADMIN` only
- **Fields:** Per level 1–5: `label`, `description`
- **Default example:** `{ 1: "Beginner", 2: "Basic", 3: "Intermediate", 4: "Advanced", 5: "Expert" }`

### 11.5 SMTP Configuration
- **Endpoint:** `GET/PUT /api/admin/config/smtp`
- **Auth:** `ADMIN` only
- **Fields:** `host`, `port`, `username`, `password`, `from_email`, `from_name`, `use_tls`
- **Endpoint:** `POST /api/admin/config/smtp/test` — sends test email to admin's own email.

### 11.6 Email Templates
- **Endpoints:** `GET/POST /api/admin/email-templates`, `GET/PUT /api/admin/email-templates/:id`
- **Auth:** `ADMIN` only
- **Fields:** `name`, `subject`, `body_html`, `trigger_event`, `is_active`
- **Available trigger events:**
  - `ACCOUNT_CREATED` — welcome email with credentials
  - `PASSWORD_RESET` — reset link
  - `DOCUMENT_ASSIGNED` — new document assigned
  - `LEARNING_REMINDER` — incomplete document reminder
  - `GOAL_SUGGESTED` — manager suggested a goal
  - `ASSESSMENT_REVIEWED` — manager reviewed assessment

### 11.7 Notification Rules
- **Endpoint:** `GET/PUT /api/admin/config/notification-rules`
- **Auth:** `ADMIN` only
- **Controls:** Enable/disable each trigger event globally. Set reminder frequency (e.g. remind every 3 days for incomplete docs).

### 11.8 Audit Logs
- **Endpoint:** `GET /api/admin/audit-logs`
- **Auth:** `ADMIN` only
- **Query params:** `actor_id`, `entity_type`, `entity_id`, `from_date`, `to_date`, `page`, `page_size`
- **Returns:** Paginated `AuditLog` records with actor name, action, entity, timestamp.

---

## 12. AI-01 · Smart Resource Matching

> **Priority — delivered Sprint 3.**  
> Helps managers find best-fit employees for a project based on required skills.

### How it works
1. Manager defines `ProjectSkillRequirement` for a project (via PRJ-01 §9.2).
2. Manager triggers AI matching for the project.
3. System scores all eligible employees against requirements.
4. Ranked results returned with match score, skill overlap, missing skills.
5. Manager allocates directly from the results screen.

### 12.1 Trigger Match
- **Endpoint:** `POST /api/ai/resource-match`
- **Auth:** `MANAGER` (results scoped to own team), `ADMIN` (all teams)
- **Input:** `{ project_id, team_id (optional — ADMIN only, omit to search all) }`
- **Scoring logic per employee:**
  - `match_score = (sum of min(user_level, required_level) for all required skills) / (sum of required_level) * 100`
  - `user_level` = `manager_score` if set, else `self_score`. Default 0 if no assessment.
  - `matched_skills`: skills where `user_level >= required_level`.
  - `missing_skills`: skills where `user_level < required_level`.
- **Returns:** `[{ user_id, full_name, avatar_url, position, team_name, match_score, matched_skills, missing_skills, current_project_count }]` sorted by `match_score DESC`.

### 12.2 Allocate from Match Result
- **Endpoint:** `POST /api/ai/resource-match/allocate`
- **Auth:** `MANAGER`, `ADMIN`
- **Input:** `{ project_id, user_id, project_role, join_date }`
- **Logic:** Creates a `ProjectMember` record (same as §9.3). Records that this allocation originated from AI matching.

### 12.3 Admin Cross-Team Match
- When `ADMIN` calls `POST /api/ai/resource-match` without `team_id`, all teams are searched.
- Results include `team_name` field.

---

## 13. AI-02 · Skill Gap Analysis

> Compares an employee's current assessed skills against required skills for their Position.

### 13.1 Individual Gap Analysis
- **Endpoint:** `GET /api/ai/gap-analysis/user/:user_id`
- **Auth:** `MANAGER` (own team), `ADMIN`; or own user for self-view
- **Logic:**
  - Fetch user's `position.required_skills`.
  - For each required skill: compare `manager_score` (fallback `self_score`) vs `min_level`.
  - `gap = min_level - user_score` (positive = shortfall; negative = exceeds requirement).
- **Priority logic:** `HIGH` = gap >= 2, `MEDIUM` = gap == 1, `LOW` = gap <= 0.
- **Returns:** `{ user_id, position_name, gaps: [{ skillset_id, skillset_name, required_level, current_level, gap, priority }] }`

### 13.2 Team Gap Analysis
- **Endpoint:** `GET /api/ai/gap-analysis/team/:team_id`
- **Auth:** `MANAGER` (own team), `ADMIN`
- **Returns:** Per skillset — how many members are below required level, average gap score.

---

## 14. AI-03 · Learning Path Recommendation

> Based on gap analysis, AI sequences documents from the library into a personalised learning roadmap.

### 14.1 Generate Learning Path
- **Endpoint:** `POST /api/ai/learning-path`
- **Auth:** `MANAGER`, `ADMIN`
- **Input:** `{ user_id }`
- **Logic:**
  1. Run gap analysis for the user (calls AI-02 internally).
  2. For each HIGH priority gap skill: find all `Document` records tagged with that `skillset_id`.
  3. Call Claude API to generate a sequenced, prioritised document list with suggested deadlines.
- **Returns:** `{ user_id, recommended_path: [{ document_id, title, skillset_name, suggested_deadline, rationale }] }`

### 14.2 Auto-Assign Learning Path
- **Endpoint:** `POST /api/ai/learning-path/assign`
- **Auth:** `MANAGER`, `ADMIN`
- **Input:** `{ user_id, path: [{ document_id, deadline }] }`
- **Logic:** Creates `DocumentAssignment` records. User receives `DOCUMENT_ASSIGNED` notification.

### 14.3 User Interaction with AI Path
- AI-suggested assignments are tagged with `AI_SUGGESTED` in the "My Upskill" list.
- User can cancel individual items (sets assignment status to `CANCELLED`).
- User can request a revised path (triggers a new call to 14.1).

---

## 15. AI-04 · Skill Extraction from Documents

> On document upload, AI reads content and suggests matching skills from the skill library.

### 15.1 Extract Skills
- **Trigger:** Automatically called after `POST /api/documents/upload` for PDF type.
- **Manual endpoint:** `POST /api/ai/extract-skills`
- **Input:** `{ document_id }`
- **Logic:**
  1. Read PDF text.
  2. Fetch all `Skillset` names from library.
  3. Call Claude API: identify which skillsets are covered and at what depth (INTRODUCTORY / INTERMEDIATE / ADVANCED).
- **Returns:** `{ document_id, suggestions: [{ skillset_id, skillset_name, confidence: float, depth }] }`
- **Stored as:** Pending in `document.ai_tag_suggestions` until confirmed.

### 15.2 Confirm / Reject AI Tags
- **Endpoint:** `PUT /api/documents/:id/ai-tags`
- **Auth:** `ADMIN`, `MANAGER` (document creator)
- **Input:** `{ accepted_skillset_ids: [id], rejected_skillset_ids: [id] }`
- **Logic:** Merge `accepted_skillset_ids` into `document.skillset_tags`. Clear `ai_tag_suggestions`.

---

## 16. AI-05 · Self-Assessment Assistant

> In-page chatbot helps users rate themselves accurately by asking clarifying questions.

### 16.1 Start Session
- **Endpoint:** `POST /api/ai/assessment-assistant/start`
- **Auth:** Any role (own assessment only)
- **Input:** `{ skillset_id }`
- **Logic:** Call Claude API with skillset name and `level_descriptions`. Returns first clarifying question.
- **Returns:** `{ session_id, question: string }`

### 16.2 Continue Conversation
- **Endpoint:** `POST /api/ai/assessment-assistant/message`
- **Input:** `{ session_id, user_message: string }`
- **Logic:** Append to conversation history, call Claude API, return next question or score suggestion.
- **Returns:** `{ response: string, suggested_score: INT(1–5) | null, is_complete: boolean }`

### 16.3 Save Session Log
- When user finalises their self-assessment, the conversation log is stored in `SkillAssessment.assessment_ai_log` (JSON).
- Managers can view this log when reviewing the assessment via `GET /api/assessments/:id`.

---

## 17. AI-06 · Auto-Generate Skill Taxonomy

> Admin describes a new career or department; AI suggests a full Career → Department → Skillset hierarchy.

### 17.1 Generate Taxonomy
- **Endpoint:** `POST /api/ai/generate-taxonomy`
- **Auth:** `ADMIN` only
- **Input:** `{ description: string }` — e.g. "A frontend development department in a fintech company"
- **Logic:** Claude API generates structured taxonomy with career, departments, skillsets, and 1–5 level descriptions.
- **Returns:**
```json
{
  "career": { "name": "IT", "description": "..." },
  "departments": [
    {
      "name": "Frontend Development",
      "skillsets": [
        {
          "name": "ReactJS",
          "level_descriptions": { "1": "...", "2": "...", "3": "...", "4": "...", "5": "..." }
        }
      ]
    }
  ]
}
```

### 17.2 Bulk Import Taxonomy
- **Endpoint:** `POST /api/ai/generate-taxonomy/import`
- **Auth:** `ADMIN` only
- **Input:** JSON from 17.1 (can be edited before submitting).
- **Logic:** Creates all Career, Department, and Skillset records. Upserts by name (skips existing).

---

## 18. AI-07 · Team Trend & Attrition Risk _(Phase 2)_

> Monitors assessment trends over time and flags early risk signals. Requires historical data (min 3 months).

### 18.1 Trend Analysis
- **Endpoint:** `GET /api/ai/trend/:team_id`
- **Auth:** `MANAGER` (own team), `ADMIN`
- **Logic:** Uses `AssessmentLog` history to compute skill score trajectory per member. Returns slope and direction per skillset: `IMPROVING / STAGNANT / DECLINING`.

### 18.2 Attrition Risk Score
- **Endpoint:** `GET /api/ai/risk-score/:team_id`
- **Auth:** `MANAGER`, `ADMIN`
- **Risk signals:**
  - Score stagnation (no improvement in 3+ months)
  - Low document completion rate
  - Skill misalignment with team direction
  - No active development goals
- **Returns:** `[{ user_id, risk_score: float(0–1), risk_level: "LOW"|"MEDIUM"|"HIGH", contributing_factors: [string] }]`

### 18.3 Risk Threshold Alert
- Weekly cron job: if any member's `risk_level` changes to `HIGH`, send in-app + email notification to their Manager.
- Threshold configurable in CFG-01 notification rules.

---

## 19. AI-08 · Natural Language Matrix Query _(Phase 2)_

> Manager types plain-text query; AI translates it to a skill matrix filter and returns live results.

### 19.1 Query
- **Endpoint:** `POST /api/ai/matrix-query`
- **Auth:** `MANAGER`, `ADMIN`
- **Input:** `{ query: string, team_id (optional) }` — e.g. "show me team members who know ReactJS above level 3 and haven't been on a project this quarter"
- **Logic:**
  1. Claude API parses query into structured filter params: `{ skillset_filters: [{ skillset_id, min_level }], exclude_active_project: bool, ... }`.
  2. System executes structured query against database.
- **Returns:** Same format as `GET /api/dashboard/team-matrix` but with applied filters.

### 19.2 Save Named Query
- **Endpoint:** `POST /api/ai/matrix-query/save`
- **Input:** `{ name: string, query: string, resolved_filters: JSON }`
- **Endpoint:** `GET /api/ai/matrix-query/saved` — list saved queries.
- **Endpoint:** `POST /api/ai/matrix-query/run/:id` — re-execute saved query.

---

## 20. AI-09 · JD Scan & Resource Finder

> **Standalone AI feature.** Reads a Job Description (JD) and instantly answers: who in the organisation fits, what's missing, and what to do next. Bridges external hiring/bidding demand with the internal skill matrix.

### How it works
1. User submits a JD (paste text, upload file, or reload from history).
2. AI extracts required skills, levels, importance, and inferred positions.
3. Extracted skills are mapped onto the internal Skillset taxonomy (unmapped skills are flagged).
4. System scores employees in scope against weighted requirements and computes the resource gap.
5. Response returns up to 4 structured sections; user can ask follow-up questions in the same chat session.
6. From the result, the user can allocate people, push skills to a project, save the JD, export a report, trigger learning paths, or add unmatched skills to the taxonomy.

### 20.1 Data Entities

#### JDScan
```
id, title: string, source_type: ENUM(PASTE, UPLOAD, SAVED_RELOAD),
raw_text: text, file_path: string nullable, file_name: string nullable,
extracted_skills: JSON [{ skillset_id nullable, raw_name, category, required_level, importance, unmatched: boolean }],
inferred_positions: JSON [{ position_id nullable, raw_title, required_headcount, key_skills, unmatched: boolean }],
scope: JSON { team_id nullable, department_id nullable, org_wide: boolean },
created_by → User, created_at, updated_at, deleted_at
```

#### JDScanSession _(chat session — short-lived; for follow-up Q&A)_
```
id, jd_scan_id → JDScan, owner_id → User,
messages: JSON [{ role: "user"|"assistant", content, created_at }],
created_at, last_activity_at, expires_at
```

#### JDScanResult _(transient — recomputed on each scope change)_
```
jd_scan_id, scope,
skill_analysis: [{ skillset_id, skillset_name, category, required_level, importance, unmatched }],
position_requirement: [{ position_id, position_title, required_headcount, key_skills, unmatched }],
employee_matches: [{ user_id, full_name, position, team_name, match_score, matched_skills, active_project_count }],
capability_analysis: [{ skillset_id, required_level, required_headcount, currently_qualified, total_coverage, resource_gap }],
generated_at
```

### 20.2 Submit JD — Paste Text
- **Endpoint:** `POST /api/ai/jd-scan/submit-text`
- **Auth:** `MANAGER`, `ADMIN`
- **Input:** `{ title (optional), raw_text: string, scope: { team_id?, department_id?, org_wide? } }`
- **Validation:**
  - `raw_text.length <= 8000` characters. Reject with `400` and `{ error: "JD_TEXT_TOO_LONG", limit: 8000 }` if exceeded.
  - `MANAGER` may only set `team_id` they own (or `org_wide = false`). `org_wide = true` requires `ADMIN` or cross-team grant via CFG-01 §11.2.
- **Logic:** Create `JDScan` with `source_type = PASTE`, run AI extraction pipeline (§20.6), return scan id + initial result.

### 20.3 Submit JD — Upload File
- **Endpoint:** `POST /api/ai/jd-scan/submit-file`
- **Auth:** `MANAGER`, `ADMIN`
- **Input:** Multipart — `file` (PDF, DOCX, or TXT; max 10 MB), `title (optional)`, `scope` (JSON).
- **Logic:**
  - Reject unsupported MIME types with `400 { error: "UNSUPPORTED_FILE_TYPE" }`.
  - Extract text server-side: PDFBox (PDF), Apache POI (DOCX), raw read (TXT).
  - Apply same 8,000-character truncation rule as §20.2; if truncated, return `extracted_text_truncated: true` in the response so the UI can warn.
  - Persist file to object storage; create `JDScan` with `source_type = UPLOAD`, then run extraction pipeline.

### 20.4 Submit JD — Reload Saved
- **Endpoint:** `POST /api/ai/jd-scan/submit-saved`
- **Auth:** `MANAGER` (own saved JDs), `ADMIN` (all)
- **Input:** `{ jd_scan_id, scope (optional override) }`
- **Logic:** Re-run the AI extraction + scoring pipeline against fresh employee data, optionally with a different scope. Original `JDScan` record is reused; result is recomputed.

### 20.5 List Saved JDs
- **Endpoint:** `GET /api/ai/jd-scan`
- **Auth:** `MANAGER` (own JDs only), `ADMIN` (all)
- **Query params:** `search` (partial title), `created_from`, `created_to`, `page`, `page_size`
- **Returns:** Paginated list `{ id, title, source_type, created_by, created_at }`.
- **Endpoint:** `GET /api/ai/jd-scan/:id` — full scan record including last result.
- **Endpoint:** `DELETE /api/ai/jd-scan/:id` — soft delete (own JDs for MANAGER; any for ADMIN).

### 20.6 AI Extraction Pipeline _(internal)_

Sequence executed by every submit endpoint:

1. **Parse** — Pull raw text from file or accept pasted text.
2. **AI Extract** — Call Claude API with the JD text **and** the full list of internal `Skillset` names + `Position` names. The taxonomy grounding prevents hallucinated skill names. AI returns:
   - Skills with `category` (Technical / Soft), `required_level` (1–5), `importance` (HIGH / MEDIUM / LOW), and a candidate `skillset_name`.
   - Inferred positions with `required_headcount` and `key_skills`.
3. **Map to Taxonomy** — Match AI skill names to existing `Skillset` rows by name (case-insensitive, fuzzy fallback). Unmatched skills are kept with `unmatched: true` and a `raw_name` field — shown to the user as "Not in system" with an option to add.
4. **Score Employees** — Run weighted match scoring (§20.7) against every employee in scope.
5. **Gap Analysis** — Per skill: count qualified employees vs. required headcount; compute `resource_gap`.
6. **Respond** — Return the 4 structured sections (§20.8). AI may omit sections that are not relevant to a follow-up question (see §20.10).

### 20.7 Scoring Logic

Weighted skill match score per employee:

```
weight(importance) = HIGH:3, MEDIUM:2, LOW:1
user_level(skill)  = manager_score if set, else self_score, else 0
contribution(skill)= min(user_level, required_level) * weight(importance)
max_possible(skill)= required_level * weight(importance)
match_score        = (sum of contribution / sum of max_possible) * 100
```

- `matched_skills` = required skills where `user_level >= required_level`.
- `active_project_count` = number of `ProjectMember` records where `out_date IS NULL` and project status is `ACTIVE`.
- Results sorted by `match_score DESC`.

### 20.8 Output — 4 Structured Sections

Each scan response includes up to 4 sections. AI selects the relevant ones based on the question/intent.

1. **JD Skill Analysis** _(AI extracted)_ — `[{ skillset_id nullable, skillset_name, category, required_level (1–5), importance (HIGH/MEDIUM/LOW), unmatched }]`
2. **Position & Resource Requirement** _(AI inferred)_ — `[{ position_id nullable, position_title, required_headcount, key_skills, unmatched }]`
3. **Employee Matching List** _(DB computed)_ — `[{ user_id, full_name, position, team_name, department, key_matched_skills, match_score, active_project_count }]`
4. **Resource Capability Analysis** _(DB computed)_ — `[{ skillset_id, skillset_name, required_level, required_employees, currently_qualified, total_coverage, resource_gap }]`
   - `resource_gap` = `currently_qualified - required_employees`. Negative = shortage (hire or upskill); positive = surplus.

### 20.9 Start Chat Session
- **Endpoint:** `POST /api/ai/jd-scan/:id/chat/start`
- **Auth:** Scan owner; `ADMIN`
- **Logic:** Create a `JDScanSession` keyed to the scan. Returns `session_id`.

### 20.10 Continue Chat Session
- **Endpoint:** `POST /api/ai/jd-scan/chat/:session_id/message`
- **Auth:** Session owner; `ADMIN`
- **Input:** `{ user_message: string }`
- **Logic:** Append the user message to history, call Claude API with full JD context + conversation history + live system data (queried fresh on each turn), and stream the response. AI may emit any subset of the 4 sections, or pure-text answers, based on intent.
- **Supported question categories:**
  - **Skill questions** — "What technical skills are needed?", "What level is required for Python?"
  - **People questions** — "Who is the best match?", "Top 5 candidates", "Who has Python at level 4 or above?", "Is Nguyen Van A a good fit?"
  - **Team readiness questions** — "Can Team Backend handle this?", "How many people do we need to hire?"
  - **Action questions** — Trigger flows in §20.11–§20.16 (e.g., "Apply these skills to Project Alpha", "Save this JD", "Export as report", "Suggest upskilling for the gaps")
- **Returns:** `{ response: string, sections?: { skill_analysis?, position_requirement?, employee_matches?, capability_analysis? }, suggested_actions?: [{ type, payload }] }`
- **Session expiry:** Sessions expire after 24 hours of inactivity. Conversation is not persisted beyond expiry.

### 20.11 Action — Allocate to Project
- **Endpoint:** `POST /api/ai/jd-scan/:id/actions/allocate`
- **Auth:** `MANAGER` (own team scope), `ADMIN`
- **Input:** `{ project_id, user_id, project_role, join_date }`
- **Logic:** Creates a `ProjectMember` (same logic as PRJ-01 §9.3 and AI-01 §12.2). Marks origin as `JD_SCAN`.

### 20.12 Action — Apply Skills to Project
- **Endpoint:** `POST /api/ai/jd-scan/:id/actions/apply-to-project`
- **Auth:** `MANAGER` (own/managed projects), `ADMIN`
- **Input:** `{ project_id, skill_ids: [skillset_id] }` — user-confirmed subset of the extracted skills.
- **Logic:** For each `skill_id`, upsert a `ProjectSkillRequirement` with `min_level` from the JD analysis and `is_required = true` for HIGH/MEDIUM importance. Returns the resulting list of project requirements.

### 20.13 Action — Save JD to History
- **Endpoint:** `POST /api/ai/jd-scan/:id/actions/save`
- **Auth:** `MANAGER` (own personal history), `ADMIN`
- **Input:** `{ title }`
- **Logic:** Promotes a transient/anonymous scan to a named saved JD. Title becomes searchable in §20.5.
- **Retention rule:** Saved JDs retained indefinitely (soft delete only). Raw text is encrypted at rest.

### 20.14 Action — Export Report
- **Endpoint:** `GET /api/ai/jd-scan/:id/export`
- **Auth:** Scan owner; `ADMIN`
- **Query params:** `format: pdf | xlsx`
- **Content:** All 4 output sections, generation timestamp, scope, and the scan title.

### 20.15 Action — Suggest Upskilling for Gaps
- **Endpoint:** `POST /api/ai/jd-scan/:id/actions/suggest-upskilling`
- **Auth:** `MANAGER` (own team), `ADMIN`
- **Input:** `{ skill_ids: [skillset_id] }` — gaps to address.
- **Logic:** For each under-qualified employee identified for those skills, call AI-03 §14.1 to generate a learning path. Returns `[{ user_id, recommended_path }]`. Does not auto-assign — caller can confirm via AI-03 §14.2.

### 20.16 Action — Add Unmatched Skill to Taxonomy
- **Endpoint:** `POST /api/ai/jd-scan/:id/actions/add-skill`
- **Auth:** `ADMIN` only
- **Input:** `{ raw_name, department_id (optional) }`
- **Logic:** Calls AI-06 §17.1 with a description seeded from the JD context to auto-generate `level_descriptions`. Creates the `Skillset`. Re-maps the JD's unmatched entry to the new skillset id and updates the scan's `extracted_skills`.

### 20.17 Scope & RBAC

| Capability | MANAGER | ADMIN |
|------------|---------|-------|
| Submit / reload JD | ✅ (own team scope by default) | ✅ (any scope) |
| Cross-team employee matching | ✅ only if granted via CFG-01 §11.2 | ✅ |
| Org-wide gap analysis | ❌ | ✅ |
| Apply skills to project | ✅ projects they own/manage | ✅ all |
| Save JD to personal history | ✅ | ✅ |
| View other managers' saved JDs | ❌ | ✅ |
| Add unmatched skill to taxonomy | ❌ | ✅ |

### 20.18 Data Exposed to the AI

The AI receives only data the requesting user is RBAC-authorised to see, plus taxonomy reference data needed for grounding:

- `Skillset` (name, category, `level_descriptions`)
- `SkillAssessment` (`self_score`, `manager_score`) — scoped
- `User` (name, position, team, department, career) — scoped
- `Position` (name, `required_skills`, `min_level`)
- `Team` (name, department, manager) — scoped
- `Department` (name, career)
- `ProjectMember` (active count per user) — scoped
- Permission Matrix (cross-team access flag for the requesting user)

**Never exposed to the AI:** password hashes, audit logs, email content, SMTP config, notification rules, or any record outside the requesting user's RBAC scope.

### 20.19 Connections to Other Features

- **AI-01 Resource Matching** — JD scan is an input layer. After extraction, AI-09 reuses AI-01's scoring engine to score employees.
- **AI-02 Gap Analysis** — Complementary; AI-02 measures gap between employee vs. their position, AI-09 measures gap between team vs. a JD.
- **AI-03 Learning Path** — §20.15 triggers AI-03 for under-qualified employees on a per-skill basis.
- **AI-04 Skill Extraction** — Same Claude provider interface; AI-04 reads upskill documents (supply), AI-09 reads JDs (demand).
- **AI-06 Taxonomy Generator** — §20.16 calls AI-06 to bootstrap unmatched skills into the taxonomy.
- **PRJ-01 Project Management** — §20.12 writes extracted skills directly into `ProjectSkillRequirement`.

### 20.20 Error Handling
- AI provider unavailable → `503 Service Unavailable`. JD scan is AI-mandatory; it cannot degrade gracefully (extraction is the core step). Failed submissions are not persisted; the user is asked to retry.
- File parse failure → `422 { error: "FILE_PARSE_FAILED" }` with the reason. The uploaded file is discarded.
- Empty extraction (AI returns zero skills) → `200` with empty `skill_analysis` and a `warning: "NO_SKILLS_DETECTED"` flag — caller may prompt the user to refine the JD.

---

## 21. Notification & Email Rules

### Trigger Events

| Event | Recipient | Template | When |
|-------|-----------|----------|------|
| `ACCOUNT_CREATED` | New user | Welcome + credentials | Admin creates account |
| `PASSWORD_RESET` | User | Reset link (1 hr expiry) | User requests reset |
| `DOCUMENT_ASSIGNED` | User | Doc title + deadline | Doc assigned to user or team |
| `LEARNING_REMINDER` | User | Incomplete doc list | Manual trigger or cron |
| `GOAL_SUGGESTED` | User | Goal details + manager name | Manager suggests a goal |
| `ASSESSMENT_REVIEWED` | User | Score + manager note | Manager reviews assessment |

### In-App Notifications
- All above events create a `Notification` record in DB.
- **Endpoint:** `GET /api/notifications` — unread notifications for current user.
- **Endpoint:** `PATCH /api/notifications/:id/read` — mark one as read.
- **Endpoint:** `PATCH /api/notifications/read-all` — mark all as read.

---

## 22. Audit & Logging Rules

Every write operation on sensitive entities must log to `AuditLog`:
`actor_id`, `action`, `entity_type`, `entity_id`, `old_data (JSON)`, `new_data (JSON)`, `ip_address`, `created_at`.

| Entity | Actions to Log |
|--------|---------------|
| User | create, update, lock, unlock, delete |
| SkillAssessment | create, update (score changes) |
| TeamMember | add, remove, position_change |
| DocumentAssignment | assign, status_change, remind |
| Project | create, update, status_change, member_add, member_remove |
| Skillset | create, update, delete |
| DevelopmentGoal | create, complete, cancel |
| JDScan | submit, save, delete, action_apply_skills, action_add_skill |
| Login events | success, failure |
| PasswordReset | requested, completed |

---

## 23. Global Business Rules

1. **Soft delete only** — no hard deletes on User, Team, Project, Document. Use `deleted_at` timestamp.
2. **Password policy** — minimum 8 characters, at least 1 uppercase letter, 1 number.
3. **Rating scale** — scores are integers 1–5. Labels and descriptions are configurable via CFG-01.
4. **Score precedence** — `manager_score` always takes precedence over `self_score` in all calculations (gap analysis, AI matching). Fall back to `self_score` when `manager_score` is null.
5. **Assessment immutability** — once `manager_score` is set, users can still update `self_score` but every change is logged. Manager must explicitly re-review to update `manager_score`.
6. **Single team membership** — a user belongs to at most one team at a time. Changing teams sets `left_at` on the previous `TeamMember` record.
7. **Project closure** — `CLOSED` or `ARCHIVED` status prevents new member allocations. Existing `ProjectMember` records remain for historical reference.
8. **Cross-team access** — `MANAGER` is scoped to own team by default. Cross-team read access for resource matching can be granted per-manager by `ADMIN` via Permission Matrix (CFG-01 §11.2).
9. **AI fallback** — if the Claude API is unavailable, all AI endpoints return `503 Service Unavailable`. The core system must be fully functional without AI features.
10. **Data ownership** — `MANAGER` can only modify documents they created. `ADMIN` can modify all.
11. **Critical email override** — account creation, password reset, and document assignment always send email regardless of the user's notification preference settings.
12. **Pagination defaults** — all list endpoints: `page = 1`, `page_size = 20`. Maximum `page_size = 100`.
13. **Timezone** — all timestamps stored in UTC. Frontend displays in user's local timezone.
14. **File storage** — uploaded files (avatars, PDFs) stored in S3-compatible object storage. Only paths stored in DB.
15. **Goal auto-assessment** — when a `DevelopmentGoal` is marked complete, the system automatically creates or updates the user's `SkillAssessment` for that skillset at `target_level` (as a self-assessment entry).
