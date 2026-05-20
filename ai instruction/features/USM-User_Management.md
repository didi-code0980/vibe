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

# USM · User Management

---

## USM-01 · List Users

**Roles:** `ADMIN`

**Backend:**
- `GET /api/admin/users`
- **Query params:** `search` (partial name or email), `status` (`ACTIVE|LOCKED|DELETED`), `position_id`, `created_from` (date), `created_to` (date), `sort_by` (`created_at|full_name`), `sort_dir` (`asc|desc`), `page`, `page_size`.
- **Default sort:** `created_at DESC`.
- **Response:** `{ data: [{ id, full_name, avatar_url, email, position_name, status, created_at }], total, page, page_size }`

**Frontend:**
- Page: `/admin/users`
- Data table with columns: Avatar, Full Name, Email, Position, Status (badge), Created At, Actions (View / Lock / Delete).
- Search bar, filter dropdowns (Status, Position, Date range).
- Pagination component.

---

## USM-02 · View User Activity Logs

**Roles:** `ADMIN`

**Backend:**
- `GET /api/admin/users/:id/activity`
- **Response:** Paginated `AuditLog` records where `actor_id = :id`, ordered by `created_at DESC`.
- **Fields:** `action`, `entity_type`, `entity_id`, `old_data`, `new_data`, `ip_address`, `created_at`.

**Frontend:**
- User detail page: "Activity Logs" tab.
- Timeline or table view of log entries with expandable `old_data`/`new_data` diff.

---

## USM-03 · Lock / Unlock Account

**Roles:** `ADMIN`

**Backend:**
- `PATCH /api/admin/users/:id/status`
- **Request body:** `{ status: "LOCKED" | "ACTIVE" }`
- **Rule:** Admin cannot lock their own account.
- **Audit:** Log `user_locked` or `user_unlocked`.

**Frontend:**
- Toggle button in user list actions and user detail page.
- Confirm dialog before locking.

---

## USM-04 · Delete Account (Soft Delete)

**Roles:** `ADMIN`

**Backend:**
- `DELETE /api/admin/users/:id`
- **Logic:** Set `status = DELETED`, `deleted_at = now()`. Remove user from all active `TeamMember` and `ProjectMember` records (set `left_at`/`out_date`).
- **Rule:** Admin cannot delete their own account.
- **Audit:** Log `user_deleted`.

**Frontend:**
- Delete button with confirmation modal: "This action cannot be undone."

---

## USM-05 · Create User Account

**Roles:** `ADMIN`

**Backend:**
- `POST /api/admin/users`
- **Request body:** `{ email: string, full_name: string, role: "ADMIN"|"MANAGER"|"USER", position_id?: number, team_id?: number }`
- **Logic:**
  1. Validate email uniqueness.
  2. Generate random password (min 10 chars, mixed case + number + special char).
  3. Set `must_change_password = true`, `status = ACTIVE`.
  4. Send `ACCOUNT_CREATED` email with temporary credentials.
- **Audit:** Log `user_created`.
- **Response:** Created `User` object (without password).

**Frontend:**
- Page: `/admin/users/create` or slide-over form.
- Fields: Full Name, Email, Role (dropdown), Position (dropdown), Team (optional dropdown).
- Show success toast with note "Credentials sent to user's email."

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

*Feature file: USM-01 — extracted from FEATURE_LIST.md*
