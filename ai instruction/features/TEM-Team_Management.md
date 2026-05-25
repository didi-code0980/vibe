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

---

## User Cases & User Experience

> Companion to the technical contracts above. Each TEM sub-feature is restated as a user story plus the expected user journey and UX behavior.

---

### TEM-01 · Team CRUD

#### User Story A — Admin: Create a Team

**As an** Admin
**I want to** create a new team and assign a manager
**So that** the organization can group employees under a responsible lead.

**User Journey**
1. I open `/admin/teams` and see a list of all existing teams as cards, each showing **team name**, **manager**, and **member count**.
2. I click the **+ New team** button (top-right).
3. A side-drawer (or modal) opens with:
   - **Team name** (required)
   - **Description** (optional, multi-line)
   - **Manager** (searchable dropdown of users with role MANAGER)
4. I fill the form and click **Create**.
5. On success → drawer closes, the new team card appears at the top of the list with a brief highlight animation, and a toast says *"Team created."*

**UX Expectations**
- Team name must be unique within the org — duplicate triggers an inline error: *"A team with this name already exists."*
- Manager dropdown shows the user's avatar + name + current team (if any) so I know if I'm reassigning them.
- If the chosen manager is already managing another team, a soft warning under the field: *"This user already manages 'Team X'. They can manage multiple teams if needed."*

---

#### User Story B — Manager: View My Team

**As a** Manager
**I want to** quickly find the team I lead
**So that** I can manage it without scrolling through unrelated teams.

**User Journey**
1. I log in and click **My Team** in the sidebar (or land on `/manager/team`).
2. If I manage exactly one team, I'm taken directly to its detail page.
3. If I manage multiple teams, I see a compact list of just my teams — no admin clutter.
4. If I'm assigned no team, I see an empty state: *"You don't manage any team yet. Contact your administrator."*

**UX Expectations**
- The header always reads *"My Team — {Team Name}"* for clarity.
- Manager never sees teams they don't manage in this view, even by URL guessing — backend enforces scope.

---

#### User Story C — Update a Team

**As an** Admin **or** the assigned Manager
**I want to** rename my team or update its description
**So that** the team information stays accurate as the org evolves.

**User Journey**
1. From the team detail page, I click the **⋯** menu → **Edit team**.
2. The same drawer used for create opens, pre-filled.
3. Manager-role users cannot change `manager_id` (the field is read-only with a tooltip: *"Only an admin can reassign the manager."*).
4. I edit name/description → **Save** → toast *"Team updated."*

**UX Expectations**
- Optimistic update — the card header changes immediately while the request is in flight.
- If another admin updates the same team concurrently, I get a conflict toast: *"Team was updated by someone else. Please refresh."*

---

#### User Story D — Delete a Team

**As an** Admin
**I want to** delete a team that no longer exists in the org
**So that** the team list reflects reality.

**User Journey**
1. From the team detail page or list card, I click **⋯** → **Delete team**.
2. A confirmation dialog appears:
   - Title: *"Delete '{Team Name}'?"*
   - Body: *"This team has {N} members. They will be unassigned. This action is reversible by an admin within 30 days."*
   - Buttons: **Cancel** (default) / **Delete** (red).
3. I confirm → toast *"Team deleted."* → list refreshes without the deleted team.

**UX Expectations**
- Soft delete: the team is hidden from all lists but can be restored from `/admin/teams?show=deleted`.
- All existing members get `left_at` set; their personal profile shows *"No team"* afterwards.
- Manager never sees a Delete button — only admin.

---

### TEM-02 · Manage Team Members

#### User Story A — Add a Member

**As a** Manager (own team) **or** Admin
**I want to** add an employee to my team
**So that** they appear in my team's member list and can be assessed.

**User Journey**
1. On the team detail page, I click **+ Add member**.
2. A modal opens with:
   - **User** — searchable dropdown showing avatar, name, current team, position.
   - **Position** (optional) — dropdown of organizational positions; default placeholder *"Member"*.
3. I select a user. If they already belong to another team, the modal shows a yellow banner:
   *"This user is currently on 'Team X'. Adding them here will remove them from that team."*
4. I click **Add** → toast *"{Name} added to the team."*

**UX Expectations**
- Search supports name + email; results highlight matched substring.
- The dropdown excludes users already on this team and users marked DELETED.
- The previous team's member list updates in real-time (or on next refresh) — that user now shows as left.

---

#### User Story B — Remove a Member

**As a** Manager (own team) **or** Admin
**I want to** remove a member who no longer belongs on the team
**So that** the roster stays accurate.

**User Journey**
1. In the member table, I hover over a member's row → a **⋯** icon appears at the end.
2. I click **⋯** → **Remove from team**.
3. A confirmation dialog: *"Remove {Name} from {Team Name}? Their history stays, but they will no longer appear in the roster."*
4. I confirm → row fades out → toast *"{Name} removed."*

**UX Expectations**
- "Remove" is a soft action — `left_at` is set, history is preserved for audit/reports.
- The user's profile/skill history is not deleted.
- I cannot remove myself if I am the team's manager (the option is hidden or disabled with a tooltip).

---

#### User Story C — Change a Member's Position

**As a** Manager (own team) **or** Admin
**I want to** update a member's job position
**So that** assessments are matched to the right required skills.

**User Journey**
1. In the member table, I click the **Position** cell for the member.
2. It turns into an inline dropdown listing all positions.
3. I pick a new position → it saves immediately (inline edit), accompanied by a subtle *"Saved"* indicator on the cell.

