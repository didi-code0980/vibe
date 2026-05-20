# CLAUDE.md — Project Instructions for Claude Code

> **Purpose**: This file is the source of truth for AI-assisted development on this project. Claude Code MUST read and follow these instructions for every task. When in doubt, refer back to this document.

---

## 1. Project Overview

This is an **enterprise platform** combining:
- **ERP system** (HR, Finance, Inventory, Projects)
- **Internal social network** (feed, groups, events, announcements)
- **Task tracking system** (employee task management, timesheets)
- **AI-powered features** (chat assistant, insights, document analysis)

**Users**: Employees, Managers, System Admins (3 initial roles, extensible RBAC)

**Stack**:
- **Framework**: Next.js 15+ (App Router, Server Components by default)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: TanStack Query (server) + Zustand (client)
- **Forms**: react-hook-form + Zod
- **API**: REST (via Axios/fetch wrapper) + BFF pattern via Next.js Route Handlers
- **AI**: Vercel AI SDK (streaming)
- **Auth**: JWT with refresh tokens
- **i18n**: next-intl (if multi-language required)

---

## 2. Folder Structure (MANDATORY)

Follow this structure strictly. **Never** create files outside this convention without explicit user approval.

```
src/
├── app/                    # Next.js App Router (routes only)
│   ├── (auth)/             # Public auth routes
│   ├── (dashboard)/        # Protected routes (requires auth)
│   │   ├── admin/          # SYSTEM_ADMIN only
│   │   ├── erp/            # HR, Finance, Inventory, Projects
│   │   ├── tasks/          # Task tracking
│   │   ├── team/           # MANAGER features
│   │   ├── social/         # Internal social
│   │   ├── ai/             # AI features
│   │   └── settings/
│   └── api/                # Route handlers (BFF)
│
├── features/               # Domain modules (feature-based architecture)
│   └── <feature-name>/
│       ├── components/     # Feature-specific components
│       ├── hooks/          # Feature-specific hooks
│       ├── services/       # API calls for this feature
│       ├── store/          # Feature-local state (if needed)
│       ├── types/          # TypeScript types
│       ├── schemas/        # Zod validation schemas
│       └── utils/          # Feature-specific helpers
│
├── components/             # SHARED components only
│   ├── ui/                 # Primitives (button, input, dialog...)
│   ├── layout/             # Sidebar, Header, Footer
│   ├── forms/              # Reusable form fields
│   ├── data-display/       # Tables, charts, empty states
│   ├── feedback/           # Loading, error, confirm
│   └── guards/             # RoleGuard, PermissionGuard, AuthGuard
│
├── lib/                    # Core libraries
│   ├── api/                # HTTP client, interceptors, endpoints
│   ├── auth/               # JWT, RBAC, permissions
│   ├── ai/                 # AI SDK client, streaming
│   ├── utils/              # cn, date, format, validation
│   └── constants/          # roles, permissions, routes
│
├── hooks/                  # GLOBAL shared hooks only
├── store/                  # GLOBAL state (Zustand)
├── providers/              # React context providers
├── types/                  # GLOBAL TypeScript types
├── config/                 # env, site, navigation config
├── styles/                 # globals.css, themes
└── middleware.ts           # Auth + RBAC routing
```

### Where Does New Code Go?

| If the code is... | Place it in... |
|---|---|
| Used by 2+ features | `components/`, `hooks/`, `lib/`, `utils/` |
| Used by ONE feature only | `features/<name>/` |
| A Next.js route/page | `app/` (keep pages thin — import from `features/`) |
| Pure UI primitive (no business logic) | `components/ui/` |
| API endpoint constant or HTTP logic | `lib/api/` |
| Type used across features | `types/` |
| Type used within one feature | `features/<name>/types/` |

---

## 3. Architectural Rules

### 3.1 Route Pages Must Stay Thin

Pages in `app/` are **routing + composition only**. Business logic lives in `features/`.

