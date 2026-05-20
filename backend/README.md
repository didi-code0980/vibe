# Skill Matrix — Backend

A Spring Boot 3.5 / Java 17 REST API for the Skill Matrix platform: a web application for managing, assessing, and developing employee skills across teams and projects.

The backend follows a **layered architecture** (Controller → Service → Repository → JPA Entity) with all features organised by domain package: Auth, Users, Skill Taxonomy (Career / Department / Skill), Teams, and Team Members. It features JWT authentication with refresh tokens, role-based access control with custom permission expressions (`@permissionService.canManage…`), Hibernate Envers auditing, business change logging via an AOP aspect, and TiDB Cloud (MySQL-protocol) as the primary database.

> **Status:** Sprint 1–2 features delivered:
> - **AUT-01 Authentication & Profile** — login, refresh, logout, forgot/reset/change password, profile read/update, avatar upload, settings, assessment history, team info (§4 in [SYSTEM.md](../ai%20instruction/SYSTEM.md)).
> - **USM-01 User Management** — admin user CRUD, scoped manager reads.
> - **SKL-01 Skill Taxonomy CRUD** — Career / Department / Skill.
> - **TEM-01 Team Management** — teams + members + manager assignment.
> - **CFG-01 App Configuration & Access Control** — Positions CRUD with required-skill levels, role descriptors, configurable permission matrix (read by `PermissionService` for cross-team toggles), rating scale, SMTP config + test-send, email templates wired into `EmailService` with variable substitution, notification rules with critical-event override, audit-log query with filter + actor enrichment (§11 in SYSTEM.md).
>
> Assessments, Projects, Documents, Goals, JD Scan (AI-09), and other AI endpoints are planned — the canonical specification for every feature is [ai instruction/SYSTEM.md](../ai%20instruction/SYSTEM.md). Always read SYSTEM.md before adding a new endpoint or entity.

## 🚀 Quick Start

