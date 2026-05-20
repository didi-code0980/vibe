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

# AI-01 · Smart Resource Matching

**Phase:** Sprint 3 priority

---

## AI-01-01 · Trigger Resource Match

**Roles:** `MANAGER` (own team), `ADMIN` (all teams)

**Backend:**
- `POST /api/ai/resource-match`
- **Request body:** `{ project_id: number, team_id?: number }` — ADMIN can omit `team_id` to search all teams.
- **Logic (no Claude API call — pure DB scoring):**
  - Fetch `ProjectSkillRequirement` for project.
  - For each eligible user: `match_score = (Σ min(user_level, required_level)) / (Σ required_level) * 100`
  - `user_level` = `manager_score` if set, else `self_score`, else `0`.
  - Compute `matched_skills` (user_level ≥ required_level) and `missing_skills`.
- **Response:** `[{ user_id, full_name, avatar_url, position_name, team_name, match_score: float, matched_skills: [{ skillset_name, user_level, required_level }], missing_skills: [{ skillset_name, required_level }], current_project_count: int }]` sorted by `match_score DESC`.
- **Fallback:** If project has no skill requirements, return `400 "Project has no skill requirements defined."`.

**Frontend:**
- Project page: "Find Best Match" button → results panel showing ranked employee cards with skill overlap visualization.

---

## AI-01-02 · Allocate from Match Result

**Roles:** `MANAGER`, `ADMIN`

**Backend:**
- `POST /api/ai/resource-match/allocate`
- **Request body:** `{ project_id, user_id, project_role, join_date }`
- **Logic:** Create `ProjectMember` record, set `ai_matched = true`.
- **Audit:** Log `project_member_add` with `source: "ai_match"`.

**Frontend:**
- Match result card: "Assign to Project" button → confirm dialog with project role and join date inputs.

---

---

# AI-02 · Skill Gap Analysis

---

## AI-02-01 · Individual Gap Analysis

**Roles:** `MANAGER` (own team), `ADMIN`; `USER` (self only)

**Backend:**
- `GET /api/ai/gap-analysis/user/:user_id`
- **Logic:**
  1. Fetch user's position → `required_skills`.
  2. For each required skill: `gap = min_level - user_score` (positive = shortfall).
  3. Priority: `HIGH` if gap ≥ 2, `MEDIUM` if gap = 1, `LOW` if gap ≤ 0.
- **Response:** `{ user_id, full_name, position_name, gaps: [{ skillset_id, skillset_name, required_level, current_level, gap, priority }] }`
- **Returns `400`** if user has no position assigned.

**Frontend:**
- User/profile page: "Gap Analysis" tab — bar chart or table showing required vs current level per skill, color-coded by priority.

---

## AI-02-02 · Team Gap Analysis

**Roles:** `MANAGER` (own team), `ADMIN`

**Backend:**
- `GET /api/ai/gap-analysis/team/:team_id`
- **Response:** `[{ skillset_name, members_below_required: int, total_members: int, average_gap: float }]`

**Frontend:**
- Team dashboard: "Skill Gaps" section — heatmap or table of skills with below-level member counts.

---

---

# AI-03 · Learning Path Recommendation

---

## AI-03-01 · Generate Learning Path

**Roles:** `MANAGER` (own team), `ADMIN`; `USER` (self only)

**Backend:**
- `POST /api/ai/learning-path`
- **Request body:** `{ user_id }`
- **Logic:**
  1. Call `GET /api/ai/gap-analysis/user/:user_id` to get gap list.
  2. Fetch all documents tagged with gap skillsets from the document library.
  3. Send to Claude API: gap list + available documents + user's current levels → request a sequenced learning roadmap.
  4. Store result in `AILearningPath` table.
- **Response:** `{ path_id, steps: [{ order, skillset_name, gap_priority, recommended_documents: [{ doc_id, title, type, rationale }] }] }`
- **AI fallback:** Return `503` if Claude API unavailable.

**DB Entity:** `AILearningPath { id, user_id, generated_at, steps: JSONB }`

**Frontend:**
- Profile/gap analysis page: "Generate Learning Path" button.
- Roadmap view: vertical step-by-step list per skill with document cards and one-click assign.

---

## AI-03-02 · Assign Learning Path Documents

**Roles:** `MANAGER`, `ADMIN`

**Backend:**
- `POST /api/ai/learning-path/:path_id/assign`
- **Request body:** `{ document_ids: [int], deadline?: date }`
- **Logic:** Bulk-create `DocumentAssignment` records for each document. Reuses SKL-02-F02 logic.

**Frontend:**
- Learning path view: "Assign All" or per-step "Assign" button with deadline picker.

---

---

# AI-04 · Skill Extraction from Documents

---

## AI-04-01 · Auto-Tag Document Skills

**Roles:** `ADMIN`, `MANAGER` (own documents)

**Backend:**
- `POST /api/ai/extract-skills/:document_id`
- **Logic:**
  1. Fetch document text (PDF extracted text or URL content).
  2. Send to Claude API: extract skills mentioned; match against existing `Skillset` names in DB.
  3. Store suggestions in `Document.ai_tag_suggestions: JSONB([{ skillset_id, skillset_name, confidence }])`.
- **Response:** `{ suggestions: [{ skillset_id, skillset_name, confidence: float, mention_count: int }] }`
- **AI fallback:** Return `503` if Claude API unavailable.

**Frontend:**
- Document edit page: "Auto-Detect Skills" button → shows suggestion chips with confidence scores.

---

## AI-04-02 · Accept / Reject Skill Tag Suggestions

**Roles:** `ADMIN`, `MANAGER` (document creator)

