# Skill Matrix — Feature List

> **For Claude Code:** Read this file before generating any backend (Java Spring Boot) or frontend code.
> Features are grouped by feature code. Each entry includes: sub-feature, endpoints, HTTP method, roles, request/response contract, DB entities touched, business rules, and frontend component hints.

---

## Tech Stack Reference

| Layer | Technology |
|---|---|
| Backend | Java Spring Boot (REST API) |
| Database | PostgreSQL |
| Auth | JWT (access token + refresh token), bcrypt password hash |
| AI | Anthropic Claude API — model `claude-sonnet-4-20250514` |
| File Storage | S3-compatible object storage (avatars, PDFs) |
| Frontend | Angular / ReactJS / NextJS / VueJS (team choice) |
| Email | SMTP (configurable via admin panel) |

---

## Global Rules (apply to ALL features)

- **Soft delete only** — no hard deletes on `User`, `Team`, `Project`, `Document`. Use `deleted_at` timestamp.
- **Pagination defaults** — all list endpoints: `page=1`, `page_size=20`, max `page_size=100`.
- **Timestamps** — stored in UTC; frontend renders in user's local timezone.
- **Scoring** — `manager_score` always takes precedence over `self_score` in calculations. Fall back to `self_score` when `manager_score` is null.
- **Password policy** — min 8 chars, at least 1 uppercase, 1 number, 1 special char; max 32 chars.
- **AI fallback** — if Claude API is unreachable, all `/api/ai/*` endpoints return `503 Service Unavailable`. Core system must work without AI.
- **Audit logging** — every write on sensitive entities must create an `AuditLog` record with `actor_id`, `action`, `entity_type`, `entity_id`, `old_data`, `new_data`, `ip_address`, `created_at`.
- **File upload limits** — avatars: jpg/png/webp, max 2 MB. Documents: PDF, max 20 MB. Store path in DB, file in S3.

---

## Roles Reference

| Role | Access Scope |
|---|---|
| `ADMIN` | Full access — all data, all config, all teams |
| `MANAGER` | Own team only (can be granted cross-team read by ADMIN) |
| `USER` | Self only — own profile, assessments, assigned docs, own projects |

---

---

---

# SKL · Skillset Management

---

## SKL-01 · Career CRUD

**Roles:** `ADMIN`

**Backend:**
- `GET /api/admin/careers` — list all; supports `search` query param.
- `POST /api/admin/careers` — `{ name: string, description: string }`
- `GET /api/admin/careers/:id`
- `PUT /api/admin/careers/:id` — `{ name, description }`
- `DELETE /api/admin/careers/:id` — **Rule:** Cannot delete if linked Departments exist.
- **Audit:** Log create/update/delete.

**DB Entity:** `Career { id, name, description, created_at, updated_at, deleted_at }`

**Frontend:**
- Page: `/admin/skills/careers`
- Table with Name, Description, # Departments, Actions.
- Inline edit or modal form.

---

## SKL-02 · Department CRUD

**Roles:** `ADMIN`

**Backend:**
- `GET /api/admin/departments` — supports `career_id` filter.
- `POST /api/admin/departments` — `{ name: string, description: string, career_id: number }`
- `PUT /api/admin/departments/:id`, `DELETE /api/admin/departments/:id`.
- **Rule:** Cannot delete if linked Skillsets exist.
- **Audit:** Log create/update/delete.

**DB Entity:** `Department { id, name, description, career_id → Career, created_at, updated_at, deleted_at }`

**Frontend:**
- Page: `/admin/skills/departments`
- Grouped by Career, or filterable by Career dropdown.

---

## SKL-03 · Skillset CRUD

**Roles:** `ADMIN`

**Backend:**
- `GET /api/admin/skillsets` — supports `department_id`, `career_id`, `search` filters.
- `POST /api/admin/skillsets` — `{ name, description, department_id, level_descriptions: { "1": string, "2": string, "3": string, "4": string, "5": string } }`
- `PUT /api/admin/skillsets/:id`, `DELETE /api/admin/skillsets/:id`.
- **Rule:** Cannot delete if existing assessments or document tags reference this skillset.
- **Audit:** Log create/update/delete.

