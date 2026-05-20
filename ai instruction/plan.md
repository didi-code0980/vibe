# Skill Matrix — AI Prompting Plan (Frontend + Backend)

> Use this file to prompt Claude Code feature by feature.
> Each section contains a ready-to-use Backend prompt and Frontend prompt.
> Copy the prompt block, paste into Claude Code, and work through them in order.
>
> **Priority constraint:** AI-01 Smart Resource Matching must be delivered as early as possible.
>
> **Reference:** Always tell Claude Code to read `SYSTEM.md` before starting any feature.
> Add this line at the top of every prompt:
> `Read SYSTEM.md in the .claude folder first, then do the following.`

---

## Dependency Chain

```
[DB Schema + Auth]
       ↓
[Skill Taxonomy: Career / Department / Skillset]
       ↓
[User Management + Team Management]
       ↓
[Skill Assessment]     [Project CRUD + Skill Requirements]
       ↓                          ↓
       └──────────┬───────────────┘
                  ↓
         ★ AI-01 RESOURCE MATCHING ★   ← unblocked at Sprint 3
                  ↓
     [Dashboard] [Documents] [Goals] [AI-02..06]
                  ↓
          [Phase 2: AI-07, AI-08]
```

---

## Current Codebase — What Already Exists

### Backend — Building from scratch with Spring Boot + MySQL (TiDB Cloud)

> ❌ **No existing backend code.** Every BE step in this plan creates new files.
> Do NOT look for existing controllers, services, or repositories — they do not exist.
> Follow the Spring Boot Coding Conventions section for all patterns and structure.

| Module | Status |
|--------|--------|
| All backend endpoints | ❌ Build from scratch |
| Database | ❌ Empty TiDB Cloud MySQL instance — run Flyway migrations |
| Auth, Users, Skills, Teams | ❌ All new |
| Projects, Assessments, Documents, Goals | ❌ All new |
| Dashboard, AI, Notifications, Config | ❌ All new |

### Frontend (from feature coverage audit) — read before writing any FE prompt

| Feature | Status | Notes |
|---------|--------|-------|
| Login | ✅ Done | LoginForm + auth.service working |
| Logout | ✅ Done | TopHeader dropdown |
| Forgot / Reset Password | ❌ Missing | No routes or UI |
| Change Password | ❌ Missing | No password section in settings |
| GET Profile | ⚠️ Partial | ProfileView exists, PUT is a stub |
| Upload Avatar | ❌ Missing | Initials only |
| Settings (notifications, language) | ⚠️ Partial | UI exists, toggles are local state only |
| Assessment History | ❌ Missing | Not in profile |
| Team Info | ❌ Missing | |
| User Management (all) | ❌ Missing | Endpoints in endpoints.ts, zero UI |
| Skill Taxonomy CRUD | ❌ Missing | No admin taxonomy pages |
| Self-Assessment form | ⚠️ Partial | UI exists, submits to mock-data.ts |
| Manager Review, Goals | ❌ Missing | |
| Document Library | ❌ Missing | |
| My Upskill / Learning | ⚠️ Partial | Page exists, uses mock-data.ts |
| Team Management | ❌ Missing | OrgChart shows static hardcoded data |
| Project Management | ❌ Missing | Zero coverage |
| Personal Dashboard | ⚠️ Partial | Layout exists, all data is mock |
| Team Skill Matrix | ⚠️ Partial | HeatmapGrid exists, mock data, filters broken |
| Export buttons | ❌ Missing | Buttons exist, do nothing |
| Admin Config (all) | ❌ Missing | No SMTP, templates, audit logs, permissions |
| AI-01 Resource Matching | ⚠️ Partial | Job Brief page calls mock analyzeJobBrief() |
| AI-02 Skill Gap | ⚠️ Partial | Tab exists, hardcoded gapSkills |
| AI-03 Learning Path | ⚠️ Partial | Recommendations tab, mock aiRecs |
| AI-05 Chatbot | ⚠️ Partial | ChatBot exists, hardcoded botReplies |
| AI-04, AI-06, AI-07, AI-08 | ❌ Missing | |
| Notification bell | ⚠️ Partial | Button in TopHeader, no dropdown/count/API |

### Critical FE structural gaps — must fix in STEP 0.3 before any feature work

1. **No TanStack Query** — all fetches are raw `useEffect`. No `QueryClientProvider`.
2. **No Zustand store** — user role is not stored globally, RBAC rendering broken.
3. **RBAC auth-only** — `middleware.ts` only checks token exists, not role.
4. **No React Hook Form + Zod** — all forms use raw `useState`.
5. **Navigation is role-unaware** — `Sidebar.tsx` shows all items to all users.
6. **No `/admin/` route group** — no ADMIN-only section exists.
7. **`endpoints.ts` incomplete** — missing assessments, projects, docs, goals, AI, dashboard.

### Naming conventions

- **IDs:** `Long` (Java/BE) / `number` (FE TS) — not UUID
- **User status:** `ACTIVE` / `DEACTIVE` / `DELETED` (NOT "LOCKED")
- **Skill status:** `ACTIVE` / `INACTIVE` / `DELETED`
- **BE response wrapper:** `ApiResponse<T> { success, message, data }` (generic record)
- **BE page response:** `PageResponse<T> { items, page, size, totalElements, totalPages }`
- **Java file naming:** PascalCase classes (one public class per file), camelCase fields
- **Java package naming:** lower-case (`com.skillmatrix.controller`, `com.skillmatrix.service`)
- **Controller prefix:** `/api/{resource}` e.g. `/api/auth`, `/api/users`, `/api/teams`
- **DTO naming:** `{Entity}Request` for input, `{Entity}Response` for output
- **JSON serialization:** Jackson with `camelCase` field names (matches FE)

---

## PHASE 0 — Project Bootstrap

### STEP 0.1 — Backend: Spring Boot Project Setup ❌ New project — build from scratch

```
Read SYSTEM.md in the .claude folder first, then do the following.

Create a new Spring Boot Java backend project for the Skill Matrix system.
Tech stack: Spring Boot 3.3.x · Java 17+ · Spring Data JPA (Hibernate) · Flyway ·
            MySQL Connector/J · TiDB Cloud · Spring Security · jjwt · Lombok

--- PROJECT STRUCTURE ---

Create the following Maven structure under backend/:
  backend/
  ├── pom.xml
  ├── Dockerfile
  ├── .env.example
  └── src/
      ├── main/
      │   ├── java/com/skillmatrix/
      │   │   ├── SkillMatrixApplication.java       # @SpringBootApplication entry point
      │   │   ├── config/
      │   │   │   ├── AppProperties.java            # @ConfigurationProperties from application.yml
      │   │   │   ├── SecurityConfig.java           # SecurityFilterChain + CORS
      │   │   │   ├── WebMvcConfig.java             # CORS / interceptors
      │   │   │   ├── OpenApiConfig.java            # springdoc-openapi (Swagger UI)
      │   │   │   └── AsyncConfig.java              # @EnableAsync + thread pool
      │   │   ├── controller/                       # REST controllers (one per feature group)
      │   │   ├── service/                          # Business logic
      │   │   ├── repository/                       # Spring Data JPA interfaces
      │   │   ├── model/                            # JPA @Entity classes
      │   │   ├── dto/
      │   │   │   ├── request/                      # *Request records / classes
      │   │   │   └── response/                     # *Response records / classes
      │   │   ├── security/
      │   │   │   ├── JwtService.java               # encode / decode JWT
      │   │   │   ├── JwtAuthenticationFilter.java  # OncePerRequestFilter
      │   │   │   ├── CustomUserDetailsService.java
      │   │   │   └── RequireRoles.java             # @PreAuthorize helper / custom annotation
      │   │   ├── exception/
      │   │   │   ├── GlobalExceptionHandler.java   # @RestControllerAdvice
      │   │   │   └── ApiException.java             # base RuntimeException with status code
      │   │   └── util/                             # Excel, file storage, pagination helpers
      │   └── resources/
      │       ├── application.yml                   # main config (profile-aware)
      │       ├── application-local.yml             # local override
      │       ├── db/migration/                     # Flyway scripts: V1__init.sql, V2__... etc.
      │       └── templates/email/                  # (optional) email body templates
      └── test/
          └── java/com/skillmatrix/                 # JUnit 5 + Mockito tests

--- DEPENDENCIES (pom.xml) ---

Parent: spring-boot-starter-parent 3.3.x (Java 17 baseline).

Required starters / libs:
  spring-boot-starter-web
  spring-boot-starter-data-jpa
  spring-boot-starter-security
  spring-boot-starter-validation
  spring-boot-starter-mail               # JavaMailSender for SMTP
  spring-boot-starter-actuator           # /actuator/health for health checks
  mysql-connector-j                      # MySQL driver (TiDB-compatible)
  org.flywaydb:flyway-core               # DB migrations
  org.flywaydb:flyway-mysql              # MySQL-specific Flyway support
  io.jsonwebtoken:jjwt-api               # JWT
  io.jsonwebtoken:jjwt-impl              # runtime
  io.jsonwebtoken:jjwt-jackson           # JSON parsing for JWT
  org.projectlombok:lombok               # boilerplate reduction
  org.mapstruct:mapstruct                # (optional) DTO mapping
  org.mapstruct:mapstruct-processor      # annotation processor
  org.apache.poi:poi-ooxml               # Excel .xlsx import/export
  org.apache.pdfbox:pdfbox               # PDF text extraction (AI-04)
  com.github.librepdf:openpdf            # PDF export (profile PDF)
  org.springdoc:springdoc-openapi-starter-webmvc-ui  # Swagger UI at /swagger-ui.html
  com.vladmihalcea:hibernate-types-60    # JSON column support for Hibernate 6

Test:
  spring-boot-starter-test
  org.testcontainers:mysql               # integration tests against a real MySQL

--- APPLICATION CONFIG (src/main/resources/application.yml) ---

server:
  port: 8080
  servlet:
    context-path: /

spring:
  application:
    name: skill-matrix
  datasource:
    url: jdbc:mysql://${DB_HOST}:${DB_PORT:4000}/${DB_NAME}?useSSL=true&requireSSL=true&serverTimezone=UTC&allowPublicKeyRetrieval=true
    username: ${DB_USER}
    password: ${DB_PASSWORD}
    driver-class-name: com.mysql.cj.jdbc.Driver
    hikari:
      maximum-pool-size: 10
      connection-test-query: SELECT 1
  jpa:
    open-in-view: false
    hibernate:
      ddl-auto: validate                 # NEVER create-drop — Flyway owns the schema
    properties:
      hibernate.dialect: org.hibernate.dialect.MySQLDialect
      hibernate.jdbc.batch_size: 50
      hibernate.order_inserts: true
      hibernate.order_updates: true
  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true
  mail:                                  # populated dynamically from smtp_config DB row at runtime
    host: ${SMTP_HOST:}
    port: ${SMTP_PORT:587}
    username: ${SMTP_USER:}
    password: ${SMTP_PASSWORD:}

app:
  jwt:
    secret: ${SECRET_KEY}
    access-token-expire-minutes: 15
    refresh-token-expire-days: 7
  cors:
    allowed-origins:
      - http://localhost:3000
  anthropic:
    api-key: ${ANTHROPIC_API_KEY:}
    model: claude-sonnet-4-20250514
    base-url: https://api.anthropic.com/v1
  storage:
    avatars: ./uploads/avatars
    documents: ./uploads/documents

logging:
  level:
    com.skillmatrix: INFO
    org.hibernate.SQL: DEBUG               # turn off in prod profile

springdoc:
  swagger-ui:
    path: /swagger-ui.html
  api-docs:
    path: /v3/api-docs

--- TIDB CLOUD CONNECTION NOTES ---

TiDB Cloud uses the MySQL wire protocol and requires SSL.
Set DB_HOST to the gateway hostname from the TiDB console
(e.g. gateway01.ap-southeast-1.prod.aws.tidbcloud.com).
The JDBC URL above enables useSSL=true & requireSSL=true — no separate CA file is needed
for TiDB Cloud (it presents a publicly-trusted certificate).

--- BOOTSTRAP CLASS (SkillMatrixApplication.java) ---

  package com.skillmatrix;

  import org.springframework.boot.SpringApplication;
  import org.springframework.boot.autoconfigure.SpringBootApplication;
  import org.springframework.scheduling.annotation.EnableAsync;
  import org.springframework.scheduling.annotation.EnableScheduling;

  @SpringBootApplication
  @EnableAsync
  @EnableScheduling
  public class SkillMatrixApplication {
      public static void main(String[] args) {
          SpringApplication.run(SkillMatrixApplication.class, args);
      }
  }

--- CORS / SECURITY BASELINE (config/SecurityConfig.java) ---

@Configuration
@EnableWebSecurity
@EnableMethodSecurity                    # enables @PreAuthorize on controller methods
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, JwtAuthenticationFilter jwtFilter) {
        return http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(Customizer.withDefaults())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/login", "/api/auth/refresh",
                                 "/api/auth/forgot-password", "/api/auth/reset-password",
                                 "/api/health", "/actuator/health",
                                 "/v3/api-docs/**", "/swagger-ui/**").permitAll()
                .anyRequest().authenticated())
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}

--- STANDARD RESPONSE TYPES (dto/response/ApiResponse.java) ---

public record ApiResponse<T>(boolean success, String message, T data) {
    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, "OK", data);
    }
}

public record ErrorResponse(boolean success, String message, String errorCode) {
    public static ErrorResponse of(String msg, String code) {
        return new ErrorResponse(false, msg, code);
    }
}

public record PageResponse<T>(
    List<T> items,
    int page,
    int size,
    long totalElements,
    int totalPages
) {
    public static <T> PageResponse<T> from(Page<T> springPage) {
        return new PageResponse<>(
            springPage.getContent(),
            springPage.getNumber() + 1,        // Spring is 0-based — API is 1-based
            springPage.getSize(),
            springPage.getTotalElements(),
            springPage.getTotalPages()
        );
    }
}

--- GLOBAL EXCEPTION HANDLER (exception/GlobalExceptionHandler.java) ---

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ErrorResponse> handleApi(ApiException ex) {
        return ResponseEntity.status(ex.getStatus())
            .body(ErrorResponse.of(ex.getMessage(), ex.getErrorCode()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        String msg = ex.getBindingResult().getFieldErrors().stream()
            .map(e -> e.getField() + ": " + e.getDefaultMessage())
            .collect(Collectors.joining(", "));
        return ResponseEntity.badRequest()
            .body(ErrorResponse.of(msg, "VALIDATION_ERROR"));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body(ErrorResponse.of("Insufficient permissions", "FORBIDDEN"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex) {
        return ResponseEntity.internalServerError()
            .body(ErrorResponse.of("Internal server error", "INTERNAL_ERROR"));
    }
}

--- HEALTH CHECK ---

GET /api/health → { "status": "ok", "db": "connected" }
Implement a HealthController that runs `SELECT 1` via JdbcTemplate to confirm DB connectivity.
Also leave Spring Boot Actuator's /actuator/health enabled for infra checks.

--- .env.example ---

DB_HOST=gateway01.ap-southeast-1.prod.aws.tidbcloud.com
DB_PORT=4000
DB_USER=your_tidb_user
DB_PASSWORD=your_tidb_password
DB_NAME=skill_matrix
SECRET_KEY=your-secret-key-min-32-chars
ANTHROPIC_API_KEY=
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
```