✅ **Good**:
```tsx
// app/(dashboard)/tasks/page.tsx
import { TaskBoard } from '@/features/tasks/components/TaskBoard';
export default function TasksPage() {
  return <TaskBoard />;
}
```

❌ **Bad**: Defining components, fetching data, or implementing logic directly in `page.tsx`.

### 3.2 Server vs Client Components

- **Default to Server Components**. Only add `'use client'` when you need: hooks, browser APIs, event handlers, or state.
- Place `'use client'` as low in the tree as possible.
- Fetch initial data in Server Components; use TanStack Query for client-side mutations & revalidation.

### 3.3 RBAC (Role-Based Access Control)

Three enforcement layers — **all three must be used together**:

1. **Route-level** (`middleware.ts`): blocks unauthorized navigation
2. **Layout-level** (`app/(dashboard)/admin/layout.tsx`): server-side role check
3. **Component-level** (`components/guards/`): hides UI elements

```typescript
// lib/constants/roles.ts — DO NOT change without team approval
export const ROLES = {
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
  MANAGER: 'MANAGER',
  EMPLOYEE: 'EMPLOYEE',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
```

When adding a protected feature: update `middleware.ts`, add layout guard if needed, and wrap UI with `<RoleGuard>`.

### 3.4 API Layer Conventions

- All HTTP calls go through `lib/api/client.ts` (centralized auth, refresh, error handling).
- Each feature has `features/<name>/services/<name>.service.ts` defining typed API functions.
- API endpoint URLs are constants in `lib/api/endpoints.ts`.
- Wrap services in TanStack Query hooks inside `features/<name>/hooks/`.

```typescript
// features/users/services/users.service.ts
export const usersService = {
  list: (params) => apiClient.get<User[]>(ENDPOINTS.USERS.LIST, { params }),
  getById: (id) => apiClient.get<User>(ENDPOINTS.USERS.DETAIL(id)),
  // ...
};

// features/users/hooks/useUsers.ts
export const useUsers = (params) =>
  useQuery({ queryKey: ['users', params], queryFn: () => usersService.list(params) });
```

### 3.5 AI Features

- AI calls **never** go directly from client to AI provider. Always proxy through `app/api/ai/*` route handlers (hides API keys, adds auth + rate limiting).
- Use streaming (SSE) for chat-like interfaces via Vercel AI SDK.
- Place AI UI components in `features/ai/components/`.

### 3.6 Forms

- Use `react-hook-form` + `zod` for ALL forms.
- Zod schemas live in `features/<name>/schemas/`.
- Reusable form fields go in `components/forms/`.

### 3.7 State Management Decision Tree

- **Server data** (anything from API) → TanStack Query
- **Global client state** (auth, theme, UI prefs) → Zustand in `store/`
- **Feature-local client state** → Zustand in `features/<name>/store/`
- **Component-local state** → `useState`

Do NOT put server data in Zustand.

---

## 4. Coding Standards

### 4.1 TypeScript

- `strict: true` in `tsconfig.json` — no `any` without justification.
- Prefer `type` for unions/intersections; `interface` for object shapes that may extend.
- Use path aliases: `@/features/...`, `@/components/...`, `@/lib/...`.

### 4.2 Naming

| Element | Convention | Example |
|---|---|---|
| Components | PascalCase | `UserTable.tsx` |
| Hooks | camelCase, `use` prefix | `useUsers.ts` |
| Services | camelCase + `.service.ts` | `users.service.ts` |
| Types/Schemas | camelCase + `.types.ts` / `.schema.ts` | `user.types.ts` |
| Constants | UPPER_SNAKE_CASE | `MAX_UPLOAD_SIZE` |
| Folders | kebab-case | `audit-logs/` |

### 4.3 Imports Order

1. React / Next.js
2. Third-party libraries
3. `@/lib`, `@/components`, `@/hooks` (shared)
4. `@/features/...`
5. Relative imports
6. Types (separate block with `import type`)

### 4.4 Component Structure

