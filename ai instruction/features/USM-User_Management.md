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

> Companion to the technical contracts above. Each USM sub-feature is restated as a user story plus the expected user journey and UX behavior. **All USM features are Admin-only** — no Manager or User ever reaches these screens.

---

### USM-01 · List Users

**As an** Admin
**I want to** browse, search, and filter every user account in the system
**So that** I can find the right person quickly when I need to make a change.

**User Journey**
1. From the admin sidebar I click **Users** → I land on `/admin/users`.
2. The page shows a data table with columns: **Avatar · Full Name · Email · Position · Status · Created · Actions**.
3. The default sort is *newest first* (`created_at DESC`).
4. At the top of the table:
   - A **search bar** (placeholder *"Search by name or email…"*).
   - Filter chips/dropdowns: **Status** (All / Active / Locked / Deleted), **Position**, **Created date range**.
   - A **+ New user** button (top-right) — see USM-05.
5. Search is debounced (~300 ms); results update without a full page reload.
6. Each row shows a **Status badge**:
   - 🟢 ACTIVE (green)
   - 🟡 LOCKED (amber)
   - ⚫ DELETED (grey, muted row)
7. Each row's **Actions** column has a `⋯` menu: **View · Lock/Unlock · Delete**.
8. Clicking a row (anywhere except Actions) opens the user detail page.
9. Pagination footer: *"Showing 1–20 of 134"* with page-size selector (20/50/100) and prev/next.

**UX Expectations**
- Empty state (filtered out): *"No users match your filters. Try clearing them."* with a **Clear filters** link.
- Empty state (system has no users): *"No users yet. **+ Create the first user**."*
- Deleted users are hidden by default; show via the **Status: Deleted** filter.
- The filter state is reflected in the URL query string so admins can share a filtered link.
- Keyboard: `/` focuses search, `↑/↓` navigates rows, `Enter` opens the focused row.
- Bulk-select with checkboxes is **out of scope for v1** (single-row actions only).

---

### USM-02 · View User Activity Logs

**As an** Admin
**I want to** see everything a user has done in the system
**So that** I can investigate security incidents, audit changes, or troubleshoot user issues.

**User Journey**
1. From the user list or detail page, I click **View** → the user detail page opens.
2. I click the **Activity Logs** tab.
3. I see a timeline (or table) of audit entries, newest first:

   ```
   ◉  2025-05-22 14:08  ·  Updated team "Frontend Guild"
       Changed: description, manager_id
       IP: 14.224.8.12
       [ View diff ]

   ◉  2025-05-22 09:31  ·  Logged in
       IP: 14.224.8.12 · Chrome on macOS

   ◉  2025-05-21 17:55  ·  Created skill assessment for user "Binh Tran"
       [ View diff ]
   ```

4. Each entry shows: **timestamp · action label · short context · IP**.
5. Clicking **View diff** expands an inline panel with a side-by-side or unified diff of `old_data` → `new_data` (JSON pretty-printed, changed fields highlighted).
6. Top filters: **Date range**, **Action type**, **Entity type**.
7. Pagination default 20 / page, with optional infinite scroll.

**UX Expectations**
- Empty state: *"This user has no recorded activity yet."*
- Sensitive fields in diffs (e.g., `password_hash`, `reset_token`) are auto-masked as `••••••`.
- Each entry is expandable but the page never blocks while expanding (lazy-load diff data only when opened).
- A subtle **Export CSV** button is available for compliance/audit handoff.
- Read-only — there is no edit/delete on this view ever (audit integrity).
- Timestamps render in the admin's local TZ but a tooltip shows the original UTC.

---

### USM-03 · Lock / Unlock Account

**As an** Admin
**I want to** temporarily disable a user's ability to log in
**So that** I can respond to security incidents, departures, or HR holds without permanently deleting the account.

**User Journey**

*Locking an account:*
1. From the user list `⋯` menu **or** the user detail page header, I click **Lock account**.
2. A confirmation dialog appears:
   - Title: *"Lock {Full Name}?"*
   - Body: *"This user will be signed out immediately and unable to log in until unlocked. Their data and history are preserved."*
   - Buttons: **Cancel** (default) / **Lock account** (amber).
3. I confirm → toast *"{Name}'s account locked."* → status badge in the list flips to 🟡 **LOCKED**.
4. If the user is currently online, their next request returns `401` and they're redirected to `/login` with the message *"Account is locked. Contact administrator."*