### Prerequisites
- [Java 17 SDK](https://adoptium.net/) (Temurin recommended)
- [Maven 3.9+](https://maven.apache.org/) — or use the bundled `./mvnw` / `mvnw.cmd` wrapper
- A MySQL-compatible database — the project is configured for [TiDB Cloud](https://tidbcloud.com/) (gateway hostname, TLS required). Local MySQL 8 works equivalently if you swap the JDBC URL.
- [Node.js](https://nodejs.org/) (optional) — only needed if you want to regenerate `openapi.yaml` via the helper script.

### Manual Installation

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd repo/backend
   ```

2. **Configure Environment:**
   Edit [src/main/resources/application.properties](src/main/resources/application.properties) and fill in your DB credentials and JWT secret. For local development you can either edit the file directly or override via `-D` JVM args / environment-specific Spring profiles.
   ```properties
   spring.application.name=skillmatrix

   # Database — TiDB Cloud (MySQL protocol, TLS required)
   spring.datasource.url=jdbc:mysql://<gateway-host>:4000/skillmatrix?sslMode=VERIFY_IDENTITY&createDatabaseIfNotExist=true
   spring.datasource.username=<your_tidb_user>
   spring.datasource.password=<your_tidb_password>
   spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

   # JPA/Hibernate — owns the schema for now (Flyway disabled, see below)
   spring.jpa.hibernate.ddl-auto=update
   spring.jpa.show-sql=true
   spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

   # Hibernate Envers — column-level audit trail (_AUD tables)
   spring.jpa.properties.org.hibernate.envers.audit_table_suffix=_AUD
   spring.jpa.properties.org.hibernate.envers.revision_field_name=REV
   spring.jpa.properties.org.hibernate.envers.revision_type_field_name=REVTYPE
   spring.jpa.properties.org.hibernate.envers.store_data_at_delete=true

   # SpringDoc / Swagger UI
   springdoc.api-docs.path=/v3/api-docs
   springdoc.swagger-ui.path=/swagger-ui.html

   # Flyway — DISABLED: TiDB does not support CREATE TABLE ... SELECT
   # used by Flyway's schema history bootstrap. Schema is managed by
   # Hibernate ddl-auto=update. See "Database Schema" below.
   spring.flyway.enabled=false

   # JWT
   jwt.secret=<at-least-32-chars-secret>
   jwt.access.expiration=900000          # 15 min, in milliseconds
   jwt.refresh.expiration=604800000      # 7 days
   ```
   ⚠️ Never commit real credentials — TiDB Cloud secrets and `jwt.secret` should come from CI / environment variables in production.

3. **Run the Application:**
   First run will:
   - Auto-create the `skillmatrix` schema on the configured DB (`createDatabaseIfNotExist=true` + Hibernate `ddl-auto=update`).
   - Seed an example hierarchy (Careers → Departments → Teams → Positions → Skills) and demo users via [config/DataSeeder.java](src/main/java/com/das/skillmatrix/config/DataSeeder.java).
   - Provision two admin accounts (see [Database Setup & Initialization](#-database-setup--initialization-important)).

   ```bash
   # Linux / macOS
   ./mvnw spring-boot:run

   # Windows
   mvnw.cmd spring-boot:run
   ```
   The API listens on `http://localhost:8080` by default.

## 📋 Table of Contents

- [Features](#-features)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Authentication & Authorization](#-authentication--authorization)
- [Auditing & Activity Logging](#-auditing--activity-logging)
- [Error Handling](#-error-handling)
- [Database Setup & Initialization](#-database-setup--initialization-important)
- [Background Services & Schedulers](#-background-services--schedulers)
- [File Storage](#-file-storage)
- [Testing](#-testing)
- [Coding Standards](#-coding-standards)
- [Troubleshooting](#-troubleshooting)
- [Commands](#-commands)

## ✨ Features

- **Spring Boot 3.5 / Java 17**: Modern Jakarta EE baseline with virtual-thread-friendly stack.
- **Layered Architecture**: Controllers (`controller/`), Services (`service/`), Repositories (`repository/`), JPA Entities (`entity/`) — one package per layer, organised by domain feature inside.
- **JWT Authentication**: Access Tokens (15 min) + Refresh Tokens (7 days) via `io.jsonwebtoken:jjwt`. Force-password-change flow for newly-provisioned accounts.
- **Fine-Grained RBAC**: Four roles (`ADMIN`, `MANAGER_CAREER`, `MANAGER_DEPARTMENT`, `MANAGER_TEAM`, `STAFF`) with Spring `@PreAuthorize` + custom expression bean `@permissionService` for scope-aware checks (e.g. "manager can only edit teams in their own department").
- **Hibernate Envers**: Automatic per-entity revision tracking — every JPA write generates a row in the corresponding `_AUD` table for full historical replay.
- **AOP Activity Logging**: [aspect/ActivityLogAspect.java](src/main/java/com/das/skillmatrix/aspect/ActivityLogAspect.java) intercepts annotated methods and writes domain-friendly entries to `business_change_log`.
- **Querydsl + JPA Specifications**: Composable filter queries for paginated list endpoints (`users`, `teams`, `careers`, `departments`).
- **Validation**: Jakarta Bean Validation (`@Valid`, `@NotBlank`, `@Email`, …) on every request DTO; errors surface through the global handler.
- **OpenAPI 3 / Swagger UI**: Auto-generated documentation at `/swagger-ui.html`. A static [openapi.yaml](src/main/resources/openapi.yaml) snapshot is checked in for frontend tooling.
- **Standardised Responses**: All endpoints return `ApiResponse<T> { data, success, error }`; paginated endpoints wrap data in `PageResponse<T>`.
- **TiDB Cloud Ready**: JDBC URL uses MySQL protocol over TLS; database is auto-created on first connect.

## 🏗 Project Structure

```
backend/
 ├── pom.xml                                  # Maven build (Spring Boot parent 3.5.5)
 ├── mvnw, mvnw.cmd, .mvn/                    # Maven wrapper
 ├── generate-oas.js, generate-oas.ps1        # Dumps live /v3/api-docs to openapi.yaml
 └── src/
     ├── main/
     │   ├── java/com/das/skillmatrix/
     │   │   ├── SkillmatrixApplication.java  # @SpringBootApplication + @EnableScheduling + @EnableAsync
     │   │   ├── annotation/                  # Custom marker annotations (e.g. @LogActivity)
     │   │   ├── aspect/                      # AOP advice (ActivityLogAspect)
     │   │   ├── config/                      # Security, CORS, JWT filter, JPA auditing, data seeder
     │   │   ├── controller/                  # REST controllers — one per /api/{resource}
     │   │   ├── dto/
     │   │   │   ├── request/                 # *Request DTOs (Login, Career, Skill, Team, …)
     │   │   │   └── response/                # *Response DTOs + ApiResponse / PageResponse / ErrorResponse
     │   │   ├── entity/                      # JPA @Entity classes (User, Career, Department, Skill, …)
     │   │   ├── exception/                   # GlobalExceptionHandler + custom exceptions + Auth handlers
     │   │   ├── repository/                  # Spring Data JPA interfaces (+ Querydsl specifications)
     │   │   ├── scheduler/                   # @Scheduled jobs (cleanups, deactivation expiry)
     │   │   ├── security/                    # JwtUtil
     │   │   └── service/                     # Business logic — one *Service per domain
     │   └── resources/
     │       ├── application.properties       # All runtime configuration
     │       ├── openapi.yaml                 # Snapshot of the live OpenAPI spec
     │       └── db/migration/                # Flyway scripts (currently disabled — see notes)
     └── test/
         └── java/com/das/skillmatrix/        # JUnit 5 + Spring Security Test
```

### Layer Responsibilities

- **Controller** (`controller/`): URL mapping, request validation (`@Valid`), role / permission checks (`@PreAuthorize`), thin pass-through to services. Returns `ResponseEntity<ApiResponse<T>>`.
- **Service** (`service/`): All business rules — RBAC scope checks beyond simple roles, transactional boundaries (`@Transactional`), audit emission, email dispatch.
- **Repository** (`repository/`): Spring Data JPA interfaces. Complex filtered queries live in `repository/specification/` as Querydsl predicates.
- **Entity** (`entity/`): JPA models with Lombok. Most entities extend `BaseEntity` (created/updated timestamps) and use soft-delete via `deleted_at` / `inactiveAt`.
- **Config / Security**: Cross-cutting setup — `SecurityConfig`, `JwtAuthenticationFilter`, `JpaAuditingConfig`, `CorsConfig`, `DataSeeder`.

## 📚 API Documentation

To view the list of available APIs and their specifications, run the server and visit Swagger UI:

- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **Raw OpenAPI JSON**: http://localhost:8080/v3/api-docs
- **Static snapshot (checked-in)**: [src/main/resources/openapi.yaml](src/main/resources/openapi.yaml) — regenerate with `node generate-oas.js` while the backend is running.

### API Endpoints

**Auth Module** (`/api/auth`) — public (whitelisted in `SecurityConfig`):
- `POST /login` — exchange email + password for access + refresh tokens. Returns `requiresPasswordChange` flag for first-login accounts.
- `POST /refresh` — exchange a valid refresh token for a new access token.
- `POST /logout` — invalidate the current refresh token (requires Bearer auth).
- `POST /forgot-password` — request a password reset email (always 200 to prevent enumeration).
- `POST /reset-password` — consume a reset token + set a new password.
- `POST /change-password` — authenticated user changes their own password; clears `mustChangePassword`.

**Profile Module** (`/api/profile`) — any authenticated role, scoped to the current user:
- `GET /` — current user's profile (id, email, full name, role, status, positions, scope, language, notification preference, `mustChangePassword`).
- `PUT /` — update `fullName` and `phone` only. Email, role, and position are admin-managed.
- `POST /avatar` — multipart upload (`file`, jpg/png/webp ≤ 2 MB). Stores via `FileStorageService`, deletes the old file, returns the new URL.
- `GET|PUT /settings` — read or update `notificationEmail` (boolean) and `language` (`VI` / `EN`).
- `GET /assessment-history` — paginated own `UserSkillEvaluation` records ordered by latest first.
- `GET /team` — current team name, manager full name, list of teammates with **public** skill scores only (self score, never personal info).

**User Management** (`/api/users`) — `ADMIN` for list/CRUD, scoped read for managers:
- `GET /` — paginated user search (filters: keyword, status, date, teamId).
- `POST /` — create a user (auto-generates initial password, sends `ACCOUNT_CREATED` email, sets `must_change_password=true`).
- `GET /{id}` — own profile or any user (ADMIN).
- `PUT /{id}` — update profile / role / department / position assignments.
- `POST /{id}/deactivate-or-delete` — deactivate (temporary / unlimited) or soft-delete; admin cannot target themself.
- `POST /{id}/reactivate` — clear deactivation and restore `ACTIVE` status.
- `GET /by-team/{teamId}` — list active members in a team (scoped to manager of that team or ADMIN).

**Skill Taxonomy** — `/api/careers`, `/api/departments`, `/api/skills`:
- Standard CRUD: `POST /`, `GET /`, `GET /{id}`, `PUT /{id}`, `DELETE /{id}` on each.
- Manager assignment helpers on Career and Department: `POST /{id}/managers/{userId}`, `DELETE /{id}/managers/{userId}`.
- Delete operations check referential integrity and return 409 if descendants exist (e.g. a Career with Departments).

**Team Management** (`/api/teams` + `/api/team-members`):
- `GET|POST|PUT|DELETE /api/teams[/{id}]` — team CRUD; MANAGER_TEAM can only edit own team.
- `POST|DELETE /api/teams/{id}/managers/{userId}` — assign / remove team manager.
- `POST /api/team-members/by-user` — add a single user to one or more teams (auto-closes prior active membership).
- `POST /api/team-members/by-team` — add a member to a team by email lookup.
- `PUT /api/team-members/{id}` — update position only.
- `DELETE /api/team-members/{id}` — soft-remove (sets `left_at`).
- `GET /api/team-members` — filterable list (teamId, userId).

**App Configuration & Admin** (`/api/admin/*`) — `ADMIN` only:

`/api/admin/positions` (§11.3) — Job titles with required-skill levels:
- `GET /` — paginated list (filter by `keyword`, `status`).
- `POST /` — create with `name`, `description`, `requiredSkills: [{ skillId, minLevel: 1-5 }]`.
- `GET /{id}` — detail with resolved skill names.
- `PUT /{id}` — replaces required-skills list.
- `DELETE /{id}` — soft delete (sets `status=DELETED`).

`/api/admin/config` (§11.1–§11.5, §11.7):
- `GET /roles` — read-only list of system roles + descriptions.
- `GET|PUT /permissions` — feature-level toggle matrix (`CROSS_TEAM_RESOURCE_MATCH`, `VIEW_AUDIT_LOGS`, `EXPORT_REPORTS`). `PermissionService.canCrossTeamMatch(user)` reads this.
- `GET|PUT /rating-scale` — exactly 5 levels with `label` + `description`. Seeds defaults (Beginner → Expert) on first read.
- `GET|PUT /smtp` — singleton SMTP config (`host`, `port`, `username`, `passwordSet` flag, `fromEmail`, `fromName`, `useTls`). Password is write-only — responses expose only `passwordSet: boolean`.
- `POST /smtp/test` — sends a test email to the currently-authenticated admin via `JavaMailSender` built by `MailSenderFactory`.
- `GET|PUT /notification-rules` — per-trigger `enabled` + `reminderIntervalDays`. Critical events (`ACCOUNT_CREATED`, `PASSWORD_RESET`, `DOCUMENT_ASSIGNED`) bypass the toggle (Global Rule §23.11).

`/api/admin/email-templates` (§11.6):
- `GET /` — paginated list (sorted by name).
- `POST /` / `PUT /{id}` — fields `name`, `subject`, `bodyHtml`, `triggerEvent`, `variablesJson`, `isActive`. `EmailService` loads the active template per trigger and substitutes `{{variable}}` placeholders.
- `GET /{id}` — single template.

`/api/admin/audit-logs` (§11.8):
- `GET /` — paginated `AuditLog` query with filters: `actorId`, `action` (LIKE), `entityType`, `entityId`, `fromDate`, `toDate`. Response is enriched with actor `fullName` + `email`.

**Health** (`/api/health`):
- `GET /` — liveness probe; returns `{ status: "ok" }`.

> Endpoints planned for later phases (Assessments, Projects, AI matching, Documents, Goals, Dashboards, AI-09 JD Scan, etc.) are fully scoped in [ai instruction/SYSTEM.md](../ai%20instruction/SYSTEM.md) §5–§20. Open issues / planned work is tracked in ClickUp.

## 🗄️ Database Schema

The schema is **owned by Hibernate** at the moment (`spring.jpa.hibernate.ddl-auto=update`). On each startup Hibernate diffs the JPA entities against the live DB and applies additive changes. Flyway is installed but **disabled** because TiDB Cloud does not support the `CREATE TABLE ... SELECT` statement that Flyway uses to seed its schema-history table on first run.

### Core Tables

| Table | Purpose |
|-------|---------|
| `users` | Central user identities — email, password hash, role, status, department, positions. |
| `password_reset_tokens` | One-time tokens for `POST /api/auth/forgot-password` flow. |
| `refresh_tokens` | Long-lived tokens for the JWT refresh flow. |
| `careers` | Top of the skill taxonomy (e.g. *IT Career*, *HR Career*). |
| `departments` | Belongs to a Career (e.g. *Software Development* under *IT Career*). |
| `teams` | Belongs to a Department (e.g. *Backend Team* under *Software Development*). |
| `team_members` | M:N user ↔ team with `position`, `joined_at`, `left_at`, and a free-form `note`. |
| `positions` | Job titles (e.g. *Backend Developer*) — linkable to required skills via `position_skill`. |
| `position_skill` | M:N positions ↔ skills (defines the "required skills for a role"). |
| `skills` | Skill catalogue (e.g. *Java*, *ReactJS*, *Manual Testing*). |
| `user_skill` | User's skill profile entries (current self/manager ratings). |
| `user_skill_evaluation` | Historical evaluations of a user's skill — score, evaluator, note. |
| `upskill_documents` | Learning materials (PDF / Link / Video) tagged with skills. |
| `user_upskill_progress` | A user's progress against an assigned learning document. |
| `notifications` | In-app notification inbox per user. |
| `audit_logs` | System-wide audit trail (security-relevant events). |
| `business_change_log` | High-level domain change records emitted by `ActivityLogAspect`. |
| `permission_flags` | _(CFG-01 §11.2)_ Configurable role × feature-key toggle matrix. |
| `rating_scales` | _(CFG-01 §11.4)_ 5 rows for levels 1–5 with `label` + `description`. |
| `smtp_config` | _(CFG-01 §11.5)_ Singleton SMTP config (id=1). Password stored opaquely. |
| `email_templates` | _(CFG-01 §11.6)_ Templated `subject`/`bodyHtml` per `TriggerEvent`. |
| `notification_rules` | _(CFG-01 §11.7)_ One row per `TriggerEvent` with `enabled` flag + reminder cadence. |
| `position_skills` | Updated for CFG-01 §11.3: now has `min_level: int` per `(position, skill)`. |
| `*_AUD` tables | Hibernate Envers revision tables — one per audited entity, suffix `_AUD`. |

### CFG-01 module surfaces _(see SYSTEM.md §11)_

| Spec | Controller | Service | Notes |
|------|-----------|---------|-------|
| §11.1 Roles | `AdminConfigController.getRoles` | `PermissionMatrixService.getRoles` | Read-only; descriptions are hard-coded in `ConfigConstants`. |
| §11.2 Permission matrix | `AdminConfigController.{getPermissions,updatePermissions}` | `PermissionMatrixService` | Flag table `permission_flags`. `PermissionService.canCrossTeamMatch` consumes it. |
| §11.3 Positions CRUD | [PositionController](src/main/java/com/das/skillmatrix/controller/PositionController.java) | [PositionService](src/main/java/com/das/skillmatrix/service/PositionService.java) | Required-skill entries with `minLevel` 1–5; soft delete. |
| §11.4 Rating scale | `AdminConfigController.{getRatingScale,updateRatingScale}` | `RatingScaleService` | Exactly 5 levels; seeds defaults on first read. |
| §11.5 SMTP config | `AdminConfigController.{getSmtp,updateSmtp,sendSmtpTest}` | `SmtpConfigService` + `MailSenderFactory` | Singleton row. Password write-only. Test-send uses authenticated admin's principal. |
| §11.6 Email templates | [EmailTemplateController](src/main/java/com/das/skillmatrix/controller/EmailTemplateController.java) | [EmailTemplateService](src/main/java/com/das/skillmatrix/service/EmailTemplateService.java) | `EmailService.send(triggerEvent, recipient, variables)` substitutes `{{var}}`. |
| §11.7 Notification rules | `AdminConfigController.{getNotificationRules,updateNotificationRules}` | `NotificationRuleService` | Critical-event override (Global Rule §23.11). |
| §11.8 Audit logs | [AuditLogController](src/main/java/com/das/skillmatrix/controller/AuditLogController.java) | [AuditLogQueryService](src/main/java/com/das/skillmatrix/service/AuditLogQueryService.java) + [AuditLogSpecification](src/main/java/com/das/skillmatrix/repository/specification/AuditLogSpecification.java) | Filter by actor/action/entity/date range; enriched with actor full name. |

### User profile columns _(AUT-01)_

Added by the Profile module on top of the base `users` table:

| Column | Type | Purpose |
|--------|------|---------|
| `notification_email` | `BOOLEAN NOT NULL DEFAULT TRUE` | Profile setting §4.7 — whether the user opts in to broadcast emails. Note: critical emails (account creation, password reset, document assignment) override this flag per Global Rule §23.11. |
| `language` | `VARCHAR(2) NOT NULL DEFAULT 'EN'` | Profile setting §4.7 — UI language (`VI` or `EN`). Backed by the `Language` enum. |
| `must_change_password` | `BOOLEAN NOT NULL DEFAULT FALSE` | Set to true for admin-created accounts; cleared by `POST /api/auth/change-password` or `POST /api/auth/reset-password`. |

### Flyway Migrations

Migration scripts live under [src/main/resources/db/migration/](src/main/resources/db/migration/) and follow the `V{N}__description.sql` convention. Currently `V2__auth_extensions.sql` adds the `must_change_password` column, the `password_reset_tokens` table, and audit-log columns. **These are kept for documentation** — they describe schema deltas Hibernate produces automatically. They will become authoritative once TiDB / Flyway compatibility is resolved.

## 🔐 Authentication & Authorization

### Authentication

The service uses **JWT (JSON Web Tokens)** signed with HMAC-SHA256 via `io.jsonwebtoken:jjwt 0.11.5`.

- **Access Token** — short-lived (default 15 min, `jwt.access.expiration` in ms). Sent in the `Authorization: Bearer <token>` header. Decoded by [config/JwtAuthenticationFilter.java](src/main/java/com/das/skillmatrix/config/JwtAuthenticationFilter.java) on every request.
- **Refresh Token** — long-lived (default 7 days, `jwt.refresh.expiration` in ms). Stored hashed in `refresh_tokens`. Exchange via `POST /api/auth/refresh`.
- **Forced password change** — Newly-provisioned users (admin-created or system-seeded admin) have `must_change_password=true`. The login response sets `requiresPasswordChange: true`, and the frontend must redirect to a change-password flow before unlocking other features.

### Authorization

Two layers stacked on top of Spring Security's `@EnableMethodSecurity`:

1. **Role check** — coarse-grained roles via `hasAnyRole(...)`:
   ```java
   @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER_CAREER', 'MANAGER_DEPARTMENT', 'MANAGER_TEAM')")
   ```
   Roles defined: `ADMIN`, `MANAGER_CAREER`, `MANAGER_DEPARTMENT`, `MANAGER_TEAM`, `STAFF`.

2. **Scope check** — fine-grained via the `@permissionService` SpEL expression bean ([service/PermissionService.java](src/main/java/com/das/skillmatrix/service/PermissionService.java)):
   ```java
   @PreAuthorize("@permissionService.canManageTeam(#id)")
   @PreAuthorize("@permissionService.checkDepartmentAccess(#id)")
   ```
   These methods consult the current principal's managed-careers / managed-departments / managed-teams and answer "may this user act on this entity?" — e.g. a MANAGER_TEAM only manages their own team; a MANAGER_DEPARTMENT manages all teams in their department.

### Whitelisted Endpoints

Configured in `SecurityConfig.WHITELIST`:
- `/`, `/api/health`, `/api/auth/login`, `/api/auth/refresh`, `/api/auth/forgot-password`, `/api/auth/reset-password`
- `/swagger-ui.html`, `/swagger-ui/**`, `/v3/api-docs`, `/v3/api-docs/**`

Everything else requires a valid Bearer token.

## 📜 Auditing & Activity Logging

Three complementary mechanisms run side-by-side:

1. **Hibernate Envers** — column-level revision history on every audited JPA entity. A `_AUD` table is created for each one (`users_AUD`, `careers_AUD`, …) and Envers writes a row per insert / update / delete. Configured globally in `application.properties` (`org.hibernate.envers.*`).
2. **`audit_logs` table** — security-relevant events (login success/failure, password reset, role changes). Written by `AuditService` from inside the service layer.
3. **`business_change_log` table** — domain-friendly summaries (e.g. "Manager M reassigned employee E from team A to team B"). Emitted by [aspect/ActivityLogAspect.java](src/main/java/com/das/skillmatrix/aspect/ActivityLogAspect.java), an AOP advice over methods annotated with the project's `@LogActivity` (or equivalent) marker in [annotation/](src/main/java/com/das/skillmatrix/annotation/).

## ⚠️ Error Handling

Centralised in [exception/GlobalExceptionHandler.java](src/main/java/com/das/skillmatrix/exception/GlobalExceptionHandler.java) via `@RestControllerAdvice`. All responses follow `ApiResponse<T>`:

**Success:**
```json
{
  "data": { "...": "..." },
  "success": true,
  "error": null
}
```

**Error:**
```json
{
  "data": null,
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "User with id 42 was not found."
  }
}
```

Paginated responses wrap the items list in `PageResponse<T>`:
```json
{
  "data": {
    "items": [ ... ],
    "page": 1,
    "size": 20,
    "totalElements": 137,
    "totalPages": 7,
    "hasNext": true,
    "hasPrevious": false
  },
  "success": true,
  "error": null
}
```

Authentication / authorization failures route through `CustomAuthenticationEntryPoint` (401) and `CustomAccessDeniedHandler` (403) so they emit the same envelope.

## 🚀 Database Setup & Initialization (Important)

This project provides **automatic bootstrapping** for fresh deployments.

### 1. First-Time Setup

On startup the app will:
- Connect to the configured DB (TiDB Cloud or local MySQL).
- Create the `skillmatrix` database if it does not exist (`createDatabaseIfNotExist=true`).
- Apply all entity definitions via Hibernate `ddl-auto=update` (no manual migration step needed for now).
- Run [config/DataSeeder.java](src/main/java/com/das/skillmatrix/config/DataSeeder.java) which provisions:
  - **Demo accounts** under `*@skillmatrix.com` (password `123456`):
    - `admin@skillmatrix.com` (ADMIN)
    - `manager_career@skillmatrix.com`, `manager_career2@skillmatrix.com` (MANAGER_CAREER)
    - `manager_department@skillmatrix.com`, `manager_department2@skillmatrix.com` (MANAGER_DEPARTMENT)
    - `manager_team@skillmatrix.com`, `manager_team2@skillmatrix.com` (MANAGER_TEAM)
    - `member1@skillmatrix.com` … `member10@skillmatrix.com` (STAFF)
  - **Root admin** for production-style first login: `admin@skillmatrix.local` / `Admin@1234` with `must_change_password=true` (forces a password change on first login).
  - Sample Career / Department / Team / Position / Skill hierarchy (IT + HR career trees, dev / QA / recruitment / ER departments, etc.).

> ⚠️ The demo accounts and the seeded passwords are convenient for development but **must be disabled or replaced before production deployment**. Either delete the `seedData()` `@Bean` from `DataSeeder.java` or guard it with a `@Profile("dev")` annotation.

**Steps:**
1. Set DB credentials, `jwt.secret`, and any SMTP config in `application.properties`.
2. Run `./mvnw spring-boot:run` (or `mvnw.cmd spring-boot:run` on Windows).
3. The system initializes everything; watch logs for `Seeded system admin: admin@skillmatrix.local`.

### 2. Ongoing Operations

After the first run subsequent restarts are standard — Hibernate diffs entities and applies any additive changes; the `DataSeeder` skips entities that already exist (its helpers use `findByName(...)` / `findUserByEmail(...)` guards).

## ⚙️ Background Services & Schedulers

[scheduler/](src/main/java/com/das/skillmatrix/scheduler/) hosts cron-style jobs registered via `@EnableScheduling` on the main application class:

- **`UserDeactivationScheduler`** — periodically reactivates users whose `deactive_until` window has elapsed (TEMPORARY deactivations only).
- **`CareerCleanupScheduler`** — removes orphaned soft-deleted Career rows past the retention window.
- **`DepartmentCleanupScheduler`** — same, for Departments.
- **`TeamCleanupScheduler`** — same, for Teams.

Email dispatch lives in [service/EmailService.java](src/main/java/com/das/skillmatrix/service/EmailService.java). Wiring (post CFG-01):

1. `spring-boot-starter-mail` is on the classpath.
2. `EmailService.send(triggerEvent, recipient, vars)` looks up the active `EmailTemplate` for the trigger, substitutes `{{vars}}` in subject + body, checks the `NotificationRule` toggle (skips disabled non-critical events), then builds a `JavaMailSender` from the singleton `smtp_config` row via [MailSenderFactory](src/main/java/com/das/skillmatrix/service/MailSenderFactory.java).
3. The legacy `send(to, subject, body)` overload is retained for places that still pass literal text (e.g. `AuthService.forgotPassword`); it shares the same dispatch path but bypasses templating.
4. If `smtp_config` has not been created via the admin UI, dispatch is logged and silently dropped — the service does not throw, so feature-path code remains decoupled from mail outages.

## 📁 File Storage

Avatar uploads (Profile §4.6) go through the [FileStorageService](src/main/java/com/das/skillmatrix/service/FileStorageService.java) abstraction. The default implementation, [LocalFileStorageService](src/main/java/com/das/skillmatrix/service/LocalFileStorageService.java), writes files to the path configured in `application.properties`:

```properties
# Avatar storage (Profile module)
app.storage.avatar-base-path=uploads/avatars
app.storage.avatar-public-base-url=/static/avatars
spring.servlet.multipart.max-file-size=2MB
spring.servlet.multipart.max-request-size=4MB
```

Constraints enforced server-side (mirroring SYSTEM.md §4.6 and Global Rule §23.14):
- Max size: **2 MB** (constant in [ProfileConstants](src/main/java/com/das/skillmatrix/constants/ProfileConstants.java)).
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`.
- Filenames are randomised (`user-{id}-{uuid}{ext}`) and path-traversal-checked.
- Old avatar is deleted automatically when a new one is uploaded.

To migrate to S3-compatible storage per Global Rule §23.14, implement `FileStorageService` against the S3 SDK and register it as a `@Primary` bean — no controller / service changes required.

## ✅ Testing

The test suite lives under [src/test/java/com/das/skillmatrix/](src/test/java/com/das/skillmatrix/) and uses **JUnit 5**, **Mockito**, and **Spring Security Test**. Every new service method and controller endpoint must ship with a corresponding test.

Test conventions in the project:

- **Service tests** — `@ExtendWith(MockitoExtension.class)` + `@Mock` / `@InjectMocks`. Cover happy path **and** error paths per method.
- **Controller tests** — `@WebMvcTest(ControllerClass.class)`, `@AutoConfigureMockMvc(addFilters = false)`, `@Import(GlobalExceptionHandler.class)`, `@WithMockUser(...)`, with `MockMvc` + `ObjectMapper`. Assert status code, `success` flag, and key JSON paths.
- **File / IO tests** — use `@TempDir` and `ReflectionTestUtils.setField` to drive `@Value`-injected paths.

Existing coverage includes:

| Test class | Covers |
|------------|--------|
| `AuthControllerTest`, `AuthServiceTest` | Login, refresh, logout, password reset/change flows. |
| `JwtUtilTest` | Token generation, validation, claim extraction. |
| `UserControllerTest`, `UserServiceTest`, `AuthorizationServiceTest`, `PermissionServiceTest` | RBAC matrix + user management. |
| `CareerControllerTest` / `Service`, `DepartmentControllerTest` / `Service`, `SkillControllerTest` / `Service` | Skill taxonomy CRUD. |
| `TeamControllerTest` / `Service`, `TeamMemberControllerTest` / `Service` | Team & team-member CRUD. |
| `ProfileControllerTest` | All 7 `/api/profile` endpoints — 200 / 400 / 404 / multipart. |
| `ProfileServiceTest` | All 7 service methods × happy and error paths. |
| `LocalFileStorageServiceTest` | Avatar store/delete, size + MIME + path-traversal rejection. |
| `PositionServiceTest`, `PositionControllerTest` | CRUD; duplicate-name 409; min-level validation; required-skill mapping; soft-delete. |
| `RatingScaleServiceTest` | Default seeding; rejects ≠ 5 levels, duplicates, blank labels; upserts each level. |
| `NotificationRuleServiceTest` | Critical events always enabled; non-critical reads rule; update upserts. |
| `PermissionMatrixServiceTest` | `getRoles`, `getMatrix`, `hasFeature`, `updateMatrix` (rejects unknown role / feature key). |
| `SmtpConfigServiceTest` | Get masks password via `passwordSet`; update keeps existing password when blank; test-send dispatches; wraps `MailException` as `IllegalArgumentException`. |
| `EmailTemplateServiceTest` | CRUD; duplicate-name rejection; `findActiveByTrigger`; 404 on missing id. |
| `EmailServiceTest` | `substitute` variable replacement; skips when rule disabled / template missing / SMTP unconfigured; dispatches via `JavaMailSender`. |
| `AuditLogQueryServiceTest` | Specification + paging; enrichment with actor name; handles null-actor system events. |
| `AdminConfigControllerTest`, `EmailTemplateControllerTest`, `AuditLogControllerTest` | One test per endpoint × happy + 400 validation paths. |

Run the whole suite:

```bash
./mvnw test                # full suite
./mvnw test -Dtest=ProfileServiceTest  # single class
./mvnw test -Dtest='*Profile*'         # pattern
```

## 📐 Coding Standards

All new Java code in this module **must** comply with the rules in [`.agents/skills/backend-development-skills/SKILL.md`](../.agents/skills/backend-development-skills/SKILL.md). Highlights:

- **R1–R2** — Exactly one blank line between fields; field order is `static final` → `static` → instance → constructors → methods.
- **R3** — Always use `this.` when accessing instance fields or methods of the same class.
- **R4** — No hardcoded String literals in business logic. Group them in domain-specific Constants classes under [constants/](src/main/java/com/das/skillmatrix/constants/) (e.g. `ProfileConstants`, `UserConstants`).
- **R5–R6** — Single-responsibility methods (~30 lines max); use meaningful action-prefixed names (`findActiveUserByEmail`, `mapToProfileResponse`, …).
- **R7** — Keep files under 1500 lines; split oversized services/controllers by feature.
- **R8** — Sensitive or environment-specific values come from `application.properties` via `@Value`. Never hardcode DB URLs, secrets, or external service hosts.
- **R9** — REST endpoints use **kebab-case** (`/api/profile/assessment-history`) and every response is wrapped in `ApiResponse<T>` (paged data in `PageResponse<T>`).
- **R10** — Any endpoint that takes ≥ 3 parameters or a list takes them in a `@RequestBody` DTO.
- **R11** — Business conditions belong on the Entity (e.g. `user.isActive()`) rather than as `if/else` chains in services.
- **R12** — Use `@FeignClient` for inter-service / external REST calls.
- **R13** — Multi-clause `@Query` strings use Java text blocks (`"""`) with one SQL clause per line.

A violation summary template (`[R{n}] {Rule} — Line {N}: {description}; Suggested fix: ...`) is recommended in code review comments.

## 🛠️ Troubleshooting

### Flyway / TiDB
Flyway 9+ uses `CREATE TABLE flyway_schema_history (...) SELECT ...` to bootstrap its schema-history table, which TiDB Cloud rejects. **Workaround in place**: `spring.flyway.enabled=false` and Hibernate `ddl-auto=update` owns the schema instead. If you need real migrations:
1. Pre-create `flyway_schema_history` manually (use the DDL from Flyway's source).
2. Re-enable Flyway and switch `ddl-auto` to `validate`.
3. Apply migrations under `db/migration/` in numbered order.

### `must_change_password` Lockout
If a user reports being stuck on a password-change screen, the column `users.must_change_password` is `TRUE`. Either resolve it via `POST /api/auth/change-password` as that user, or as ADMIN reset the column to `FALSE` directly in DB.

### Failed Logins
Check `audit_logs` for `LOGIN_FAILURE` events. After repeated failures the account moves to `LOCKED` / `INACTIVE` — see `AccountLockedException` and `AuthService.login(...)`.

### JWT Issues
- `jwt.secret` must be **at least 32 characters** (HS256 requirement). The default value in `application.properties` is dev-only.
- Token expiry is configured in **milliseconds** (`jwt.access.expiration`, `jwt.refresh.expiration`).

### Swagger UI 401
The static resources `/swagger-ui/**` and `/v3/api-docs/**` are whitelisted in `SecurityConfig`. If you still get a 401, check that any custom reverse proxy isn't stripping these paths.

### Avatar upload fails with `MAX_AVATAR_SIZE_BYTES` / `AVATAR_INVALID_FILE_TYPE`
The 2 MB / MIME-type check is enforced both in `LocalFileStorageService.validateAvatarFile(...)` and the `spring.servlet.multipart.max-file-size` property. If you increase one limit, update the other to match.

### `PROFILE_NOT_FOUND` / `TEAM_NOT_FOUND` on `/api/profile/*`
- `PROFILE_NOT_FOUND` — the JWT subject doesn't match any user (token was issued before the account was deleted, or the JWT secret rotated). Re-login.
- `TEAM_NOT_FOUND` — the user has no active `TeamMember` row and isn't a team manager. Add them to a team via `POST /api/team-members/by-user` first.

## 💻 Commands

**Run application (with hot-reload via Spring DevTools):**
```bash
# Linux / macOS
./mvnw spring-boot:run

# Windows
mvnw.cmd spring-boot:run
```

**Build a runnable JAR:**
```bash
./mvnw clean package
java -jar target/skillmatrix-0.0.1-SNAPSHOT.jar
```

**Run tests:**
```bash
./mvnw test
```

**Compile only (sanity check):**
```bash
./mvnw clean compile
```

**Regenerate `openapi.yaml` from a running backend:**
```bash
# Requires backend running on localhost:8080
node generate-oas.js

# Windows wrapper
./generate-oas.ps1
```

**Run against a non-default config file (e.g. for a staging profile):**
```bash
./mvnw spring-boot:run -Dspring-boot.run.arguments=--spring.config.location=classpath:/application-staging.properties
```

**Override a single property at run time:**
```bash
./mvnw spring-boot:run \
  -Dspring-boot.run.jvmArguments="-Dspring.datasource.password=secret -Djwt.secret=$JWT_SECRET"
```