---

### STEP 0.2 — Backend: All JPA Entities + Initial Flyway Migration

```
Read SYSTEM.md in the .claude folder first, then do the following.

Create all JPA @Entity classes and the initial Flyway migration script.
Base all field definitions on Section 3 (Data Entities) of SYSTEM.md.

--- BASE TYPES (model/BaseEntity.java) ---

@MappedSuperclass
@Getter @Setter
public abstract class BaseEntity {
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}

@MappedSuperclass
@Getter @Setter
public abstract class SoftDeleteEntity extends BaseEntity {
    @Column(name = "deleted_at")
    private Instant deletedAt;
}

--- ENTITY GUIDELINES (MySQL / TiDB) ---

- Use @Entity + @Table(name = "snake_case_table") for every model.
- All tables: __table_options__ via @Table(name = "...", indexes = { @Index(...) }).
  Charset / engine are set in the Flyway script (DEFAULT CHARSET=utf8mb4 ENGINE=InnoDB).
- IDs: @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
- Use Long for FK references, mapped with @ManyToOne(fetch = LAZY) + @JoinColumn.
- Enums in JSON / DB: store as String(20), validate at service layer.
  (Do NOT use MySQL ENUM; do NOT use @Enumerated(EnumType.STRING) unless you can
   guarantee the enum will never gain values needing a DB migration.)
- JSON columns: use hibernate-types-60 @Type(JsonType.class) on a Map / List / record field.
- Boolean → MySQL TINYINT(1); Hibernate handles automatically.
- Soft delete: filter with .where(deletedAt == null) at the repository or service layer.
  (Do NOT use @Where annotation — it conflicts with admin "show deleted" queries.)

--- CREATE ENTITY CLASSES in model/ ---

1. model/User.java — User
   (id, email UNIQUE, passwordHash, fullName, avatarUrl, phone,
    role VARCHAR(20), status VARCHAR(20), mustChangePassword Boolean default false,
    @ManyToOne Position position, @ManyToOne Team team, @ManyToOne Career career,
    timestamps + deletedAt)

2. model/Career.java — Career
   (id, name, careerType, description, status VARCHAR(20), timestamps)

3. model/Department.java — Department
   (id, name, description, @ManyToOne Career career, status, timestamps)

4. model/Skill.java — Skill
   (id, name, description, @ManyToOne Department department (nullable),
    @Type(JsonType.class) Map<Integer,String> levelDescriptions,
    status VARCHAR(20), timestamps)

5. model/Position.java — Position
   (id, name, @Type(JsonType.class) List<Map<String,Object>> requiredSkills,
    timestamps)

6. model/Team.java — Team
   (id, name, description, @ManyToOne Department department (nullable),
    status VARCHAR(20), timestamps + deletedAt)

7. model/TeamMember.java — TeamMember
   (id, @ManyToOne Team team, @ManyToOne User user,
    position VARCHAR(100) default 'Member', note TEXT,
    joinedAt, leftAt (nullable))

8. model/TeamManager.java — TeamManager join table
   (id, @ManyToOne Team team, @ManyToOne User user)

9. model/SkillAssessment.java — SkillAssessment
   (id, @ManyToOne User user, @ManyToOne Skill skill,
    selfScore Integer, managerScore Integer,
    selfNote TEXT, managerNote TEXT,
    @ManyToOne User assessedBy, assessedAt Instant,
    @Type(JsonType.class) Map<String,Object> assessmentAiLog,
    UNIQUE(user_id, skill_id))

10. model/AssessmentLog.java — AssessmentLog
    (id, @ManyToOne SkillAssessment assessment,
     @ManyToOne User changedBy, fieldChanged VARCHAR(50),
     oldValue VARCHAR(255), newValue VARCHAR(255), changedAt Instant)

11. model/Project.java — Project
    (id, name, description, customer VARCHAR(255),
     startDate LocalDate, endDate LocalDate,
     status VARCHAR(20) default 'PLANNING',
     @ManyToOne User createdBy, timestamps + deletedAt)

12. model/ProjectSkillRequirement.java — ProjectSkillRequirement
    (id, @ManyToOne Project project, @ManyToOne Skill skill,
     minLevel Integer, isRequired Boolean,
     UNIQUE(project_id, skill_id))

13. model/ProjectMember.java — ProjectMember
    (id, @ManyToOne Project project, @ManyToOne User user,
     projectRole VARCHAR(100), joinDate LocalDate, outDate LocalDate)

14. model/Document.java — Document
    (id, title VARCHAR(255), description TEXT,
     type VARCHAR(10), url VARCHAR(2000), filePath VARCHAR(1000),
     @Type(JsonType.class) List<Long> skillsetTags,
     @Type(JsonType.class) List<Map<String,Object>> aiTagSuggestions,
     @ManyToOne User createdBy, timestamps + deletedAt)

15. model/DocumentAssignment.java — DocumentAssignment
    (id, @ManyToOne Document document,
     @ManyToOne User assignedToUser (nullable),
     @ManyToOne Team assignedToTeam (nullable),
     deadline LocalDate, status VARCHAR(20) default 'NOT_STARTED',
     @ManyToOne User assignedBy, assignedAt, completedAt)

16. model/DevelopmentGoal.java — DevelopmentGoal
    (id, @ManyToOne User user, @ManyToOne Skill skill,
     targetLevel Integer, currentLevel Integer, note TEXT,
     @ManyToOne User suggestedBy (nullable),
     status VARCHAR(20) default 'IN_PROGRESS', completedAt Instant)

17. model/Notification.java — Notification
    (id, @ManyToOne User recipient, type VARCHAR(100),
     title VARCHAR(255), body TEXT,
     relatedEntityType VARCHAR(100), relatedEntityId Long,
     isRead Boolean default false, createdAt)

18. model/AuditLog.java — AuditLog
    (id, @ManyToOne User actor (nullable),
     action VARCHAR(100), entityType VARCHAR(100), entityId Long,
     @Type(JsonType.class) Map<String,Object> oldData,
     @Type(JsonType.class) Map<String,Object> newData,
     ipAddress VARCHAR(50), userAgent TEXT, createdAt)

19. model/EmailTemplate.java — EmailTemplate
    (id, name VARCHAR(100), subject VARCHAR(500), bodyHtml TEXT,
     triggerEvent VARCHAR(100) UNIQUE, isActive Boolean default true)

20. Config tables (model/SmtpConfig.java, RatingScale.java, NotificationRule.java,
    UserSettings.java, PasswordResetToken.java, RefreshToken.java, SavedQuery.java)

--- FLYWAY INITIAL MIGRATION ---

Create src/main/resources/db/migration/V1__initial_schema.sql with raw DDL:

  CREATE TABLE users (
      id BIGINT PRIMARY KEY AUTO_INCREMENT,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      full_name VARCHAR(255),
      avatar_url VARCHAR(1000),
      phone VARCHAR(50),
      role VARCHAR(20) NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
      must_change_password TINYINT(1) NOT NULL DEFAULT 0,
      position_id BIGINT NULL,
      team_id BIGINT NULL,
      career_id BIGINT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      deleted_at DATETIME NULL,
      INDEX idx_users_status (status),
      INDEX idx_users_team (team_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

  -- repeat the same pattern for every entity above
  -- foreign keys: add as ALTER TABLE ... ADD CONSTRAINT ... at the end of the script
  -- composite UNIQUE constraints: define inline
  -- JSON columns: use the native MySQL JSON type

Run on first startup automatically (Flyway is wired through application.yml).

--- SEED DATA (config/Seeder.java) ---

@Component
@RequiredArgsConstructor
public class Seeder implements ApplicationRunner {
    private final UserRepository users;
    private final RatingScaleRepository ratingScales;
    private final EmailTemplateRepository templates;
    private final PasswordEncoder encoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (users.count() == 0) {
            User admin = User.builder()
                .email("admin@skillmatrix.local")
                .passwordHash(encoder.encode("Admin@1234"))
                .fullName("System Administrator")
                .role("ADMIN")
                .status("ACTIVE")
                .mustChangePassword(true)
                .build();
            users.save(admin);
        }
        if (ratingScales.count() == 0) {
            ratingScales.saveAll(List.of(
                new RatingScale(1, "Beginner", "..."),
                new RatingScale(2, "Basic", "..."),
                new RatingScale(3, "Intermediate", "..."),
                new RatingScale(4, "Advanced", "..."),
                new RatingScale(5, "Expert", "...")
            ));
        }
        // Seed EmailTemplate rows — one per trigger event with placeholder body_html
    }
}

ApplicationRunner runs after the application context is ready, which is the
correct hook for one-time data seeding under Spring Boot.
```

### STEP 0.3 — Frontend: Foundation Setup ⚠️ Partially exists — fix before building anything

> The frontend app already exists. Read the entire src/ directory structure before making changes.
> This step MUST be completed before any feature work — every other FE step depends on these foundations.

```
Feature groups: ALL
Tasks covered: Foundation for all feature groups — must be done first

Read SYSTEM.md in the .claude folder first, then do the following.

The frontend app already exists with the following structure (Next.js App Router):
  app/(auth)/login/         ✅ LoginForm + auth.service — already working
  app/(dashboard)/          ✅ Route group exists with layout
  app/api/                  ✅ BFF pattern established, /api/me exists
  features/auth/            ✅ Login feature module
  features/profile/         ✅ Profile page (GET only, PUT not wired)
  lib/api/endpoints.ts      ⚠️ Exists but incomplete (missing assessments, projects, docs, goals, etc.)
  components/ui/            ✅ Shared primitives (Card, Badge, SkillBar, etc.) — keep these

DO NOT delete or rebuild existing working code. Read each file before modifying.

--- WHAT IS MISSING (must add before any feature work) ---

1. Install missing packages (check package.json first, install only what is absent):
   - @tanstack/react-query @tanstack/react-query-devtools
   - zustand
   - react-hook-form @hookform/resolvers zod
   Recharts, Tailwind, shadcn/ui should already be installed — verify first.

2. Set up QueryClientProvider in app/layout.tsx (or providers.tsx):
   Wrap the app with <QueryClientProvider client={queryClient}>.
   Add <ReactQueryDevtools> in development only.

3. Create Zustand auth store at store/auth.store.ts:
   State: { user: User | null, accessToken: string | null, refreshToken: string | null,
            isAuthenticated: boolean, mustChangePassword: boolean }
   Actions: login(loginResponse), logout(), updateUser(partial: Partial<User>)
   On login: decode JWT to extract role, save to user.role.
   Persist to localStorage (use zustand/middleware persist).
   IMPORTANT: the existing auth.service.ts likely handles login — read it and
   extract the token storage logic into this store instead of duplicating it.

4. Upgrade middleware.ts for role-based access control:
   Current middleware only checks that auth_token cookie exists.
   Extend it to:
   - Decode the JWT and read the role claim.
   - Block /admin/* routes if role !== 'ADMIN' (redirect to /403).
   - Block /team/* management routes if role === 'USER'.
   If middleware.ts does not have access to role, store role in a separate
   role cookie (httpOnly: false) at login time for middleware to read.

5. Create components/guards/RoleGuard.tsx:
   Props: { allowedRoles: Role[], children: ReactNode, fallback?: ReactNode }
   Reads role from Zustand auth store. Renders children if role matches, else fallback (or null).
   Example: <RoleGuard allowedRoles={['ADMIN']}><DeleteButton/></RoleGuard>

6. Refactor lib/api/endpoints.ts — add all missing endpoint groups:
   Current: auth, users, teams, team-members, skills, departments, careers
   Add: assessments, projects, documents, goals, my-upskill, notifications,
        ai (resource-match, gap-analysis, learning-path, extract-skills,
            assessment-assistant, generate-taxonomy, trend, risk-score, matrix-query),
        admin (config/smtp, config/rating-scale, email-templates, notification-rules,
               positions, audit-logs),
        export (profile/pdf, team-matrix),
        dashboard (personal, team-matrix, completion-rate)
   Follow the existing pattern in endpoints.ts exactly (same function signature style).

7. Update config/navigation.ts (or wherever Sidebar.tsx reads its nav items) to be
   role-aware. Each nav item should have a requiredRoles field.
   Admin nav group (Taxonomy, Users, Config) visible only to ADMIN.
   Team Skill Matrix visible to ADMIN and MANAGER, hidden from USER.
   Sidebar renders items filtered by current user's role from Zustand store.

8. Create app/(dashboard)/admin/ route group:
   app/(dashboard)/admin/layout.tsx — server component, check role === 'ADMIN',
     redirect /403 if not.
   This is the container for all ADMIN-only pages added in later steps.

9. Add TypeScript types for ALL entities:
   Read existing types/ or types.ts. Add only what is missing.
   Must match SYSTEM.md Section 3 and use:
   - id: number (Java Long on BE; matches Jackson serialization to JS number)
   - status: 'ACTIVE' | 'DEACTIVE' | 'DELETED' for User
   - status: 'ACTIVE' | 'INACTIVE' | 'DELETED' for Skill
   New entities (Skill Assessment, Project, Document, Goal, Notification, etc.):
   define these now so all future steps can import them.

DO NOT change any existing route paths or component names in this step.
Only add the missing infrastructure around what already exists.
```

---

## PHASE 1 — Authentication & User Foundation (Sprint 1)

### STEP 1.1 — Backend: Authentication Module ❌ Build from scratch