**DB Entity:** `Skillset { id, name, description, department_id → Department, level_descriptions: JSONB, created_at, updated_at, deleted_at }`

**Frontend:**
- Page: `/admin/skills/skillsets`
- 3-level breadcrumb tree: Career > Department > Skillset.
- Edit form includes a "Level Descriptions" section with 5 text fields for levels 1–5.

---

## SKL-04 · Import / Export Skillsets

**Roles:** `ADMIN`

**Backend:**
- `POST /api/admin/skillsets/import` — accepts `.xlsx`.
  - **Expected columns:** `career_name`, `department_name`, `skillset_name`, `description`, `level_1`, `level_2`, `level_3`, `level_4`, `level_5`.
  - **Logic:** Upsert by name. Auto-create Career/Department if not existing.
  - **Response:** `{ created: number, updated: number, skipped: number, errors: [string] }`
- `GET /api/admin/skillsets/export` — returns `.xlsx` with all skillsets.

**Frontend:**
- Import button with file upload drag-and-drop. Show import results in a summary modal.
- Export button that triggers file download.

---

## SKL-05 · Self-Assessment

**Roles:** ALL (authenticated, own only)

**Backend:**
- `POST /api/assessments`
- **Request body:** `{ skillset_id: number, self_score: int (1–5), self_note?: string }`
- **Logic:**
  - If record exists for `(user_id, skillset_id)`: update `self_score`, `self_note`, log change to `AssessmentLog`.
  - If new record: create `SkillAssessment`.
  - `manager_score` is never set by this endpoint.
- **Response:** Created/updated `SkillAssessment`.

**DB Entity:** `SkillAssessment { id, user_id, skillset_id, self_score, self_note, manager_score, manager_note, assessed_by, assessed_at, assessment_ai_log: JSONB, created_at, updated_at }`

**Frontend:**
- Component: Skill Assessment Modal / Slide-over.
- 1–5 star or slider rating with `level_descriptions` shown as helper text per level.
- Optional text note field.
- "Start AI Assistant" button (calls AI-05).

---

## SKL-06 · Manager Review Assessment

**Roles:** `MANAGER` (own team only), `ADMIN`

**Backend:**
- `PUT /api/assessments/:id/manager-review`
- **Request body:** `{ manager_score: int (1–5), manager_note?: string }`
- **Auth check:** Verify `MANAGER` is the manager of the assessed user's team.
- **Logic:** Update `manager_score`, `manager_note`, `assessed_by = current_user_id`, `assessed_at = now()`. Log to `AssessmentLog`. Send `ASSESSMENT_REVIEWED` in-app + email notification.
- **Business rule:** Once `manager_score` is set, user can still update `self_score` but every change is logged. Manager must explicitly re-review to update `manager_score`.

**Frontend:**
- Team skill matrix page: each cell opens a review panel.
- Shows user's self score + note, then manager score input + note field.

---

## SKL-07 · Assessment Change Log

**Roles:** Assessment owner, their MANAGER, ADMIN

**Backend:**
- `GET /api/assessments/:id/logs`
- **Response:** Paginated `AssessmentLog` entries ordered by `changed_at DESC`.
- **Fields:** `changed_by_name`, `field_changed`, `old_value`, `new_value`, `changed_at`.

**DB Entity:** `AssessmentLog { id, assessment_id, changed_by, old_self_score, new_self_score, old_manager_score, new_manager_score, changed_at }`

**Frontend:**
- Assessment detail panel: "Change History" collapsible section.

---

## SKL-08 · Export Assessments

**Roles:** ALL (scoped: own for USER, team for MANAGER, all for ADMIN)

**Backend:**
- `GET /api/assessments/export`
- **Query params:** `team_id` (MANAGER/ADMIN), `user_id` (ADMIN only), `format=xlsx`.
- **Columns in output:** `employee_name`, `skillset`, `department`, `career`, `self_score`, `manager_score`, `assessed_at`.

