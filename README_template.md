# Central Consent Service

A comprehensive, modular .NET 8 Web API for managing multi-tenant consents, authentication, and file storage.

The project follows a **Modular Monolith** architecture, ensuring high cohesion and low coupling by organizing features into distinct modules (Auth, Tenant, Consent, Storage). It features advanced schema-based multi-tenancy, JWT authentication with refresh tokens, and robust error handling.

## 🚀 Quick Start

### Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [PostgreSQL](https://www.postgresql.org/)
- [NATS Server](https://nats.io/) (for asynchronous messaging)

### Manual Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/intrahealth-source/central-consent-service.git
   cd central-consent-service
   ```

2. **Configure Environment:**
   Copy `appsettings.json.example` to `appsettings.json` and update it with your database credentials and secret keys. Set `"SeedDatabase": true` for the FIRST run to initialize the schema and create the root admin account.
   ```json
   {
     "SeedDatabase": false,
     "ConnectionStrings": {
       "Default": "Host=localhost;Port=5432;Database=intrahealth_local;Username=postgres;Password=your_password"
     },
     "Logging": {
       "LogLevel": {
         "Default": "Information",
         "Microsoft.AspNetCore": "Warning"
       }
     },
     "Serilog": {
       "Using": [ "Serilog.Sinks.File" ],
       "MinimumLevel": {
         "Default": "Information",
         "Override": {
           "Microsoft": "Warning",
           "System": "Warning"
         }
       },
       "WriteTo": [
         {
           "Name": "File",
           "Args": {
             "path": "/srv/logs/log-.txt",
             "rollingInterval": "Day",
             "outputTemplate": "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {Message:lj}{NewLine}{Exception}"
           }
         }
       ]
     },
     "StorageSettings": {
       "BaseUrl": "http://localhost:8080/api/files",
       "RootPath": "/srv/files"
     },
     "Jwt": {
       "Key": "your_super_secret_key_at_least_32_chars_long",
       "Issuer": "ConsentCenter",
       "Audience": "ConsentCenter"
     },
     "SmtpSettings": {
       "Host": "smtp.gmail.com",
       "Port": 587,
       "Username": "example@gmail.com",
       "Password": "your_app_password",
       "EnableSsl": true,
       "FromEmail": "example@gmail.com"
     },
     "AllowedHosts": "*",
     "AllowedSwagger": true,
     "AllowedOrigins": [
       "http://localhost:3000"
     ],
     "AppClient": {
       "Url": "http://localhost:3000"
     },
     "NATS": {
       "Host": "nats://localhost:4222"
     },
     "Invitation": {
       "MagicLinkPrefix": "http://localhost:3000/consent/{code}/survey",
       "RevokeUrl": "http://localhost:3000/{code}/update-or-revoke"
     }
   }
   ```

3. **Run Migrations:**
   The application uses EF Core migrations.
   ```bash
   dotnet ef database update
   ```

4. **Run the Application:**
   ```bash
   dotnet run
   ```

## 📋 Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Environment Variables](#environment-variables)
- [Authentication & Authorization](#authentication--authorization)
- [Multi-tenancy](#multi-tenancy)
- [Storage](#storage)
- [Error Handling](#error-handling)
- [Commands](#commands)

## ✨ Features

- **Modular Monolith Architecture**: Codebase organized into `Auth`, `Tenant`, `Consent`, and `Storage` modules.
- **Multi-tenancy**: Schema-per-tenant isolation strategy using EF Core interceptors (`SchemaSettingInterceptor`).
- **Authentication**: Secure JWT authentication with Access Tokens and Refresh Tokens.
- **Authorization**: Role-Based Access Control (RBAC) with policies.
- **CQRS**: Command Query Responsibility Segregation using [MediatR](https://github.com/jbogard/MediatR).
- **Validation**: Request validation pipeline using [FluentValidation](https://docs.fluentvalidation.net/).
- **File Storage**: Abstracted storage service with local file system implementation.
- **FHIR R4 Support**: Interoperability with FHIR R4 standard for consent and patient data.
- **Audit Logging**: Comprehensive system-wide audit tracking with CSV export capabilities.
- **Patient Kiosk**: Dedicated workflow for patient self-service registration and consent.
- **Bulk Data Import**: Efficient CSV-based bulk import system with preview and validation.
- **Messaging Service**: Asynchronous event processing using NATS.
- **Documentation**: Auto-generated API documentation with [Swagger/OpenAPI](https://swagger.io/).
- **Standardized Responses**: Unified `ResponseModel<T>` for consistent API responses.

## 🏗 Project Structure

The solution is organized into modular components:

```
Modules\
 |--Auth\           # Authentication & User Management (JWT, Users, Roles)
 |--Consent\        # Core Consent Logic (Invitations, Submissions, Kiosk)
 |--Tenant\         # Tenant Management (Onboarding, Audit Logs)
 |--Fhir\           # FHIR R4 Interoperability (Bundle transactions)
 |--Storage\        # File Storage (Upload, Download, Media)
 |--Shared\         # Shared Kernel (Constants, Common Models, Interfaces)
Tests\              # Unit and Integration Tests
docs\               # Documentation (MkDocs)
Program.cs          # Application Entry Point & DI Configuration
Dockerfile          # Container Configuration
```

### Standard Module Structure
Each module follows **Clean Architecture** principles:
- **Api**: Controllers and API endpoints.
- **Application**: Business logic (CQRS Commands, Queries, Validators).
- **Domain**: Core entities, constants, and business rules.
- **Infrastructure**: Data access (EF Core), migrations, and external services.

## 📚 API Documentation

To view the list of available APIs and their specifications, run the server and go to the Swagger UI:

- **URL**: `http://localhost:8080/swagger-ui` (or your configured port)

### API Endpoints

**Auth Module** (`/api/auth`):
- `POST /login` - Login to get Access Token
- `POST /forgot-password/send-otp` - Send OTP for password reset
- `POST /forgot-password/verify-otp` - Verify OTP
- `POST /forgot-password/reset` - Reset password
- `POST /logout` - Logout (invalidate specific/all tokens)

**User Management** (`/api/users`):
- `GET /roles` - Get available user roles
- `POST /` - Create a new user
- `PUT /{id}` - Update user details
- `GET /{id}` - Get user by ID
- `GET /search` - Search users with pagination and filters
- `PATCH /{id}/deactivate` - Deactivate a user
- `PATCH /{id}/activate` - Activate a user
- `PUT /{id}/assign-role` - Assign role to a user

**Tenant Management** (`/api/tenants`):
- `GET /by-email` - Lookup tenants by user email
- `POST /` - Create a new tenant
- `PUT /{id}` - Update tenant details
- `GET /{id}` - Get tenant by ID
- `GET /search` - Search tenants (supports `excludePublic` filter)
- `PATCH /{id}/deactivate` - Deactivate a tenant
- `PATCH /{id}/activate` - Activate a tenant
- `GET /timezones` - Get available timezones
- `GET /languages` - Get available languages

**Storage Module** (`/api/files`):
- `POST /upload-file` - Upload a file (multipart/form-data)
- `GET /info/{*path}` - Get file metadata
- `GET /media/{*path}` - Stream media file
- `GET /office/{*path}` - Download office file
- `DELETE /{*path}` - Delete a file

**Consent Types** (`/api/consent-types`):
- `GET /` - List consent types
- `POST /` - Create a new consent type
- `GET /{code}` - Get consent type details
- `PUT /` - Update consent type
- `POST /version` - Create new version of consent type

**Consent Templates** (`/api/consent-templates`):
- `POST /` - Create a new consent template
- `GET /search` - List consent templates (Paged, Searchable)
- `GET /{id}` - Get template details (includes versions)
- `POST /{id}/versions` - Create a new version for a template
- `GET /versions/{versionId}` - Get version details
- `POST /versions/{versionId}/publish` - Publish a specific version

**Audit Logs** (`/api/audit-logs`):
- `GET /` - Search audit logs with advanced filters
- `GET /export` - Export filtered audit logs to CSV
- `GET /export/{id}` - Export a specific audit log entry to CSV
- `GET /filters` - Get available filter values for audit logs

**Kiosk Mode** (`/api/kiosk`):
- `GET /patients/search` - Search patients by keyword
- `POST /submissions` - Submit consent from kiosk

**Imports** (`/api/imports`):
- `GET /configuration` - Get CSV import configuration/mapping
- `POST /preview` - Preview CSV data before execution
- `POST /execute` - Run the import job
- `GET /{id}/status` - Track import job progress
- `GET /search` - List/Search past import jobs

**FHIR R4** (`/fhir`):
- `POST /` - Process FHIR Bundle transactions (Accepts `application/fhir+json`)

## 🗄️ Database Schema

### Auth Module (`public` schema)
- `auth_users`: Central user repository.
- `auth_roles`: System roles.
- `auth_refresh_tokens`: Tokens for session management.

### Tenant Module (`public` schema)
- `tenants`: Registered tenants with configuration.

### Consent Module (`context` schema - public or tenant)
- `consent_types`: Definitions of consent types (e.g., Privacy, Treatment).
- `consent_type_versions`: Version history for consent types.
- `consent_templates`: Consent form templates (e.g., Admission Form).
- `consent_template_versions`: Versions of templates containing the json schema.
- `consent_type_rules`: Logic rules linking form answers to consent type decisions.
- `consent_submissions`: Patient consent submissions.
- `consent_submission_answers`: Individual answers from submissions.
- `consent_submission_decisions`: Calculated decisions (PERMIT/DENY) based on rules.
- `csv_import_jobs`: Tracking for bulk data status import.

## 🔐 Authentication & Authorization

### Authentication
The service uses **JWT (JSON Web Tokens)**.
- **Access Token**: Short-lived (e.g., 30 mins). Sent in `Authorization: Bearer <token>` header.
- **Refresh Token**: Long-lived (e.g., 30 days). Used to obtain new access tokens without re-login.

### Authorization
Endpoints are protected using Policies and Roles:
- `[Authorize]`: Requires a valid token.
- `[Authorize(Roles = "RootAdmin")]`: Requires specific role configuration.

## 🏢 Multi-tenancy

The application implements **Data Isolation** using schemas.
- **Public Schema**: Stores shared data (Tenants, Users, central usage).
- **Tenant Schemas**: Each tenant gets a dedicated schema (e.g., `t00000001`) for their consent data.
- **Interceptors**: EF Core interceptors automatically switch the PostgreSQL `search_path` based on the current tenant context.

## 💾 Storage

The **Storage Module** handles file operations.
- **Upload**: Files are stored in the configured `RootPath` organized by type (e.g., `media`, `office`).
- **Streaming**: Supports range processing for media streaming.
- **Security**: File ownership is tracked, and access can be restricted.

## ⚠️ Error Handling

The application uses a centralized `ExceptionHandlingMiddleware`. All API responses follow a standard format:

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested user was not found."
  }
}
```

## 🚀 Database Setup & Initialization (Important)

This project uses a multi-tenant PostgreSQL architecture. It provides an automated bootstrapping process for fresh deployments.

### 1. First-Time Setup (Bootstrapping)
The application has an **auto-detect bootstrapping feature**. On startup, it checks if the database exists and if all core migrations (for the `public` schema) have been applied.

If it detects an empty or missing database, it will automatically:
- Apply all EF Core migrations to the `public` schema (creating all 24 core tables).
- Create the `public` Base Tenant.
- Create the root admin user: **`admin@intrahealth.com`** / **`Admin@123`**. *(**Note**: Please change this default password immediately after your first login via the Admin API/UI).*
- Link the admin user to the public tenant.

**Steps:**
1. Configure your PostgreSQL connection string in `appsettings.json`.
2. Run the application: `dotnet run`. 
3. The system will detect the fresh state and auto-initialize everything.

### 2. Ongoing Operations (After Setup)
Once the initial setup is complete, subsequent application restarts are completely standard. The auto-detect check evaluates as `false` in milliseconds.
1. Login with the root account (`admin@intrahealth.com`).
2. Use the system's APIs or UI to create new Tenants.
3. Every time you create a new Tenant via the API, the system automatically runs migrations to set up an isolated, dedicated database schema (e.g., `t00000001`) specifically for that Tenant's Consent data. You do not need to run manual commands for this.

## 🛠️ Troubleshooting & Recovery

This project uses a multi-tenant strategy with **PostgreSQL schemas**. Migrations are split into different contexts and must be applied carefully.

### 1. Central Migrations (CLI)
Used for the `public` schema which stores tenant and user metadata.

```bash
# Apply Tenant migrations (public schema)
dotnet ef database update --context TenantDbContext

