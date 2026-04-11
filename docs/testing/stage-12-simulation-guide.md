# Stage 12 - Simple WhatsApp AI Simulation Guide

This guide shows a very simple way to simulate a WhatsApp AI attendant using the backend you already have.

## 1) What this simulation does

1. You register fake tenant data (catalog + knowledge).
2. You configure assistant profile.
3. You send messages as webhook events (`message.received`).
4. Worker pipeline handles async processing.
5. You read the assistant response from `ai-assistant/runs`.

Flow:
`webhooks -> webhook-ingestion -> inbound-events -> ai-tasks -> outbound-messages`

## 2) Prerequisites

- API and worker running (`npm run dev`)
- Mongo + Redis running
- valid `tenantId`
- valid `accessToken` from login

## 3) Seed fake services/products ("training" data)

Use these endpoints with Authorization + tenant context:

### Create product
`POST /api/catalog/items`

```json
{
  "itemType": "product",
  "name": "Plano Atendimento IA Premium",
  "slug": "plano-atendimento-ia-premium",
  "description": "Atendente virtual com funil de vendas e suporte",
  "sku": "IA-PREMIUM-01",
  "currency": "BRL",
  "priceCents": 19900,
  "tags": ["ia", "whatsapp", "automacao"],
  "attributes": {
    "sla": "24h",
    "canal": "whatsapp"
  }
}
```

### Create service
`POST /api/catalog/items`

```json
{
  "itemType": "service",
  "name": "Implantacao Assistente IA",
  "slug": "implantacao-assistente-ia",
  "description": "Setup do assistente com personalizacao por nicho",
  "currency": "BRL",
  "priceCents": 49000,
  "tags": ["implantacao", "onboarding"]
}
```

### Create knowledge document
`POST /api/knowledge/documents`

```json
{
  "title": "FAQ Comercial",
  "sourceType": "manual",
  "content": "Nosso assistente atende 24/7. O plano premium custa R$199/mês. Implantacao unica R$490. Suporte via WhatsApp incluso.",
  "status": "active",
  "tags": ["faq", "preco", "comercial"]
}
```

## 4) Configure assistant behavior

`PUT /api/ai-assistant/profile`

```json
{
  "name": "Assistente Comercial",
  "tone": "sales",
  "language": "pt-BR",
  "handoffEnabled": true,
  "handoffThreshold": 0.45,
  "policy": {
    "canCreateOrders": true,
    "canCreateAppointments": true
  },
  "knowledgeMode": "basic"
}
```

## 5) Run the interactive simulator (recommended)

1. Create local simulation env file from template:

```bash
copy .env.simulation.example .env.simulation
```

2. Fill `.env.simulation`:

```env
SIM_BASE_URL=http://localhost:3000
SIM_API_PREFIX=/api
SIM_TENANT_ID=YOUR_TENANT_ID
SIM_ACCESS_TOKEN=YOUR_ACCESS_TOKEN
SIM_FROM_PHONE=+5511999999999
```

3. Run:

```bash
npm run simulate:whatsapp
```

You can chat in terminal:
- "Quero agendar uma reunião"
- "Quero fazer um pedido"
- "Qual o preço do plano premium?"
- "Estou com um problema"

Type `exit` to stop.

## 6) Optional alternative (terminal env vars)

If you prefer not to create `.env.simulation`, set env vars directly in PowerShell:

```powershell
$env:SIM_BASE_URL='http://localhost:3000'
$env:SIM_API_PREFIX='/api'
$env:SIM_TENANT_ID='YOUR_TENANT_ID'
$env:SIM_ACCESS_TOKEN='YOUR_ACCESS_TOKEN'
$env:SIM_FROM_PHONE='+5511999999999'
```

Then run:

```bash
npm run simulate:whatsapp
```

## 7) How to inspect results

After chatting, check:

- `GET /api/ai-assistant/runs`
- `GET /api/appointments`
- `GET /api/orders`
- `GET /api/executions/jobs`
- `GET /api/usage/counters`

## 8) Expected behavior by intent

- schedule-related messages -> creates appointment (`appointment.create`)
- order/purchase-related messages -> creates order (`order.create`)
- product/price-related messages -> responds using catalog/knowledge (`knowledge.answer`)
- low-confidence/fallback -> handoff (`human.handoff`)

## 9) Important note about "training"

In current Stage 12 implementation, there is no model fine-tuning pipeline yet.

"Training" here means:
- feeding tenant data into `catalog` and `knowledge`
- assistant uses this data to compose response and actions

This is the right first production step before adding full LLM/RAG infra.

## 10) Enable real OpenAI model (optional)

In `.env`:

```env
AI_PROVIDER=openai
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4.1-mini
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_TIMEOUT_MS=12000
OPENAI_TEMPERATURE=0.2
```

Then restart API and worker (`npm run dev`).

Behavior:
- intent/action suggestion comes from OpenAI model
- policy and tenant safety enforcement still runs on backend
- if OpenAI fails or times out, backend falls back to heuristic mode automatically