**Backend:**
- `POST /api/ai/extract-skills/:document_id/confirm`
- **Request body:** `{ accepted_skillset_ids: [int], rejected_skillset_ids: [int] }`
- **Logic:** Merge `accepted_skillset_ids` into `document.skillset_tags`. Clear `ai_tag_suggestions`.

**Frontend:**
- Suggestion chips: thumbs-up to accept, X to reject. "Confirm Selection" button to save.

---

---

# AI-05 · Self-Assessment Assistant

---

## AI-05-01 · Start Assessment Session

**Roles:** ALL (authenticated, own assessment only)

**Backend:**
- `POST /api/ai/assessment-assistant/start`
- **Request body:** `{ skillset_id }`
- **Logic:** Fetch `Skillset.level_descriptions`. Call Claude API with skillset context. Returns first clarifying question.
- **Response:** `{ session_id: string, question: string }`
- **AI fallback:** Return `503` if Claude API unavailable.

---

## AI-05-02 · Continue Conversation

**Roles:** ALL (authenticated)

**Backend:**
- `POST /api/ai/assessment-assistant/message`
- **Request body:** `{ session_id, user_message: string }`
- **Logic:** Append user message to conversation history (stored in cache by `session_id`). Call Claude API. Return AI response and optionally a score suggestion.
- **Response:** `{ response: string, suggested_score?: int (1–5), is_complete: boolean }`

---

## AI-05-03 · Save Session Log

**Roles:** ALL (authenticated)

**Backend:**
- Called automatically when user finalises self-assessment via `POST /api/assessments`.
- **Logic:** Store conversation log JSON in `SkillAssessment.assessment_ai_log`.
- Manager can view log via `GET /api/assessments/:id` (field `assessment_ai_log`).

**Frontend:**
- Assessment modal: "Use AI to help me rate myself" toggle opens a chat-style panel.
- AI suggests a score — user can accept or override.
- On save, log is silently persisted.

---

---

# AI-06 · Auto-Generate Skill Taxonomy

---

## AI-06-01 · Generate Taxonomy from Description

**Roles:** `ADMIN`

**Backend:**
- `POST /api/ai/generate-taxonomy`
- **Request body:** `{ description: string }` — e.g. "A frontend development department in a fintech company"
- **Logic:** Call Claude API. Prompt requests a structured Career → Department → Skillset hierarchy with 1–5 level descriptions for each skill.
- **Response:**
  ```json
  {
    "career": { "name": "IT", "description": "..." },
    "departments": [{
      "name": "Frontend Development",
      "skillsets": [{
        "name": "ReactJS",
        "level_descriptions": { "1": "...", "2": "...", "3": "...", "4": "...", "5": "..." }
      }]
    }]
  }
  ```
- **AI fallback:** Return `503` if Claude API unavailable.

**Frontend:**
- Skill taxonomy page: "Generate with AI" button → text area for description → loading → preview of suggested hierarchy tree (editable before importing).

---

## AI-06-02 · Bulk Import Generated Taxonomy

**Roles:** `ADMIN`

**Backend:**
- `POST /api/ai/generate-taxonomy/import`
- **Request body:** JSON from AI-06-F01 (user may have edited it before submitting).
- **Logic:** Upsert Career, Departments, Skillsets by name. Skip if already existing.
- **Response:** `{ careers_created, departments_created, skillsets_created, skipped }`

**Frontend:**
- Preview screen after generation: editable tree. "Import All" button. Summary modal after import.

---

---

# AI-07 · Team Trend & Attrition Risk _(Phase 2)_

> Requires minimum 3 months of `AssessmentLog` history.

---

## AI-07-01 · Skill Score Trend Analysis

**Roles:** `MANAGER` (own team), `ADMIN`

**Backend:**
- `GET /api/ai/trend/:team_id`
- **Logic:** Query `AssessmentLog` for each member × skillset. Compute slope and direction.
- **Response:** `[{ user_id, full_name, skillset_name, trend: "IMPROVING"|"STAGNANT"|"DECLINING", data_points: [{ date, score }] }]`

**Frontend:**
- Team dashboard: per-member trend indicators (arrow icons for direction). Line charts on expand.

---

## AI-07-02 · Attrition Risk Score

**Roles:** `MANAGER`, `ADMIN`

**Backend:**
- `GET /api/ai/risk-score/:team_id`
- **Risk signals:** Score stagnation (no improvement in 3+ months), low document completion rate, skill misalignment with team direction, no active development goals.
- **Logic:** Claude API evaluates signals and outputs a risk score + contributing factors.
- **Response:** `[{ user_id, full_name, risk_score: float (0–1), risk_level: "LOW"|"MEDIUM"|"HIGH", contributing_factors: [string] }]`
- **AI fallback:** Return `503` if Claude API unavailable.

**Frontend:**
- Team overview: risk level badge per member (green/amber/red). Click to expand contributing factors.

---

## AI-07-03 · Risk Threshold Alert (Cron Job)

**Roles:** System-generated (notifies MANAGER)

**Backend:**
- Scheduled weekly cron: evaluate all teams' risk scores.
- If any member's `risk_level` changes to `HIGH`: send in-app + email notification to their Manager.
- Risk threshold configurable via CFG-01 notification rules.

---

---

# AI-08 · Natural Language Matrix Query _(Phase 2)_

---

## AI-08-01 · Natural Language Query

**Roles:** `MANAGER`, `ADMIN`