# Apply Auth migrations to public schema (optional/initial)
dotnet ef database update --context AuthDbContext
```

### 2. Multi-tenant Migrations (API Orchestration)
Tenant-specific data (Consent and tenant-bound Auth users) resides in separate schemas. Migrations must be applied to **all** tenant schemas.

#### **Auth Module Migrations**
To update the `auth` structure across all tenant schemas:
- **Endpoint**: `POST /api/auth` (Requires Admin privileges)
- **Description**: Iterates through all tenants and applies `AuthDbContext` migrations to each schema.

#### **Consent Module Migrations**
To update the `consent` structure across all tenant schemas:
- **Endpoint**: `POST /api/consent/admin/migrate-all` (Requires Admin privileges)
- **Description**: Uses `MigrationOrchestrator` to apply `ConsentDbContext` migrations to all existing tenant schemas.

### 3. Creating New Migrations
When making model changes, generate a new migration for the specific context:
```bash
dotnet ef migrations add <Name> --context <DbContextName> -o <PathToMigrations>
```
*See [Commands](#commands) section for specific paths.*

## 🛠️ Troubleshooting & Recovery

### Failed Migrations
If a multi-tenant migration fails:
1. **Check Logs**: Review the API response from the `migrate-all` endpoint or the application logs (`/srv/logs/`).
2. **Schema State**: Identify which schema failed. Each schema maintains its own `__EFMigrationsHistory` table.
3. **Manual Rollback**: If a migration is stuck, you may need to manually remove the failed entry from `__EFMigrationsHistory` for that specific schema before retrying.
4. **Data Isolation**: Since schemas are isolated, a failure in one tenant typically doesn't affect others.

### NATS Connectivity
- Ensure the NATS server is reachable at the configured `NATS:Host`.
- If invitation emails are not being sent, check if the `SendInvitationEmailProcessStartedConsumer` background service is running.

### Storage Permissions
- Ensure the application has write permissions to the `StorageSettings:RootPath` (default `/srv/files`).

## ⚙️ Background Services & Integrations

- **NATS Messaging**: Decoupled architecture for asynchronous tasks like sending invitation emails.
- **Consent Expiry**: Background service that periodically checks and updates the status of expired invitations.
- **Import/Export Engine**: Handles long-running CSV processing tasks using an internal command queue.

## 💻 Commands

**Run Application:**
```bash
dotnet run
```

**Run Tests:**
```bash
dotnet test
```

**Create Migration (Auth Module):**
```bash
dotnet ef migrations add <MigrationName> --context AuthDbContext -o Modules/Auth/Auth.Infrastructure/Persistence/Migrations
```

**Create Migration (Tenant Module):**
```bash
dotnet ef migrations add <MigrationName> --context TenantDbContext -o Modules/Tenant/Tenant.Infrastructure/Persistence/Migrations
```

**Create Migration (Consent Module):**
```bash
dotnet ef migrations add <MigrationName> --context ConsentDbContext -o Modules/Consent/Consent.Infrastructure/Persistence/Migrations
```

**Create Migration (Fhir Module):**
```bash
dotnet ef migrations add <MigrationName> --context FhirDbContext -o Modules/Fhir/Fhir.Infrastructure/Persistence/Migrations
```

**Update Database (Specific Module):**
```bash
dotnet ef database update --context <DbContextName>
```