```
Feature groups: AUT-01
Tasks covered: Login/logout · Forgot password · Change password · Force password change on first login

Read SYSTEM.md in the .claude folder first, then do the following.

Build the complete Authentication module. All files are new — nothing exists yet.

Files to create:
  controller/AuthController.java
  service/AuthService.java
  repository/UserRepository.java                  # extends JpaRepository<User, Long>
  repository/RefreshTokenRepository.java
  repository/PasswordResetTokenRepository.java
  dto/request/LoginRequest.java
  dto/request/ForgotPasswordRequest.java
  dto/request/ResetPasswordRequest.java
  dto/request/ChangePasswordRequest.java
  dto/response/LoginResponse.java
  security/JwtService.java
  security/JwtAuthenticationFilter.java
  security/CustomUserDetailsService.java
  util/PasswordValidator.java
  service/AuditService.java                       # @Service stub for audit logging

--- DTO SCHEMAS (dto/request and dto/response) ---

public record LoginRequest(
    @NotBlank @Email String email,
    @NotBlank String password
) {}

public record LoginResponse(
    String accessToken,
    String refreshToken,
    String tokenType,                              # always "bearer"
    boolean requiresPasswordChange
) {}

public record ForgotPasswordRequest(
    @NotBlank @Email String email
) {}

public record ResetPasswordRequest(
    @NotBlank String token,
    @NotBlank String newPassword
) {}

public record ChangePasswordRequest(
    @NotBlank String currentPassword,
    @NotBlank String newPassword
) {}

--- JWT SERVICE (security/JwtService.java) ---

@Service
@RequiredArgsConstructor
public class JwtService {
    private final AppProperties props;

    public String createAccessToken(User user) {
        Instant now = Instant.now();
        return Jwts.builder()
            .subject(String.valueOf(user.getId()))
            .claim("email", user.getEmail())
            .claim("role", user.getRole())
            .issuedAt(Date.from(now))
            .expiration(Date.from(now.plus(props.getJwt().getAccessTokenExpireMinutes(), ChronoUnit.MINUTES)))
            .signWith(Keys.hmacShaKeyFor(props.getJwt().getSecret().getBytes()))
            .compact();
    }

    public String createRefreshToken(Long userId) { /* similar, longer expiry, store hash in DB */ }

    public Claims parse(String token) {
        return Jwts.parser()
            .verifyWith(Keys.hmacShaKeyFor(props.getJwt().getSecret().getBytes()))
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }
}

--- JWT FILTER (security/JwtAuthenticationFilter.java) ---

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwt;
    private final CustomUserDetailsService uds;

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res,
                                    FilterChain chain) throws ServletException, IOException {
        String header = req.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            try {
                Claims claims = jwt.parse(header.substring(7));
                String userId = claims.getSubject();
                UserDetails user = uds.loadUserByUsername(userId);
                var auth = new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(auth);
            } catch (JwtException ignored) { /* leave context empty → 401 from endpoint */ }
        }
        chain.doFilter(req, res);
    }
}

--- PASSWORD POLICY (util/PasswordValidator.java) ---

public final class PasswordValidator {
    public static void validate(String password) {
        var errors = new ArrayList<String>();
        if (password.length() < 8) errors.add("min 8 characters");
        if (password.chars().noneMatch(Character::isUpperCase)) errors.add("1 uppercase letter");
        if (password.chars().noneMatch(Character::isDigit)) errors.add("1 digit");
        if (!errors.isEmpty())
            throw new ApiException(HttpStatus.BAD_REQUEST,
                "Password must have: " + String.join(", ", errors), "WEAK_PASSWORD");
    }
}

--- AUDIT STUB (service/AuditService.java) ---

@Service
@RequiredArgsConstructor
public class AuditService {
    private final AuditLogRepository repo;

    @Async
    public void log(Long actorId, String action, String entityType, Long entityId,
                    Map<String,Object> oldData, Map<String,Object> newData,
                    String ipAddress, String userAgent) {
        var entry = AuditLog.builder()
            .actorId(actorId).action(action)
            .entityType(entityType).entityId(entityId)
            .oldData(oldData).newData(newData)
            .ipAddress(ipAddress).userAgent(userAgent)
            .build();
        repo.save(entry);
    }
}

--- ENDPOINTS (controller/AuthController.java) ---

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService auth;

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest req,
                                            HttpServletRequest http) {
        return ApiResponse.ok(auth.login(req, http));
    }

    @PostMapping("/refresh")
    public ApiResponse<LoginResponse> refresh(@RequestBody Map<String,String> body) {
        return ApiResponse.ok(auth.refresh(body.get("refresh_token")));
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout(@AuthenticationPrincipal User current) {
        auth.logout(current); return ApiResponse.ok(null);
    }

    @PostMapping("/forgot-password")
    public ApiResponse<Void> forgot(@Valid @RequestBody ForgotPasswordRequest req) {
        auth.requestPasswordReset(req.email()); return ApiResponse.ok(null);
    }

    @PostMapping("/reset-password")
    public ApiResponse<Void> reset(@Valid @RequestBody ResetPasswordRequest req) {
        auth.resetPassword(req); return ApiResponse.ok(null);
    }

    @PostMapping("/change-password")
    public ApiResponse<Void> change(@AuthenticationPrincipal User current,
                                    @Valid @RequestBody ChangePasswordRequest req) {
        auth.changePassword(current, req); return ApiResponse.ok(null);
    }
}

--- ENDPOINT BEHAVIOR ---

POST /api/auth/login
  - Query user by email. If not found: throw 401 (never reveal whether email exists).
  - passwordEncoder.matches(req.password(), user.getPasswordHash()). If false: 401, log FAILURE.
  - If user.status != 'ACTIVE': 403 "Account is deactivated."
  - Generate access + refresh tokens. Persist refresh token hash to refresh_tokens table.
  - Return LoginResponse with requiresPasswordChange = user.mustChangePassword.
  - Audit: log LOGIN_SUCCESS or LOGIN_FAILURE.

POST /api/auth/refresh
  Body: { "refresh_token": "..." }
  Validate token in refresh_tokens (not expired, not revoked). Return new access token.

POST /api/auth/logout
  Delete refresh token record from DB.

POST /api/auth/forgot-password
  ALWAYS return 200 { success: true, message: "If this email exists, a reset link will be sent." }
  If user found: generate UUID token, save to password_reset_tokens (expires 1 hr).
  Log the reset URL to console (stub — email not sent yet, wired in STEP 6.1).

POST /api/auth/reset-password
  Validate token: exists, used=false, expiresAt > now.
  Call PasswordValidator.validate(newPassword).
  Update user.passwordHash = encoder.encode(newPassword).
  Set user.mustChangePassword = false. Mark token used.
  Audit: log PASSWORD_RESET_COMPLETED.

POST /api/auth/change-password
  passwordEncoder.matches(currentPassword, user.passwordHash) — 400 if false.
  PasswordValidator.validate(newPassword).
  Update hash. Set mustChangePassword = false.

Register all endpoints by simply having Spring component-scan pick up @RestController.
SecurityConfig (STEP 0.1) already permits /api/auth/login, /refresh, /forgot-password,
/reset-password without authentication.
```

### STEP 1.2 — Frontend: Complete Auth Pages ⚠️ Login exists — add missing password flows

```
Feature groups: AUT-01
Tasks covered: Login/logout · Forgot password · Change password · Force password change on first login

Read SYSTEM.md in the .claude folder first, then do the following.



--- WHAT IS MISSING (add only these) ---

Migrate existing LoginForm to use React Hook Form + Zod (do not add a new component —
edit the existing LoginForm):
  - Replace raw useState with useForm<{ email: string; password: string }>()
  - Add Zod schema: email required + valid email, password required
  - Wire the existing submit logic to RHF handleSubmit
  - After login success: if response.data.requiresPasswordChange === true,
    redirect to /change-password instead of /dashboard
  - Store result in Zustand auth store (from STEP 0.3)

New page: app/(auth)/forgot-password/page.tsx
  - Single email field, RHF + Zod
  - POST /api/auth/forgot-password (add to endpoints.ts)
  - Always show: "If this email exists, you will receive a reset link." (no error on failure)

New page: app/(auth)/reset-password/page.tsx
  - Reads ?token= from search params
  - Fields: newPassword, confirmPassword (must match)
  - Zod: min 8 chars, 1 uppercase, 1 digit
  - POST /api/auth/reset-password { token, newPassword }
  - On success: redirect /login with toast "Password reset successfully."
  - On 400: "This link is invalid or has expired." + link back to /forgot-password

New page: app/(dashboard)/change-password/page.tsx
  - Requires auth (inside dashboard group so middleware protects it)
  - Fields: currentPassword, newPassword, confirmPassword
  - If Zustand store has mustChangePassword=false, redirect to /dashboard
  - POST /api/auth/change-password { currentPassword, newPassword }
  - On success: update Zustand mustChangePassword=false, redirect /dashboard

Update app/(auth)/layout.tsx or login page to show "Forgot password?" link.
Add links between: login ↔ forgot-password, reset-password → login.
```
### STEP 1.3 — Backend: App Configuration & Email Service ❌ Build from scratch

```
Feature groups: CFG-01
Tasks covered: RBAC/permissions · Master data (job titles, rating scale) · Email config (SMTP, templates, triggers)

Read SYSTEM.md in the .claude folder first, then do the following.

Build config management and email infrastructure. All files are new.

Files to create:
  controller/AdminConfigController.java
  service/ConfigService.java
  service/EmailService.java
  dto/request/SmtpConfigRequest.java
  dto/request/EmailTemplateRequest.java
  dto/request/RatingScaleRequest.java
  dto/response/SmtpConfigResponse.java
  dto/response/EmailTemplateResponse.java
  dto/response/RatingScaleResponse.java
  repository/SmtpConfigRepository.java
  repository/EmailTemplateRepository.java
  repository/RatingScaleRepository.java
  repository/NotificationRuleRepository.java

--- EMAIL SERVICE (service/EmailService.java) ---

Use Spring's JavaMailSender, but load credentials dynamically from smtp_config DB row
so admins can change SMTP at runtime without an app restart.

@Service
@RequiredArgsConstructor
public class EmailService {
    private final SmtpConfigRepository smtpRepo;
    private final EmailTemplateRepository templateRepo;
    private final NotificationRuleRepository ruleRepo;

    @Async
    public void send(String triggerEvent, String recipientEmail, Map<String,String> variables) {
        // 1. Load SmtpConfig row. If absent → log warning and return.
        // 2. Load active EmailTemplate by triggerEvent. If absent → log warning and return.
        // 3. Check NotificationRule.isEnabled for triggerEvent. If false → return.
        // 4. Build a JavaMailSenderImpl on the fly from SmtpConfig:
        //      var sender = new JavaMailSenderImpl();
        //      sender.setHost(cfg.getHost()); sender.setPort(cfg.getPort());
        //      sender.setUsername(cfg.getUsername()); sender.setPassword(cfg.getPassword());
        //      Properties p = sender.getJavaMailProperties();
        //      p.put("mail.smtp.starttls.enable", cfg.isUseTls());
        // 5. Replace {{key}} placeholders in template.subject and template.bodyHtml.
        // 6. Send MimeMessage with HTML body.
        // 7. Catch MailException → log, do NOT rethrow (non-critical path).
    }
}

--- ENDPOINTS (controller/AdminConfigController.java) ---

All require ADMIN: @PreAuthorize("hasRole('ADMIN')") on the class.

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminConfigController {

  GET  /api/admin/config/smtp                  → SmtpConfigResponse
  PUT  /api/admin/config/smtp                  → upsert smtp_config row
  POST /api/admin/config/smtp/test             → send test email to current admin

  GET  /api/admin/config/rating-scale          → List<RatingScaleResponse>
  PUT  /api/admin/config/rating-scale          → bulk replace all 5 levels

  GET  /api/admin/email-templates              → List<EmailTemplateResponse>
  POST /api/admin/email-templates              → create
  GET  /api/admin/email-templates/{id}
  PUT  /api/admin/email-templates/{id}         → update subject / bodyHtml / isActive

  GET  /api/admin/config/notification-rules    → List<NotificationRuleResponse>
  PUT  /api/admin/config/notification-rules    → bulk update

  GET  /api/admin/config/permissions
    Returns role-level descriptors (read-only). Stub:
      Map.of(
        "ADMIN",   List.of("all"),
        "MANAGER", List.of("own_team"),
        "USER",    List.of("self_only")
      )
}

--- SEED DATA (extend config/Seeder.java) ---

In Seeder.run() add:
  Seed rating_scale rows if empty: 1=Beginner, 2=Basic, 3=Intermediate, 4=Advanced, 5=Expert
  Seed email_templates if empty — one per trigger event with placeholder body_html:
    ACCOUNT_CREATED, PASSWORD_RESET, DOCUMENT_ASSIGNED,
    LEARNING_REMINDER, GOAL_SUGGESTED, ASSESSMENT_REVIEWED

@EnableAsync is already on the application class — EmailService.send() runs on
the default Spring async executor. Configure a dedicated pool in config/AsyncConfig.java
if email volume warrants it.
```

### STEP 1.4 — Backend: User Management ❌ Build from scratch

```
Feature groups: USM-01
Tasks covered: User list · View activity logs · Lock/unlock · Delete · Create account (auto-password, welcome email)

Read SYSTEM.md in the .claude folder first, then do the following.

Build the User Management module. All files are new.

Files to create:
  controller/UserController.java                # /api/users
  controller/AdminUserController.java           # /api/admin/users/{id}/...
  service/UserService.java
  repository/UserRepository.java                # already exists from STEP 1.1 — extend with custom queries
  dto/request/CreateUserRequest.java
  dto/request/UpdateUserRequest.java
  dto/request/DeactivateUserRequest.java
  dto/request/UserFilterRequest.java
  dto/response/UserResponse.java
  dto/response/UserDetailResponse.java
  dto/response/PositionBriefResponse.java

--- DTO SCHEMAS ---

public record UserResponse(
    Long userId,
    String email,
    String fullName,
    String avatarUrl,
    String role,
    String status,
    List<PositionBriefResponse> positions,
    Instant createdAt
) {}

public record UserDetailResponse(
    Long userId, String email, String fullName, String avatarUrl,
    String role, String status, List<PositionBriefResponse> positions,
    Instant createdAt, String phone, String deactiveType, Instant deactiveUntil
) {}

public record CreateUserRequest(
    @NotBlank @Email String email,
    @NotBlank String role,             # must be one of ADMIN, MANAGER, USER (validate in service)
    String fullName,
    Long careerId,
    Long departmentId,
    Long teamId,
    List<Long> positionIds
) {}

public record UpdateUserRequest(
    String fullName, String phone, String role,
    Long careerId, Long departmentId, Long teamId,
    List<Long> positionIds
) {}

public record DeactivateUserRequest(
    @NotBlank String action,           # "DEACTIVATE" or "DELETE"
    String deactiveType,
    Integer duration                   # days
) {}

public record UserFilterRequest(
    String keyword,
    String status,
    LocalDate dateModified,
    Long teamId,
    Integer page,                      # default 1
    Integer size                       # default 20
) {}

--- ENDPOINTS (controller/UserController.java) ---

@RestController @RequestMapping("/api/users") @RequiredArgsConstructor
public class UserController {
    private final UserService users;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<PageResponse<UserResponse>> list(UserFilterRequest filter) {
        return ApiResponse.ok(users.list(filter));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> create(@Valid @RequestBody CreateUserRequest req) {
        // Auto-generate 10-char random password (mixed case + digit).
        // Set mustChangePassword=true, status='ACTIVE'. Hash with passwordEncoder.
        // Save user. Call EmailService.send("ACCOUNT_CREATED", user.email, {"password": generated}).
        // Audit USER_CREATED.
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(users.create(req)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
    public ApiResponse<UserDetailResponse> get(@PathVariable Long id) {
        return ApiResponse.ok(users.get(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
    public ApiResponse<UserResponse> update(@PathVariable Long id,
                                            @Valid @RequestBody UpdateUserRequest req,
                                            @AuthenticationPrincipal User current) {
        # role / career changes only allowed if current.role == ADMIN — enforce in service
        return ApiResponse.ok(users.update(id, req, current));
    }

    @PostMapping("/{id}/deactivate-or-delete")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> deactivate(@PathVariable Long id,
                                        @Valid @RequestBody DeactivateUserRequest req,
                                        @AuthenticationPrincipal User current) {
        # Admin cannot deactivate/delete self → 400 if id == current.id
        users.deactivateOrDelete(id, req, current); return ApiResponse.ok(null);
    }

    @PostMapping("/{id}/reactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> reactivate(@PathVariable Long id) {
        users.reactivate(id); return ApiResponse.ok(null);
    }

    @GetMapping("/by-team/{teamId}")
    @PreAuthorize("hasRole('ADMIN') or @teamSecurity.isManagerOf(#teamId, authentication)")
    public ApiResponse<List<UserResponse>> byTeam(@PathVariable Long teamId) {
        return ApiResponse.ok(users.activeByTeam(teamId));
    }
}

@RestController @RequestMapping("/api/admin/users") @PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {
    @GetMapping("/{id}/activity")
    public ApiResponse<PageResponse<AuditLogResponse>> activity(@PathVariable Long id,
                                                                Pageable pageable) {
        # Paginated AuditLog entries where actorId = id, ordered createdAt DESC
    }
}

Use `@teamSecurity.isManagerOf(...)` as a Spring Security expression bean defined in
security/TeamSecurity.java for clean MANAGER-own-team checks.
```

