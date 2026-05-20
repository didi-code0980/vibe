# SkillMatrix Frontend

A Next.js 14 (App Router) web client for the **SkillMatrix** platform — an enterprise application for managing, assessing, and developing employee skills across teams and projects.

The project follows a **feature-based architecture** on top of Next.js App Router. Routes are kept thin and compose from feature modules in `features/`; cross-cutting concerns (auth, RBAC, API client, navigation) live in `lib/`, `store/`, `providers/`, and `components/`. Server data is fetched through **TanStack Query**; global client state goes through **Zustand**; forms use **react-hook-form + Zod**. A **BFF layer** (Next.js Route Handlers under `app/api/`) proxies the Spring Boot backend so that secrets stay server-side.

> **Canonical spec:** Every endpoint, entity, and business rule is defined in [../ai instruction/SYSTEM.md](../ai%20instruction/SYSTEM.md). Read it before adding a feature.
>
> **Authoring conventions:** Every change to this codebase must follow [CLAUDE.md](./CLAUDE.md) — folder layout, RBAC layering, state-management decision tree, naming rules.
>
> **Status:** AUT-01 §4 and CFG-01 §11 delivered end-to-end.
> - **AUT-01** — login, forgot/reset/change password, profile view + edit + avatar upload + settings + assessment history + team panel.
> - **CFG-01** — Job Titles (Positions) CRUD, App Configuration tabs (Rating Scale, SMTP + test-send, Notification Rules, Permission Matrix), Email Templates CRUD, Audit Logs query.
>
> Other modules are scaffolded (routes + endpoint constants + types) and will be wired up feature-by-feature.

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) **18.18+** (Next.js 14 requirement)
- [npm](https://www.npmjs.com/) 9+ (or pnpm / yarn — examples below use npm)
- A running [SkillMatrix backend](../backend) (Spring Boot, default `http://localhost:8080`)

### Manual Installation

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd repo/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment:**
   Create a `.env.local` file in the `frontend/` root:
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:8080/api
   ```
   The dev server proxies every request under `/api/*` to this URL via the rewrite rule in [`next.config.mjs`](./next.config.mjs), so the browser never talks to the backend directly.

4. **Run the Application (development):**
   ```bash
   npm run dev
   ```
   App is served at `http://localhost:3000`.

5. **Build & Run (production):**
   ```bash
   npm run build
   npm run start
   ```

## 📋 Table of Contents

- [Features](#-features)
- [Project Structure](#-project-structure)
- [Routes & Pages](#-routes--pages)
- [Environment Variables](#-environment-variables)
- [Authentication & Authorization](#-authentication--authorization)
- [State Management](#-state-management)
- [API Layer (BFF)](#-api-layer-bff)
- [Error Handling](#-error-handling)
- [Styling & UI](#-styling--ui)
- [Auth & Profile Module (AUT-01)](#-auth--profile-module-aut-01)
- [Admin Module (CFG-01)](#-admin-module-cfg-01)
- [Forms & Validation](#-forms--validation)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)
- [Commands](#-commands)

## ✨ Features

- **Next.js 14 App Router** — Server Components by default; `'use client'` only where needed.
- **TypeScript (strict mode)** — `any` is disallowed without justification.
- **Feature-based architecture** — each domain (`auth`, `profile`, …) owns its `components/`, `hooks/`, `services/`, `types/`, `schemas/`.
- **Role-Based Access Control (RBAC)** — three enforcement layers: `middleware.ts` (route), server `layout.tsx` guards (admin), and `<RoleGuard>` (UI). Roles: `ADMIN`, `MANAGER`, `USER`.
- **Server state via TanStack Query** — typed hooks per feature; devtools enabled in development.
- **Client state via Zustand** — persisted auth store with JWT decoding and cookie mirror for SSR/middleware.
- **Forms with react-hook-form + Zod** — Zod schemas colocated in `features/<name>/schemas/`.
- **Centralized API client** — `lib/api/client.ts` wraps `fetch`, auto-attaches the bearer token, and normalizes errors.
- **Endpoint registry** — every backend URL lives in `lib/api/endpoints.ts` (no hardcoded URLs in features).
- **BFF pattern** — Next.js Route Handlers under `app/api/` proxy backend calls so secrets / cookies stay server-side.
- **Tailwind CSS + shadcn/ui-style primitives** — design tokens (`teal`, `navy`, `fog`, …) defined in `tailwind.config.ts`.
- **Recharts** — used by the dashboard/matrix views for radar, bar, donut, and heatmap visualisations.
- **AI surface area pre-wired** — endpoints + types for the eight `AI-0x` features (resource match, gap analysis, learning path, taxonomy generation, trend, risk score, matrix query, assessment assistant).

## 🏗 Project Structure

```
frontend/
 ├── src/
 │   ├── app/                  # Next.js App Router (routes only — keep thin)
 │   │   ├── (auth)/           # Public auth routes
 │   │   │   └── login/
 │   │   ├── (dashboard)/      # Protected routes (auth required)
 │   │   │   ├── admin/        # ADMIN-only (server-side guard)
 │   │   │   ├── dashboard/    # Personal dashboard
 │   │   │   ├── profile/      # Own profile
 │   │   │   ├── matrix/       # Team skill matrix (ADMIN, MANAGER)
 │   │   │   ├── assessment/
 │   │   │   ├── org/          # Org chart (ADMIN, MANAGER)
 │   │   │   ├── ai/           # AI-powered insights
 │   │   │   ├── agent/        # AI agent / chat
 │   │   │   ├── job-brief/    # AI job brief (ADMIN, MANAGER)
 │   │   │   ├── learning/
 │   │   │   └── settings/
 │   │   ├── api/              # BFF route handlers (e.g. /api/me)
 │   │   ├── 403/              # Forbidden page
 │   │   └── layout.tsx        # Root layout + <QueryProvider>
 │   │
 │   ├── features/             # Domain modules (feature-based)
 │   │   ├── auth/
 │   │   │   ├── components/   # LoginForm, ForgotPasswordForm, ResetPasswordForm, ChangePasswordForm
 │   │   │   ├── hooks/        # useAuthMutations (useLogin / useLogout / useForgotPassword / useResetPassword / useChangePassword)
 │   │   │   ├── schemas/      # login, forgot-password, password (reset + change)
 │   │   │   ├── services/     # auth.service.ts
 │   │   │   └── types/
 │   │   ├── profile/
 │   │   │   ├── components/   # ProfileView, EditProfileForm, AvatarUploader, SettingsPanel, AssessmentHistoryList, MyTeamPanel
 │   │   │   ├── hooks/        # useProfile, useCurrentProfile, useUpdateProfile, useUploadAvatar, useProfileSettings, useAssessmentHistory, useMyTeam
 │   │   │   ├── schemas/      # update-profile, settings
 │   │   │   ├── services/     # profile.service.ts
 │   │   │   └── types/        # ProfileResponse, ProfileSettings, AssessmentHistoryItem, ProfileTeam, …
 │   │   └── admin/                          # CFG-01 admin module
 │   │       ├── shared/types.ts             # TriggerEvent, AdminRole, FeatureKey + lists
 │   │       ├── positions/                  # §11.3 Job Titles (types, schema, service, hooks, PositionList, PositionFormDialog)
 │   │       ├── config/                     # §11.1, §11.2, §11.4, §11.5, §11.7
 │   │       │   ├── components/             # RatingScalePanel, SmtpPanel, NotificationRulesPanel, PermissionsPanel
 │   │       │   ├── hooks/useConfig.ts      # useRoles, usePermissionMatrix, useRatingScale, useSmtpConfig, …
 │   │       │   ├── schemas/                # ratingScale, smtp, notificationRules, permissionMatrix
 │   │       │   └── services/config.service.ts
 │   │       ├── email-templates/            # §11.6 (EmailTemplateList, EmailTemplateEditor)
 │   │       └── audit-logs/                 # §11.8 (AuditLogTable + filter form)
 │   │
 │   ├── components/           # SHARED components only
 │   │   ├── ui/               # Primitives (Card, Badge, KpiCard, SkillBar, …)
 │   │   ├── layout/           # Sidebar, TopHeader
 │   │   ├── guards/           # RoleGuard
 │   │   └── features/         # Per-feature UI shared across routes
 │   │
 │   ├── lib/                  # Core libraries
 │   │   ├── api/              # client, endpoints, response types
 │   │   ├── constants/        # roles
 │   │   ├── utils.ts          # cn() helper, formatters
 │   │   └── mock-data.ts      # Dev-time mock data
 │   │
 │   ├── store/                # GLOBAL Zustand stores
 │   │   └── auth.store.ts     # user, tokens, role, mustChangePassword
 │   │
 │   ├── providers/            # React context providers
 │   │   └── QueryProvider.tsx # <QueryClientProvider> + Devtools
 │   │
 │   ├── types/                # GLOBAL TypeScript entities
 │   │   ├── user.types.ts
 │   │   ├── skill.types.ts
 │   │   ├── project.types.ts
 │   │   ├── document.types.ts
 │   │   ├── notification.types.ts
 │   │   └── admin.types.ts
 │   │
 │   ├── styles/               # globals.css
 │   └── middleware.ts         # Auth + RBAC routing
 │
 ├── tests/                    # Jest test root
 │   ├── unit/                 # auth.schemas, auth.store, auth.service, profile.service
 │   └── integration/          # LoginForm, ForgotPasswordForm, ChangePasswordForm, AvatarUploader
 ├── api-docs.yaml             # Backend OpenAPI snapshot (reference)
 ├── jest.config.ts            # Jest config (next/jest, JSDOM, @/* alias)
 ├── jest.setup.ts             # @testing-library/jest-dom imports
 ├── next.config.mjs           # /api/* rewrite → NEXT_PUBLIC_API_URL
 ├── tailwind.config.ts        # Theme tokens + content globs
 ├── tsconfig.json             # Strict TS + @/* path alias
 ├── package.json
 └── CLAUDE.md                 # Authoring conventions
```

### Where Does New Code Go?

| If the code is...                     | Place it in...                       |
|---------------------------------------|--------------------------------------|
| Used by 2+ features                   | `components/`, `hooks/`, `lib/`      |
| Used by ONE feature only              | `features/<name>/`                   |
| A Next.js route/page                  | `app/` (keep pages thin)             |
| Pure UI primitive (no business logic) | `components/ui/`                     |
| API endpoint URL                      | `lib/api/endpoints.ts`               |
| Type used across features             | `types/`                             |
| Type used within one feature          | `features/<name>/types/`             |

## 🧭 Routes & Pages

### Public Routes (`app/(auth)/`)
- `GET /login` — Login form. Posts to backend `/auth/login` via the BFF.
- `GET /forgot-password` — Request a password reset email (always succeeds — prevents user enumeration per SYSTEM.md §4.3).
- `GET /reset-password?token=...` — Consume reset token + set a new password (token comes from the email link).
- `GET /change-password` — Authenticated user updates their own password. Forced by the `must_change_password` middleware guard for first-login accounts.

### Protected Routes (`app/(dashboard)/`) — all require an auth cookie
- `GET /dashboard` — Personal dashboard (radar chart, top/focus skills, todos).
- `GET /profile` — Own profile view & edit.
- `GET /assessment` — Self-assessment & manager review.
- `GET /matrix` — Team skill matrix (`ADMIN`, `MANAGER`).
- `GET /org` — Org chart (`ADMIN`, `MANAGER`).
- `GET /learning` — My upskill list + course recommendations.
- `GET /ai` — AI-powered insights panel.
- `GET /agent` — AI chat agent.
- `GET /job-brief` — AI job-brief generator (`ADMIN`, `MANAGER`).
- `GET /settings` — User-level settings (notifications, language).

### Admin Routes (`app/(dashboard)/admin/`) — `ADMIN` only (server guard)
- `/admin/users` — User management (CRUD, lock/unlock).
- `/admin/taxonomy` — Career / Department / Skillset CRUD.
- `/admin/positions` — _CFG-01 §11.3_ Job Titles CRUD with required-skill levels. Built.
- `/admin/config` — _CFG-01 §11.1–§11.5, §11.7_ Tabbed shell: Rating Scale · SMTP · Notification Rules · Permission Matrix. Built.
- `/admin/email-templates` — _CFG-01 §11.6_ Template list + editor. Built.
- `/admin/audit-logs` — _CFG-01 §11.8_ Filterable, paginated audit-log table. Built.

### BFF Route Handlers (`app/api/`)
- `GET /api/me` — *Deprecated.* Originally wrapped `/users/{id}` because the JWT didn't carry `userId`. Replaced by direct `/api/profile` calls via [features/profile/services/profile.service.ts](src/features/profile/services/profile.service.ts). Safe to remove once nothing references it.
- (Additional handlers are added per-feature as needed under `app/api/<feature>/`.)

## 🔑 Environment Variables

All variables live in `.env.local` (gitignored) and `.env.example` if maintained.

| Variable              | Required | Default                       | Purpose                                            |
|-----------------------|----------|-------------------------------|----------------------------------------------------|
| `NEXT_PUBLIC_API_URL` | yes      | `http://localhost:8080/api`   | Base URL the Next.js `/api/*` rewrite proxies to.  |

> **Note:** Variables prefixed with `NEXT_PUBLIC_` are inlined into the client bundle at build time. Do **not** put server-only secrets there.

## 🔐 Authentication & Authorization

### Authentication
The app uses **JWT-based auth** issued by the backend.

- On successful login, the backend returns `{ accessToken, refreshToken, requiresPasswordChange? }`.
- [`features/auth/services/auth.service.ts`](./src/features/auth/services/auth.service.ts) delegates token storage to the **Zustand auth store** ([`store/auth.store.ts`](./src/store/auth.store.ts)), which:
  1. Decodes the JWT to extract `email` (`sub`) and `role`.
  2. Writes the `accessToken`, `refreshToken`, `user`, and `mustChangePassword` flag into state and persists them to `localStorage`.
  3. Mirrors `auth_token`, `user_role`, `user_id`, and `must_change_password` into cookies so the middleware and server components can see them.
- Logout clears state, cookies, and redirects to `/login`.

#### must_change_password flow (SYSTEM.md §4.1, §4.4)

1. Backend returns `requiresPasswordChange: true` for first-login accounts.
2. `auth.store.login()` sets the `must_change_password=true` cookie + Zustand flag.
3. `middleware.ts` then redirects every request (except `/change-password` and `/logout`) back to `/change-password`.
4. `authService.changePassword` clears both the cookie and the flag on success — normal navigation resumes.

#### Cookies maintained by the auth store

| Cookie | Set when | Read by |
|--------|----------|---------|
| `auth_token` | Login success | `apiClient` (Authorization header) + middleware |
| `user_role` | Login success | Middleware for RBAC |
| `user_id` | Login success / `updateUser({ id })` | (legacy BFF lookup) |
| `must_change_password` | Login when `requiresPasswordChange = true`; cleared after `changePassword` succeeds | Middleware to force `/change-password` |

### Authorization — three enforcement layers

| Layer       | File                                    | Role                                                    |
|-------------|-----------------------------------------|---------------------------------------------------------|
| Route       | `src/middleware.ts`                     | Reads `user_role` cookie; blocks `/admin/*` for non-ADMIN, blocks `/team/*` for USER, redirects unauthenticated to `/login`. |
| Server      | `src/app/(dashboard)/admin/layout.tsx`  | Server component re-checks the cookie and `redirect('/403')` if not `ADMIN`. |
| UI          | `src/components/guards/RoleGuard.tsx`   | `<RoleGuard allowedRoles={['ADMIN']}>...</RoleGuard>` hides UI based on the Zustand store. |

Role constants are centralized in [`src/lib/constants/roles.ts`](./src/lib/constants/roles.ts):

```ts
export const ROLES = { ADMIN: 'ADMIN', MANAGER: 'MANAGER', USER: 'USER' } as const
export type Role = (typeof ROLES)[keyof typeof ROLES]
```

> **Never** hardcode role strings — always import `ROLES`.

## 🧠 State Management

| Kind                                | Tool                          | Where                                                 |
|-------------------------------------|-------------------------------|-------------------------------------------------------|
| Server data (anything from the API) | **TanStack Query**            | `features/<name>/hooks/use<Thing>.ts`                 |
| Global client state                 | **Zustand** (persisted)       | `store/`                                              |
| Feature-local client state          | Zustand                       | `features/<name>/store/`                              |
| Component-local UI state            | `useState` / `useReducer`     | inline                                                |

`<QueryClientProvider>` is set up in [`providers/QueryProvider.tsx`](./src/providers/QueryProvider.tsx) and wrapped around the app in `app/layout.tsx`. `<ReactQueryDevtools>` is mounted in development only.

> **Do not** put server-fetched data in Zustand.

## 🌐 API Layer (BFF)

All HTTP calls go through **[`lib/api/client.ts`](./src/lib/api/client.ts)** — a thin `fetch` wrapper that:
- Resolves URLs against the `/api` base (proxied by Next to `NEXT_PUBLIC_API_URL`).
- Attaches `Authorization: Bearer <token>` from the `auth_token` cookie.
- Parses JSON and throws `ApiError(status, message, data)` on non-2xx.

Endpoint URLs are defined as constants in **[`lib/api/endpoints.ts`](./src/lib/api/endpoints.ts)**, organized by domain:
`AUTH`, `PROFILE`, `USERS`, `TEAMS`, `TEAM_MEMBERS`, `SKILLS`, `DEPARTMENTS`, `CAREERS`, `ASSESSMENTS`, `GOALS`, `DOCUMENTS`, `MY_UPSKILL`, `PROJECTS`, `MY_PROJECTS`, `TEAM_LEARNING`, `NOTIFICATIONS`, `DASHBOARD`, `EXPORT`, `ADMIN.*` (users, careers, departments, skillsets, positions, config, email-templates, audit-logs), `AI.*` (resource-match, gap-analysis, learning-path, extract-skills, assessment-assistant, generate-taxonomy, trend, risk-score, matrix-query).

The standard backend response envelope is typed in [`lib/api/types.ts`](./src/lib/api/types.ts):

```ts
interface ApiResponse<T> { data: T; success: boolean; error: ErrorResponse | null }
interface PageResponse<T> { items: T[]; page: number; size: number; totalElements: number; totalPages: number; hasNext: boolean; hasPrevious: boolean }
```

> **Pagination uses `items`** (not `content`). Always destructure `body.data.items`.

### Adding a new feature module
1. Create `src/features/<name>/` with subfolders `components/`, `hooks/`, `services/`, `types/`, `schemas/`.
2. Add entity types under `types/` (or `src/types/` if shared).
3. Add endpoint constants under the right group in `lib/api/endpoints.ts`.
4. Create the service: `services/<name>.service.ts` — typed wrappers around `apiClient`.
5. Wrap the service in TanStack Query hooks under `hooks/`.
6. Build components under `components/` and consume the hooks.
7. Add a thin route in `app/(dashboard)/<name>/page.tsx`.
8. Register the menu entry in `components/layout/Sidebar.tsx` with `requiredRoles`.

## ⚠️ Error Handling

- The API client throws `ApiError` on non-2xx. Features catch and surface user-friendly messages.
- Backend error envelope:
  ```json
  { "success": false, "data": null, "error": { "errorCode": 1001, "message": "Invalid credentials", "details": null } }
  ```
- Middleware redirects to `/login` (unauthenticated) or `/403` (forbidden).
- A dedicated `/403` page lives at [`src/app/403/page.tsx`](./src/app/403/page.tsx).

## 🔑 Auth & Profile Module (AUT-01)

Implements [SYSTEM.md §4 AUT-01](../ai%20instruction/SYSTEM.md#4-aut-01--authentication--profile) end-to-end.

| Spec | UI | Hook | Service |
|------|----|------|---------|
| 4.1 Login | [LoginForm.tsx](src/features/auth/components/LoginForm.tsx) | `useLogin` | `authService.login` |
| 4.2 Logout | (sidebar / top-bar action) | `useLogout` | `authService.logout` |
| 4.3 Forgot password | [ForgotPasswordForm.tsx](src/features/auth/components/ForgotPasswordForm.tsx) | `useForgotPassword` | `authService.forgotPassword` |
| 4.3 Reset password | [ResetPasswordForm.tsx](src/features/auth/components/ResetPasswordForm.tsx) | `useResetPassword` | `authService.resetPassword` |
| 4.4 Change password | [ChangePasswordForm.tsx](src/features/auth/components/ChangePasswordForm.tsx) | `useChangePassword` | `authService.changePassword` |
| 4.5 Get/update profile | [ProfileView.tsx](src/features/profile/components/ProfileView.tsx) + [EditProfileForm.tsx](src/features/profile/components/EditProfileForm.tsx) | `useProfile`, `useUpdateProfile` | `profileService.get` / `update` |
| 4.6 Upload avatar | [AvatarUploader.tsx](src/features/profile/components/AvatarUploader.tsx) | `useUploadAvatar` | `profileService.uploadAvatar` |
| 4.7 Settings | [SettingsPanel.tsx](src/features/profile/components/SettingsPanel.tsx) | `useProfileSettings`, `useUpdateProfileSettings` | `profileService.getSettings` / `updateSettings` |
| 4.8 Assessment history | [AssessmentHistoryList.tsx](src/features/profile/components/AssessmentHistoryList.tsx) | `useAssessmentHistory` | `profileService.getAssessmentHistory` |
| 4.9 Team info | [MyTeamPanel.tsx](src/features/profile/components/MyTeamPanel.tsx) | `useMyTeam` | `profileService.getMyTeam` |

## ⚙️ Admin Module (CFG-01)

Implements [SYSTEM.md §11 CFG-01](../ai%20instruction/SYSTEM.md#11-cfg-01--app-configuration--access-control) end-to-end. Every page sits under the `/admin/*` route group, gated by [src/app/(dashboard)/admin/layout.tsx](src/app/(dashboard)/admin/layout.tsx).

| Spec | Page | Component(s) | Service | Hooks |
|------|------|--------------|---------|-------|
| §11.1 Roles | `/admin/config` → Permission Matrix tab | [PermissionsPanel](src/features/admin/config/components/PermissionsPanel.tsx) | `configService.getRoles` | `useRoles` |
| §11.2 Permissions | `/admin/config` → Permission Matrix tab | [PermissionsPanel](src/features/admin/config/components/PermissionsPanel.tsx) | `configService.{getPermissions,updatePermissions}` | `usePermissionMatrix`, `useUpdatePermissions` |
| §11.3 Positions CRUD | [/admin/positions](src/app/(dashboard)/admin/positions/page.tsx) | [PositionList](src/features/admin/positions/components/PositionList.tsx), [PositionFormDialog](src/features/admin/positions/components/PositionFormDialog.tsx) | `positionsService` | `usePositions`, `useCreatePosition`, `useUpdatePosition`, `useDeletePosition` |
| §11.4 Rating Scale | `/admin/config` → Rating Scale tab | [RatingScalePanel](src/features/admin/config/components/RatingScalePanel.tsx) | `configService.{getRatingScale,updateRatingScale}` | `useRatingScale`, `useUpdateRatingScale` |
| §11.5 SMTP | `/admin/config` → SMTP tab | [SmtpPanel](src/features/admin/config/components/SmtpPanel.tsx) | `configService.{getSmtp,updateSmtp,sendSmtpTest}` | `useSmtpConfig`, `useUpdateSmtp`, `useSendSmtpTest` |
| §11.6 Email Templates | [/admin/email-templates](src/app/(dashboard)/admin/email-templates/page.tsx) | [EmailTemplateList](src/features/admin/email-templates/components/EmailTemplateList.tsx), [EmailTemplateEditor](src/features/admin/email-templates/components/EmailTemplateEditor.tsx) | `emailTemplatesService` | `useEmailTemplates`, `useCreateEmailTemplate`, `useUpdateEmailTemplate` |
| §11.7 Notification Rules | `/admin/config` → Notification Rules tab | [NotificationRulesPanel](src/features/admin/config/components/NotificationRulesPanel.tsx) | `configService.{getNotificationRules,updateNotificationRules}` | `useNotificationRules`, `useUpdateNotificationRules` |
| §11.8 Audit Logs | [/admin/audit-logs](src/app/(dashboard)/admin/audit-logs/page.tsx) | [AuditLogTable](src/features/admin/audit-logs/components/AuditLogTable.tsx) | `auditLogsService.search` | `useAuditLogs` |

Shared constants live in [src/features/admin/shared/types.ts](src/features/admin/shared/types.ts): `TRIGGER_EVENTS`, `CRITICAL_TRIGGER_EVENTS`, `ADMIN_ROLES`, `FEATURE_KEYS`. **Keep these in sync with the backend `ConfigConstants` / `TriggerEvent` enum.**

The Notification Rules panel disables the toggle for critical events (`ACCOUNT_CREATED`, `PASSWORD_RESET`, `DOCUMENT_ASSIGNED`) per Global Rule §23.11 — they always send regardless of the rule.

## 📝 Forms & Validation

Every form uses **react-hook-form + Zod** with `@hookform/resolvers/zod`. Schemas live in `features/<feature>/schemas/` and export both the schema and its inferred type:

```ts
// features/auth/schemas/login.schema.ts
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})

export type LoginFormValues = z.infer<typeof loginSchema>
```

The password policy schema ([features/auth/schemas/password.schema.ts](src/features/auth/schemas/password.schema.ts)) mirrors backend Global Rule §23.2: ≥ 8 characters, ≥ 1 uppercase letter, ≥ 1 digit. Keep the two in sync if either changes.

Schemas currently provided:

| Schema | Location |
|--------|----------|
| `loginSchema` | `features/auth/schemas/login.schema.ts` |
| `forgotPasswordSchema` | `features/auth/schemas/forgot-password.schema.ts` |
| `resetPasswordSchema`, `changePasswordSchema` | `features/auth/schemas/password.schema.ts` |
| `updateProfileSchema` | `features/profile/schemas/update-profile.schema.ts` |
| `settingsSchema` | `features/profile/schemas/settings.schema.ts` |
| `positionSchema` | `features/admin/positions/schemas/position.schema.ts` |
| `ratingScaleSchema`, `smtpSchema`, `notificationRulesSchema`, `permissionMatrixSchema` | `features/admin/config/schemas/config.schemas.ts` |
| `emailTemplateSchema` | `features/admin/email-templates/schemas/email-template.schema.ts` |

## ✅ Testing

The test suite runs under **Jest** (configured via `next/jest`) with **React Testing Library** and **@testing-library/user-event**. Tests live under [tests/](tests/), split into:

- `tests/unit/` — schemas, services, stores. No DOM.
- `tests/integration/` — components that render a form / panel; covers user flows.

```bash
npm test                       # run all tests
npm run test:watch             # watch mode
npm test -- --coverage         # coverage report
npm test ChangePasswordForm    # single file
```

Config files:
- [jest.config.ts](jest.config.ts) — uses `next/jest`, JSDOM env, `@/*` alias, glob `<rootDir>/tests/**/*.test.{ts,tsx}`.
- [jest.setup.ts](jest.setup.ts) — imports `@testing-library/jest-dom`.

### What's covered today

| Test | Covers |
|------|--------|
| `tests/unit/auth.schemas.test.ts` | login / forgot / reset / change-password / update-profile / settings — accept and reject paths. |
| `tests/unit/auth.store.test.ts` | JWT decode → cookies; logout clears all cookies; `mustChangePassword` cookie lifecycle. |
| `tests/unit/auth.service.test.ts` | `login` happy + 401 + `mustChangePassword` branch; `forgotPassword` always resolves. |
| `tests/unit/profile.service.test.ts` | All 7 profile endpoints — happy + error paths. |
| `tests/integration/LoginForm.test.tsx` | Field validation; `/dashboard` redirect; `/change-password` redirect on `requiresPasswordChange`. |
| `tests/integration/ForgotPasswordForm.test.tsx` | Invalid-email error; success state shown regardless of email existence. |
| `tests/integration/ChangePasswordForm.test.tsx` | Mismatched passwords blocked; valid input submits. |
| `tests/integration/AvatarUploader.test.tsx` | Size + MIME-type rejection; valid PNG uploads. |
| `tests/unit/admin.schemas.test.ts` | Every admin Zod schema — position, ratingScale (length + duplicate + blank-label), smtp (port/email), notificationRules, permissionMatrix, emailTemplate. |
| `tests/unit/admin.services.test.ts` | All 4 admin services unwrap `ApiResponse`; error path throws; happy paths return parsed data. |
| `tests/integration/PositionFormDialog.test.tsx` | Required-field validation; close-on-save flow. |
| `tests/integration/RatingScalePanel.test.tsx` | Renders all 5 rows pre-filled from API; PUT issued on submit. |

> **Rule:** every new hook, service, and form must ship with a matching test. Mirror the patterns above (mock `global.fetch` for service tests; wrap with `QueryClientProvider` for hook/component tests).

## 🛠️ Troubleshooting

### `Cannot find module 'jest'` in `jest.config.ts`
Jest is declared as a dev dependency but not yet installed. Run `npm install`. The error disappears once `node_modules/jest` exists.

### Login succeeds but the page bounces back to `/login`
Check that the `auth_token` cookie is set after login (DevTools → Application → Cookies). Common causes:
- Browser blocking `SameSite=Lax` over plain HTTP on a non-localhost domain.
- A previous JWT was issued under a different `jwt.secret` — clear cookies and retry.

### Page is stuck redirecting to `/change-password`
The `must_change_password` cookie is `true`. Complete the change in the form (which clears it) or, for a user that shouldn't have the flag, manually clear the cookie.

### CORS errors when calling `http://localhost:8080`
The backend sets `@CrossOrigin(origins = "*")` on every controller. If you have narrowed it for production, set `NEXT_PUBLIC_API_URL` to the same origin the backend allows.

### Avatar upload returns `AVATAR_INVALID_FILE_TYPE` / `AVATAR_FILE_TOO_LARGE`
The frontend filters by 2 MB and JPG/PNG/WEBP **before** uploading. The backend enforces the same limits via [ProfileConstants](../backend/src/main/java/com/das/skillmatrix/constants/ProfileConstants.java) + `spring.servlet.multipart.max-file-size=2MB`. Update both sides together if you change limits.

### `profileService` returns 401 immediately after login
`apiClient` reads `auth_token` from `document.cookie`. If the cookie wasn't written (e.g. `auth.store.login()` was never called), no Authorization header is sent. Verify the login flow goes through `authService.login` and not a raw `fetch`.

### `/admin/config` SMTP tab shows "Could not load SMTP config"
Backend returns 404 `SMTP_NOT_CONFIGURED` until an admin saves the first config — the panel handles that case by switching to "fill in the fields below" mode. If you see the danger-red error instead, the API itself errored (check the request in the Network tab).

### Permission Matrix changes don't seem to apply to cross-team match
Confirm the matrix actually contains an enabled `CROSS_TEAM_RESOURCE_MATCH` row for the user's role. The backend `PermissionService.canCrossTeamMatch` is the gate — `ADMIN` is always allowed; for `MANAGER_*` roles the flag must be ticked.

### Audit Logs `from`/`to` filters fail silently
The inputs send `datetime-local` ISO strings; the backend expects ISO-8601 with `T` separator (Spring's `@DateTimeFormat(ISO_DATE_TIME)`). The browser format matches — if you bypass the input and pass `YYYY-MM-DD`, the server ignores it. Use the date+time picker.

## 🎨 Styling & UI

- **Tailwind CSS** with a custom palette defined in [`tailwind.config.ts`](./tailwind.config.ts):
  - `teal` / `teal-dark` / `accent` — primary brand.
  - `navy` — sidebar surface.
  - `fog` / `ink` / `ink2` / `muted` / `faint` — neutral scale.
  - `success` / `warning` / `danger` — semantic.
- Custom radii: `card` (14px), `btn` (8px), `chip` (20px).
- Fonts: **DM Sans** (body), **DM Mono** (mono).
- Primitives live in [`src/components/ui/`](./src/components/ui/) — `Card`, `Badge`, `KpiCard`, `SkillBar`, `StarRating`, `ProgressRing`, `Toggle`, `MockDataWrapper`.
- Feature-specific visuals live in [`src/components/features/`](./src/components/features/) — radar/bar/donut charts (Recharts), heatmap grids, org chart, AI chatbot, etc.

## 💻 Commands

**Install dependencies:**
```bash
npm install
```

**Run dev server (hot reload):**
```bash
npm run dev
```

**Production build:**
```bash
npm run build
```

**Start production server (after `build`):**
```bash
npm run start
```

**Lint:**
```bash
npm run lint
```

**Type-check (no emit):**
```bash
npx tsc --noEmit
```

**Tests:**
```bash
npm test                       # one-shot
npm run test:watch             # watch mode
npm test -- --coverage         # coverage report
npm test ChangePasswordForm    # single test
```

---

For backend / API setup, see [../backend/README.md](../backend/README.md). For the authoritative feature spec, see [../ai instruction/SYSTEM.md](../ai%20instruction/SYSTEM.md).