**Frontend:**
- Export button on skill matrix and personal profile pages.

---

## SKL-09 · Development Goals (User)

**Roles:** `USER` (own goals only)

**Backend:**
- `POST /api/goals` — `{ skillset_id, target_level: int (1–5), note?: string }`
- `GET /api/goals` — list own goals; filter by `status`.
- `PUT /api/goals/:id` — update `note`, `target_level`.
- `PATCH /api/goals/:id/complete` — mark complete; auto-creates/updates `SkillAssessment` for skillset at `target_level` (as a self-assessment entry).
- `PATCH /api/goals/:id/accept` — accept manager-suggested goal (status stays `IN_PROGRESS`).
- `PATCH /api/goals/:id/reject` — reject manager-suggested goal (`status → CANCELLED`).

**DB Entity:** `DevelopmentGoal { id, user_id, skillset_id, target_level, current_level, note, suggested_by?, status: ENUM(IN_PROGRESS, COMPLETED, CANCELLED), created_at, updated_at, completed_at }`

**Frontend:**
- Page: `/goals` — goal cards with progress bar showing current_level vs target_level.
- "Mark Complete" button triggers confirmation modal.

---

## SKL-10 · Manager Suggest Goals

**Roles:** `MANAGER`, `ADMIN`

**Backend:**
- `POST /api/goals/suggest`
- **Request body:** `{ user_id, skillset_id, target_level, note? }`
- **Logic:** Create goal with `suggested_by = current_manager_id`, `status = IN_PROGRESS`. Send `GOAL_SUGGESTED` notification to user.

**Frontend:**
- Manager team view: per-member action menu includes "Suggest Goal".
- Form: select skillset from dropdown, set target level, optional note.

---

---

---

## Database Schema Summary

> All tables include `created_at`, `updated_at`. Soft-deletable tables include `deleted_at`.