## PHASE 2 — Skill Taxonomy & Teams (Sprint 2)

### STEP 2.1 — Backend: Skill Taxonomy ❌ Build from scratch

```
Feature groups: SKL-01
Tasks covered: Career CRUD · Department CRUD · Skillset CRUD + Excel import/export

Read SYSTEM.md in the .claude folder first, then do the following.

Build Career, Department, Skill, and Position modules. All files are new.

Files to create:
  controller/CareerController.java         service/CareerService.java
  controller/DepartmentController.java     service/DepartmentService.java
  controller/SkillController.java          service/SkillService.java
  controller/AdminPositionController.java  service/PositionService.java
  dto/request/{Career,Department,Skill,Position}Request.java
  dto/response/{Career,Department,Skill,Position}Response.java + DepartmentBriefResponse
  util/ExcelUtil.java                                   # Apache POI helpers

--- CAREER ENDPOINTS (controller/CareerController.java) ---

public record CareerRequest(
    @NotBlank String name,
    String careerType,
    String description
) {}

public record CareerResponse(
    Long careerId, String name, String careerType,
    String description, String status, int departmentsCount,
    List<DepartmentBriefResponse> departments,
    Instant createdAt
) {}

GET /api/careers                 → filter by keyword, status. PageResponse<CareerResponse>
POST /api/careers                → @PreAuthorize("hasRole('ADMIN')")
GET /api/careers/{id}            → with linked departments
PUT /api/careers/{id}            → ADMIN
DELETE /api/careers/{id}         → ADMIN. 409 if career has departments.
POST /api/careers/{id}/managers/{userId}      → ADMIN. Assign manager.
DELETE /api/careers/{id}/managers/{userId}    → ADMIN.

--- DEPARTMENT ENDPOINTS (controller/DepartmentController.java) ---

public record DepartmentRequest(
    @NotBlank String name,
    @NotNull Long careerId,
    String description
) {}

GET /api/departments?careerId=   → filterable, paginated
POST /api/departments            → ADMIN
GET /api/departments/{id}
PUT /api/departments/{id}        → ADMIN
DELETE /api/departments/{id}     → 409 if has skills
POST/DELETE /api/departments/{id}/managers/{userId}

--- SKILL ENDPOINTS (controller/SkillController.java) ---

public record SkillRequest(
    @NotBlank String name,
    String description,
    Long departmentId,
    Map<Integer,String> levelDescriptions,
    String status                                     # default "ACTIVE"
) {}

public record SkillResponse(
    Long skillId, String name, String description,
    Long departmentId, String departmentName, String careerName,
    Map<Integer,String> levelDescriptions,
    String status, Instant createdAt
) {}

GET /api/skills?departmentId=&careerId=&keyword=&status=   → paginated
GET /api/skills/all                                        → flat list, no pagination — any auth role
POST /api/skills                                           → ADMIN
GET /api/skills/{id}
PUT /api/skills/{id}                                       → ADMIN
DELETE /api/skills/{id}                                    → 409 if skill has assessments

--- IMPORT / EXPORT (util/ExcelUtil.java + SkillController) ---

POST /api/skills/import          → ADMIN. multipart/form-data (.xlsx)
  Expected columns:
    career_name, department_name, skillset_name, description,
    level_1, level_2, level_3, level_4, level_5
  Logic: per row, getOrCreate Career → getOrCreate Department → upsert Skill by name.
  Return summary { created, updated, skipped }.
  Use Apache POI XSSFWorkbook to parse:
    try (var fis = file.getInputStream(); var wb = new XSSFWorkbook(fis)) { ... }

GET /api/skills/export           → ADMIN.
  Build .xlsx with Apache POI, write to a ByteArrayOutputStream,
  return as ResponseEntity<byte[]> with:
    Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
    Content-Disposition: attachment; filename="skills.xlsx"

--- POSITION CRUD (controller/AdminPositionController.java) ---

public record PositionRequest(
    @NotBlank String name,
    List<Map<String,Object>> requiredSkills            # [{ "skillId": 1, "minLevel": 3 }]
) {}

@RestController @RequestMapping("/api/admin/positions") @PreAuthorize("hasRole('ADMIN')")
  GET    /api/admin/positions
  POST   /api/admin/positions
  PUT    /api/admin/positions/{id}
  DELETE /api/admin/positions/{id}
```

### STEP 2.2 — Backend: Team Management ❌ Build from scratch

```
Feature groups: TEM-01
Tasks covered: Team CRUD · Member management · View team list/details · Member profile/notes/logs

Read SYSTEM.md in the .claude folder first, then do the following.

Build Team and TeamMember modules. All files are new.

Files to create:
  controller/TeamController.java          service/TeamService.java
  controller/TeamMemberController.java    service/TeamMemberService.java
  dto/request/{Team,AddMemberByTeam,AddMemberByUser}Request.java
  dto/response/{Team,TeamMember}Response.java
  security/TeamSecurity.java                              # Spring Security expression bean

--- TEAM ENDPOINTS (controller/TeamController.java) ---

public record TeamRequest(
    @NotBlank String name,
    String description,
    Long departmentId
) {}

public record TeamResponse(
    Long teamId, String name, String description,
    Long departmentId, String departmentName,
    String status, int memberCount, Instant createdAt
) {}

GET /api/teams                       — ADMIN sees all; MANAGER sees own teams only. Paginated.
POST /api/teams                      — ADMIN, MANAGER. Create.
GET /api/teams/{id}                  — ADMIN or team's MANAGER.
PUT /api/teams/{id}                  — ADMIN or team's own MANAGER.
DELETE /api/teams/{id}               — ADMIN. Soft delete; set teamId=null for active members.
POST /api/teams/{id}/managers/{userId}    — assign manager
DELETE /api/teams/{id}/managers/{userId}  — remove manager

--- TEAM MEMBER ENDPOINTS (controller/TeamMemberController.java) ---

public record AddMemberByTeamRequest(
    @NotNull Long teamId,
    @NotBlank @Email String email,
    Long positionId
) {}

public record AddMemberByUserRequest(
    @NotNull Long userId,
    List<Map<String,Object>> assignments               # [{ "teamId": 1, "positionId": 2 }]
) {}

public record TeamMemberResponse(
    Long id, Long userId, String email, String fullName,
    Long teamId, String teamName,
    Long positionId, String positionName,
    String note, Instant joinedAt, Instant leftAt
) {}

GET    /api/team-members?teamId=&userId=    — paginated
POST   /api/team-members/by-user            — add user to one or more teams
        Before inserting: if user already has active record (leftAt IS NULL)
        in another team, set that record's leftAt = now() first.
POST   /api/team-members/by-team            — add member by email
        Look up user by email; if not found return 404.
PUT    /api/team-members/{id}               — update position only
DELETE /api/team-members/{id}               — set leftAt = now() (soft remove)

Member detail (on TeamController for clean RBAC at the team scope):
GET  /api/teams/{id}/members/{userId}
  Returns: full UserDetailResponse + assessment summary stub (empty list for now).
POST /api/teams/{id}/members/{userId}/notes
  Body: { "content": "..." }. Upsert note on TeamMember (replace, not append).
  Auth: MANAGER (own team), ADMIN.
GET  /api/teams/{id}/members/{userId}/logs
  Paginated AuditLog entries related to this user's team membership.
  Auth: MANAGER (own team), ADMIN.
```

### STEP 2.3 — Frontend: Skill Taxonomy Pages ❌ Missing — build from scratch

```
Feature groups: SKL-01
Tasks covered: Career CRUD · Department CRUD · Skillset CRUD + Excel import/export

Read SYSTEM.md in the .claude folder first, then do the following.

--- BUILD THESE (all new under app/(dashboard)/admin/taxonomy/) ---
Use TanStack Query. Use RHF + Zod for all forms. ADMIN only (layout guard from STEP 0.3).

app/(dashboard)/admin/taxonomy/page.tsx — Three-panel layout
  Left panel — Careers:
    useQuery ['careers'] → GET /api/careers (CareerFilterRequest body)
    Career cards: name, careerType, department count
    "Add Career" button → CareerFormModal
    Each card: Edit icon, Delete icon (with 409 guard: if has departments, toast error)
    Click career → sets selectedCareerId state → filters center panel

  Center panel — Departments (filtered by selectedCareerId):
    useQuery ['departments', selectedCareerId] → GET /api/departments?careerId=x
    Same card pattern. Click dept → sets selectedDeptId → filters right panel

  Right panel — Skills (filtered by selectedDeptId):
    useQuery ['skills', selectedDeptId] → GET /api/skills with departmentId filter
    Table: Name, Status badge, Actions (Edit, Delete)
    "Add Skill" → SkillFormModal
    Import button: file input (.xlsx) → POST /api/skills/import → toast summary
    Export button: GET /api/skills/export → trigger download

  CareerFormModal: fields name, careerType, description. POST/PUT /api/careers[/{id}]
  DepartmentFormModal: fields name, description, careerId (prefilled). POST/PUT /api/departments[/{id}]
  SkillFormModal: fields name, description, departmentId (prefilled), status,
    levelDescriptions — 5 rows (Level 1–5, text input each). POST/PUT /api/skills[/{id}]

All mutations use useMutation + invalidateQueries on success.
Add "Taxonomy" link to admin nav (ADMIN only).
```
### STEP 2.4 — Frontend: Team Management Pages ❌ Missing real implementation

```
Feature groups: TEM-01
Tasks covered: Team CRUD · Member management · View team list & details · View member profile, notes, change logs

Read SYSTEM.md in the .claude folder first, then do the following.

--- IMPLEMENT ---
Use TanStack Query. Use RHF + Zod for forms.
ADMIN sees all teams. MANAGER sees only their own. USER sees read-only.

app/(dashboard)/teams/page.tsx — Team List
  useQuery ['teams'] → GET /api/teams
  Cards: team name, department name, status badge, memberCount, createdAt
  ADMIN: "Create Team" button → CreateTeamModal
    Fields: name, description, departmentId (select from GET /api/departments)
    POST /api/teams, then POST /api/teams/{id}/managers/{userId} to assign manager
  Each card → link to /teams/[id]

app/(dashboard)/teams/[id]/page.tsx — Team Detail
  useQuery ['team', id] → GET /api/teams/{id}
  Header: name, department, status, memberCount
  Manager section: current manager name + "Change Manager" button
    → opens user search select → POST /api/teams/{id}/managers/{userId}
  Members table (useQuery ['team-members', teamId]):
    GET /api/team-members with teamId filter
    Columns: Avatar+Name, Position, Joined date, Actions
    "Add Member": POST /api/team-members/by-team { teamId, email, positionId }
    Edit position: PUT /api/team-members/{id} { positionId }
    Remove: DELETE /api/team-members/{id}
    Click row → opens MemberDetailDrawer

  MemberDetailDrawer (slide-over):
    Profile tab: name, email, positionName, avatar
    Notes tab: textarea. Save → POST /api/teams/{id}/members/{userId}/notes
      On load: GET /api/teams/{id}/members/{userId} to show existing note
    Logs tab: GET /api/teams/{id}/members/{userId}/logs → timeline

Replace OrgChart static data with real API data or leave OrgChart as a separate
view alongside the team list — do NOT delete the OrgChart component, just stop it
from being the only team view. Check with the team how they want to handle this.
```
### STEP 2.5 — Backend: AI-06 Auto-Generate Skill Taxonomy ❌ Build from scratch

```
Feature groups: AI-06
Tasks covered: Admin describes career/dept → AI suggests hierarchy · Admin reviews/imports · AI uses industry standards for levels

Read SYSTEM.md in the .claude folder first, then do the following.

Build AI-06. All files are new. Uses Spring WebClient (or RestClient) to call Anthropic Claude.

Files to create:
  controller/AiController.java                # will grow with more AI endpoints in later steps
  service/AiService.java
  service/ClaudeClient.java                   # thin wrapper around WebClient
  dto/request/GenerateTaxonomyRequest.java
  dto/request/ImportTaxonomyRequest.java
  dto/response/TaxonomyResponse.java
  dto/response/ImportTaxonomyResult.java

--- WEBCLIENT BEAN (config/WebClientConfig.java) ---

@Configuration
public class WebClientConfig {
    @Bean
    public WebClient anthropicClient(AppProperties props) {
        return WebClient.builder()
            .baseUrl(props.getAnthropic().getBaseUrl())
            .defaultHeader("x-api-key", props.getAnthropic().getApiKey())
            .defaultHeader("anthropic-version", "2023-06-01")
            .defaultHeader("content-type", "application/json")
            .build();
    }
}

--- DTOs ---

public record GenerateTaxonomyRequest(@NotBlank String description) {}

public record SkillsetSuggestion(String name, Map<Integer,String> levelDescriptions) {}
public record DepartmentSuggestion(String name, List<SkillsetSuggestion> skillsets) {}
public record TaxonomyResponse(
    Map<String,String> career,                                 # { name, description }
    List<DepartmentSuggestion> departments
) {}

public record ImportTaxonomyRequest(
    Map<String,String> career,
    List<Map<String,Object>> departments
) {}

public record ImportTaxonomyResult(
    int createdCareers, int createdDepartments,
    int createdSkills, int skippedExisting
) {}

--- ENDPOINTS (controller/AiController.java) ---

@RestController @RequestMapping("/api/ai") @RequiredArgsConstructor
public class AiController {
    private final AiService ai;

    @PostMapping("/generate-taxonomy")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<TaxonomyResponse> generate(@Valid @RequestBody GenerateTaxonomyRequest req) {
        return ApiResponse.ok(ai.generateTaxonomy(req.description()));
    }

    @PostMapping("/generate-taxonomy/import")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<ImportTaxonomyResult> importTaxonomy(@RequestBody ImportTaxonomyRequest req) {
        return ApiResponse.ok(ai.importTaxonomy(req));
    }
}

--- AiService.generateTaxonomy(description) ---

POST to https://api.anthropic.com/v1/messages with body:
  {
    "model": "claude-sonnet-4-20250514",
    "max_tokens": 2000,
    "system": "You are a skills taxonomy expert. Return ONLY valid JSON, no markdown, no explanation.",
    "messages": [{ "role": "user", "content": <prompt> }]
  }

Prompt template:
  "Generate a skill taxonomy for: {description}.
   Return JSON in this exact format:
   { \"career\": { \"name\": \"...\", \"description\": \"...\" },
     \"departments\": [{ \"name\": \"...\", \"skillsets\":
       [{ \"name\": \"...\", \"levelDescriptions\":
          { \"1\": \"...\", \"2\": \"...\", \"3\": \"...\", \"4\": \"...\", \"5\": \"...\" }
       }] }] }"

Parse JSON from response.content[0].text using Jackson ObjectMapper.
Wrap WebClient calls in try/catch:
  - WebClientResponseException → throw ApiException(503, "AI service unavailable").
  - JsonProcessingException → throw ApiException(502, "AI returned invalid JSON").

AiService.importTaxonomy(req):
  Reuse CareerService, DepartmentService, SkillService (getOrCreate by name).
  Wrap in @Transactional so all upserts succeed or roll back together.
```

### STEP 2.6 — Frontend: AI-06 Taxonomy Generator UI ❌ Missing — build from scratch

