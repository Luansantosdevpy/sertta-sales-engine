# Frontend Integration Blueprint (Current Backend)

## 1. Purpose

This document defines how the frontend should integrate with the backend that is already implemented, including:
- what is available now
- what the frontend must build
- required request/response patterns
- user flows and scenarios to cover
- known backend gaps to consider in UI/UX

Use this as the source of truth for building the first production-ready frontend layer.

## 2. Backend Reality (What is already working)

Current stack and behavior:
- API base: `http://localhost:3000/api`
- Auth: JWT access/refresh, tenant-scoped membership check
- Multi-tenant: enforced in protected modules
- Response shape:
  - success: `{ data, meta?, requestId }`
  - error: `{ error: { code, message, details? }, requestId }`
- Async foundation: webhook ingestion + queue + worker + execution/usage tracking

Implemented route groups:
- Health
- Auth
- Users
- Plans (read-only)
- Tenants
- Integrations
- Channels
- Automation Templates
- Automation Instances
- Usage
- Executions
- Webhooks

## 3. Frontend Contract Rules

### 3.1 Base URL
- `BASE_API_URL = http://localhost:3000/api`

### 3.2 Required headers
- Public routes: none required
- Protected routes:
  - `Authorization: Bearer <accessToken>`
- Optional and recommended:
  - `x-tenant-id: <tenantId>`
  - `x-request-id: <uuid>`
  - `x-correlation-id: <uuid>`

### 3.3 Token storage and refresh
- Keep `accessToken` in memory when possible.
- Keep `refreshToken` in secure storage strategy defined by frontend app type.
- On 401 from protected endpoints:
  1. call `POST /auth/refresh`
  2. retry original request once
  3. if still unauthorized, force logout

### 3.4 Tenant context
- User can belong to multiple tenants (`GET /tenants/my`).
- Frontend must keep `currentTenantId` globally.
- All tenant-scoped screens must use selected tenant context consistently.

## 4. API Capability Matrix for Frontend

### Health
- `GET /health`
- `GET /health/ready`
- Front usage: status page and startup diagnostics.

### Identity and onboarding
- `POST /users` (create user)
- `POST /tenants` (create tenant)
- `POST /auth/login`
- `POST /auth/refresh`
- `GET /auth/me`
- `GET /users/me`
- `GET /tenants/my`
- `GET /tenants/:tenantId`

### Platform data
- `GET /plans`
- `GET /plans/:planId`

### Tenant configuration
- `GET/POST /integrations`
- `GET/POST /channels`

### Automation
- `GET/POST /automation-templates`
- `GET/POST /automation-instances`
- `GET /automation-instances/:instanceId`
- `PATCH /automation-instances/:instanceId/status`

### Operations and observability
- `GET /usage/counters`
- `GET /executions/jobs`
- `GET /executions/logs`

### Ingestion (usually not via UI)
- `POST /webhooks/:provider/:tenantId`

## 5. Screens and Front Modules to Build Now

## 5.1 Auth + Session
- Sign up (user creation)
- Login with tenant
- Session bootstrap (`/auth/me`, `/users/me`, `/tenants/my`)
- Tenant switcher

## 5.2 Tenant onboarding
- Tenant creation form
- Plan selector (read-only plans list)

## 5.3 Integrations and channels
- Integration list + create
- Channel list + create
- Dependency rule: channel creation requires `integrationId`

## 5.4 Automation management
- Template catalog list
- Template creation (tenant template)
- Instance list
- Instance creation
- Status control (active/paused/archived)

## 5.5 Monitoring
- Jobs list (`executions/jobs`) with status filter
- Execution logs (`executions/logs`) with level/status filters
- Usage counters list (`usage/counters`)

## 6. End-to-End Scenarios Frontend Must Cover

### Scenario A: First-time customer setup
1. Create user
2. List plans
3. Create tenant using chosen plan and user as owner
4. Login with tenant
5. Show dashboard with tenant context

Expected result:
- user authenticated
- tenant context selected
- protected routes accessible

### Scenario B: Configure messaging stack
1. Create integration
2. Create channel bound to integration
3. Verify channel appears in list

Expected result:
- tenant-scoped records visible only for current tenant

### Scenario C: Configure automation
1. Create automation template
2. Create automation instance from template
3. Pause and reactivate instance

Expected result:
- instance status transitions reflected in UI

### Scenario D: Webhook processing visibility
1. Trigger webhook ingestion (test tool/backoffice action)
2. Open jobs/logs screens
3. Validate new records and status progression
4. Check usage counters growth

Expected result:
- async lifecycle visible in operations screens

### Scenario E: Tenant isolation safety
1. Authenticate in tenant A
2. Try accessing tenant B resource/path
3. Confirm error response and blocked UI action

Expected result:
- no cross-tenant data leakage in UI or API calls

## 7. Validation and Error UX Requirements

Frontend must map these status classes:
- 400: validation/tenant mismatch input problems
- 401: auth invalid/expired
- 403: missing permission
- 404: not found in tenant scope
- 409: conflict (ex: duplicate email/slug)
- 5xx: retryable/operational issue

Recommended UX:
- Always show `error.message`
- Show `requestId` in support/debug panel
- For form validation, map `error.details` when available

## 8. What Frontend Must Create (Data Forms)

### Create User
- `email`, `fullName`, `password`, optional `phoneNumber`

### Create Tenant
- `name`, `slug`, `planId`, `ownerUserId`

### Login
- `email`, `password`, `tenantId`

### Create Integration
- `name`, `provider`, optional `externalAccountId`, `credentialsRef`

### Create Channel
- `name`, `kind`, `integrationId`, optional `externalChannelId`, `endpoint`

### Create Automation Template
- `code`, `name`, optional `description`, `triggerType`, `definition`

### Create Automation Instance
- `name`, `templateId`, `templateVersion`, optional `triggerConfig`, `runtimeConfig`, `channelId`, `integrationId`

### Update Automation Instance Status
- `status`: `active | paused | archived`

## 9. Current Backend Gaps (UI should account for this)

- Plans are read-only via API (seeded directly in DB for now).
- No full billing/subscription module yet.
- No full admin dashboard module yet.
- Many queue families exist but only some processors have business logic now.

Frontend strategy for gaps:
- hide unavailable product actions behind feature flags
- show "Coming soon" modules with clear status
- do not block core onboarding/tenant setup/automation configuration

## 10. Technical Integration Checklist for Front Implementation

Before coding screens:
- define typed API client from OpenAPI/doc contracts
- implement auth interceptor + refresh flow
- implement global tenant store + tenant switch behavior
- implement standardized error parser for backend shape
- enforce route guards for authenticated areas

Before QA:
- verify all Scenario A-E flows
- verify requestId surfaced in error UI/logging
- verify forbidden/not-found states per tenant
- verify status filters in jobs/logs/usage pages

## 11. Suggested Front Folder Modules (for Codex front generation)

- `src/core/api` (http client, interceptors, error mapping)
- `src/core/auth` (session, refresh, guards)
- `src/core/tenant` (tenant selection/context)
- `src/modules/onboarding`
- `src/modules/integrations`
- `src/modules/channels`
- `src/modules/automation-templates`
- `src/modules/automation-instances`
- `src/modules/operations` (jobs/logs/usage)

This keeps frontend boundaries aligned with backend modular boundaries.

## 12. Ready-to-build Scope for Front Team (MVP)

Must ship in MVP:
- onboarding + login + tenant selection
- integrations/channels CRUD (create/list)
- automation templates/instances basic management
- operations pages (jobs/logs/usage lists)

Can be phase 2:
- billing UI
- advanced admin console
- provider-specific deep integration wizards
