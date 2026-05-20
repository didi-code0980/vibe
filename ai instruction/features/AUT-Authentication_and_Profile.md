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

# AUT · Authentication & Profile Management

---

## AUT-01 · Login

**Roles:** ALL (unauthenticated)

**Backend:**
- `POST /api/auth/login`
- **Request body:** `{ email: string, password: string }`
- **Logic:**
  1. Find user by email; if not found return `401` (do not reveal whether email exists).
  2. Verify `status = ACTIVE`; if `LOCKED` return `403 "Account is locked. Contact administrator."`.
  3. Compare password with bcrypt hash; wrong password → `401`.
  4. If valid: generate JWT access token (15 min expiry) + refresh token (7 day expiry), store refresh token server-side.
  5. If `must_change_password = true`: return tokens with flag `{ requiresPasswordChange: true }`.
  6. After 5 consecutive failed attempts: lock login for 15 minutes (track in cache/DB per user).
- **Audit:** Log `login_success` or `login_failure` to `AuditLog`.
- **Response:** `{ access_token, refresh_token, user: { id, full_name, email, role, avatar_url, must_change_password } }`

**Frontend:**
- Page: `/login`
- Fields: Email, Password (masked, toggle show/hide), "Remember me" checkbox.
- "Remember me" stores email (and optionally password) in localStorage/cookie.
- On `requiresPasswordChange: true` → redirect to `/change-password` screen; block all other navigation.
- Role-based redirect after login: ADMIN → `/admin/dashboard`, MANAGER → `/manager/dashboard`, USER → `/dashboard`.

---

## AUT-02 · Logout

**Roles:** ALL (authenticated)

**Backend:**
- `POST /api/auth/logout`
- **Logic:** Invalidate refresh token (delete from DB/blacklist). Clear server-side session.
- **Response:** `200 OK`

**Frontend:**
- Logout button in top navbar.
- On success: clear access token, refresh token from memory/storage, redirect to `/login`.

---

## AUT-03 · Refresh Token

**Roles:** ALL (authenticated)

**Backend:**
- `POST /api/auth/refresh`
- **Request body:** `{ refresh_token: string }`
- **Logic:** Validate refresh token; issue new access token.
- **Response:** `{ access_token }`

**Frontend:**
- Axios/HTTP interceptor: on `401` response, auto-call `/api/auth/refresh`, retry original request. On refresh failure → redirect to `/login`.

---

## AUT-04 · Forgot Password

**Roles:** ALL (unauthenticated)

**Backend:**
- `POST /api/auth/forgot-password`
  - **Request body:** `{ email: string }`
  - **Logic:** Always return `200` (prevent user enumeration). If email exists: generate signed reset token (expires 1 hour), send `PASSWORD_RESET` email via SMTP.
- `POST /api/auth/reset-password`
  - **Request body:** `{ token: string, new_password: string }`
  - **Logic:** Validate token is valid and not expired. Update `password_hash`. Invalidate token. Set `must_change_password = false`.
- **Audit:** Log `password_reset_requested` and `password_reset_completed`.

**Frontend:**
- Page: `/forgot-password` — email input form.
- Page: `/reset-password?token=xxx` — new password + confirm password form.
- Show success toast on both steps.

---

## AUT-05 · Change Password

**Roles:** ALL (authenticated)

**Backend:**
- `POST /api/auth/change-password`
- **Request body:** `{ current_password: string, new_password: string }`
- **Logic:** Verify `current_password` against hash. Validate new password meets policy. Update hash. Set `must_change_password = false`.
- **Response:** `200 OK` or `400` with validation error.

**Frontend:**
- Component: settings page → "Change Password" section.
- Fields: Current Password, New Password, Confirm New Password.
- Inline validation against password policy before submit.

---

## AUT-06 · Get & Update My Profile

**Roles:** ALL (authenticated)

**Backend:**
- `GET /api/profile` — returns own `User` record: `{ id, full_name, email, phone, avatar_url, role, position_id, position_name, team_id, team_name, must_change_password, created_at }`.
- `PUT /api/profile`
  - **Request body:** `{ full_name: string, phone: string }`
  - Read-only fields (cannot be changed here): `email`, `role`, `position_id`.
- **Response:** Updated `User` object.

**Frontend:**
- Page: `/profile`
- Editable fields: full name, phone.
- Display only: email, role, position, team.

---

## AUT-07 · Upload Avatar

**Roles:** ALL (authenticated)

**Backend:**
- `POST /api/profile/avatar`
- **Input:** Multipart form-data with file field `avatar` (jpg, png, webp; max 2 MB).
- **Logic:** Validate format and size. Upload to S3. Update `User.avatar_url`. Delete old file from S3.
- **Response:** `{ avatar_url: string }`

**Frontend:**
- Profile page: circular avatar component with "Change Photo" button.
- Show image preview before upload. Display upload progress.

---

## AUT-08 · General Settings (Notifications & Language)

**Roles:** ALL (authenticated)

**Backend:**
- `GET /api/profile/settings` — returns `{ notification_email: boolean, language: "vi" | "en" }`.
- `PUT /api/profile/settings` — update above fields.

**Frontend:**
- Settings page: toggle for email notifications, language dropdown (Vietnamese / English).

---

## AUT-09 · My Assessment History

**Roles:** ALL (authenticated, own data only)

**Backend:**
- `GET /api/profile/assessment-history`
- **Response:** Paginated list of own `SkillAssessment` records ordered by `assessed_at DESC`.
- **Fields per row:** `skillset_name`, `department_name`, `career_name`, `self_score`, `manager_score`, `manager_note`, `assessed_at`.

**Frontend:**
- Profile page tab: "Assessment History".
- Table with columns: Skill, Department, Self Score, Manager Score, Date.

---

## AUT-10 · View My Team Info

**Roles:** ALL (authenticated)

**Backend:**
- `GET /api/profile/team`
- **Response:** `{ team_name, manager_name, members: [{ user_id, full_name, avatar_url, position_name, skillsets: [{ name, self_score }] }] }`
- Note: exposes only `self_score` for teammates — no personal contact info.

**Frontend:**
- Profile page tab: "My Team".
- Card list of teammates with their skill tags.

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

*Feature file: AUT-01 — extracted from FEATURE_LIST.md*