**Backend:**
- `POST /api/ai/matrix-query`
- **Request body:** `{ query: string, team_id?: number }`
- **Example query:** "show me team members who know ReactJS above level 3 and haven't been on a project this quarter"
- **Logic:**
  1. Send query to Claude API. Prompt requests structured JSON filter: `{ skillset_filters: [{ skillset_id, min_level }], exclude_active_project?: bool, department_id?: int, ... }`.
  2. Execute structured filter against DB (same engine as `/api/dashboard/team-matrix`).
- **Response:** Same format as Team Skill Matrix (DSH-01-F02).
- **AI fallback:** Return `503` if Claude API unavailable.

**Frontend:**
- Team matrix page: "Ask AI" search bar. Natural language input → results update in the same matrix grid. Show "interpreted as: [filter summary]" chip above results.

---

## AI-08-02 · Save Named Query

**Roles:** `MANAGER`, `ADMIN`

**Backend:**
- `POST /api/ai/matrix-query/save` — `{ name: string, query: string, resolved_filters: JSON }`
- `GET /api/ai/matrix-query/saved` — list saved queries.
- `POST /api/ai/matrix-query/run/:id` — re-execute a saved query.

**Frontend:**
- "Save This Query" button after successful AI query. Named query sidebar/dropdown for quick re-run.

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
| `skill_assessments` | `id`, `user_id`, `skillset_id`, `self_score`, `self_note`, `manager_score`, `manager_note`, `assessed_by`, `assessed_at`, `assessment_ai_log: JSONB` |
| `assessment_logs` | `id`, `assessment_id`, `changed_by`, `old_self_score`, `new_self_score`, `old_manager_score`, `new_manager_score`, `changed_at` |
| `development_goals` | `id`, `user_id`, `skillset_id`, `target_level`, `current_level`, `note`, `suggested_by`, `status: ENUM(IN_PROGRESS,COMPLETED,CANCELLED)`, `completed_at` |
| `documents` | `id`, `title`, `description`, `type: ENUM(PDF,LINK,VIDEO)`, `url`, `file_path`, `skillset_tags: int[]`, `ai_tag_suggestions: JSONB`, `created_by`, `deleted_at` |
| `document_assignments` | `id`, `document_id`, `user_id`, `assigned_by`, `deadline`, `status: ENUM(NOT_STARTED,IN_PROGRESS,COMPLETED,CANCELLED)`, `assigned_at`, `completed_at` |
| `notifications` | `id`, `recipient_id`, `type`, `title`, `body`, `related_entity_type`, `related_entity_id`, `is_read` |
| `audit_logs` | `id`, `actor_id`, `action`, `entity_type`, `entity_id`, `old_data: JSONB`, `new_data: JSONB`, `ip_address`, `user_agent` |
| `email_templates` | `id`, `name`, `subject`, `body_html`, `trigger_event`, `is_active` |
| `rating_scale` | `id`, `level: int(1-5)`, `label`, `description` |
| `ai_learning_paths` | `id`, `user_id`, `generated_at`, `steps: JSONB` |
| `ai_jd_analyses` | `id`, `created_by`, `project_id?`, `raw_input: text`, `input_type: ENUM(PDF,TEXT)`, `extracted_skills: JSONB`, `suggested_positions: JSONB`, `employee_matches: JSONB`, `resource_gaps: JSONB`, `generated_at` |
| `ai_chat_sessions` | `id`, `user_id`, `session_type: ENUM(MANAGER_INTEL,ASSESSMENT_ASSIST)`, `context: JSONB`, `messages: JSONB([{role,content,timestamp}])`, `created_at`, `updated_at` |
| `ai_chat_feedback` | `id`, `session_id`, `message_index: int`, `feedback_type: ENUM(LIKE,REPORT)`, `report_reason: ENUM(INCORRECT,IRRELEVANT,OTHER)?`, `report_detail: text?`, `created_by`, `created_at` |
| `ai_certifications` | `id`, `user_id`, `file_path?`, `raw_text: text`, `cert_name`, `issuer`, `issue_date?`, `expiry_date?`, `extracted_skillsets: JSONB([{skillset_id,suggested_level}])`, `status: ENUM(PENDING,ACCEPTED,REJECTED)`, `created_at` |
| `ai_team_formations` | `id`, `project_id`, `requested_by`, `team_size`, `configurations: JSONB([{users:[],coverage_score,rationale}])`, `selected_config_index?`, `generated_at` |
| `ai_benchmark_reports` | `id`, `requested_by`, `scope_type: ENUM(USER,TEAM)`, `scope_id: int`, `benchmark_source: text`, `results: JSONB([{skillset_name,user_level,market_level,delta,verdict}])`, `generated_at` |
| `ai_assessment_reviews` | `id`, `assessment_id`, `triggered_by`, `issues: JSONB([{type,description,severity}])`, `overall_quality: ENUM(GOOD,WARNING,FLAGGED)`, `generated_at` |

---

## API Conventions

- **Base path:** `/api/`
- **Auth header:** `Authorization: Bearer <access_token>`
- **Error response format:** `{ error: string, message: string, field_errors?: { [field]: string } }`
- **Success list format:** `{ data: [], total: int, page: int, page_size: int }`
- **HTTP status codes:** `200` OK, `201` Created, `400` Validation error, `401` Unauthenticated, `403` Forbidden, `404` Not found, `409` Conflict (duplicate), `422` Business rule violation, `503` AI service unavailable.

---

---

# AI-09 · JD Analyzer & Resource Planner

> Parses a Job Description (PDF upload or pasted text) and cross-references it against the existing employee database. Returns skill requirements, best-fit positions, employee match ranking, and a resource gap report — covering the full "we got a new contract, can we staff it?" workflow in one step.