*Unlocking:*
1. The same `⋯` menu now shows **Unlock account** for any LOCKED user.
2. I click it → no confirmation needed (it's a low-risk, reversible action) → toast *"{Name}'s account unlocked."*

**UX Expectations**
- **Self-lock is forbidden.** The Lock option is hidden (or disabled with a tooltip *"You can't lock your own account."*) when viewing my own row.
- The user's session is invalidated server-side immediately upon lock.
- Bulk lock is **not** supported in v1 — only single-row operations.
- The action is audit-logged as `user_locked` / `user_unlocked` with my admin id and reason (optional reason field is OK to add in v1.1).
- A locked user still appears in lists, search results, team membership, and audit logs — they're disabled, not hidden.

---

### USM-04 · Delete Account (Soft Delete)

**As an** Admin
**I want to** remove a user from active rosters when they leave the organization
**So that** they no longer appear in teams or projects while their historical data is preserved for audit.

**User Journey**
1. From the user list `⋯` menu or detail page, I click **Delete account**.
2. A two-step confirmation appears:
   - **Step 1 — Warning:**
     - Title: *"Delete {Full Name}?"*
     - Body: *"This will sign the user out, remove them from {N} team(s) and {M} project(s), and hide them from active lists. Their assessments, history, and audit logs are kept. An admin can restore this account within 30 days."*
     - Buttons: **Cancel** / **Continue**.
   - **Step 2 — Type-to-confirm:**
     - *"To confirm, type the user's email below:"*
     - An input that must match the user's email exactly to enable the red **Delete account** button.
3. I confirm → toast *"{Name}'s account deleted."* → row fades to grey (or disappears, depending on current filter).

**UX Expectations**
- **Self-delete is forbidden.** Delete is hidden/disabled when viewing my own row.
- The action is **soft**: `status = DELETED`, `deleted_at = now()`. The row remains in the DB.
- The user's `TeamMember.left_at` and `ProjectMember.out_date` are set automatically (no manual cleanup).
- Active sessions for the deleted user are killed immediately.
- A deleted user is restored from `/admin/users?status=DELETED` via a **Restore** action (within 30 days).
- After 30 days, an admin can choose to purge the user (this is a separate Admin feature, out of v1 scope, but the door is left open).
- All deletion attempts are audit-logged regardless of outcome (succeeded, cancelled, denied).

---

### USM-05 · Create User Account

**As an** Admin
**I want to** onboard a new employee into Skill Matrix in under a minute
**So that** they can log in and start using the system the same day.

**User Journey**
1. From `/admin/users`, I click **+ New user** (top-right).
2. A slide-over (or full page `/admin/users/create`) opens with the form:
   - **Full name** (required, 2–100 chars)
   - **Email** (required, must be unique; live duplicate-check shows a green check or *"This email is already used by another account."*)
   - **Role** (required, dropdown: `USER` (default) / `MANAGER` / `ADMIN`)
   - **Position** (optional dropdown, searchable)
   - **Team** (optional dropdown, searchable)
3. Below the form, a help block reads:
   *"A temporary password will be generated and emailed to the user. They will be required to set a new password on first login."*
4. I click **Create**.
5. The button shows a spinner. On success:
   - Slide-over closes.
   - Toast: *"Account created. Credentials sent to {email}."*
   - The new user appears at the top of the list with status 🟢 ACTIVE.
6. The new user receives an email (`ACCOUNT_CREATED` template) containing:
   - Their email (login id)
   - A temporary password (10+ chars, mixed-case + number + symbol)
   - A login link
   - A note that they must change the password on first login.

**UX Expectations**
- Email validation is RFC-compliant and trimmed of whitespace.
- Duplicate email returns inline error (`409`) without losing the rest of the form.
- If the SMTP send fails after the account is created, the toast warns: *"Account created, but the credential email could not be sent. **Resend email**."*
- The form has both **Create** and **Create & add another** so admins onboarding multiple users don't have to reopen the form repeatedly.
- The temporary password is **never displayed** in the admin UI (only emailed) to avoid accidental shoulder-surfing.
- Pre-creation: if the admin selects a Team, the dropdown shows the team's current manager so the admin understands chain of command.
- Audit-logged as `user_created` with the creating admin's id, the new user's id, and the role assigned.

---

### Cross-Cutting UX Principles for USM

| Principle | What it looks like |
|---|---|
| **Admin-only surface** | Every USM route is gated by `ADMIN`; non-admins reaching these URLs see a friendly 403 page with a link to their dashboard. |
| **No self-foot-guns** | Lock and Delete are hidden/disabled on the admin's own row — server enforces this too. |
| **Soft over hard** | Delete is reversible for 30 days. Lock is freely reversible at any time. |
| **Diff-based audit** | Activity Logs always show *what changed*, not just *that something changed*. Diffs are inline-expandable. |
| **Sensitive masking** | `password_hash`, reset tokens, and other secrets are automatically redacted in any UI that shows audit data. |
| **Confirmation matches risk** | Lock = simple confirm. Delete = two-step + type-to-confirm. Restore/Unlock = no dialog. |
| **Live duplicate-checking** | Email uniqueness is checked as the admin types, not only on submit. |
| **No credential leakage** | Temporary passwords are emailed, never shown in the admin UI; resend is one click if delivery failed. |
| **URL-encoded filters** | The list view's filter and search state is reflected in the URL, so admins can bookmark and share specific views. |
| **Localized & TZ-aware** | All timestamps render in the admin's local timezone with a UTC tooltip for forensic precision. |

---