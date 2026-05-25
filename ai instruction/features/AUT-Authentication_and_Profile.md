---

## User Cases & User Experience

> Companion to the technical contracts above. Each AUT sub-feature is restated as a user story plus the expected user journey and UX behavior.

---

### AUT-01 · Login

**As a** Skill Matrix user (employee, manager, or admin)
**I want to** sign in with my email and password
**So that** I can securely access the parts of the system that apply to my role.

**User Journey**
1. I land on `/login` and see a clean form: **Email**, **Password** (with a show/hide toggle), a **Remember me** checkbox, and a **Forgot password?** link.
2. I type my credentials. If "Remember me" is checked, my email (and optionally password) is restored next time so I don't have to retype.
3. I click **Sign in**.
4. The button shows a spinner; the form is disabled to prevent double-submission.
5. Depending on the outcome:
   - **Success →** I'm redirected based on my role:
     - ADMIN → `/admin/dashboard`
     - MANAGER → `/manager/dashboard`
     - USER → `/dashboard`
   - **First login / forced reset →** I'm pushed to `/change-password` and *cannot navigate anywhere else* until I set a new password.
   - **Wrong email or password →** I see a single generic message: *"Invalid email or password."* (the system never reveals whether the email exists).
   - **Locked account →** *"Account is locked. Contact administrator."*
   - **Too many failed attempts →** *"Too many failed attempts. Try again in 15 minutes."*

**UX Expectations**
- Submit on **Enter** key.
- Inline validation: email format, non-empty password.
- Error messages render below the form, never as intrusive modals.
- Login lockout is silent to the attacker — the same friendly message appears after each failure until the 5-attempt threshold triggers the 15-min cooldown.
- After login, the token lives in memory or HttpOnly cookie; the user does not have to log in again as the app refreshes tokens behind the scenes.

---

### AUT-02 · Logout

**As an** authenticated user
**I want to** end my session with one click
**So that** I can safely leave my workstation.

**User Journey**
1. I click my avatar in the top navbar.
2. A dropdown opens with "Profile", "Settings", and **Log out**.
3. I click **Log out**.
4. Tokens are cleared client-side, the server invalidates my refresh token, and I'm redirected to `/login` with a soft toast: *"You've been signed out."*

**UX Expectations**
- One click — no confirmation dialog (logout is non-destructive).
- If I open another tab where I was logged in, that tab should also detect the logout on its next request and redirect.

---

### AUT-03 · Refresh Token (silent)

**As a** logged-in user
**I want** my session to stay alive while I'm actively using the app
**So that** I don't get bounced to the login screen mid-task.

**User Journey**
1. I'm filling out a form or reading a long page. My access token quietly expires (15 min).
2. My next click triggers a request → server returns `401`.
3. The HTTP interceptor catches this, calls `/api/auth/refresh` with my refresh token, and **retries the original request automatically**.
4. I see no flicker, no error — the page just works.
5. If the refresh token has also expired (after 7 days), I'm redirected to `/login` with the message: *"Your session expired. Please sign in again."*

**UX Expectations**
- 100% invisible while the user is active.
- Any unsaved form data should be preserved if a forced re-login is required (ideally restore after re-auth).

---

### AUT-04 · Forgot Password

**As a** user who forgot my password
**I want to** request a reset link by email
**So that** I can regain access without involving the admin.

**User Journey**

*Step A — Request reset*
1. From `/login`, I click **Forgot password?**.
2. I'm taken to `/forgot-password` with a single Email field and a **Send reset link** button.
3. I enter my email and submit.
4. I see a success toast: *"If that email is registered, a reset link has been sent."* (same message whether or not the email exists — anti-enumeration).
5. I check my inbox.

*Step B — Set new password*
1. The email contains a button **Reset my password** that links to `/reset-password?token=xxx`.
2. I land on a form with **New password** and **Confirm new password**.
3. I see the password policy as a checklist that lights up green as my input satisfies each rule:
   - 8–32 characters
   - At least one uppercase letter
   - At least one number
   - At least one special character
   - Both fields match
4. I submit → success toast → automatic redirect to `/login`.
5. If the token is expired (>1 hour) or already used, I see: *"This reset link is no longer valid. Please request a new one."*

**UX Expectations**
- The email button works on mobile and includes a plain-text fallback URL.
- The reset page is reachable without being logged in.
- The new password is checked client-side AND server-side.

---

### AUT-05 · Change Password

**As a** logged-in user
**I want to** change my password from my settings
**So that** I can rotate credentials or replace a temporary password.

**User Journey**
1. I go to **Settings → Security → Change password**.
2. Three fields: **Current password**, **New password**, **Confirm new password**.
3. The same live policy checklist as AUT-04 guides me.
4. I submit.
   - **Wrong current password →** *"Current password is incorrect."*
   - **New password doesn't meet policy →** inline error under the field.
   - **Success →** toast: *"Password updated."* — I stay on the page.
5. If I was on the forced-change screen (after first login), I'm now released and redirected to my role-based dashboard.

**UX Expectations**
- The new password must differ from the current one.
- I'm not logged out of my current session after a password change (no surprise re-login).

---

### AUT-06 · View & Update My Profile

**As any** user
**I want to** see and update my own profile
**So that** my contact information stays accurate.