| Table | Key Fields |
|---|---|
| `users` | `id`, `email`, `password_hash`, `full_name`, `phone`, `avatar_url`, `role: ENUM(ADMIN,MANAGER,USER)`, `position_id`, `status: ENUM(ACTIVE,LOCKED,DELETED)`, `must_change_password`, `deleted_at` |
| `careers` | `id`, `name`, `description`, `deleted_at` |
| `departments` | `id`, `name`, `description`, `career_id`, `deleted_at` |
| `skillsets` | `id`, `name`, `description`, `department_id`, `level_descriptions: JSONB`, `deleted_at` |
| `positions` | `id`, `name`, `required_skills: JSONB([{skillset_id, min_level}])` |
| `teams` | `id`, `name`, `description`, `manager_id`, `deleted_at` |
| `team_members` | `id`, `team_id`, `user_id`, `position_id`, `join_date`, `left_at` |
| `member_notes` | `id`, `team_id`, `user_id`, `manager_id`, `content`, `created_at` |
| `projects` | `id`, `name`, `description`, `customer`, `start_date`, `end_date`, `status: ENUM(PLANNING,ACTIVE,CLOSED,ARCHIVED)`, `created_by`, `deleted_at` |
| `project_skill_requirements` | `id`, `project_id`, `skillset_id`, `min_level` |
| `project_members` | `id`, `project_id`, `user_id`, `project_role`, `join_date`, `out_date`, `ai_matched` |
| `skill_assessments` | `id`, `user_id`, `skillset_id`, `self_score`, `self_note`, `manager_score`, `manager_note`, `assessed_by`, `assessed_at`, `assessment_ai_log: JSONB`, `evidence_ref: text?` |
| `assessment_logs` | `id`, `assessment_id`, `changed_by`, `old_self_score`, `new_self_score`, `old_manager_score`, `new_manager_score`, `changed_at` |
| `development_goals` | `id`, `user_id`, `skillset_id`, `target_level`, `current_level`, `note`, `suggested_by`, `status: ENUM(IN_PROGRESS,COMPLETED,CANCELLED)`, `completed_at` |
| `documents` | `id`, `title`, `description`, `type: ENUM(PDF,LINK,VIDEO)`, `url`, `file_path`, `skillset_tags: int[]`, `ai_tag_suggestions: JSONB`, `created_by`, `deleted_at` |
| `document_assignments` | `id`, `document_id`, `user_id`, `assigned_by`, `deadline`, `status: ENUM(NOT_STARTED,IN_PROGRESS,COMPLETED,CANCELLED)`, `assigned_at`, `completed_at` |
| `notifications` | `id`, `recipient_id`, `type`, `title`, `body`, `related_entity_type`, `related_entity_id`, `is_read` |
| `audit_logs` | `id`, `actor_id`, `action`, `entity_type`, `entity_id`, `old_data: JSONB`, `new_data: JSONB`, `ip_address`, `user_agent` |
| `email_templates` | `id`, `name`, `subject`, `body_html`, `trigger_event`, `is_active` |
| `rating_scale` | `id`, `level: int(1-5)`, `label`, `description` |
| `ai_learning_paths` | `id`, `user_id`, `generated_at`, `steps: JSONB` |
| `ai_jd_analyses` | `id`, `created_by`, `project_id?`, `raw_input: text`, `input_type: ENUM(PDF,TEXT)`, `extracted_skills: JSONB`, `suggested_positions: JSONB`, `employee_matches: JSONB`, `resource_gaps: JSONB`, `ai_summary: text`, `generated_at` |
| `ai_chat_sessions` | `id`, `user_id`, `session_type: ENUM(MANAGER_INTEL,ASSESSMENT_ASSIST)`, `context: JSONB`, `messages: JSONB([{role,content,timestamp}])`, `deleted_at`, `created_at`, `updated_at` |
| `ai_chat_feedback` | `id`, `session_id`, `message_index: int`, `feedback_type: ENUM(LIKE,REPORT)`, `report_reason: ENUM(INCORRECT,IRRELEVANT,OTHER)?`, `report_detail: text?`, `created_by`, `created_at` |
| `ai_certifications` | `id`, `user_id`, `file_path?`, `raw_text: text`, `cert_name`, `issuer`, `issue_date?`, `expiry_date?`, `extracted_skillsets: JSONB([{skillset_id,suggested_level,reasoning}])`, `status: ENUM(PENDING,ACCEPTED,REJECTED)`, `created_at` |
| `ai_team_formations` | `id`, `project_id`, `requested_by`, `team_size`, `configurations: JSONB([{members,coverage_score,skill_gaps_remaining,rationale}])`, `selected_config_index?`, `generated_at` |
| `ai_benchmark_reports` | `id`, `requested_by`, `scope_type: ENUM(USER,TEAM)`, `scope_id: int`, `position_benchmarked: text`, `market_context: text`, `overall_verdict: text`, `hiring_recommendation: text`, `results: JSONB`, `previous_report_id?`, `generated_at` |
| `ai_assessment_reviews` | `id`, `assessment_id`, `triggered_by`, `trigger_source: ENUM(MANUAL,AUTO)`, `issues: JSONB([{type,severity,description,affected_skillsets,suggested_action,dismissed,dismissed_reason}])`, `overall_quality: ENUM(GOOD,WARNING,FLAGGED)`, `generated_at` |

---

## API Conventions

- **Base path:** `/api/`
- **Auth header:** `Authorization: Bearer <access_token>`
- **Error response format:** `{ error: string, message: string, field_errors?: { [field]: string } }`
- **Success list format:** `{ data: [], total: int, page: int, page_size: int }`
- **HTTP status codes:** `200` OK, `201` Created, `400` Validation error, `401` Unauthenticated, `403` Forbidden, `404` Not found, `409` Conflict (duplicate), `422` Business rule violation, `503` AI service unavailable.

---

*End of Feature List — generated from WBS_v1.xlsx + SYSTEM_FEATURES.md + AI feature suggestions*

*Feature file: SKL-01 — extracted from FEATURE_LIST.md*