**Phase:** Post-launch / Sprint 6 extension
**AI model:** `claude-sonnet-4-20250514`
**Roles:** `MANAGER`, `ADMIN`

---

## AI-09-01 · Submit JD for Analysis

**Backend:**
- `POST /api/ai/jd-analysis`
- **Input:** Multipart form-data with either:
  - `file`: PDF (max 20 MB) — system extracts raw text server-side before sending to Claude.
  - `text`: plain-text string (pasted JD content), max 50,000 characters.
  - `project_id` (optional): if provided, results are linked to an existing project and can trigger AI-01 allocation flow.
  - `scope_team_id` (optional): restrict employee matching to one team; omit to search all.
- **Logic:**
  1. If PDF: extract full text using a PDF text-extraction library (e.g. Apache PDFBox in Java). Store raw text in `ai_jd_analyses.raw_input`.
  2. Send extracted text to Claude API with a structured prompt requesting:
     - `extracted_skills`: list of `{ skill_name, category, required_level_description, is_critical: boolean }`.
     - `suggested_positions`: list of `{ position_name, headcount_needed, key_skills: [skill_name], rationale }`.
  3. For each extracted skill, fuzzy-match against `skillsets` table by name (case-insensitive, partial match). Store `skillset_id` if matched, `null` if unrecognised.
  4. Run employee matching: for each employee in scope, compute `match_score` using the same algorithm as AI-01 — `Σ min(user_level, required_level) / Σ required_level * 100`. Use `manager_score` over `self_score`.
  5. Compute resource gap per skill: `required_employee_count` (from `suggested_positions`) vs `current_qualified_employees` (employees with `user_level >= required_level`).
  6. Persist full result to `ai_jd_analyses`.
- **Response:**
```json
{
  "analysis_id": "uuid",
  "extracted_skills": [
    {
      "skill_name": "ReactJS",
      "skillset_id": 12,
      "skillset_matched": true,
      "category": "Frontend",
      "required_level": 3,
      "is_critical": true
    }
  ],
  "suggested_positions": [
    {
      "position_name": "Senior Frontend Developer",
      "headcount_needed": 2,
      "key_skills": ["ReactJS", "TypeScript", "CSS"],
      "rationale": "JD requires ownership of UI architecture and mentoring of junior devs"
    }
  ],
  "employee_matches": [
    {
      "user_id": 42,
      "full_name": "Nguyen Van A",
      "position_name": "Frontend Developer",
      "team_name": "Platform Team",
      "match_score": 87.5,
      "matched_skills": [{ "skillset_name": "ReactJS", "user_level": 4, "required_level": 3 }],
      "missing_skills": [{ "skillset_name": "TypeScript", "required_level": 2 }],
      "current_project_count": 1
    }
  ],
  "resource_gaps": [
    {
      "skillset_name": "ReactJS",
      "required_level": 3,
      "required_employee_count": 2,
      "current_qualified_employees": 5,
      "gap": -3
    },
    {
      "skillset_name": "TypeScript",
      "required_level": 2,
      "required_employee_count": 2,
      "current_qualified_employees": 1,
      "gap": 1
    }
  ],
  "ai_summary": "The JD requires a strong frontend team. Current capacity covers ReactJS well but TypeScript is a bottleneck with only 1 qualified employee vs 2 needed."
}
```
- **AI fallback:** Return `503` if Claude API unavailable.
- **Audit:** Log `jd_analysis_created` to `AuditLog`.

---

## AI-09-02 · Get Analysis Result

**Backend:**
- `GET /api/ai/jd-analysis/:analysis_id`
- Returns the full stored `ai_jd_analyses` record.
- Supports repeated viewing without re-running Claude API.

---

## AI-09-03 · Allocate Employees from JD Match

**Backend:**
- `POST /api/ai/jd-analysis/:analysis_id/allocate`
- **Request body:** `{ project_id, allocations: [{ user_id, project_role, join_date }] }`
- **Logic:** Bulk-create `ProjectMember` records with `ai_matched = true`. Reuses PRJ-01-F03 logic.
- **Rule:** `project_id` must be in `PLANNING` or `ACTIVE` status.

---

## AI-09-04 · Add Unrecognised Skills to Taxonomy

**Backend:**
- `POST /api/ai/jd-analysis/:analysis_id/add-skills`
- **Request body:** `{ skills: [{ skill_name, department_id, level_descriptions?: { "1": string, … "5": string } }] }`
- **Logic:** Creates new `Skillset` records for skills in the JD that had `skillset_matched = false`. Optionally calls AI-06 to generate `level_descriptions` if not provided.
- **Auth:** `ADMIN` only.

**Frontend:**
- Page: `/ai/jd-analyzer`
- Step 1: Upload PDF or paste JD text → "Analyse" button.
- Step 2: Loading state (streaming preferred; show partial results as sections load).
- Step 3: Results in 4 collapsible sections:
  - **Extracted Skills** — tag chips with level badges; unmatched skills highlighted in amber with "Add to System" action.
  - **Suggested Positions** — cards with headcount, key skills, rationale text.
  - **Employee Matching List** — sortable table: Employee Name, Position, Team, Match Score (progress bar), Matched/Missing skills. "Assign to Project" per row.
  - **Resource Gap Summary** — table showing Skill, Required Count, Current Qualified, Gap (red if positive, green if negative).
- AI summary paragraph at top of results.
- "Link to Project" dropdown to associate analysis with an existing project.

---

---

# AI-10 · Manager Intelligence Chat

> A persistent multi-turn chat interface where Admin/Manager can ask any question about people, skills, teams, or projects in plain natural language. Claude has full read access to the system's data context and answers with structured responses (tables, charts, lists) embedded inside the chat thread. Supports session history, feedback (like/report per message), and multi-turn follow-up.