```
Feature groups: AI-06
Tasks covered: Admin describes career/dept → AI suggests full skill hierarchy · Admin reviews, edits, bulk-imports

Read SYSTEM.md in the .claude folder first, then do the following.

--- BUILD THIS ---
Add a "✨ Generate with AI" button to the app/(dashboard)/admin/taxonomy/page.tsx header.
Opens a 3-step modal (use existing modal/dialog components if available):

Step 1 — Input:
  Textarea: "Describe the career or department"
  Placeholder: "e.g. A backend dev team using Java and microservices"
  "Generate" → useMutation → POST /api/ai/generate-taxonomy { description }
  Loading state: "AI is generating your taxonomy..."
  On success: advance to Step 2 with the response JSON.

Step 2 — Review & Edit:
  Render the returned JSON as an editable tree:
    Career name (text input at top)
    Departments as collapsible accordion sections (editable names)
    Skills listed under each department (editable names)
    Click any skill → expand inline to edit 5 level description fields
  Add Department button, Add Skill per department button, delete icons on each node.
  "Import to system" button → Step 3.

Step 3 — Import:
  useMutation → POST /api/ai/generate-taxonomy/import with the (possibly edited) JSON
  Show result toast: "Created X careers, Y departments, Z skills. N skipped."
  Close modal. Invalidate all taxonomy queries to refresh panels.
```
## PHASE 3 — Skill Assessment + ★ AI-01 Resource Matching (Sprint 3)

### STEP 3.1 — Backend: Skill Assessment Module ❌ Build from scratch

```
Feature groups: SKL-01
Tasks covered: Self-assessment (rate 1–5) · Manager review & modify entries · Assessment change log + export

Read SYSTEM.md in the .claude folder first, then do the following.

All files are new — build from scratch. Do not look for existing code.

No assessment feature exists. Add from scratch. Follow Sections 6.5-6.8.

--- DB CHANGES REQUIRED ---
Create Flyway migration src/main/resources/db/migration/V6__assessments.sql:

  CREATE TABLE IF NOT EXISTS skill_assessments (
    id                BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id           BIGINT NOT NULL,
    skill_id          BIGINT NOT NULL,
    self_score        INT CHECK (self_score BETWEEN 1 AND 5),
    manager_score     INT CHECK (manager_score BETWEEN 1 AND 5),
    self_note         TEXT,
    manager_note      TEXT,
    assessed_by       BIGINT,
    assessed_at       DATETIME,
    assessment_ai_log JSON,
    created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_skill (user_id, skill_id),
    CONSTRAINT fk_sa_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_sa_skill FOREIGN KEY (skill_id) REFERENCES skills(id),
    CONSTRAINT fk_sa_assessor FOREIGN KEY (assessed_by) REFERENCES users(id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

  CREATE TABLE IF NOT EXISTS assessment_logs (
    id             BIGINT PRIMARY KEY AUTO_INCREMENT,
    assessment_id  BIGINT NOT NULL,
    changed_by     BIGINT NOT NULL,
    field_changed  VARCHAR(100) NOT NULL,
    old_value      VARCHAR(255),
    new_value      VARCHAR(255),
    changed_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_al_assessment FOREIGN KEY (assessment_id) REFERENCES skill_assessments(id),
    CONSTRAINT fk_al_user FOREIGN KEY (changed_by) REFERENCES users(id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

  CREATE INDEX idx_sa_user_id ON skill_assessments(user_id);
  CREATE INDEX idx_sa_skill_id ON skill_assessments(skill_id);

--- ADD NEW CODE ---

SkillAssessmentController at /api/assessments:

POST /api/assessments (any authenticated role — self only)
  Request: { skillId: Long, selfScore: int, selfNote: String }
  Upsert: if record exists for (userId, skillId) → update + log to assessment_logs.
  Else → insert new record.

GET /api/assessments/my → all assessments for current user with skill details.

GET /api/assessments/user/{userId}
  Auth: MANAGER (userId must be in manager's team), ADMIN.

PUT /api/assessments/{id}/manager-review
  Auth: MANAGER (assessed user in their team), ADMIN.
  Request: { managerScore: int, managerNote: String }
  Update fields. Log to assessment_logs. Log to audit_logs.
  Call NotificationService stub: log.info("ASSESSMENT_REVIEWED: userId={}, skill={}", ...).

GET /api/assessments/{id}/logs → AssessmentLog entries for this id, created_at DESC, paginated.
  Auth: assessment owner, their manager, admin.

GET /api/assessments/export
  Scoped: USER=own, MANAGER=team, ADMIN=all.
  Build .xlsx with Apache POI: employee_name, skill_name, department_name, career_name,
  self_score, manager_score, assessed_at.
  Return as ResponseEntity<byte[]> with Content-Disposition: attachment.

GET /api/profile/assessment-history → current user's assessments, updatedAt DESC.
```

---

### STEP 3.2 — Backend: Project CRUD + Skill Requirements ❌ Build from scratch

```
Feature groups: PRJ-01
Tasks covered: Project CRUD (name, dates, customer, status lifecycle) · Define required skills per project

Read SYSTEM.md in the .claude folder first, then do the following.

All files are new — build from scratch. Do not look for existing code.

No project feature exists. Add from scratch. Follow Sections 9.1-9.2.

--- DB CHANGES REQUIRED ---
Create Flyway migration V7__projects.sql:

  CREATE TABLE IF NOT EXISTS projects (
    id           BIGINT PRIMARY KEY AUTO_INCREMENT,
    name         VARCHAR(255) NOT NULL,
    description  TEXT,
    customer     VARCHAR(255),
    start_date   DATE,
    end_date     DATE,
    status       VARCHAR(50) NOT NULL DEFAULT 'PLANNING'
                   CHECK (status IN ('PLANNING','ACTIVE','CLOSED','ARCHIVED')),
    created_by   BIGINT,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at   DATETIME,
    CONSTRAINT fk_proj_creator FOREIGN KEY (created_by) REFERENCES users(id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

  CREATE TABLE IF NOT EXISTS project_skill_requirements (
    id           BIGINT PRIMARY KEY AUTO_INCREMENT,
    project_id   BIGINT NOT NULL,
    skill_id     BIGINT NOT NULL,
    min_level    INT NOT NULL CHECK (min_level BETWEEN 1 AND 5),
    is_required  TINYINT(1) NOT NULL DEFAULT 1,
    UNIQUE KEY uk_proj_skill (project_id, skill_id),
    CONSTRAINT fk_psr_proj FOREIGN KEY (project_id) REFERENCES projects(id),
    CONSTRAINT fk_psr_skill FOREIGN KEY (skill_id) REFERENCES skills(id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

  CREATE TABLE IF NOT EXISTS project_members (
    id           BIGINT PRIMARY KEY AUTO_INCREMENT,
    project_id   BIGINT NOT NULL,
    user_id      BIGINT NOT NULL,
    project_role VARCHAR(255),
    join_date    DATE,
    out_date     DATE,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pm_proj FOREIGN KEY (project_id) REFERENCES projects(id),
    CONSTRAINT fk_pm_user FOREIGN KEY (user_id) REFERENCES users(id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

  CREATE INDEX idx_projects_status ON projects(status);
  CREATE INDEX idx_pm_project_id ON project_members(project_id);
  CREATE INDEX idx_pm_user_id ON project_members(user_id);

--- ADD NEW CODE ---

ProjectController at /api/projects:

GET  /api/projects (ADMIN: all; MANAGER: own projects). Filter: keyword, status. Paginated.
POST /api/projects { name, description, customer, startDate, endDate }. Default status: PLANNING.
GET  /api/projects/{id}
PUT  /api/projects/{id}
PATCH /api/projects/{id}/status { status }
  Forward-only lifecycle: PLANNING→ACTIVE→CLOSED→ARCHIVED.
  Throw ApiException(400) if trying to go backward.
DELETE /api/projects/{id} (ADMIN only) — soft delete (set deleted_at).

Skill requirements:
GET    /api/projects/{id}/skills
POST   /api/projects/{id}/skills { skillId, minLevel, isRequired }
PUT    /api/projects/{id}/skills/{skillId}
DELETE /api/projects/{id}/skills/{skillId}

Staff endpoints:
GET /api/my-projects → projects where current user is in project_members (out_date IS NULL).
GET /api/projects/{id}/members → list of project_members with user details.
  Auth: any project member, MANAGER, ADMIN.
```

---

### STEP 3.3 — Backend: ★ AI-01 Smart Resource Matching ❌ Build from scratch

```
Feature groups: AI-01 ⭐ PRIORITY
Tasks covered: AI scoring engine (match % algorithm) · Ranked candidate list UI · Skill gap highlight · One-click allocate · Admin cross-team view

Read SYSTEM.md in the .claude folder first, then do the following.

All files are new — build from scratch. Do not look for existing code.

★ PRIORITY FEATURE. Follow Section 12 of SYSTEM.md exactly.
Requires skill_assessments (STEP 3.1) and project_skill_requirements (STEP 3.2) to exist.
Add to the existing AiController at /api/ai.

--- NO DB CHANGES REQUIRED ---

POST /api/ai/resource-match
  Auth: MANAGER (results scoped to own team), ADMIN (pass teamId or omit for all teams)
  Request: { projectId: Long, teamId: Long (optional, ADMIN only) }

  a) Fetch all ProjectSkillRequirement for projectId.
     If empty: throw ApiException(400, "This project has no skill requirements defined.").

  b) Build candidate pool:
     MANAGER → users with active TeamMember (leftAt IS NULL) in manager's team.
     ADMIN + teamId → same for specified team.
     ADMIN without teamId → all users where status = 'ACTIVE'.

  c) For each candidate, compute (do this in a single SQL with a JdbcTemplate query
     OR a JPQL query that loads all needed data, NOT N+1 in a loop):

     For each required skill:
       effectiveLevel = COALESCE(sa.manager_score, sa.self_score, 0)
       (LEFT JOIN skill_assessments sa ON sa.user_id=candidate AND sa.skill_id=req.skillId)
     matchScore = SUM(LEAST(effectiveLevel, req.minLevel)) / SUM(req.minLevel) * 100
     matchedSkills = requirements where effectiveLevel >= minLevel
     missingSkills = requirements where effectiveLevel < minLevel
     currentProjectCount = COUNT(project_members) WHERE user_id=candidate AND out_date IS NULL

  d) Sort by matchScore DESC.

  Response per candidate:
  {
    userId, fullName, userAvatar,
    positionName: String (user's first position name, or null),
    teamName: String,
    matchScore: Double (round to 1 decimal),
    matchedSkills: [{ skillId, skillName, userLevel, requiredLevel }],
    missingSkills:  [{ skillId, skillName, userLevel, requiredLevel }],
    currentProjectCount: Integer
  }

  NOTE: this endpoint does NOT call the Claude API. Pure JPA/JDBC + Java logic.

POST /api/ai/resource-match/allocate
  Auth: MANAGER (own team only), ADMIN
  Request: { projectId: Long, userId: Long, projectRole: String, joinDate: LocalDate }
  Verify project is not CLOSED or ARCHIVED → throw ApiException(400) if so.
  Verify MANAGER is allocating from their own team → throw AccessDeniedException if not.
  Insert into project_members. Return created record with user details.
```

---

### STEP 3.4 — Frontend: Skill Assessment Pages ⚠️ UI scaffold exists — wire to API

```
Feature groups: SKL-01 · AUT-01
Tasks covered: SKL-01: Self-assessment · Manager review | AUT-01: Assessment history log

Read SYSTEM.md in the .claude folder first, then do the following.


--- IMPLEMENT ---

1. Find the existing assessment form component.
   Replace the mock data submission with a real useMutation:
   POST /api/assessments { skillId, selfScore, selfNote }
   Replace mock skill list with useQuery → GET /api/skills/all (returns flat list).
   Replace static rating display with data from GET /api/admin/config/rating-scale.
   On success: invalidate ['assessments','my'] query.

2. My Skills page (app/(dashboard)/assessments/page.tsx):
   useQuery ['assessments','my'] → GET /api/assessments/my
   If page already exists with mock data, replace mock data with this query.
   Cards: skillName, departmentName, selfScore (star display), managerScore badge (if set),
     assessedAt, Edit button.
   "Add Skill" / "Assess Skill" button → assessment form (wired in point 1 above).
   Add AI-05 "Ask AI" button next to each unrated skill → opens AI chat drawer (STEP 5.6).

3. Team Assessment Review page (app/(dashboard)/team/assessments/page.tsx) — NEW:
   useQuery ['assessments','team'] → GET /api/assessments/user/{userId} per member
   Or better: fetch by team using GET /api/users/by-team/{teamId} then assessments per user.
   Table: member name, skill, selfScore, managerScore, updated, Actions.
   Filter by member, skill, score range (client-side filter on cached data).
   "Review" action → ReviewModal:
     Shows selfScore (read-only), managerScore input, managerNote input.
     useMutation → PUT /api/assessments/{id}/manager-review
   "History" → GET /api/assessments/{id}/logs → timeline modal.
   "Export" button → GET /api/assessments/export → download .xlsx.
   Visible to MANAGER and ADMIN only (RoleGuard).

4. Add assessment history to /profile page:
   Find the existing ProfileView or profile page.
   Add "Assessment History" tab with useQuery → GET /api/profile/assessment-history.
   Table: skillName, selfScore, managerScore, assessedAt.
```
### STEP 3.5 — Frontend: Projects + ★ AI-01 Resource Matching UI ❌ Missing — build from scratch

```
Feature groups: PRJ-01 · AI-01 ⭐ PRIORITY
Tasks covered: PRJ-01: Project CRUD · Required skills | AI-01: Ranked candidates · Skill gap highlight · One-click allocate · Admin cross-team view

Read SYSTEM.md in the .claude folder first, then do the following.

--- IMPLEMENT ---

app/(dashboard)/projects/page.tsx — Project List
  useQuery ['projects'] → GET /api/projects
  Cards: name, customer, status badge, memberCount (from project detail), date range.
  Status badge colors: PLANNING=gray, ACTIVE=blue, CLOSED=amber, ARCHIVED=red.
  "New Project" button → CreateProjectModal (RHF + Zod):
    Fields: name (required), customer, description, startDate, endDate
    POST /api/projects. On success: navigate to /projects/[id].
  USER sees read-only /my-projects instead (useQuery → GET /api/my-projects).

app/(dashboard)/projects/[id]/page.tsx — Project Detail with 3 tabs:

Tab "Required Skills":
  useQuery ['project',id,'skills'] → GET /api/projects/{id}/skills
  List: skillName, minLevel badge, isRequired toggle, delete button.
  "Add Skill" → skill search select (GET /api/skills/all) + minLevel 1-5 + isRequired toggle.
  POST /api/projects/{id}/skills. DELETE /api/projects/{id}/skills/{skillId}.

Tab "Members":
  useQuery ['project',id,'members'] → GET /api/projects/{id}/members
  Table: avatar+name, projectRole, joinDate, outDate, "Release" button.
  "Add Member" button → navigate to or open AI Match tab.
  Release: DELETE /api/projects/{id}/members/{userId} (sets outDate=today).

★ Tab "AI Match" (priority — must be fully functional):
  If no skills defined: callout "Define required skills first."
  "Find Matches" → useMutation → POST /api/ai/resource-match { projectId }
  Loading: "Scanning team members..."
  Results: ranked candidate cards.
    Each card: rank number, avatar+name, position, teamName,
    matchScore as large colored percentage (green ≥80%, amber ≥50%, red <50%),
    matchedSkills as green pill badges, missingSkills as red pill badges,
    currentProjectCount badge.
  "Allocate" button per card → inline form: projectRole (text) + joinDate (date picker).
    useMutation → POST /api/ai/resource-match/allocate { projectId, userId, projectRole, joinDate }
    On success: invalidate ['project',id,'members'], switch to Members tab, show toast.

Status change: dropdown on project detail header.
  PATCH /api/projects/{id}/status. Show disabled options for invalid transitions.

Refactor or remove the existing Job Brief mock page once this is working.
```
## PHASE 4 — Dashboard, Reporting & Gap Analysis (Sprint 4)

