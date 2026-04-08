# Sertta Sales Engine API

Production-grade backend foundation for a multi-tenant SaaS automation platform.  
The project is a modular monolith designed for fast iteration now and clean scaling later.

## Project Purpose

This API supports automation products such as:
- WhatsApp/customer support automations
- lead capture and qualification
- follow-up and reminders
- billing reminders
- post-sale reactivation
- external integrations and webhook ingestion

It is built from day one for multi-tenant SaaS behavior using shared MongoDB collections with strict tenant isolation patterns.

## Stack

- Node.js 20+
- TypeScript (strict)
- Express
- MongoDB + Mongoose
- Redis + BullMQ
- Zod
- Pino
- JWT auth + RBAC foundations
- Docker / Docker Compose

## Architecture Summary

- **Style:** Modular monolith
- **Layers per module:** `domain`, `application`, `infrastructure`, `presentation`
- **Cross-cutting:** shared middleware, errors, auth, tenancy, validation, queue abstraction, logging
- **Data model:** shared collections, tenant-owned entities include `tenantId`
- **Async model:** API receives/validates/persists/enqueues; workers process heavy work
- **Observability:** request correlation, structured logs, job lifecycle records, execution logs

## Module Overview

Current module set:
- `auth`: login/refresh scaffolding, JWT and membership-aware auth middleware
- `users`: user creation and profile retrieval
- `tenants`: tenant lifecycle + owner membership bootstrap
- `plans`: platform plans and plan lookup
- `integrations`: tenant integration config management
- `channels`: tenant channels connected to integrations
- `contacts`: contact persistence and inbound lead upsert flow
- `automation-templates`: platform/tenant reusable template catalog
- `automation-instances`: tenant activated automation instances
- `webhooks`: ingestion, normalization, idempotency, queue handoff
- `executions`: job records and execution logs
- `usage`: usage counter reads/increments for future enforcement/billing
- `health`: liveness/readiness endpoints

## Multi-Tenant Model Overview

- Shared DB/collections strategy with tenant isolation enforced in repository filters.
- Tenant context is resolved from request route/header/auth and propagated through request context.
- Tenant-aware middleware and helpers are required for tenant-owned routes and queries.
- Platform-owned entities (for example plans and system templates) are queried through explicit platform-scope patterns.

## Webhook Processing Overview

End-to-end flow:
1. Request arrives at `/api/webhooks/:provider/:tenantId`
2. Validation + optional signature verification
3. Event normalization
4. Duplicate/idempotency checks (Redis + Mongo unique keys)
5. Event persistence (`WebhookEvent`)
6. Queue enqueue (`webhook-ingestion`)
7. Worker consumes and processes business flow (example: inbound lead -> contact upsert)
8. Execution logs and usage counters are updated

## Queue and Worker Overview

Queues are defined centrally with runtime config (`concurrency`, retries, backoff, optional limiter).

Current queue catalog includes:
- webhook ingestion
- inbound events
- automation dispatch
- outbound messages
- scheduled reminders
- lead follow-up
- billing reminders
- webhook retries
- AI tasks
- usage aggregation

Worker specialization is supported via `WORKER_QUEUES` env var (comma-separated queue names), allowing dedicated worker pools.

## Local Setup

### Prerequisites

- Node.js 20+
- npm
- Docker + Docker Compose (recommended for local infra)

### Installation

1. Copy env file:
```bash
cp .env.example .env
```
2. Install dependencies:
```bash
npm install
```
3. Start infrastructure:
```bash
docker compose up -d mongo redis
```
4. Run API + worker:
```bash
npm run dev
```

API default: `http://localhost:3000`  
Health checks:
- `GET /api/health`
- `GET /api/health/ready`

## Environment Variables

Core:
- `NODE_ENV`
- `PORT`
- `API_PREFIX`
- `LOG_LEVEL`

Database/Cache:
- `MONGODB_URI`
- `REDIS_URL`
- `REDIS_KEY_PREFIX`

Auth:
- `JWT_SECRET`
- `JWT_ISSUER`
- `JWT_AUDIENCE`
- `JWT_EXPIRES_IN`
- `JWT_REFRESH_EXPIRES_IN`

HTTP and security:
- `CORS_ORIGIN`
- `RATE_LIMIT_WINDOW_MS`
- `RATE_LIMIT_MAX`
- `WEBHOOK_DEFAULT_SIGNATURE_SECRET`

Idempotency/retention:
- `IDEMPOTENCY_TTL_SECONDS`
- `EXECUTION_LOG_RETENTION_DAYS`
- `WEBHOOK_EVENT_RETENTION_DAYS`
- `JOB_RECORD_RETENTION_DAYS`

Worker specialization:
- `WORKER_QUEUES` (optional, comma-separated)

## Docker Usage

Build and run full local stack:
```bash
docker compose up --build
```

Services:
- `api`: Express API
- `worker`: BullMQ workers
- `mongo`: MongoDB
- `redis`: Redis

## Development Workflow

Useful scripts:
- `npm run dev` -> API + worker watch mode
- `npm run dev:api` -> API only
- `npm run dev:worker` -> worker only
- `npm run lint` -> lint checks
- `npm run typecheck` -> strict TS checks
- `npm run build` -> production compile
- `npm run start` -> run compiled API
- `npm run start:worker` -> run compiled worker

Recommended workflow per change:
1. implement module/layer changes
2. `npm run lint`
3. `npm run typecheck`
4. `npm run build`

## Production-Ready vs Scaffolded

### Already production-ready foundations

- strict TypeScript, lint/type/build workflow
- modular monolith structure with module boundaries
- centralized config and env validation
- structured logging + correlation context
- multi-tenant request/context enforcement patterns
- shared-collection Mongo strategy with tenant indexes
- webhook ingestion pipeline with idempotency and async handoff
- queue lifecycle tracking with `JobRecord` + failure/dead-letter status
- retention controls for high-growth operational collections

### Scaffolded but needs product completion

- provider-specific integrations and signature strategies per provider
- full auth product hardening (refresh token persistence/revocation, MFA, etc.)
- complete business handlers for all queue families
- full plan-limit enforcement on all critical write paths
- billing engine and invoicing/subscription integrations
- admin dashboards/metrics endpoints
- advanced replay/recovery operations tooling

## Architecture and Code Conventions

- Keep controllers thin: validate -> call service -> format response.
- Keep business logic in `application` services/use-cases.
- Keep persistence rules in repositories.
- Never query tenant-owned collections without tenant scope.
- Use queue envelope conventions (`tenantId`, `correlationId`, `eventType`, `idempotencyKey`, timestamps).

## Next Steps

1. Implement plan/limit enforcement middleware for high-cost operations.
2. Add provider adapters (webhook + outbound channels) behind integration interfaces.
3. Add operational dashboards for queue health, dead-letter monitoring, and per-tenant throughput.
4. Add archival/replay tooling for webhook and job operations.
5. Expand billing module using current usage counters and tenant plan snapshots.
