import { enqueue } from '../../../infra/queue/bullmq';
import { createJobEnvelope } from '../../../infra/queue/job-envelope';
import { outboundMessagesQueue } from '../../../infra/queue/queues';
import { logger } from '../../../infra/logger/pino';
import { usageService } from '../../usage/application/usage.service';
import { catalogRepository } from '../../catalog/infrastructure/catalog.repository';
import { knowledgeRepository } from '../../knowledge/infrastructure/knowledge.repository';
import { appointmentsRepository } from '../../appointments/infrastructure/appointments.repository';
import { ordersRepository } from '../../orders/infrastructure/orders.repository';
import { aiAssistantRepository } from '../infrastructure/ai-assistant.repository';
import type { AssistantActionType, AssistantIntent } from '../domain/assistant.types';

const normalizeMessage = (message: string): string => message.trim().toLowerCase();

const detectIntent = (message: string): { intent: AssistantIntent; confidence: number } => {
  const normalized = normalizeMessage(message);

  if (/agendar|marcar|agenda|horario|horário/.test(normalized)) {
    return { intent: 'schedule_request', confidence: 0.89 };
  }

  if (/comprar|pedido|orcamento|orçamento|fechar/.test(normalized)) {
    return { intent: 'order_request', confidence: 0.87 };
  }

  if (/produto|servico|serviço|preco|preço|plano/.test(normalized)) {
    return { intent: 'product_question', confidence: 0.8 };
  }

  if (/suporte|ajuda|problema|erro/.test(normalized)) {
    return { intent: 'support_question', confidence: 0.7 };
  }

  return { intent: 'fallback', confidence: 0.45 };
};

const nextBusinessSlot = (): Date => {
  const target = new Date();
  target.setDate(target.getDate() + 1);
  target.setHours(14, 0, 0, 0);
  return target;
};

const makeReply = (params: {
  tone: 'friendly' | 'formal' | 'sales';
  intent: AssistantIntent;
  knowledgeSnippets: string[];
  catalogHint?: string;
}): string => {
  const openingByTone = {
    friendly: 'Perfeito, vou te ajudar com isso.',
    formal: 'Entendido. Vou seguir com sua solicitacao.',
    sales: 'Excelente, vamos resolver isso agora para voce.'
  } as const;

  const opening = openingByTone[params.tone];

  if (params.intent === 'schedule_request') {
    return `${opening} Posso sugerir um horario para nossa conversa e confirmar com voce em seguida.`;
  }

  if (params.intent === 'order_request') {
    return `${opening} Iniciei seu pedido e ja posso seguir para confirmacao dos itens.`;
  }

  if (params.intent === 'product_question' && params.catalogHint) {
    return `${opening} Sobre o que voce pediu: ${params.catalogHint}`;
  }

  if (params.knowledgeSnippets.length > 0) {
    return `${opening} ${params.knowledgeSnippets[0]}`;
  }

  return `${opening} Pode me dar mais detalhes para eu te atender com precisao?`;
};