### STEP 4.1 — Backend: Profile + Personal Dashboard ❌ Build from scratch

```
Feature groups: AUT-01 · DSH-01
Tasks covered: AUT-01: Profile update/avatar · General settings · Team info | DSH-01: Personal radar chart dashboard, top/focus skills, to-do widget

Read SYSTEM.md in the .claude folder first, then do the following.

All files are new — build from scratch. Do not look for existing code.

Current code has GET/PUT /api/users/{id} but no /api/profile endpoints.
Add profile and personal dashboard. Follow Sections 4.5-4.9 and 10.1.

--- DB CHANGES REQUIRED ---
Create Flyway migration V8__profile_settings.sql:
  ALTER TABLE users
    ADD COLUMN phone VARCHAR(50),
    ADD COLUMN notification_email TINYINT(1) DEFAULT 1,
    ADD COLUMN language VARCHAR(10) DEFAULT 'vi';

(MySQL/TiDB note: `ADD COLUMN IF NOT EXISTS` is not supported on all TiDB versions —
use a baseline check in Flyway, or simply ensure this migration runs only once.)

--- ADD NEW CODE ---

ProfileController at /api/profile (any authenticated role):
  GET /api/profile → own user record (same as GET /api/users/{id} for self).
  PUT /api/profile { fullName, phone } (email/role/positions NOT editable here).
  POST /api/profile/avatar
    Use @RequestParam("file") MultipartFile.
    Validate: jpg/png/webp, max 2 MB.
    Store under app.storage.avatars (local) — replace with S3 / object storage in prod.
    Update users.avatar_url. Delete old file.
  GET/PUT /api/profile/settings → { notificationEmail: boolean, language: String }
  GET /api/profile/assessment-history → own assessments ordered by updatedAt DESC.
  GET /api/profile/team → { teamId, teamName, managerName, managerAvatar,
    teammates: [{ userId, fullName, avatarUrl, topSkills: [{ skillName, selfScore }] }] }
    topSkills = top 3 skills by selfScore DESC.

DashboardController at /api/dashboard:
  GET /api/dashboard/personal
  Returns:
    radarChartData: [{ skillName, departmentName, selfScore, managerScore }]
    topSkills: top 5 by COALESCE(managerScore, selfScore) DESC with skillName + score.
    focusSkills: skills where effectiveScore <= 2.
    todoReminders: {
      incompleteDocuments: [] (empty list if document_assignments not yet created),
      pendingGoals: [] (empty list if development_goals not yet created)
    }
```

---

### STEP 4.2 — Backend: Team Dashboard & Exports ❌ Build from scratch

```
Feature groups: DSH-01
Tasks covered: Team skill matrix grid · Export individual profile PDF · Export team matrix Excel/CSV

Read SYSTEM.md in the .claude folder first, then do the following.

All files are new — build from scratch. Do not look for existing code.

Add team matrix and exports. Follow Sections 10.2-10.5. No existing endpoints to modify.

--- NO DB CHANGES REQUIRED ---

Add to DashboardController:

GET /api/dashboard/team-matrix (ADMIN, MANAGER)
  Query: teamId (ADMIN required; MANAGER auto-uses own team), skillId, minLevel, memberName.
  Returns:
    members: [{ userId, fullName, avatarUrl, positionName }]
    skills:  [{ skillId, skillName, departmentName }]
    scores:  [{ userId, skillId, selfScore, managerScore }]
    skillCoverage: [{ skillId, coveragePercent }]
      (% of members with managerScore >= 3; fallback selfScore if managerScore null)

GET /api/dashboard/completion-rate (ADMIN, MANAGER)
  Query: teamId.
  Returns empty list if document_assignments table not yet created.
  Otherwise: [{ userId, fullName, assignedCount, completedCount, completionPercent }],
             teamAveragePercent.

ExportController at /api/export:

GET /api/export/profile/pdf?userId= (any role for own; MANAGER/ADMIN for others)
  Use OpenPDF (com.github.librepdf:openpdf) to build the PDF:
    new Document(PageSize.A4), PdfWriter.getInstance(doc, outputStream), doc.open()
    Add: name, position(s), team, assessment table (skill, dept, selfScore, managerScore, date),
         top 5 skills list.
  Return ResponseEntity<byte[]> with
    Content-Disposition: attachment; filename="profile_{fullName}.pdf"
    Content-Type: application/pdf

GET /api/export/team-matrix?teamId=&format=xlsx|csv (ADMIN, MANAGER)
  Rows = team members, columns = skills (fetched from team matrix data).
  Cell = "{selfScore}/{managerScore}" or "—/—" if no scores.
  xlsx: Apache POI XSSFWorkbook. csv: java.io.PrintWriter + RFC 4180 quoting.
  Return as file attachment.
```

---

### STEP 4.3 — Frontend: Dashboard Pages ⚠️ UI scaffolds exist — replace mock data with real API

```
Feature groups: AUT-01 · DSH-01
Tasks covered: AUT-01: Profile page (edit, avatar, settings, team info) | DSH-01: Personal dashboard · Team skill matrix · Exports

Read SYSTEM.md in the .claude folder first, then do the following.


--- WHAT IS MISSING / NEEDS WIRING ---

1. Personal Dashboard — replace ALL mock data:
   useQuery ['dashboard','personal'] → GET /api/dashboard/personal
   Wire radar chart (find existing chart component) with radarChartData from response.
   Wire Top Skills list with topSkills from response.
   Wire Focus Skills list with focusSkills from response.
   Wire To-Do card with todoReminders.incompleteDocuments and todoReminders.pendingGoals.
   KPI cards: count of assessments, top skill score, goals count, docs completion%.
   If the existing chart library is NOT Recharts, check STEP 0.3 — install Recharts
   only if the existing chart is a stub. If a chart already works, keep it.

2. Team Skill Matrix — replace mock data on HeatmapGrid:
   useQuery ['dashboard','team-matrix', filters] → GET /api/dashboard/team-matrix
   Wire HeatmapGrid with real members[], skills[], scores[] from response.
   Wire skill coverage row at bottom with skillCoverage[].
   Connect the filter bar (member search, skill filter, minLevel filter) to query params —
   currently filters don't work. Make each filter update the query.
   Fix the Export button: GET /api/export/team-matrix?teamId=&format=xlsx → trigger file download.

3. Profile page — wire PUT and add tabs:
   Find the existing ProfileView. The "Edit Profile" button is currently a stub.
   Wire it: PUT /api/users/{id} { fullName, phone } using useMutation.
   Add avatar upload: POST /api/profile/avatar (multipart). Show initials as fallback.
   Add "Assessment History" tab (GET /api/profile/assessment-history) if not added in STEP 3.4.
   Add "Team" tab (GET /api/profile/team): team name, manager, teammates' top skills.
   Add "Settings" tab: wire notification toggle + language select to
     GET/PUT /api/profile/settings (currently local state only — persist to API).
   "Export My Profile (PDF)" button → GET /api/export/profile/pdf → file download.
```
### STEP 4.4 — Backend: AI-02 Skill Gap Analysis ❌ Build from scratch

```
Feature groups: AI-02
Tasks covered: Auto-compare employee vs position required skills · Prioritised gap report per employee · Team-wide gap analysis · Trigger from dashboard/profile

Read SYSTEM.md in the .claude folder first, then do the following.

All files are new — build from scratch. Do not look for existing code.

Add AI-02. No Claude API needed — pure DB computation. Follow Section 13.
Add to AiController at /api/ai.

--- NO DB CHANGES REQUIRED ---

GET /api/ai/gap-analysis/user/{userId}
  Auth: own user, MANAGER (userId in their team), ADMIN.
  a) Fetch user → get their positions[] → use first position with required_skills.
  b) Load position.requiredSkills JSON: List<Map<String,Object>> → each entry has skillId, minLevel.
  c) If empty: return { gaps: [], note: "No position requirements defined." }
  d) For each required skill:
     Fetch skill_assessments where user_id=userId AND skill_id=req.skillId.
     effectiveScore = managerScore ?? selfScore ?? 0.
     gap = minLevel - effectiveScore.
     priority: HIGH if gap>=2, MEDIUM if gap==1, LOW if gap<=0.
  e) Sort: HIGH → MEDIUM → LOW.
  Returns: { userId, fullName, positionName,
    gaps: [{ skillId, skillName, departmentName, requiredLevel, currentLevel, gap, priority }] }

GET /api/ai/gap-analysis/team/{teamId}
  Auth: MANAGER (own team), ADMIN.
  Run individual gap analysis for each active team member (leftAt IS NULL).
  Aggregate per skill: belowCount (gap > 0), totalMembers, averageGap.
  Sort by averageGap DESC.
  Returns: [{ skillId, skillName, belowCount, totalMembers, averageGap }]
```

---

### STEP 4.5 — Frontend: Skill Gap Analysis UI ⚠️ UI scaffold exists — replace hardcoded data

```
Feature groups: AI-02
Tasks covered: Auto-compare profile vs position · Prioritised gap report · Team-wide gap analysis · Trigger from dashboard/profile

Read SYSTEM.md in the .claude folder first, then do the following.


--- IMPLEMENT ---

1. Find the existing Skill Gap tab in the AI page.
   Replace hardcoded gapSkills with:
   useQuery ['gap-analysis','user',currentUserId] → GET /api/ai/gap-analysis/user/{userId}
   Wire the existing UI elements to the real response fields:
     skillName, requiredLevel, currentLevel, gap, priority.
   If no position is set: show "Set your job position in Profile to see your skill gaps."
   Group by priority: HIGH (red), MEDIUM (amber), LOW (green) — replace any hardcoded colors.

2. Add "My Gap Analysis" section to personal dashboard page (from STEP 4.3) if not already there.
   Compact list view: skill name + priority badge + gap number.

3. Add "Gap Analysis" tab to Team Detail page /teams/[id] (from STEP 2.4):
   "Run Analysis" button → useQuery ['gap-analysis','team',teamId]
     → GET /api/ai/gap-analysis/team/{teamId}
   Render as a horizontal bar chart (Recharts BarChart):
     Y-axis = skill names, X-axis = averageGap (0–5)
     Red if averageGap > 1.5, amber 0.5–1.5, green < 0.5.
   Table below: skillName, belowCount/totalMembers, averageGap.

4. Add gap analysis drawer to Team Assessments page /team/assessments (from STEP 3.4):
   Per-member "View Gap" button → GET /api/ai/gap-analysis/user/{userId}
   Show in a slide-over with the individual gap list.
```
## PHASE 5 — Learning, Documents & Remaining AI (Sprint 5)

### STEP 5.1 — Backend: Documents & Assignments ❌ Build from scratch

```
Feature groups: SKL-02
Tasks covered: Document library CRUD (PDF/link/video, tag to skill) · Assign docs to staff/team + deadline · My Upskill page · Team learning dashboard

Read SYSTEM.md in the .claude folder first, then do the following.

All files are new — build from scratch. Do not look for existing code.

No document feature exists. Add from scratch. Follow Section 7.

--- DB CHANGES REQUIRED ---
Create Flyway migration V9__documents.sql:

  CREATE TABLE IF NOT EXISTS documents (
    id                  BIGINT PRIMARY KEY AUTO_INCREMENT,
    title               VARCHAR(500) NOT NULL,
    description         TEXT,
    type                VARCHAR(50) CHECK (type IN ('PDF','LINK','VIDEO')),
    url                 VARCHAR(2000),
    file_path           VARCHAR(1000),
    skillset_tags       JSON,                                  -- list of skill ids
    ai_tag_suggestions  JSON,
    created_by          BIGINT,
    created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at          DATETIME,
    CONSTRAINT fk_doc_creator FOREIGN KEY (created_by) REFERENCES users(id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

  CREATE TABLE IF NOT EXISTS document_assignments (
    id                    BIGINT PRIMARY KEY AUTO_INCREMENT,
    document_id           BIGINT NOT NULL,
    assigned_to_user_id   BIGINT,
    assigned_to_team_id   BIGINT,
    deadline              DATE,
    status                VARCHAR(50) DEFAULT 'NOT_STARTED'
                            CHECK (status IN ('NOT_STARTED','IN_PROGRESS','COMPLETED','CANCELLED')),
    assigned_by           BIGINT,
    assigned_at           DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at          DATETIME,
    CONSTRAINT fk_da_doc FOREIGN KEY (document_id) REFERENCES documents(id),
    CONSTRAINT fk_da_user FOREIGN KEY (assigned_to_user_id) REFERENCES users(id),
    CONSTRAINT fk_da_team FOREIGN KEY (assigned_to_team_id) REFERENCES teams(id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  CREATE INDEX idx_da_user_id ON document_assignments(assigned_to_user_id);

--- ADD NEW CODE ---

DocumentController at /api/documents:
  GET  /api/documents → paginated; filter: type, skillId (in skillset_tags), keyword.
  GET  /api/documents/{id}
  POST /api/documents { title, description, type, url, skillsetTags: Long[] } (ADMIN, MANAGER)
  PUT  /api/documents/{id} (ADMIN or creator)
  DELETE /api/documents/{id} → soft delete (ADMIN or creator)
  POST /api/documents/upload → @RequestParam("file") MultipartFile, max 20 MB PDF.
    Store under app.storage.documents, return { filePath, url }.
    After saving: trigger AI-04 extraction async (stub: log.info for now; implement in STEP 5.4).
  POST /api/documents/{id}/assign { userId: Long, deadline (optional) }
    MANAGER can only assign to own team members. Create DocumentAssignment + send stub notification.
  POST /api/documents/{id}/assign-team { teamId: Long, deadline (optional) }
    Create one DocumentAssignment per active team member.

My Upskill endpoints (any authenticated role):
  GET    /api/my-upskill → own assignments grouped: pending + completed.
  PATCH  /api/my-upskill/{assignmentId}/status { status: 'IN_PROGRESS'|'COMPLETED' }
    On COMPLETED: set completedAt = now().

Team progress (MANAGER, ADMIN):
  GET  /api/team/learning-progress?teamId=
  POST /api/team/learning-progress/remind { teamId, documentId? }
    Send LEARNING_REMINDER email/notification. Log to audit_logs.
```

---

### STEP 5.2 — Backend: Development Goals ❌ Build from scratch