**User Journey**
1. I navigate to `/profile` from the avatar menu.
2. I see a profile card showing:
   - Avatar
   - **Full name** (editable)
   - **Phone** (editable)
   - **Email** (read-only, with tooltip: *"Contact admin to change."*)
   - **Role** (read-only)
   - **Position** (read-only)
   - **Team** (read-only)
   - Member-since date
3. Editable fields show a pencil icon on hover; clicking turns the field into an input with **Save / Cancel** buttons.
4. Saving triggers an optimistic update and a small *"Saved"* toast.

**UX Expectations**
- Read-only fields are visually distinct (grey background, lock icon).
- Phone is validated for format.
- Long names truncate gracefully with a tooltip.

---

### AUT-07 · Upload Avatar

**As any** user
**I want to** change my avatar photo
**So that** my profile feels personal and teammates can recognize me.

**User Journey**
1. On `/profile`, I hover over my circular avatar → an overlay appears with **Change photo**.
2. I click → a file picker opens (also supports drag-and-drop).
3. I select a JPG/PNG/WebP file under 2 MB.
   - **Wrong format →** *"Only JPG, PNG, or WebP allowed."*
   - **Too big →** *"Image must be 2 MB or smaller."*
4. A **preview modal** appears with a circular crop, optional zoom/reposition, and **Upload / Cancel** buttons.
5. On confirm, I see a progress bar. On success the new avatar replaces the old everywhere in the UI (navbar, comments, etc.) and the old file is purged from storage.

**UX Expectations**
- Visual progress feedback for uploads, not just a spinner.
- Failure during upload leaves the old avatar untouched.
- Optional: a "Remove photo" option that reverts to the default initials avatar.

---

### AUT-08 · General Settings — Notifications & Language

**As any** user
**I want to** control whether I receive emails and choose my UI language
**So that** the system fits my workflow and locale.

**User Journey**
1. I open **Settings → Preferences**.
2. I see:
   - **Email notifications** — a single toggle (on by default).
   - **Language** — a dropdown: Tiếng Việt / English.
3. Changes save immediately on toggle/select (no explicit Save button). A subtle *"Saved"* indicator appears.
4. If I switch language, the UI re-renders in the new language without a page reload.

**UX Expectations**
- Setting persists across devices (server-side, tied to my user).
- Disabling email notifications stops digest/marketing emails but **NOT** security emails (password reset, account lock). This is communicated under the toggle.

---

### AUT-09 · My Assessment History

**As any** user
**I want to** see the history of my skill assessments
**So that** I can track my growth over time.

**User Journey**
1. On `/profile`, I click the **Assessment History** tab.
2. I see a paginated table:

   | Skill | Department | Self Score | Manager Score | Date |
   |---|---|---:|---:|---|
   | React | Frontend | 4 | 5 | 2025-03-12 |
   | Python | Backend | 3 | 3 | 2025-02-01 |
   | … | | | | |

3. Sorting defaults to most-recent first.
4. I can click a row to expand and see the manager's note.
5. If a manager score is missing, I see *"—"* with a tooltip: *"Awaiting manager review."*
6. If I have no history yet, an empty state shows: *"You don't have any assessments yet. Your manager will start one soon."*

**UX Expectations**
- Pagination defaults to 20 rows.
- Self vs. Manager scores are visually distinguishable (e.g., colored chips).
- Read-only — no edit affordances on this page.

---

### AUT-10 · View My Team Info

**As any** user
**I want to** see who else is on my team and what skills they have
**So that** I know whom to ask for help and where my team's strengths are.

**User Journey**
1. On `/profile`, I open the **My Team** tab.
2. The top banner shows: **Team name** · **Manager** (name + avatar).
3. Below is a grid of teammate cards:
   - Avatar
   - Full name
   - Position
   - Top 3 skills as colored chips (`React · 4`, `Python · 3`, `SQL · 5`)
4. Clicking a teammate card opens a slide-over with the full skillset list (self-scores only).
5. **Privacy boundary:** I see *no* phone numbers, *no* emails, and *no* manager scores for teammates.

**UX Expectations**
- If I'm not currently in a team, an empty state: *"You haven't been assigned to a team yet."*
- Cards are responsive: 3 columns on desktop, 2 on tablet, 1 on mobile.
- Loading state uses skeleton cards, not a centered spinner.

---

### Cross-Cutting UX Principles for AUT

| Principle | What it looks like |
|---|---|
| **Privacy first** | Errors never reveal whether an email is registered. Teammate views never expose private contact info or manager scores. |
| **Forgiving forms** | Inline validation as the user types; only block submit on real errors. Submit on **Enter**. |
| **Optimistic feedback** | Save-on-toggle for settings; toasts confirm save without taking focus. |
| **Forced-state guardrails** | After first login, the user *cannot* leave the change-password screen until they set a new password. |
| **Silent session continuity** | Token refresh is invisible. The user gets redirected to `/login` only when the refresh token itself expires. |
| **Accessible by default** | All form fields have labels, focus rings are visible, password show/hide is keyboard-reachable, color is never the sole indicator. |
| **i18n ready** | Every message uses translation keys (vi/en), with dates rendered in the user's local timezone. |

---