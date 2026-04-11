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
import type { AssistantActionType } from '../domain/assistant.types';
import { aiDecisionService } from './services/ai-decision.service';

interface AssistantProfilePolicy {
  canCreateOrders: boolean;
  canCreateAppointments: boolean;
}

interface AssistantProfileState {
  tone: 'friendly' | 'formal' | 'sales';
  language: string;
  handoffEnabled: boolean;
  handoffThreshold: number;
  policy: AssistantProfilePolicy;
}

const nextBusinessSlot = (): Date => {
  const target = new Date();
  target.setDate(target.getDate() + 1);
  target.setHours(14, 0, 0, 0);
  return target;
};

const getProfileState = (profile: Record<string, unknown> | null): AssistantProfileState => {
  const policy = (profile?.['policy'] as AssistantProfilePolicy | undefined) ?? {
    canCreateOrders: true,
    canCreateAppointments: true
  };

  return {
    tone: (profile?.['tone'] as AssistantProfileState['tone'] | undefined) ?? 'friendly',
    language: (profile?.['language'] as string | undefined) ?? 'pt-BR',
    handoffEnabled: (profile?.['handoffEnabled'] as boolean | undefined) ?? true,
    handoffThreshold: (profile?.['handoffThreshold'] as number | undefined) ?? 0.45,
    policy
  };
};

const resolveActionType = (params: {
  suggestedAction: AssistantActionType;
  confidence: number;
  handoffEnabled: boolean;
  handoffThreshold: number;
  policy: AssistantProfilePolicy;
}): AssistantActionType => {
  if (params.handoffEnabled && params.confidence < params.handoffThreshold) {
    return 'human.handoff';
  }

  if (params.suggestedAction === 'appointment.create' && !params.policy.canCreateAppointments) {
    return params.handoffEnabled ? 'human.handoff' : 'message.reply';
  }

  if (params.suggestedAction === 'order.create' && !params.policy.canCreateOrders) {
    return params.handoffEnabled ? 'human.handoff' : 'message.reply';
  }

  return params.suggestedAction;
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

    const profileDoc = await aiAssistantRepository.getProfile(params.tenantId);
    const profile = profileDoc ? (profileDoc.toJSON() as Record<string, unknown>) : null;
    const profileState = getProfileState(profile);

    const knowledgeDocs = await knowledgeRepository.searchActive(params.tenantId, params.messageText);
    const catalogItems = await catalogRepository.listActiveBySearch(params.tenantId, params.messageText);

    const catalogSummaries = catalogItems.map(
      (item) => `${String(item['name'])} | ${Number(item['priceCents']) / 100} ${String(item['currency'])}`
    );
    const knowledgeSnippets = knowledgeDocs.map((item) => String(item['content']).slice(0, 240));

    const decision = await aiDecisionService.decide({
      messageText: params.messageText,
      tone: profileState.tone,
      language: profileState.language,
      handoffEnabled: profileState.handoffEnabled,
      catalogSummaries,
      knowledgeSnippets
    });

    const actionType = resolveActionType({
      suggestedAction: decision.suggestedAction,
      confidence: decision.confidence,
      handoffEnabled: profileState.handoffEnabled,
      handoffThreshold: profileState.handoffThreshold,
      policy: profileState.policy
    });

    let actionResult: Record<string, unknown> = {};

    if (actionType === 'appointment.create') {
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
    } else if (actionType === 'order.create') {
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
    } else if (actionType === 'human.handoff') {
      actionResult = {
        handoff: true,
        reason: decision.confidence < profileState.handoffThreshold ? 'low_confidence' : 'policy_block'
      };
    }

    const outputMessage = decision.outputMessage;

    const run = await aiAssistantRepository.createRun(params.tenantId, {
      sourceWebhookEventId: params.webhookEventId,
      intent: decision.intent,
      confidence: decision.confidence,
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
      amount: decision.promptTokens ?? Math.max(1, Math.ceil(params.messageText.length / 4))
    });

    await usageService.trackEvent({
      tenantId: params.tenantId,
      metric: 'ai_tokens_out',
      period: 'daily',
      amount: decision.completionTokens ?? Math.max(1, Math.ceil(outputMessage.length / 4))
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
        intent: decision.intent,
        actionType,
        confidence: decision.confidence,
        provider: 'assistant',
        correlationId: params.correlationId
      },
      'AI assistant handled inbound WhatsApp message'
    );

    return run.toJSON();
  }
};