```tsx
'use client'; // only if needed

import type { FC } from 'react';
// ...imports

interface Props {
  // ...
}

export const ComponentName: FC<Props> = ({ ... }) => {
  // hooks
  // derived state
  // handlers
  // effects
  return ( /* JSX */ );
};
```

---

## 5. What Claude Code MUST Always Do

1. **Read `CLAUDE.md` before any task** — re-read if the task touches multiple areas.
2. **Check existing patterns** — before creating a new file, look at similar existing files and mirror their structure.
3. **Place files correctly** — use the decision table in Section 2.
4. **Keep pages thin** — never put business logic in `app/`.
5. **Type everything** — no implicit `any`.
6. **Validate inputs** with Zod schemas for forms and API responses.
7. **Centralize API calls** through `lib/api/client.ts` and feature services.
8. **Apply RBAC** at all three layers when adding protected features.
9. **Use Server Components by default** — justify any `'use client'` directive.
10. **Run lint/typecheck** before declaring a task complete.

## 6. What Claude Code MUST NEVER Do

1. ❌ Create components directly in `app/` route files (extract to `features/` or `components/`).
2. ❌ Make direct `fetch` calls in components — use a service via TanStack Query.
3. ❌ Bypass `middleware.ts` for protected routes.
4. ❌ Hardcode API URLs — use `lib/api/endpoints.ts`.
5. ❌ Hardcode role strings — use `ROLES` constants.
6. ❌ Put server-fetched data in Zustand.
7. ❌ Use `any` without a `// TODO:` comment explaining why.
8. ❌ Install a new dependency without checking if existing ones cover the use case.
9. ❌ Create duplicate utilities — search `lib/utils/` first.
10. ❌ Commit secrets, API keys, or tokens to the repo.

---

## 7. Common Task Recipes

### Adding a New Feature Module

1. Create folder: `src/features/<feature-name>/` with subfolders: `components/`, `hooks/`, `services/`, `types/`, `schemas/`.
2. Define types in `types/<feature>.types.ts`.
3. Define Zod schemas in `schemas/<feature>.schema.ts`.
4. Add endpoints to `lib/api/endpoints.ts`.
5. Create service in `services/<feature>.service.ts`.
6. Wrap service in TanStack Query hooks in `hooks/`.
7. Build components in `components/`.
8. Create route in `app/(dashboard)/<feature>/page.tsx` — keep it thin.
9. Update `config/navigation.ts` with role-based menu entries.
10. Add RBAC checks where needed.

### Adding a New Protected Route

1. Place route under `app/(dashboard)/`.
2. If admin-only, place under `app/(dashboard)/admin/` (covered by existing layout guard).
3. Otherwise, add explicit check in `middleware.ts` or use `<RoleGuard>` in the page.
4. Update navigation config.

### Adding an AI Feature

1. Add proxy route in `app/api/ai/<feature>/route.ts`.
2. Use Vercel AI SDK for streaming.
3. Build UI in `features/ai/components/`.
4. Add hook in `features/ai/hooks/` to consume the stream.
5. Never expose AI provider keys to the client.

---

## 8. Testing Expectations

- Unit tests for utils and hooks → `tests/unit/`
- Integration tests for features → `tests/integration/`
- E2E for critical flows → `tests/e2e/` (Playwright)
- Run `pnpm test` (or equivalent) before completing tasks.

---

## 9. Communication with the User

- **Before large changes**: summarize the plan and confirm.
- **When ambiguous**: ask one focused question rather than guessing.
- **After completing tasks**: report what changed, what files were created/modified, and what to verify.
- **When deviating from this guide**: explicitly explain why.

---

## 10. References

- [Next.js App Router docs](https://nextjs.org/docs/app)
- [TanStack Query](https://tanstack.com/query/latest)
- [shadcn/ui](https://ui.shadcn.com/)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [Zod](https://zod.dev/)

---

**Last updated**: 2026-05-13
**Maintained by**: Frontend Engineering Team