**Phase:** Post-launch / Sprint 6 extension
**AI model:** `claude-sonnet-4-20250514`
**Roles:** `MANAGER`, `ADMIN`

---

## AI-10-01 · Start or Resume a Chat Session

**Backend:**
- `POST /api/ai/chat/start`
- **Request body:** `{ session_type: "MANAGER_INTEL", context?: { team_id?, project_id? } }`
- **Logic:**
  1. Create a new `ai_chat_sessions` record with empty `messages` array.
  2. Build a system prompt that injects: caller's role, team scope, current date, and a summary of the data they can access (team member count, active projects, recent assessments).
  3. Return `session_id`.
- `GET /api/ai/chat/sessions` — list caller's past sessions ordered by `updated_at DESC`.
- `GET /api/ai/chat/sessions/:session_id` — load full message history for a session.

---

## AI-10-02 · Send a Message

**Backend:**
- `POST /api/ai/chat/sessions/:session_id/message`
- **Request body:** `{ user_message: string, attachments?: [{ type: "FILE", file_path: string }] }`
- **Logic:**
  1. Append `{ role: "user", content: user_message, timestamp }` to `messages`.
  2. Resolve data context: based on the user's question, the backend pre-fetches relevant DB data (team matrix, gap analysis, project list) and injects it as structured context into the Claude API prompt. This avoids Claude hallucinating numbers.
  3. Call Claude API with full `messages` array (conversation history) + injected data context + system prompt.
  4. Append `{ role: "assistant", content: response, timestamp }` to `messages`. Persist.
- **Response:** `{ message_index: int, response: string, data_references: [{ type: string, entity_id: int }] }`
- **Supported question categories (examples):**
  - Team analysis: "Who on my team has the biggest skill gap right now?"
  - Project analysis: "Which project is most understaffed for its required skills?"
  - Employee lookup: "Show me Nguyen Van A's full skill profile."
  - Resource planning: "How many people can cover both ReactJS and NodeJS at level 3 or above?"
  - Document tracking: "Who hasn't finished their assigned upskill documents this month?"
  - Goal tracking: "Which team members have no active development goals?"
- **Streaming support:** Implement SSE (`text/event-stream`) at `GET /api/ai/chat/sessions/:session_id/stream?message=...` for real-time token streaming.
- **AI fallback:** Return `503` if Claude API unavailable.

---

## AI-10-03 · Like / Report a Message

**Backend:**
- `POST /api/ai/chat/sessions/:session_id/feedback`
- **Request body:** `{ message_index: int, feedback_type: "LIKE" | "REPORT", report_reason?: "INCORRECT" | "IRRELEVANT" | "OTHER", report_detail?: string }`
- **Logic:** Store in `ai_chat_feedback`. If `feedback_type = REPORT`: also log to `AuditLog` for quality monitoring.
- **Rule:** A user can only submit one feedback record per `(session_id, message_index)` pair. Subsequent submissions overwrite.

---

## AI-10-04 · Delete a Session

**Backend:**
- `DELETE /api/ai/chat/sessions/:session_id`
- **Logic:** Soft delete — set `deleted_at`. User can no longer see the session in their list. Feedback records are retained for quality monitoring.

**Frontend:**
- Page: `/ai/chat`
- Left sidebar: session list with timestamps and first-message preview. "New Chat" button.
- Main area: chat thread. User messages right-aligned (bold), AI responses left-aligned.
- AI responses render Markdown: tables, bullet lists, code blocks, bold headings.
- Each AI message has a Like (👍) and Report (⚑) button that appears on hover/highlight.
- Report triggers a dropdown: "Incorrect answer / Irrelevant / Other" with optional text input.
- Input box at bottom: textarea with submit on Enter (Shift+Enter for newline). File attach button for PDF/image upload.
- Streaming: AI response streams token-by-token into the message bubble.
- Context chips above input: "Scoped to: [Team Name]" when a team context is active.

---

---

# AI-11 · Certification & Achievement Recognition

> Employee uploads a certificate image or PDF. Claude extracts the certification details, maps it to relevant skillsets in the system, and suggests updated self-assessment scores backed by the certificate as verified evidence. Managers can endorse or override the suggested levels.

**Phase:** Post-launch
**AI model:** `claude-sonnet-4-20250514`
**Roles:** ALL (own certifications); `MANAGER` / `ADMIN` (view team certifications, endorse)

---

## AI-11-01 · Upload and Analyse Certificate

**Backend:**
- `POST /api/ai/certifications`
- **Input:** Multipart form-data:
  - `file`: image (jpg, png, webp, max 5 MB) or PDF (max 10 MB).
  - `user_id` (MANAGER/ADMIN uploading on behalf of a staff member, optional).
- **Logic:**
  1. If image: send directly to Claude API as base64-encoded image content.
  2. If PDF: extract text + first page as image; send both to Claude API.
  3. Claude API prompt: extract `cert_name`, `issuer`, `issue_date`, `expiry_date`, and `implied_skills: [{ skill_name, implied_level_description }]`.
  4. For each implied skill: fuzzy-match against `skillsets` table. Map to `skillset_id` where found.
  5. For each matched skillset: compare implied level with existing `SkillAssessment.self_score`. Suggest new level only if implied level > current self-assessment.
  6. Store full result in `ai_certifications` with `status = PENDING`.