```
Feature groups: SKL-01
Tasks covered: Development goal (create, track, mark complete) · Manager suggest goals for staff

Read SYSTEM.md in the .claude folder first, then do the following.

All files are new — build from scratch. Do not look for existing code.

No goals feature exists. Add from scratch. Follow Sections 6.9-6.10.

--- DB CHANGES REQUIRED ---
Create Flyway migration V10__goals.sql:

  CREATE TABLE IF NOT EXISTS development_goals (
    id            BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id       BIGINT NOT NULL,
    skill_id      BIGINT NOT NULL,
    target_level  INT NOT NULL CHECK (target_level BETWEEN 1 AND 5),
    current_level INT CHECK (current_level BETWEEN 1 AND 5),
    note          TEXT,
    suggested_by  BIGINT,
    status        VARCHAR(50) DEFAULT 'IN_PROGRESS'
                    CHECK (status IN ('IN_PROGRESS','COMPLETED','CANCELLED')),
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at  DATETIME,
    CONSTRAINT fk_dg_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_dg_skill FOREIGN KEY (skill_id) REFERENCES skills(id),
    CONSTRAINT fk_dg_suggester FOREIGN KEY (suggested_by) REFERENCES users(id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--- ADD NEW CODE ---

GoalController at /api/goals:
  GET  /api/goals → own goals with skill details.
  POST /api/goals { skillId, targetLevel, note } → create with status=IN_PROGRESS.
  PUT  /api/goals/{id} { note, targetLevel } (owner only, status must be IN_PROGRESS).
  PATCH /api/goals/{id}/complete
    Set status=COMPLETED, completedAt=now().
    Upsert SkillAssessment: set selfScore = targetLevel for this user+skill.
    (Business Rule 15 from SYSTEM.md)
  POST /api/goals/suggest { userId, skillId, targetLevel, note } (MANAGER own team, ADMIN)
    Set suggestedBy = current user. Send GOAL_SUGGESTED notification stub.
  PATCH /api/goals/{id}/accept → user accepts (keep IN_PROGRESS status).
  PATCH /api/goals/{id}/reject → status = CANCELLED.
  GET  /api/goals/team/{teamId} (MANAGER own team, ADMIN) → all IN_PROGRESS goals for team.
```

---

### STEP 5.3 — Backend: Project Resource Allocation ❌ Build from scratch

```
Feature groups: PRJ-01
Tasks covered: Resource allocation (assign staff, role, join/out dates, release) · Staff view (own projects, teammates, dashboard)

Read SYSTEM.md in the .claude folder first, then do the following.

All files are new — build from scratch. Do not look for existing code.

Projects and project_members table already exist from STEP 3.2.
Add resource allocation endpoints. Follow Sections 9.3-9.6.

--- NO DB CHANGES REQUIRED ---

Add to ProjectController at /api/projects:

POST /api/projects/{id}/members { userId, projectRole, joinDate }
  Auth: ADMIN; MANAGER (from own team only — throw AccessDeniedException otherwise).
  Rule: project status must not be CLOSED or ARCHIVED → throw ApiException(400) if so.
  Insert into project_members.

PUT /api/projects/{id}/members/{userId} { projectRole, joinDate, outDate }

DELETE /api/projects/{id}/members/{userId}
  Release resource: set outDate = today. Keep record.

GET /api/projects/{id}/dashboard (MANAGER assigned, ADMIN)
  Returns: {
    status, memberCount,
    requiredSkills: [{ skillId, skillName, minLevel, isRequired,
      membersWhoMeetLevel: int, totalActiveMembers: int }]
  }
  membersWhoMeetLevel = project_members (outDate IS NULL) with effectiveScore >= minLevel.
```

---

### STEP 5.4 — Backend: AI-03 + AI-04 + AI-05 ❌ Build from scratch

```
Feature groups: AI-03 · AI-04 · AI-05
Tasks covered: AI-03: Learning path from gap analysis, auto-assign docs, employee accept/modify | AI-04: Skill extraction on upload, confirm/reject tags | AI-05: Chatbot clarifying questions, rating suggestion, conversation log

Read SYSTEM.md in the .claude folder first, then do the following.

All files are new — build from scratch. Do not look for existing code.

Add AI-03 (Learning Paths), AI-04 (Skill Extraction), AI-05 (Assessment Chatbot).
Follow Sections 14-16. Add to existing AiController.

--- NO DB CHANGES REQUIRED ---

AI-03: POST /api/ai/learning-path { userId: Long }
  Auth: MANAGER (own team), ADMIN.
  a) Call AiService.gapAnalysis(userId) internally — get HIGH priority gaps.
  b) For each gap skill: SELECT documents WHERE JSON_CONTAINS(skillset_tags, CAST(skillId AS JSON)).
     (MySQL JSON_CONTAINS works with TiDB.)
  c) Claude API call:
     System: "You are a learning path advisor. Return ONLY valid JSON, no markdown."
     User: "Create a learning path for these gaps: {gaps JSON}.
       Available docs: {docs JSON (title+description only, no HTML)}.
       Return JSON array: [{ documentId, title, skillName, suggestedDeadlineDays, rationale }]
       Order by priority. suggestedDeadlineDays = integer days from today."
  d) Parse. Compute actualDeadline = LocalDate.now().plusDays(suggestedDeadlineDays).
  Returns: { userId, fullName, recommendedPath: [...with actualDeadline dates] }

AI-03: POST /api/ai/learning-path/assign { userId: Long, path: [{ documentId, deadline }] }
  Auth: MANAGER, ADMIN. Creates DocumentAssignment records. Sends notification stub.

AI-04: POST /api/ai/extract-skills { documentId: Long }
  Auth: ADMIN, MANAGER (document creator).
  a) Load document. If filePath not null:
       try (var doc = Loader.loadPDF(Path.of(filePath).toFile())) {
           text = new PDFTextStripper().getText(doc);
       }
     (Apache PDFBox.) Truncate to first 3000 chars.
  b) Fetch all ACTIVE skill names: [{ id, name }].
  c) Claude API:
     System: "You are a skills analyst. Return ONLY valid JSON."
     User: "Given this document: {text}.
       Which of these skills does it cover: {skill names list}.
       Return JSON: [{ skillName, confidence: 0.0-1.0, depth: 'INTRODUCTORY'|'INTERMEDIATE'|'ADVANCED' }]"
  d) Map skillNames to IDs (case-insensitive match). Save to document.aiTagSuggestions.
  Returns: { documentId, suggestions: [{ skillId, skillName, confidence, depth }] }
  Auto-trigger asynchronously after PDF upload (use @Async on AiService.extractSkills —
  replaces the log stub from STEP 5.1).

PUT /api/documents/{id}/ai-tags { acceptedSkillIds: Long[], rejectedSkillIds: Long[] }
  Merge acceptedSkillIds into skillsetTags. Clear aiTagSuggestions.

AI-05: POST /api/ai/assessment-assistant/start { skillId: Long }
  Auth: any role (own assessment).
  Load skill + levelDescriptions. Store session in a Caffeine cache with 30 min TTL:
    @Bean Caffeine<Object,Object> sessions =
        Caffeine.newBuilder().expireAfterAccess(30, TimeUnit.MINUTES).maximumSize(10_000).build();
    Each session: { sessionId: UUID, userId, skillId, conversation: List<Map<String,String>> }
  Claude API system: "You are assessing proficiency in {skillName}.
    Scale: 1={level1}...5={level5}. Ask 3-5 clarifying questions, ONE at a time.
    When ready: include exactly SUGGESTED_SCORE: X in your response."
  Returns: { sessionId, question }

AI-05: POST /api/ai/assessment-assistant/message { sessionId, userMessage }
  Load session. Append user message. Call Claude API with full history.
  Check response text for regex "SUGGESTED_SCORE: (\\d)". Extract suggestedScore if found.
  Returns: { response, suggestedScore (null until present), isComplete }

Extend POST /api/assessments: add optional field sessionId.
  If provided: serialize session conversation to JSON → save to skill_assessments.assessment_ai_log.
```

---

### STEP 5.5 — Frontend: Documents, Goals & Learning

```
Feature groups: SKL-02 · SKL-01 · PRJ-01 · AI-03 · AI-04 · AI-05
Tasks covered: SKL-02: Document library UI, My Upskill, team learning dashboard | SKL-01: Goals page | PRJ-01: Staff project view | AI-03/04/05: Learning path UI, doc AI tags, chatbot

Read SYSTEM.md in the .claude folder first, then do the following.

Build document, goals, and learning pages.

/documents — Document Library (all roles browse; ADMIN/MANAGER manage)
  Card grid: title, type icon, skillset tags, created by name.
  Filters: type select, skill filter, title search.
  ADMIN/MANAGER: "Add Document" modal:
    Title, Description, Type.
    PDF: file upload → POST /api/documents/upload.
      After upload: poll GET /api/documents/{id} for aiTagSuggestions.
      When suggestions arrive: show checkboxes "AI suggests these skills are covered."
      Confirm/reject → PUT /api/documents/{id}/ai-tags.
    Link/Video: URL field.
    Skill tags: multi-select (GET /api/skills/all).
  "Assign" button per card → modal: user search OR team select + deadline.

/my-upskill — My Learning (all roles)
  Two columns: "To Do" | "Done".
  Card: title, type icon, deadline (red if past due), status badge.
  "Start" / "Mark Complete" status buttons.
  "AI Learning Path" button → POST /api/ai/learning-path → modal:
    Recommended sequence with rationale. "Assign All" → POST /api/ai/learning-path/assign.

/goals — Development Goals (all roles)
  List: skill name, target level, current level, progress bar, status.
  "Add Goal" modal: skill search-select + target level 1–5.
  Manager-suggested: "Suggested by [Name]" badge + Accept / Reject buttons.
  "Complete" button → PATCH /api/goals/{id}/complete → toast "Assessment updated automatically."

/team/learning — Team Learning (MANAGER, ADMIN)
  Completion table: member, assigned/completed counts, % progress bar.
  "Remind Incomplete" button → POST /api/team/learning-progress/remind.
  Click member row → expand: their document list with statuses.

AI-05 Widget on /assessments:
  "Ask AI" button on each un-assessed skill card.
  Opens chat drawer: bubbles layout, text input + Send.
  POST /api/ai/assessment-assistant/start on open.
  POST /api/ai/assessment-assistant/message on each send.
  When suggestedScore arrives: banner "AI suggests Level 3 — Intermediate"
  + "Use this score" button that pre-fills the rating in the assessment form.
```

---

## PHASE 6 — Notifications, Config & Hardening (Sprint 6)

### STEP 6.1 — Backend: Notification System ❌ Build from scratch

```
Feature groups: CFG-01
Tasks covered: Email config notification triggers (all events wired: ACCOUNT_CREATED, DOCUMENT_ASSIGNED, GOAL_SUGGESTED, etc.)

Read SYSTEM.md in the .claude folder first, then do the following.

All files are new — build from scratch. Do not look for existing code.

EmailService and EmailTemplate exist from STEP 1.3.
Add in-app notifications and wire all triggers. Follow Section 20.

--- DB CHANGES REQUIRED ---
Create Flyway migration V11__notifications.sql:

  CREATE TABLE IF NOT EXISTS notifications (
    id                   BIGINT PRIMARY KEY AUTO_INCREMENT,
    recipient_id         BIGINT NOT NULL,
    type                 VARCHAR(100) NOT NULL,
    title                VARCHAR(500),
    body                 TEXT,
    related_entity_type  VARCHAR(100),
    related_entity_id    BIGINT,
    is_read              TINYINT(1) DEFAULT 0,
    created_at           DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_recipient FOREIGN KEY (recipient_id) REFERENCES users(id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  CREATE INDEX idx_notif_recipient ON notifications(recipient_id, is_read);

--- ADD NEW CODE ---

1. NotificationService (service/NotificationService.java):
   createInApp(recipientId, type, title, body, relatedEntityType, relatedEntityId)
     → insert into notifications (synchronous, fast).
   sendEmail(triggerEvent, recipientEmail, Map<String,String> variables)
     → check notification_rules.isEnabled for triggerEvent; skip if false.
     → load EmailTemplate, replace {{key}} placeholders, call EmailService.send().
     → both methods are safe to call from any service.
   @Async send() so callers don't block.

2. NotificationController at /api/notifications (any auth):
   GET  /api/notifications → unread for current user, createdAt DESC, paginated.
   PATCH /api/notifications/{id}/read
   PATCH /api/notifications/read-all
   GET  /api/notifications/unread-count → { count: Integer }

3. Replace all notification stubs with NotificationService calls:
   AssessmentService   → ASSESSMENT_REVIEWED
   DocumentService     → DOCUMENT_ASSIGNED
   GoalService         → GOAL_SUGGESTED
   UserService         → ACCOUNT_CREATED
   AuthService         → PASSWORD_RESET
   TeamLearningService → LEARNING_REMINDER

4. Scheduled reminder (daily 08:00):
   @Component class LearningReminderJob {
     @Scheduled(cron = "0 0 8 * * *")
     public void remindUpcomingDeadlines() {
       // Find documentAssignments where deadline = tomorrow AND status != 'COMPLETED'.
       // For each: notificationService.sendEmail("LEARNING_REMINDER", user.email, {...}).
     }
   }
   @EnableScheduling is already on SkillMatrixApplication (STEP 0.1).
```

---

### STEP 6.2 — Backend: Audit Logging ❌ Build from scratch

```
Feature groups: CFG-01
Tasks covered: Audit logs — system-wide change history

Read SYSTEM.md in the .claude folder first, then do the following.

All files are new — build from scratch. Do not look for existing code.

AuditService and audit_logs table exist from STEP 1.1/1.4.
Verify auditService.log() is called for every action in Section 21 of SYSTEM.md.

Read each service class and add any missing auditService.log() calls:

UserService:        USER_CREATED, USER_UPDATED, USER_DEACTIVATED, USER_REACTIVATED, USER_DELETED
AssessmentService:  ASSESSMENT_CREATED, ASSESSMENT_UPDATED (self), ASSESSMENT_MANAGER_REVIEWED
TeamMemberService:  MEMBER_ADDED, MEMBER_REMOVED, MEMBER_POSITION_CHANGED, MEMBER_NOTE_UPDATED
DocumentService:    DOCUMENT_ASSIGNED, ASSIGNMENT_STATUS_CHANGED, LEARNING_REMINDER_SENT
ProjectService:     PROJECT_CREATED, PROJECT_UPDATED, PROJECT_STATUS_CHANGED
ProjectMemberService: MEMBER_ALLOCATED, MEMBER_RELEASED
SkillService:       SKILL_CREATED, SKILL_UPDATED, SKILL_DELETED
GoalService:        GOAL_CREATED, GOAL_COMPLETED, GOAL_CANCELLED
AuthService:        LOGIN_SUCCESS, LOGIN_FAILURE, PASSWORD_RESET_REQUESTED, PASSWORD_RESET_COMPLETED

Each log() call must capture: actorId, action, entityType, entityId, oldData (Map), newData (Map).
Save asynchronously (auditService.log is @Async).
Capture ipAddress + userAgent from the HttpServletRequest:
  - Either pass through controller method, or use a `@Component` that exposes
    `RequestContextHolder.currentRequestAttributes()` inside AuditService.
```

---

### STEP 6.3 — Frontend: Notifications, Admin Config & Settings