export const aiAssistantService = {
  async upsertProfile(
    tenantId: string,
    actorUserId: string,
    dto: {
      name: string;
      tone: 'friendly' | 'formal' | 'sales';
      language: string;
      handoffEnabled: boolean;
      handoffThreshold: number;
      policy: {
        canCreateOrders: boolean;
        canCreateAppointments: boolean;
      };
      knowledgeMode: 'none' | 'basic';
    }
  ) {
    const profile = await aiAssistantRepository.upsertProfile(tenantId, {
      ...dto,
      createdByUserId: actorUserId
    });

    return profile?.toJSON();
  },

  async getProfile(tenantId: string) {
    const profile = await aiAssistantRepository.getProfile(tenantId);

    if (profile) {
      return profile.toJSON();
    }

    return {
      name: 'Default AI Assistant',
      tone: 'friendly',
      language: 'pt-BR',
      handoffEnabled: true,
      handoffThreshold: 0.45,
      policy: {
        canCreateOrders: true,
        canCreateAppointments: true
      },
      knowledgeMode: 'basic'
    };
  },

  async listRuns(tenantId: string) {
    const runs = await aiAssistantRepository.listRuns(tenantId);
    return runs.map((run) => run.toJSON());
  },

  async processInboundWhatsappMessage(params: {
    tenantId: string;
    webhookEventId: string;
    messageText: string;
    recipient: string;
    correlationId: string;
    channelId?: string;
    integrationId?: string;
  }) {
    const existing = await aiAssistantRepository.findRunByWebhookEvent(params.tenantId, params.webhookEventId);

    if (existing) {
      return existing.toJSON();
    }

    const profile = await aiAssistantRepository.getProfile(params.tenantId);
    const tone = (profile?.get('tone') as 'friendly' | 'formal' | 'sales' | undefined) ?? 'friendly';

    const { intent, confidence } = detectIntent(params.messageText);
    const knowledgeDocs = await knowledgeRepository.searchActive(params.tenantId, params.messageText);
    const catalogItems = await catalogRepository.listActiveBySearch(params.tenantId, params.messageText);

    let actionType: AssistantActionType = 'message.reply';
    let actionResult: Record<string, unknown> = {};

    if (intent === 'schedule_request' && ((profile?.get('policy') as Record<string, boolean> | undefined)?.['canCreateAppointments'] ?? true)) {
      actionType = 'appointment.create';

      const appointment = await appointmentsRepository.create(params.tenantId, {
        title: 'Conversa iniciada pelo atendente IA',
        notes: `Criado a partir do webhook ${params.webhookEventId}`,
        scheduledFor: nextBusinessSlot(),
        timezone: 'America/Sao_Paulo',
        createdBy: 'ai-assistant',
        status: 'pending_confirmation'
      });

      actionResult = {
        appointmentId: String(appointment['_id']),
        scheduledFor: appointment['scheduledFor']
      };
    } else if (intent === 'order_request' && ((profile?.get('policy') as Record<string, boolean> | undefined)?.['canCreateOrders'] ?? true)) {
      actionType = 'order.create';

      const selectedItem = catalogItems[0];
      const itemName = selectedItem ? String(selectedItem['name']) : 'Atendimento personalizado';
      const unitPriceCents = selectedItem ? Number(selectedItem['priceCents']) : 0;

      const order = await ordersRepository.create(params.tenantId, {
        status: 'draft',
        currency: selectedItem ? String(selectedItem['currency']) : 'USD',
        items: [
          {
            ...(selectedItem ? { itemId: String(selectedItem['_id']) } : {}),
            itemName,
            quantity: 1,
            unitPriceCents,
            totalPriceCents: unitPriceCents
          }
        ],
        subtotalCents: unitPriceCents,
        discountCents: 0,
        totalCents: unitPriceCents,
        notes: `Criado automaticamente pelo assistente IA a partir do webhook ${params.webhookEventId}`,
        createdBy: 'ai-assistant'
      });

      actionResult = {
        orderId: String(order['_id']),
        totalCents: order['totalCents']
      };
    } else if (intent === 'product_question') {
      actionType = 'knowledge.answer';
    } else if (intent === 'fallback' && ((profile?.get('handoffEnabled') as boolean | undefined) ?? true)) {
      actionType = 'human.handoff';
      actionResult = {
        handoff: true,
        reason: 'low_confidence'
      };
    }

    const knowledgeSnippets = knowledgeDocs.map((item) => String(item['content']).slice(0, 240));
    const catalogHint = catalogItems[0]
      ? `${String(catalogItems[0]['name'])} esta disponivel por ${Number(catalogItems[0]['priceCents']) / 100} ${String(catalogItems[0]['currency'])}.`
      : undefined;

    const outputMessage = makeReply({
      tone,
      intent,
      knowledgeSnippets,
      ...(catalogHint ? { catalogHint } : {})
    });

    const run = await aiAssistantRepository.createRun(params.tenantId, {
      sourceWebhookEventId: params.webhookEventId,
      intent,
      confidence,
      actionType,
      inputMessage: params.messageText,
      outputMessage,
      actionResult,
      correlationId: params.correlationId
    });

    await usageService.trackEvent({
      tenantId: params.tenantId,
      metric: 'ai_runs',
      period: 'daily',
      amount: 1
    });

    await usageService.trackEvent({
      tenantId: params.tenantId,
      metric: 'ai_tokens_in',
      period: 'daily',
      amount: Math.max(1, Math.ceil(params.messageText.length / 4))
    });

    await usageService.trackEvent({
      tenantId: params.tenantId,
      metric: 'ai_tokens_out',
      period: 'daily',
      amount: Math.max(1, Math.ceil(outputMessage.length / 4))
    });

    await enqueue(
      outboundMessagesQueue,
      'outbound.whatsapp.reply',
      createJobEnvelope({
        tenantId: params.tenantId,
        eventType: 'assistant.reply.generated',
        payload: {
          messageId: `assistant-run-${String(run['_id'])}`,
          channelId: params.channelId ?? 'unknown-channel',
          integrationId: params.integrationId ?? 'unknown-integration',
          recipient: params.recipient,
          content: outputMessage
        },
        idempotencyKey: `${params.webhookEventId}:assistant-reply`,
        producer: 'ai-assistant.module'
      })
    );

    logger.info(
      {
        tenantId: params.tenantId,
        webhookEventId: params.webhookEventId,
        assistantRunId: String(run['_id']),
        intent,
        actionType,
        correlationId: params.correlationId
      },
      'AI assistant handled inbound WhatsApp message'
    );

    return run.toJSON();
  }
};