- **Response:**
```json
{
  "certification_id": "uuid",
  "cert_name": "AWS Certified Solutions Architect – Associate",
  "issuer": "Amazon Web Services",
  "issue_date": "2024-03-15",
  "expiry_date": "2027-03-15",
  "extracted_skillsets": [
    {
      "skillset_id": 34,
      "skillset_name": "Cloud Architecture (AWS)",
      "current_self_score": 2,
      "suggested_score": 4,
      "reasoning": "Solutions Architect Associate cert implies intermediate-to-advanced cloud design skills, corresponding to level 4 on the system's scale."
    },
    {
      "skillset_id": 41,
      "skillset_name": "Infrastructure as Code",
      "current_self_score": null,
      "suggested_score": 3,
      "reasoning": "SAA-C03 exam covers CloudFormation and basic IaC, suggesting a solid intermediate level."
    }
  ],
  "unmatched_skills": ["Amazon RDS", "Auto Scaling Groups"]
}
```
- **AI fallback:** Return `503` if Claude API unavailable.
- **Audit:** Log `certification_uploaded`.

---

## AI-11-02 · Accept / Reject Suggested Score Updates

**Backend:**
- `POST /api/ai/certifications/:certification_id/confirm`
- **Request body:** `{ accepted: [{ skillset_id, accepted_score: int (1–5) }], rejected_skillset_ids: [int] }`
- **Logic:**
  - For each accepted skillset: call `POST /api/assessments` to create/update `SkillAssessment.self_score`. Store `certification_id` in `SkillAssessment.evidence_ref` (new nullable field) as proof.
  - Update `ai_certifications.status = ACCEPTED`.
  - Rejected skillsets: update `status = REJECTED`; no assessment changes.
- **Rule:** User can override `accepted_score` — they are not forced to use the AI-suggested level. The suggested level is a starting point only.

---

## AI-11-03 · Manager Endorsement