```
Feature groups: CFG-01
Tasks covered: RBAC permission matrix UI · Master data (job titles, rating scale) · Email config (SMTP, templates) · Audit logs · Notification bell

Read SYSTEM.md in the .claude folder first, then do the following.

Build notification bell, admin config, and profile settings.

1. Notification bell in AppLayout topbar:
   Poll GET /api/notifications/unread-count every 60s → show red badge if count > 0.
   Click → dropdown: last 10 notifications (icon by type, title, "X ago", entity link).
   "Mark all read" → PATCH /api/notifications/read-all. "View all" → /notifications.
   /notifications page: full paginated list.

2. /admin/config (ADMIN only, 4 tabs):

   "SMTP & Email" tab:
   SMTP form: host, port, username, password (masked), from email/name, TLS toggle.
   Save + "Test Email" button → POST /api/admin/config/smtp/test → toast.
   Email Templates: select by event → edit subject + body_html textarea.
     Available variables shown as chips (click to insert {{variable}}).
     Save button.

   "Rating Scale" tab:
   5 rows: Level (read-only), Label field, Description field. Save button.

   "Notification Rules" tab:
   Toggle per event. Reminder frequency number input. Save button.

   "Audit Logs" tab:
   Table: actor, action, entity type, entity ID, timestamp. Filters + date range.
   Click row → expand: old_data and new_data as formatted JSON side-by-side.

3. /profile/settings:
   "Email notifications" toggle → PUT /api/profile/settings { notificationEmail }.
   Language select (Tiếng Việt / English) → PUT /api/profile/settings { language }.
```

---

## PHASE 7 — Phase 2 AI (Sprint 7–8)

### STEP 7.1 — Backend: AI-07 Trend & Attrition Risk ❌ Build from scratch

```
Feature groups: AI-07 · DSH-01
Tasks covered: AI-07: Monitor skill growth trends · Flag stagnant/misaligned skills · Risk score card · Manager threshold alert | DSH-01: Trend analysis (growth chart, team trend by quarter/year)

Read SYSTEM.md in the .claude folder first, then do the following.

All files are new — build from scratch. Do not look for existing code.

Add AI-07. Requires historical assessment_logs data (3+ months ideal). Follow Section 18.
Add to AiController.

--- NO DB CHANGES REQUIRED ---

GET /api/ai/trend/{teamId} (MANAGER own team, ADMIN)
  From assessment_logs, group by (user_id, skill_id, month) for last 12 months.
  Per user+skill: slope = (last_score - first_score) / months_span.
  Direction: IMPROVING (slope > 0.2), DECLINING (slope < -0.2), STAGNANT.
  Returns: [{ userId, fullName, trends: [{ skillName, direction, slope, dataPoints: [{ month, score }] }] }]

GET /api/ai/risk-score/{teamId} (MANAGER own team, ADMIN)
  Per member — 4 binary signals:
  1. scoreStagnation: no score improvement in last 90 days.
  2. lowCompletion: document completion rate < 30%.
  3. skillMisalignment: gap analysis returns any HIGH priority gap.
  4. noActiveGoals: no IN_PROGRESS DevelopmentGoal.
  riskScore = sumOfSignals / 4.0
  riskLevel: HIGH > 0.7, MEDIUM 0.4–0.7, LOW < 0.4.
  Returns: [{ userId, fullName, riskScore, riskLevel, contributingFactors: String[] }]

@Scheduled(cron = "0 0 9 * * MON") weekly job in service/RiskAlertJob.java:
  For each team run risk scores. If any member just became HIGH risk:
  notificationService.createInApp(manager.id, "RISK_ALERT", title, body, "USER", userId).
```

---

### STEP 7.2 — Backend: AI-08 NL Matrix Query ❌ Build from scratch

```
Feature groups: AI-08
Tasks covered: Natural language input on dashboard · AI translates query into matrix filter · Save query as named filter

Read SYSTEM.md in the .claude folder first, then do the following.

All files are new — build from scratch. Do not look for existing code.

Add AI-08. Follow Section 19. Add to AiController.

--- DB CHANGES REQUIRED ---
Create Flyway migration V12__saved_queries.sql:
  CREATE TABLE IF NOT EXISTS saved_queries (
    id                BIGINT PRIMARY KEY AUTO_INCREMENT,
    name              VARCHAR(255) NOT NULL,
    query_text        TEXT NOT NULL,
    resolved_filters  JSON,
    created_by        BIGINT,
    created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sq_creator FOREIGN KEY (created_by) REFERENCES users(id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--- ADD NEW CODE ---

POST /api/ai/matrix-query { query: String, teamId: Long (optional) }
  Auth: MANAGER, ADMIN.
  a) Claude API to parse query:
     System: "You are a query parser. Return ONLY valid JSON."
     User: "Parse: '{query}'. Return: { skillFilters: [{ skillName, minLevel }],
       memberNameSearch: null|String, excludeActiveProject: boolean, minCompletionRate: null|int }"
  b) Map skillNames to IDs (case-insensitive LIKE).
  c) Execute query against skill_assessments + teams + project_members.
     Return same format as GET /api/dashboard/team-matrix.

POST /api/ai/matrix-query/save { name, queryText, resolvedFilters }
GET  /api/ai/matrix-query/saved → list for current user
POST /api/ai/matrix-query/run/{id} → re-execute saved query
```

---

### STEP 7.3 — Frontend: Phase 2 AI Dashboards

```
Feature groups: AI-07 · AI-08 · DSH-01
Tasks covered: AI-07 UI: trend chart, risk table | AI-08 UI: NL query bar, saved queries | DSH-01: Growth chart, trend by quarter/year

Read SYSTEM.md in the .claude folder first, then do the following.

Build Phase 2 AI dashboards.

/dashboard/team-trend (MANAGER, ADMIN):
  GET /api/ai/trend/{teamId} + GET /api/ai/risk-score/{teamId}.
  Member tabs at top.
  Selected member: Recharts LineChart (X=months, Y=score 1-5, one line per skill, max 6).
  Direction badges per skill row: ↑ IMPROVING (green), → STAGNANT (gray), ↓ DECLINING (red).
  "Team Risk" table: member avatar+name, risk badge (HIGH=red, MEDIUM=amber, LOW=green),
  contributing factors as small tags.

/dashboard/team — add NL search bar above matrix:
  Placeholder "Try: 'React developers above level 3 not on a project'"
  Enter → POST /api/ai/matrix-query → reload matrix.
  Parsed filter chips below input. "Save query" icon → name prompt → POST /api/ai/matrix-query/save.
  Saved queries dropdown → click to re-run.

/dashboard personal — add "My Growth" below radar chart:
  LineChart: X=last 12 months, Y=average assessment score.
  Only render if data spans > 1 month.
```

---

## Reference: Prompt Template

```
Read SYSTEM.md in the .claude folder first, then do the following.

[Paste the relevant STEP block above]

Additional context:
- The project uses Long IDs (not UUID). Do not change this.
- User status: ACTIVE / DEACTIVE / DELETED. Map "lock" → DEACTIVE, "unlock" → ACTIVE.
- Do NOT change existing endpoint paths, DTO field names, or response structures
  unless the step explicitly says to.
- For any new DB changes: write a new Flyway migration file (V{N}__description.sql).
- Run `mvn test` after implementation and fix any failures before finishing.
```

---


---

## Feature Group → Step Mapping

> Quick reference: which ClickUp task group is built in which step.

| ClickUp Group | Steps (BE) | Steps (FE) | Sprint |
|--------------|------------|------------|--------|
| AUT-01 Authentication & Profile | 1.1 · 4.1 | 1.2 · 4.3 | 1 + 4 |
| USM-01 User Management | 1.4 | 1.5 | 1 |
| SKL-01 Skillset Management | 2.1 · 3.1 · 5.2 | 2.3 · 3.4 · 5.5 | 2 + 3 + 5 |
| SKL-02 Upskill Documents | 5.1 | 5.5 | 5 |
| TEM-01 Team Management | 2.2 | 2.4 | 2 |
| PRJ-01 Project Management | 3.2 · 5.3 | 3.5 · 5.5 | 3 + 5 |
| DSH-01 Dashboard & Reporting | 4.1 · 4.2 · 7.1 | 4.3 · 7.3 | 4 + 7 |
| CFG-01 App Configuration | 1.3 · 6.1 · 6.2 | 0.3 · 6.3 | 1 + 6 |
| AI-01 Smart Resource Matching ⭐ | **3.3** | **3.5** | **3** |
| AI-02 Skill Gap Analysis | 4.4 | 4.5 | 4 |
| AI-03 Learning Path | 5.4 | 5.5 | 5 |
| AI-04 Skill Extraction | 5.4 | 5.5 | 5 |
| AI-05 Self-Assessment Chatbot | 5.4 | 5.5 | 5 |
| AI-06 Auto-Generate Taxonomy | 2.5 | 2.6 | 2 |
| AI-07 Team Trend & Risk [P2] | 7.1 | 7.3 | 7 |
| AI-08 NL Matrix Query [P2] | 7.2 | 7.3 | 7 |

## Build Order Summary

| Step | What | When | Blocks |
|------|------|------|--------|
| 0.3 | FE: React project setup | Day 1 | FE everything |
| **1.1** | **BE: Auth (login, refresh, forgot/reset/change-pwd, must_change flag)** | Week 1 | Login flow |
| 1.2 | FE: Login + password pages | Week 1 | App entry |
| **1.3** | **BE: Config + Email service (new)** | Week 1–2 | Notifications |
| **1.4** | **BE: User Management (CRUD + audit activity)** | Week 2 | Team setup |
| 1.5 | FE: Admin User Management | Week 2 | — |
| **2.1** | **BE: Skill Taxonomy (Career/Dept/Skill + Excel import/export, Positions)** | Week 3 | ★ AI-01 |
| **2.2** | **BE: Teams + TeamMembers (notes, leftAt, member detail + logs)** | Week 3 | ★ AI-01 |
| 2.3 | FE: Taxonomy pages | Week 3 | — |
| 2.4 | FE: Team pages | Week 3–4 | — |
| 2.5 | BE: AI-06 Taxonomy Generator (new) | Week 4 | — |
| 2.6 | FE: AI-06 UI | Week 4 | — |
| 3.1 | BE: Skill Assessment (new tables) | Week 5 | ★ AI-01 |
| 3.2 | BE: Project CRUD + Skill Requirements (new tables) | Week 5 | ★ AI-01 |
| **★ 3.3** | **BE: ★ AI-01 Smart Resource Matching** | **Week 5–6** | **PRIORITY** |
| 3.4 | FE: Assessment pages | Week 5–6 | — |
| **★ 3.5** | **FE: ★ Projects + AI-01 Match UI** | **Week 6** | **PRIORITY** |
| 4.1 | BE: Profile endpoints + Personal Dashboard | Week 7 | — |
| 4.2 | BE: Team Dashboard + Exports | Week 7 | — |
| 4.3 | FE: Dashboard pages | Week 7–8 | — |
| 4.4 | BE: AI-02 Gap Analysis (pure DB) | Week 8 | AI-03 |
| 4.5 | FE: Gap Analysis UI | Week 8 | — |
| 5.1 | BE: Documents + Assignments (new) | Week 9 | AI-03, AI-04 |
| 5.2 | BE: Development Goals (new) | Week 9 | — |
| 5.3 | BE: Project Allocation remaining | Week 9 | — |
| 5.4 | BE: AI-03 + AI-04 + AI-05 | Week 10 | — |
| 5.5 | FE: Documents + Goals + Learning + AI chat | Week 9–10 | — |
| 6.1 | BE: Full Notification System | Week 11 | — |
| 6.2 | BE: Complete Audit Logging | Week 11 | — |
| 6.3 | FE: Notifications + Admin Config + Settings | Week 11–12 | — |
| 7.1 | BE: AI-07 Trend + Risk (Phase 2) | Week 13–14 | — |
| 7.2 | BE: AI-08 NL Query (Phase 2) | Week 15 | — |

## Spring Boot Coding Conventions (apply to ALL BE steps)

> Claude Code must follow these patterns in every backend step.

```java
// Controller pattern — controller/ExampleController.java
@RestController
@RequestMapping("/api/examples")
@RequiredArgsConstructor
public class ExampleController {
    private final ExampleService service;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<ExampleResponse>> create(
            @Valid @RequestBody ExampleRequest body,
            @AuthenticationPrincipal User current) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok(service.create(body, current)));
    }
}

// Service pattern — service/ExampleService.java
@Service
@RequiredArgsConstructor
@Transactional
public class ExampleService {
    private final ExampleRepository repo;
    private final AuditService audit;

    public ExampleResponse create(ExampleRequest body, User actor) {
        var entity = Example.builder()
            .name(body.name())
            .createdBy(actor)
            .build();
        var saved = repo.save(entity);
        audit.log(actor.getId(), "EXAMPLE_CREATED", "Example", saved.getId(), null,
                  Map.of("name", saved.getName()), null, null);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public ExampleResponse get(Long id) {
        return repo.findById(id).map(this::toResponse)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Example not found", "NOT_FOUND"));
    }
}

// Repository pattern — repository/ExampleRepository.java
public interface ExampleRepository extends JpaRepository<Example, Long>,
                                            JpaSpecificationExecutor<Example> {
    Optional<Example> findByNameAndDeletedAtIsNull(String name);

    @Query("select e from Example e where e.deletedAt is null and e.team.id = :teamId")
    Page<Example> findActiveByTeam(@Param("teamId") Long teamId, Pageable pageable);
}

// Custom security expression for MANAGER-own-team checks
@Component("teamSecurity")
@RequiredArgsConstructor
public class TeamSecurity {
    private final TeamManagerRepository teamManagers;

    public boolean isManagerOf(Long teamId, Authentication auth) {
        var principal = (User) auth.getPrincipal();
        if ("ADMIN".equals(principal.getRole())) return true;
        return teamManagers.existsByTeamIdAndUserId(teamId, principal.getId());
    }
}
// Usage on controller method:
// @PreAuthorize("hasRole('ADMIN') or @teamSecurity.isManagerOf(#teamId, authentication)")

// Pagination helper — util/Pagination.java
public final class Pagination {
    public static Pageable of(Integer page, Integer size) {
        int p = page == null || page < 1 ? 0 : page - 1;    // API is 1-based, Spring is 0-based
        int s = size == null || size < 1 ? 20 : Math.min(size, 100);
        return PageRequest.of(p, s);
    }
}
```

**MySQL / TiDB Cloud rules (follow in every entity and migration):**
- Every JPA entity: explicit `@Table(name = "snake_case")` (Hibernate default mapping diverges from app convention)
- The Flyway script that creates the table sets `ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
- JSON columns: declare DB column as native `JSON` type, map in Java with `@Type(JsonType.class)` from `hibernate-types-60`
- Status fields: `VARCHAR(20)` + Java `String` (or sealed enum at service layer) — do NOT use MySQL `ENUM` in DDL; do NOT use `@Enumerated(EnumType.STRING)` for status fields that may grow
- Soft delete: every query that lists active rows filters with `where deletedAt is null` — either in the JPQL or via a `JpaSpecificationExecutor` Specification helper. Do NOT use `@Where(clause = "deleted_at IS NULL")` — it breaks admin "show deleted" queries.
- Flyway file naming: `V{N}__snake_case_description.sql` under `src/main/resources/db/migration/`
- Never edit a Flyway script after it has been applied to any environment — create a new V{N+1} migration to fix mistakes
- TiDB Cloud requires SSL: include `useSSL=true&requireSSL=true` in the JDBC URL
- TiDB note: foreign keys are enforced as of TiDB 6.6+. If targeting an older cluster, FK constraints are still defined for documentation but may not be enforced — keep referential integrity at the service layer

---