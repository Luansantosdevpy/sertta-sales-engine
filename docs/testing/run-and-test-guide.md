# Run and Test Guide

## 1) Prerequisites

- Node.js 20+
- npm
- Docker + Docker Compose

## 2) Environment setup

1. Copy `.env.example` to `.env`.
2. Use these values for local execution:

```env
NODE_ENV=development
PORT=3000
API_PREFIX=/api
LOG_LEVEL=debug

MONGODB_URI=mongodb://localhost:27017/sertta_sales_engine
REDIS_URL=redis://localhost:6379
REDIS_KEY_PREFIX=sertta

JWT_SECRET=replace-with-a-strong-secret-32-chars-min
JWT_ISSUER=sertta-sales-engine
JWT_AUDIENCE=sertta-api
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:3000

RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=120

IDEMPOTENCY_TTL_SECONDS=1800
WEBHOOK_DEFAULT_SIGNATURE_SECRET=local-webhook-secret

EXECUTION_LOG_RETENTION_DAYS=45
WEBHOOK_EVENT_RETENTION_DAYS=30
JOB_RECORD_RETENTION_DAYS=30
```

Notes:
- `WEBHOOK_DEFAULT_SIGNATURE_SECRET` can be empty if you want to skip signature verification in early tests.
- For signature validation tests, keep it set and send a valid HMAC signature.

## 3) Start infra and app

Start Mongo and Redis:

```bash
docker compose up -d mongo redis
```

Install dependencies:

```bash
npm install
```

Run API + worker:

```bash
npm run dev
```

Useful health checks:
- `GET http://localhost:3000/api/health`
- `GET http://localhost:3000/api/health/ready`

## 4) Mandatory seed before tenant creation

There is no plan-creation endpoint yet, so you must seed at least one active plan directly in MongoDB.

Option A (local Mongo):

```bash
mongosh "mongodb://localhost:27017/sertta_sales_engine" --eval "db.plans.insertOne({ code:'starter', name:'Starter', status:'active', monthlyPriceCents:9900, currency:'USD', limits:{ maxUsers:10, maxChannels:5, maxAutomations:20, monthlyMessages:10000 }, features:['webhooks','queues','automation'], version:1, createdAt:new Date(), updatedAt:new Date() })"
```

Option B (Mongo in Docker):

```bash
docker compose exec mongo mongosh "mongodb://localhost:27017/sertta_sales_engine" --eval "db.plans.insertOne({ code:'starter', name:'Starter', status:'active', monthlyPriceCents:9900, currency:'USD', limits:{ maxUsers:10, maxChannels:5, maxAutomations:20, monthlyMessages:10000 }, features:['webhooks','queues','automation'], version:1, createdAt:new Date(), updatedAt:new Date() })"
```

Then call `GET /api/plans` and keep the returned `planId`.

## 5) End-to-end test sequence (recommended)

1. `GET /api/health` -> expect 200.
2. `GET /api/health/ready` -> expect 200 (or 503 if infra is down).
3. `POST /api/users` -> create user and keep `userId`.
4. `GET /api/plans` -> keep `planId`.
5. `POST /api/tenants` with `ownerUserId=userId` and `planId` -> keep `tenantId`.
6. `POST /api/auth/login` with `email/password/tenantId` -> keep `accessToken` and `refreshToken`.
7. `GET /api/auth/me` with `Authorization: Bearer <accessToken>`.
8. `GET /api/users/me` with `Authorization`.
9. `GET /api/tenants/my` with `Authorization`.
10. `GET /api/tenants/{tenantId}` with `Authorization`.
11. `POST /api/integrations` with `Authorization` -> keep `integrationId`.
12. `GET /api/integrations`.
13. `POST /api/channels` with `integrationId` -> keep `channelId`.
14. `GET /api/channels`.
15. `POST /api/automation-templates` -> keep `templateId`.
16. `GET /api/automation-templates`.
17. `POST /api/automation-instances` with `templateId` and `templateVersion=1` -> keep `instanceId`.
18. `GET /api/automation-instances`.
19. `GET /api/automation-instances/{instanceId}`.
20. `PATCH /api/automation-instances/{instanceId}/status`.
21. `POST /api/webhooks/whatsapp/{tenantId}` with inbound lead payload.
22. Wait a few seconds for worker processing.
23. `GET /api/executions/jobs` and `GET /api/executions/logs`.
24. `GET /api/usage/counters`.

## 6) What to validate in tests

### Auth and tenant
- Login only works when user belongs to the informed tenant.
- Protected routes fail without `Authorization`.
- Permission-protected routes return 403 when role has no permission.

### Tenant isolation
- Same request with token from tenant A must not access tenant B data.
- `GET /api/tenants/{tenantId}` should fail for mismatched tenant context.

### Webhooks and idempotency
- Re-send the same webhook with same `idempotency-key` and expect duplicate acceptance behavior.
- If signature secret is enabled, invalid signature must return 401.
- Worker should process asynchronously (HTTP request returns quickly with 202).

### Observability
- Response body always includes `requestId`.
- Log lines should include correlation context.
- Execution logs and job records should appear after webhook processing.

## 7) Required keys/secrets

Application mandatory:
- `JWT_SECRET`
- `MONGODB_URI`
- `REDIS_URL`

Strongly recommended:
- `WEBHOOK_DEFAULT_SIGNATURE_SECRET`
- `CORS_ORIGIN`
- `RATE_LIMIT_*`

HTTP headers used in tests:
- `Authorization: Bearer <accessToken>`
- `x-tenant-id: <tenantId>` (optional in many routes, useful for explicit tenant context tests)
- `x-request-id` (optional)
- `x-correlation-id` (optional)
- `idempotency-key` (webhooks)
- `x-webhook-signature` (webhooks with signature enabled)

## 8) Insomnia import

- Import file: `docs/insomnia/sertta-sales-engine.openapi.yaml`
- Optional environment template: `docs/insomnia/local.environment.json`

## 9) Signature generation example (webhook)

If `WEBHOOK_DEFAULT_SIGNATURE_SECRET` is enabled, compute `x-webhook-signature` using the raw JSON body.

Example (Node.js one-liner):

```bash
node -e "const crypto=require('crypto');const body=JSON.stringify({eventType:'lead.created',eventId:'evt-lead-001',leadId:'lead-001',fullName:'Jane Doe',email:'jane@example.com'});console.log(crypto.createHmac('sha256','local-webhook-secret').update(body).digest('hex'))"
```

Use the output as header:

- `x-webhook-signature: <generated_hex>`