**Backend:**
- `POST /api/ai/certifications/:certification_id/endorse`
- **Auth:** `MANAGER` (team member's cert), `ADMIN`
- **Request body:** `{ skillset_id, endorsed_manager_score: int (1–5), note?: string }`
- **Logic:** Create/update `SkillAssessment.manager_score` for the skillset. Log to `AssessmentLog`. Send `ASSESSMENT_REVIEWED` notification to employee.
- **Business rule:** Manager endorsement is equivalent to a regular manager review — `manager_score` takes precedence over `self_score` in all calculations.

---

## AI-11-04 · List My Certifications

**Backend:**
- `GET /api/ai/certifications` — own certifications; supports `status` filter.
- `GET /api/ai/certifications/team/:team_id` — MANAGER/ADMIN: all certifications for team members.
- **Response fields:** `cert_name`, `issuer`, `issue_date`, `expiry_date`, `status`, `extracted_skillsets (count)`, `created_at`.

**Frontend:**
- Profile page: "Certifications" tab with certification cards (issuer logo if available, name, dates, status badge, associated skills).
- "Upload Certificate" button → file drop zone → loading → results card with suggested score chips.
- Per suggested skill: accept (with optional score override slider) or reject toggle.
- "Confirm" saves all accepted updates.
- Expiry warning badge (amber) if `expiry_date` is within 60 days; expired badge (red) if past.
- Manager team view: "Certifications" column in member list showing cert count.

---

---

# AI-12 · Team Formation Optimizer

> Given a project's required skills and a desired team size, Claude analyses the full employee pool and suggests multiple ranked team configurations — each balancing skill coverage, seniority mix, workload availability, and team cohesion signals. Returns configurations side-by-side for the manager to compare and select.

**Phase:** Post-launch
**AI model:** `claude-sonnet-4-20250514`
**Roles:** `MANAGER` (own team pool), `ADMIN` (all teams)

---

## AI-12-01 · Generate Team Configurations

**Backend:**
- `POST /api/ai/team-formation`
- **Request body:**
```json
{
  "project_id": 15,
  "team_size": 4,
  "required_skillsets": [
    { "skillset_id": 12, "min_level": 3, "headcount": 2 },
    { "skillset_id": 8,  "min_level": 4, "headcount": 1 },
    { "skillset_id": 19, "min_level": 2, "headcount": 1 }
  ],
  "constraints": {
    "exclude_user_ids": [5, 7],
    "include_user_ids": [22],
    "max_current_projects": 2,
    "scope_team_ids": [3, 4]
  },
  "num_configurations": 3
}
```
- **Logic:**
  1. Query eligible employees: active users in `scope_team_ids`, not in `exclude_user_ids`, with `current_project_count <= max_current_projects`.
  2. For each employee compute individual `match_score` against `required_skillsets` (same formula as AI-01).
  3. Send employee pool data + requirements to Claude API. Prompt asks Claude to:
     - Generate `num_configurations` distinct team combinations of exactly `team_size` people.
     - Each configuration must include `include_user_ids` if specified.
     - Optimise for: maximum aggregate skill coverage, mix of senior (score ≥ 4) and mid-level (score 2–3), minimise overlap of identical skill sets (avoid redundancy).
     - For each configuration: compute `coverage_score = skills fully covered / total required skills * 100`.
     - Return `rationale` per configuration explaining the trade-offs.
  4. Persist to `ai_team_formations`.
- **Response:**
```json
{
  "formation_id": "uuid",
  "project_name": "AI Platform v2",
  "configurations": [
    {
      "index": 0,
      "coverage_score": 95.0,
      "label": "Balanced — high coverage, mixed seniority",
      "members": [
        {
          "user_id": 22, "full_name": "Le Van C", "position": "Senior Backend Dev",
          "team_name": "Platform Team", "current_project_count": 1,
          "contributed_skills": [{ "skillset_name": "Java Spring Boot", "level": 5 }]
        }
      ],
      "skill_gaps_remaining": [],
      "rationale": "Strong senior anchor (Le Van C, L5 Java) paired with two mid-level members. Full coverage of all required skills. Recommend this for a project with tight deadlines."
    },
    {
      "index": 1,
      "coverage_score": 88.0,
      "label": "Availability-first — lower workload",
      "members": [],
      "skill_gaps_remaining": [{ "skillset_name": "DevOps", "gap": 1 }],
      "rationale": "All 4 members have zero current projects. Trade-off: one DevOps gap; recommend pairing with a part-time DevOps consultant."
    }
  ]
}
```
- **AI fallback:** Return `503` if Claude API unavailable.

---

## AI-12-02 · Select a Configuration and Allocate

**Backend:**
- `POST /api/ai/team-formation/:formation_id/select`
- **Request body:** `{ config_index: int, join_date: date, project_roles: [{ user_id, project_role }] }`
- **Logic:**
  1. Update `ai_team_formations.selected_config_index`.
  2. Bulk-create `ProjectMember` records from the selected configuration with `ai_matched = true`.
  3. Send `DOCUMENT_ASSIGNED`-style in-app notification to each allocated member.
- **Audit:** Log `project_member_add` with `source: "team_formation"` for each member.

**Frontend:**
- Project page: "Optimise Team" button → form (team size, constraints, num configs).
- Loading → side-by-side configuration cards:
  - Coverage score as a large circular progress indicator.
  - Member list with avatar, skills contributed, current workload.
  - Skill gaps remaining highlighted in red.
  - Rationale text in italics.
- "Select this team" button on preferred config → confirm modal with join date + role assignment per member.

---

---

# AI-13 · Skill Benchmark & Market Comparison

> Compares an individual's or team's skill profile against publicly known industry expectations for a given position or domain. Claude uses its training knowledge of industry standards (supplemented by optional web search) to produce a benchmark report with per-skill verdicts (above/at/below market).

**Phase:** Post-launch
**AI model:** `claude-sonnet-4-20250514`
**Roles:** `MANAGER` (own team), `ADMIN`; `USER` (self only)

---

## AI-13-01 · Generate Benchmark Report

**Backend:**
- `POST /api/ai/benchmark`
- **Request body:**
```json
{
  "scope_type": "USER",
  "scope_id": 42,
  "position_name": "Senior Frontend Developer",
  "market_context": "Vietnam tech industry, 2024–2025"
}
```
  - `scope_type`: `"USER"` or `"TEAM"`.
  - `scope_id`: `user_id` or `team_id`.
  - `position_name`: free-text job title to benchmark against. If omitted, uses the user's current `position.name`.
  - `market_context`: optional free-text descriptor (region, industry, year). Defaults to "general software industry".
- **Logic:**
  1. Fetch the target's skill assessments (`manager_score` preferred, fallback `self_score`).
  2. Build a prompt for Claude API containing: skill list + current levels + position name + market context.
  3. Claude generates `results: [{ skillset_name, user_level, market_level, delta, verdict, commentary }]` where:
     - `market_level`: Claude's estimate of typical level for this skill at this position in this context (int 1–5).
     - `delta`: `user_level - market_level` (positive = above market, negative = below).
     - `verdict`: `"ABOVE_MARKET"` | `"AT_MARKET"` | `"BELOW_MARKET"` | `"CRITICAL_GAP"` (delta ≤ -2).
     - `commentary`: 1–2 sentence explanation.
  4. Claude also returns `overall_verdict: string` (1 paragraph summary) and `hiring_recommendation: string`.
  5. Persist to `ai_benchmark_reports`.
- **Response:**
```json
{
  "report_id": "uuid",
  "scope_name": "Nguyen Van A",
  "position_benchmarked": "Senior Frontend Developer",
  "market_context": "Vietnam tech industry, 2024–2025",
  "overall_verdict": "Nguyen Van A is competitive for a Senior FE role in Vietnam. Strong in ReactJS and CSS but below market on TypeScript, which is now a standard requirement at senior level.",
  "hiring_recommendation": "Upskill TypeScript to L3 before applying to senior roles. Consider AWS basics as a differentiator.",
  "results": [
    {
      "skillset_name": "ReactJS",
      "user_level": 4,
      "market_level": 4,
      "delta": 0,
      "verdict": "AT_MARKET",
      "commentary": "Level 4 ReactJS is the standard expectation for senior FE roles in Vietnamese product companies."
    },
    {
      "skillset_name": "TypeScript",
      "user_level": 2,
      "market_level": 4,
      "delta": -2,
      "verdict": "CRITICAL_GAP",
      "commentary": "TypeScript at L4 is now expected for senior FE roles. This gap would be a blocker in most interviews."
    }
  ]
}
```
- **Important note:** Clearly label all market estimates as "AI-estimated" in the UI. Advise users to validate against current job postings for high-stakes decisions.
- **AI fallback:** Return `503` if Claude API unavailable.

---

## AI-13-02 · Team Benchmark Report

**Backend:**
- Same endpoint with `scope_type: "TEAM"`.
- **Logic:** Aggregate team average scores per skillset. Run same benchmark logic. Add `members_above_market`, `members_below_market` counts per skill.
- **Response:** Includes all individual `results` plus team-level aggregate row per skill.

---

## AI-13-03 · Re-run Report

**Backend:**
- `POST /api/ai/benchmark/:report_id/rerun`
- Reruns with same parameters. Useful after a skill assessment update.
- Stores new report with `previous_report_id` reference for comparison.

**Frontend:**
- Profile page: "Market Benchmark" button → position input (pre-filled from user's position) + market context input → loading → results.
- Results layout:
  - Overall verdict paragraph at top.
  - Per-skill table: Skill Name, Your Level (bar), Market Level (bar), Verdict badge (color-coded), Commentary tooltip.
  - Verdicts: green = ABOVE_MARKET, grey = AT_MARKET, amber = BELOW_MARKET, red = CRITICAL_GAP.
  - "AI estimated benchmarks — validate with current job postings" disclaimer footer.
  - "Add to Learning Goals" button per BELOW_MARKET/CRITICAL_GAP skill → creates `DevelopmentGoal` with `target_level = market_level`.

---

---

# AI-14 · Assessment Quality Reviewer

> Before a manager submits or finalises their review, Claude automatically analyses the full assessment record (self scores, manager scores, notes, assessment history, and cross-skillset relationships) and flags potential data quality issues: unexplained score inflation, illogical skill combinations, stagnant scores with no development activity, or assessments that contradict each other. Helps ensure the skill matrix stays accurate and trustworthy.

**Phase:** Sprint 5 / Phase 2
**AI model:** `claude-sonnet-4-20250514`
**Roles:** `MANAGER` (own team assessments), `ADMIN` (all); triggered automatically or on-demand

---

## AI-14-01 · Review Single Assessment

**Backend:**
- `POST /api/ai/assessment-review/single`
- **Request body:** `{ assessment_id: int }`
- **Logic:**
  1. Fetch `SkillAssessment` record including `self_score`, `manager_score`, `self_note`, `manager_note`, `assessment_ai_log`, and full `AssessmentLog` history.
  2. Fetch all other `SkillAssessment` records for the same user (cross-skillset context).
  3. Fetch user's `position.required_skills` and `DevelopmentGoal` records.
  4. Build Claude API prompt with all of the above. Instruct Claude to identify issues such as:
     - **Score without justification**: `manager_score` changed significantly (≥ 2 levels) with no `manager_note`.
     - **Contradictory skill levels**: e.g. ReactJS L5 but JavaScript L1 — logically inconsistent.
     - **Inflated self-assessment**: `self_score` is 2+ levels above `manager_score` across 3+ skills (systematic over-estimation pattern).
     - **Stagnant skills**: same score for 6+ months with no learning activity (no completed documents, no active goals for this skillset).
     - **Prerequisite gap**: a framework skill is rated high but its foundational skill is rated low (e.g. Spring Boot L4 but Java L1).
  5. Return structured issue list.
  6. Persist to `ai_assessment_reviews`.
- **Response:**
```json
{
  "review_id": "uuid",
  "assessment_id": 88,
  "skillset_name": "Spring Boot",
  "user_name": "Tran Thi B",
  "overall_quality": "FLAGGED",
  "issues": [
    {
      "type": "PREREQUISITE_GAP",
      "severity": "HIGH",
      "description": "Spring Boot is rated L4, but the foundational skill Java is rated L1. This combination is logically inconsistent and likely reflects an error in one of the two assessments.",
      "affected_skillsets": ["Spring Boot", "Java"],
      "suggested_action": "Review and align Java assessment before finalising Spring Boot score."
    },
    {
      "type": "SCORE_WITHOUT_JUSTIFICATION",
      "severity": "MEDIUM",
      "description": "Manager score was raised from L2 to L4 (a 2-level jump) with no manager note explaining the change.",
      "suggested_action": "Add a manager note documenting the basis for this score increase."
    }
  ],
  "generated_at": "2025-08-01T10:00:00Z"
}
```
- **AI fallback:** Return `503` if Claude API unavailable.

---

## AI-14-02 · Review Full Team Assessments

**Backend:**
- `POST /api/ai/assessment-review/team`
- **Request body:** `{ team_id: int }`
- **Logic:** Run AI-14-F01 logic for every `SkillAssessment` in the team that has been updated in the past 90 days. Batch Claude API calls (max 10 per request to avoid rate limits). Return aggregated issues per user.
- **Response:** `{ team_id, total_assessments_reviewed, flagged_count, warning_count, good_count, results: [AI-14-F01 response per assessment] }`

---

## AI-14-03 · Auto-trigger on Manager Review

**Backend:**
- Triggered automatically when `PUT /api/assessments/:id/manager-review` is called.
- **Logic:** After the manager score is saved, run AI-14-F01 asynchronously (non-blocking). If `overall_quality = FLAGGED`: create an in-app notification for the manager with a link to review the issues.
- **Business rule:** Auto-trigger only fires if `manager_score` changed by ≥ 2 levels in a single update, or if no `manager_note` is provided with a score of 4 or 5.

---

## AI-14-04 · Dismiss / Acknowledge Issues

**Backend:**
- `PATCH /api/ai/assessment-review/:review_id/issues/:issue_index/dismiss`
- **Request body:** `{ dismissed_reason: string }`
- **Logic:** Mark the specific issue as dismissed. Does not delete it — retained for audit trail.

**Frontend:**
- Manager assessment review panel: "Quality Check" button → runs AI-14-F01 → shows issue cards inline before the manager finalises the score.
- Issue cards: severity badge (HIGH = red, MEDIUM = amber, LOW = grey), issue type label, description, suggested action.
- "Dismiss" button per issue with a reason text field (e.g. "Score is correct — employee holds undocumented experience").
- "View Team Quality Report" in the team dashboard → runs AI-14-F02 and shows a heatmap of assessment quality across the team.
- Auto-triggered notification (AI-14-F03): bell notification "Quality issue flagged on [Employee Name]'s [Skillset] assessment" → click navigates to the review panel.

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

*Feature file: AI-01 → AI-14 — extracted from FEATURE_LIST.md*
