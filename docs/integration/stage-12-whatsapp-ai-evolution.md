# Stage 12 - WhatsApp AI Attendant Evolution Plan

## 1. Goal

Evolve current backend foundation to support an AI-first WhatsApp attendant that can:
- answer customer questions with tenant-specific product/service knowledge
- qualify leads
- schedule conversations/appointments
- create orders directly in chat
- escalate to human operator when needed

The architecture remains a modular monolith with strict multi-tenant isolation.

## 2. New Modules to Add

## 2.1 Catalog (`products`, `services`, `offers`)
Responsibilities:
- tenant-owned product/service records
- pricing, availability, active/inactive status
- searchable attributes for chat grounding

Suggested entities:
- `Product`
- `Service`
- `Offer` (optional in first iteration)

Critical indexes:
- `{ tenantId: 1, status: 1, createdAt: -1 }`
- `{ tenantId: 1, sku: 1 }` unique sparse
- `{ tenantId: 1, name: "text", description: "text" }` or vector-ready strategy

## 2.2 Knowledge Base (`knowledge`)
Responsibilities:
- tenant knowledge documents (FAQ, policies, product docs)
- chunking/index references for retrieval (RAG-ready)

Suggested entities:
- `KnowledgeDocument`
- `KnowledgeChunk`
- `KnowledgeIndexJob`

Critical indexes:
- `{ tenantId: 1, status: 1, updatedAt: -1 }`
- `{ tenantId: 1, sourceType: 1, externalId: 1 }` unique sparse

## 2.3 Appointments (`appointments`)
Responsibilities:
- scheduling slots
- appointment creation/update/cancellation
- calendar integration hook points

Suggested entities:
- `Appointment`
- `AvailabilityWindow`

Critical indexes:
- `{ tenantId: 1, status: 1, scheduledFor: 1 }`
- `{ tenantId: 1, contactId: 1, createdAt: -1 }`

## 2.4 Orders (`orders`)
Responsibilities:
- order creation from conversation
- itemization, totals, status flow, payment state references

Suggested entities:
- `Order`
- `OrderItem` (embedded for first iteration)

Critical indexes:
- `{ tenantId: 1, status: 1, createdAt: -1 }`
- `{ tenantId: 1, contactId: 1, createdAt: -1 }`
- `{ tenantId: 1, externalOrderId: 1 }` unique sparse

## 2.5 AI Orchestration (`ai-assistant`)
Responsibilities:
- intent detection and response generation
- tool/action routing
- confidence and safety policy
- handoff decisioning

Suggested entities:
- `AssistantProfile` (tone, policy, language, escalation rules)
- `AssistantRun` (audit of each AI decision)

Critical indexes:
- `{ tenantId: 1, createdAt: -1 }`
- `{ tenantId: 1, conversationId: 1, createdAt: -1 }`

## 3. Automation and Action Evolution

Extend `AutomationTemplate.definition.steps[].actionType` with actionable types:
- `ai.reply`
- `ai.classify_intent`
- `knowledge.search`
- `appointment.create`
- `appointment.reschedule`
- `order.create`
- `order.add_item`
- `human.handoff`
- `notification.send`

Execution pattern:
1. webhook inbound message -> queue
2. conversation context loaded
3. AI decision step (intent + confidence)
4. tool/action step (order/appointment/knowledge)
5. outbound message step
6. execution/usage logging

## 4. Queue and Worker Expansion

Add or refine queues:
- `inbound-events` (already present): parse and route inbound messages
- `ai-tasks` (already present): LLM and retrieval tasks
- `automation-dispatch` (already present): execute workflow steps
- `outbound-messages` (already present): deliver WhatsApp responses
- `scheduled-reminders` (already present): appointment reminders
- `billing-reminders` (future billing)

Worker specialization recommendation:
- Worker A: webhook + inbound-events
- Worker B: ai-tasks + automation-dispatch
- Worker C: outbound-messages + scheduled-reminders

## 5. Required Safety and Quality Controls

- hard tenant boundaries in all repositories
- prompt/context isolation by tenant
- action allowlist by tenant plan and role
- confidence threshold + fallback strategy
- explicit hallucination guardrails (catalog/knowledge only)
- always log AI decisions with trace identifiers
- easy human handoff action in every critical flow

## 6. Validation Plan for WhatsApp AI Attendant

## 6.1 Functional tests
- inbound lead question -> AI answers using tenant catalog
- user asks for schedule -> appointment created
- user asks to buy -> order created
- unsupported scenario -> handoff to human

## 6.2 Tenant isolation tests
- tenant A data never appears in tenant B response context
- cross-tenant ids rejected by service/repository boundaries

## 6.3 Reliability tests
- duplicate webhook events are deduplicated
- failed downstream tasks retry safely
- queue backlog behavior under load

## 6.4 Quality tests
- intent accuracy baseline
- resolution rate without handoff
- average response latency
- order/appointment conversion rate

## 7. Rollout Strategy

Phase 1:
- knowledge read-only + ai.reply + human.handoff
- no transactional actions yet

Phase 2:
- appointment.create + reminders

Phase 3:
- order.create + payment integration adapter points

Phase 4:
- optimization, analytics, and advanced policy controls

## 8. Backend Deliverables for Next Stage

1. new modules scaffolded:
- `catalog`
- `knowledge`
- `appointments`
- `orders`
- `ai-assistant`

2. action handlers added in execution engine for:
- `ai.reply`
- `knowledge.search`
- `appointment.create`
- `order.create`
- `human.handoff`

3. usage metrics expanded:
- `ai_tokens_in`
- `ai_tokens_out`
- `ai_runs`
- `appointments_created`
- `orders_created`

4. operations visibility:
- assistant runs list
- action success/failure dashboards

## 9. Definition of Done (Stage 12)

- one complete inbound WhatsApp flow handled end-to-end with AI
- tenant-specific knowledge grounding demonstrated
- at least one transactional action (appointment or order) completed
- execution logs + usage counters correctly populated
- retry/idempotency behavior validated
- frontend can consume stable endpoints for operations and management
