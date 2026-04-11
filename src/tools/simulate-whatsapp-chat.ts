import { randomUUID } from 'node:crypto';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

interface AssistantRunLike {
  id?: string;
  sourceWebhookEventId?: string;
  intent?: string;
  confidence?: number;
  actionType?: string;
  inputMessage?: string;
  outputMessage?: string;
  actionResult?: Record<string, unknown>;
  createdAt?: string;
}

const baseUrl = process.env['SIM_BASE_URL'] ?? 'http://localhost:3000';
const apiPrefix = process.env['SIM_API_PREFIX'] ?? '/api';
const tenantId = process.env['SIM_TENANT_ID'];
const accessToken = process.env['SIM_ACCESS_TOKEN'];
const fromPhone = process.env['SIM_FROM_PHONE'] ?? '+5511999999999';

const ensureRequired = () => {
  const missing: string[] = [];

  if (!tenantId) {
    missing.push('SIM_TENANT_ID');
  }

  if (!accessToken) {
    missing.push('SIM_ACCESS_TOKEN');
  }

  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(', ')}`);
  }
};

const requestJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, init);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status} ${response.statusText}: ${text}`);
  }

  return (await response.json()) as T;
};

const submitWebhookMessage = async (messageText: string) => {
  const eventId = `evt-${randomUUID()}`;

  const payload = {
    eventType: 'message.received',
    eventId,
    from: fromPhone,
    text: messageText
  };

  const result = await requestJson<{ data?: { webhookEventId?: string } }>(
    `${baseUrl}${apiPrefix}/webhooks/whatsapp/${tenantId}`,
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'idempotency-key': `${eventId}-idem`
      },
      body: JSON.stringify(payload)
    }
  );

  const webhookEventId = result.data?.webhookEventId;

  if (!webhookEventId) {
    throw new Error('Webhook response did not include webhookEventId');
  }

  return webhookEventId;
};

const findAssistantRunByWebhookId = async (webhookEventId: string): Promise<AssistantRunLike | null> => {
  const result = await requestJson<{ data?: AssistantRunLike[] }>(`${baseUrl}${apiPrefix}/ai-assistant/runs`, {
    headers: {
      authorization: `Bearer ${accessToken}`,
      'x-tenant-id': tenantId as string
    }
  });

  const runs = result.data ?? [];
  const exact = runs.find((run) => run.sourceWebhookEventId === webhookEventId);

  return exact ?? null;
};

const waitForAssistantRun = async (webhookEventId: string): Promise<AssistantRunLike> => {
  const maxAttempts = 25;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const run = await findAssistantRunByWebhookId(webhookEventId);

    if (run) {
      return run;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error('Timed out waiting for assistant run');
};

const printRun = (run: AssistantRunLike) => {
  const confidenceText = typeof run.confidence === 'number' ? run.confidence.toFixed(2) : 'n/a';

  output.write(`\nIA -> ${run.outputMessage ?? '(sem resposta)'}\n`);
  output.write(`   intent=${run.intent ?? 'n/a'} | confidence=${confidenceText} | action=${run.actionType ?? 'n/a'}\n`);

  if (run.actionResult) {
    output.write(`   actionResult=${JSON.stringify(run.actionResult)}\n`);
  }

  output.write('\n');
};

const main = async () => {
  ensureRequired();

  output.write('WhatsApp AI Simulator\n');
  output.write('Type a message and press Enter. Type "exit" to quit.\n\n');

  const rl = createInterface({ input, output });

  try {
    let active = true;

    while (active) {
      const message = (await rl.question('You: ')).trim();

      if (message.length === 0) {
        continue;
      }

      if (message.toLowerCase() === 'exit') {
        active = false;
        continue;
      }

      const webhookEventId = await submitWebhookMessage(message);
      const run = await waitForAssistantRun(webhookEventId);
      printRun(run);
    }
  } finally {
    rl.close();
  }
};

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  output.write(`\nSimulation failed: ${message}\n`);
  process.exit(1);
});