**UX Expectations**
- Loading state on the cell while saving (small spinner replaces value briefly).
- If save fails, the cell reverts and shows an inline error tooltip.
- The change is audit-logged with old → new position.

---

#### User Story D — Browse Team Members

**As a** Manager **or** Admin
**I want to** see all members of a team at a glance
**So that** I can plan workload, assessments, and 1:1s.

**User Journey**
1. The team detail page shows a members table:

   | Avatar | Name | Position | Joined | Status | ⋯ |
   |---|---|---|---|---|---|
   | 🟢 | An Nguyen | Senior Dev | 2024-01-15 | Active | ⋯ |
   | 🟡 | Binh Tran | Member | 2025-03-02 | New | ⋯ |

2. The table supports pagination (default 20 / page), search, and sort by name / join date.
3. Clicking a row navigates to **TEM-03** (member detail).

**UX Expectations**
- Empty state with a CTA: *"This team has no members yet. **+ Add the first member**."*
- Status chip shows ACTIVE / LOCKED / DELETED, color-coded.

---

### TEM-03 · View & Note on Member

#### User Story A — View Member Detail

**As a** Manager (own team) **or** Admin
**I want to** see everything relevant about a team member in one place
**So that** I can prepare for 1:1s and performance discussions.

**User Journey**
1. From the member table, I click a row → a slide-over (right-side panel) opens.
2. The slide-over has tabs: **Profile · Skills · Goals · Documents · Notes · Change Log**.
3. **Profile** tab shows: avatar, name, email (visible to manager), phone, position, join date, status.
4. **Skills** tab shows: list of skillsets with self-score + manager-score side by side.
5. **Goals** tab shows: development goals with status (IN_PROGRESS / COMPLETED / CANCELLED).
6. **Documents** tab shows: assigned learning documents with completion status.
7. **Notes** tab shows: private notes (described below).
8. **Change Log** tab is described in **TEM-04**.

**UX Expectations**
- The slide-over is wide (≥640 px) to comfortably display tables.
- I can close it with **Esc**, the X button, or by clicking the backdrop.
- Tab state persists if I navigate away and come back within the session.

---

#### User Story B — Add a Private Note

**As a** Manager
**I want to** record private observations about my team member
**So that** I have context for future reviews without the member seeing it.

**User Journey**
1. On the **Notes** tab, I see a chronological list of my previous notes (newest first).
2. At the top is a text-area placeholder: *"Add a private note about this member…"*
3. I type, then click **Save note**.
4. The new note appears at the top with my name, avatar, and timestamp.

**UX Expectations**
- Notes are explicitly labeled *"Visible to managers and admins only — never shown to the member."* under the input.
- The member cannot see this tab and the API blocks attempts to read others' notes.
- Notes are append-only in v1: no edit or delete (audit-friendly). If needed, this is documented to managers.
- A note must be 1–2000 characters; the counter shows live.

---

### TEM-04 · View Member Change Logs

**As a** Manager (own team) **or** Admin
**I want to** see what has changed for a member over time
**So that** I can investigate disputes, prepare audits, and understand a member's trajectory.

**User Journey**
1. From the member slide-over, I click the **Change Log** tab.
2. I see a reverse-chronological timeline of events:

   ```
   ◉  2025-05-10 14:22  · An Nguyen
       Position changed from "Member" → "Senior Dev"
       Actor: Tran Linh (Manager)

   ◉  2025-03-02 09:10  · An Nguyen
       Joined team "Frontend Guild"
       Actor: Tran Linh (Manager)

   ◉  2025-02-28 16:45  · An Nguyen
       Skill "React" — Manager score updated 3 → 4
       Actor: Tran Linh (Manager)
   ```

3. Each event row shows: timestamp, action label, actor, and (where useful) a *"View details"* link to see the old → new diff.
4. Top filters: **Date range**, **Action type** (Member add/remove, Position change, Skill score change, Note added), **Actor**.

**UX Expectations**
- Pagination default 20 / page, infinite scroll preferred for timelines.
- Empty state: *"No changes recorded yet."*
- For high-noise events (e.g., bulk imports), the timeline can collapse into a single grouped entry: *"45 changes from CSV import — view details."*
- All entries are read-only; this view never offers edit or delete actions.

---

### Cross-Cutting UX Principles for TEM

| Principle | What it looks like |
|---|---|
| **Scope discipline** | A Manager never sees teams or members outside their own — no leaks via URL, search, or autocomplete. |
| **Soft over hard** | Delete team and remove member are soft operations; recoverable for 30 days by Admin. |
| **Single-team invariant** | When adding a member who's on another team, the UI surfaces the conflict and explains the auto-move before the action is confirmed. |
| **Inline editing where safe** | Position is inline-edited; team rename uses a drawer to allow rich edits and validation. |
| **Audit-friendly notes** | Manager notes are append-only and clearly labeled as private; the member never has read access. |
| **Always reversible at admin level** | Every destructive action shows what happens and offers a path to restore. |
| **Forced empty states** | Every list (teams, members, notes, change log) has a clear empty state with a CTA where appropriate. |
| **Real-time consistency** | Adding a member to my team also reflects in the previous team's roster without manual refresh. |
| **Keyboard-first** | Drawers and modals close on **Esc**, action menus open with **Enter**, tables support **Tab** navigation. |
| **Localized & tz-aware** | All timestamps render in the viewer's local timezone; labels respect the user's language (vi / en). |

---